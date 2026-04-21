const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const {
  fetchTotalCommits,
  fetchGithubProfile,
} = require("../services/githubService");
const { calculateUserStreak } = require("../services/streakService");
const { calculateScore } = require("../utils/scoreCalculator");

const formatUser = (user) => ({
  _id: user._id,
  githubId: user.githubId || "",
  githubUsername: user.githubUsername || "",
  githubConnected: user.githubConnected || false,
  username: user.username,
  avatar: user.avatar || "",
  email: user.email || "",
  totalRepos: Number(user.totalRepos ?? 0),
  totalCommits: Number(user.totalCommits ?? 0),
  currentStreak: Number(user.currentStreak ?? 0),
  longestStreak: Number(user.longestStreak ?? 0),
  lastCommitDate: user.lastCommitDate || null,
  score: Number(user.score ?? 0),
  lastRefreshed: user.lastRefreshed || null,
  createdAt: user.createdAt,
  badge: user.badge,
  streakBadge: user.streakBadge,
});

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      data: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Register failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, data: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

const githubLogin = (req, res) => {
  const redirectUri = `${process.env.BACKEND_URL}/auth/github/callback`;
  const userId = req.query.userId || null;
  const stateParam = userId ? `connect_${userId}` : "login";

  console.log("GitHub Login - userId:", userId);
  console.log("GitHub Login - state:", stateParam);

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=read:user user:email repo` +
    `&state=${encodeURIComponent(stateParam)}`;

  res.redirect(url);
};

const githubCallback = async (req, res) => {
  const { code, state } = req.query;

  console.log("=== GitHub Callback Hit ===");
  console.log("Code:", code ? "YES" : "NO");
  console.log("State:", state);

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
  }

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.BACKEND_URL}/auth/github/callback`,
      },
      { headers: { Accept: "application/json" } }
    );

    console.log("Token Response:", tokenRes.data);
    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      console.log("❌ Token failed:", tokenRes.data.error);
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=token_failed`
      );
    }

    const ghProfile = await fetchGithubProfile(null, accessToken);
    console.log("✅ GitHub Profile:", ghProfile.login, ghProfile.id);

    const [totalCommits, streak] = await Promise.all([
      fetchTotalCommits(ghProfile.login, accessToken),
      calculateUserStreak(ghProfile.login, accessToken),
    ]);

    const score = calculateScore({
      totalCommits,
      totalRepos: ghProfile.public_repos || 0,
      currentStreak: streak.currentStreak,
    });

    // ✅ githubAccessToken save ho raha hai
    const updateData = {
      githubId: String(ghProfile.id),
      githubUsername: ghProfile.login,
      avatar: ghProfile.avatar_url,
      githubConnected: true,
      githubAccessToken: accessToken, // ✅ ADDED
      totalRepos: ghProfile.public_repos,
      totalCommits,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCommitDate: streak.lastCommitDate,
      score,
      lastRefreshed: new Date(),
    };

    if (state && state.startsWith("connect_")) {
      const userId = state.replace("connect_", "");
      console.log("Connecting GitHub to userId:", userId);

      const existingOwner = await User.findOne({
        githubId: String(ghProfile.id),
      });

      if (
        existingOwner &&
        String(existingOwner._id) !== String(userId)
      ) {
        console.log("❌ GitHub already linked to another user");
        return res.redirect(
          `${process.env.CLIENT_URL}/dashboard?error=github_already_linked`
        );
      }

      await User.findByIdAndUpdate(userId, updateData);
      console.log("✅ GitHub connected to userId:", userId);

      return res.redirect(
        `${process.env.CLIENT_URL}/dashboard?github=connected`
      );
    }

    const user = await User.findOneAndUpdate(
      { githubId: String(ghProfile.id) },
      {
        ...updateData,
        username: ghProfile.login,
        email: ghProfile.email || "",
      },
      { new: true, upsert: true }
    );

    const jwtToken = generateToken(user._id);
    res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${jwtToken}`
    );
  } catch (err) {
    console.error("GitHub callback error:", err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
};

module.exports = {
  register,
  login,
  githubLogin,
  githubCallback,
  logout,
};  