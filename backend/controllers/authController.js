const axios = require("axios");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const {
  fetchTotalCommits,
  fetchGithubProfile,
} = require("../services/githubService");
const { calculateUserStreak } = require("../services/streakService");
const { calculateScore } = require("../utils/scoreCalculator");

// ─── Helper ─────────────────────────────────────────────
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

// ─── REGISTER ───────────────────────────────────────────
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

// ─── LOGIN ──────────────────────────────────────────────
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

    res.json({
      success: true,
      token,
      data: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ─── GitHub Login Start ─────────────────────────────────
const githubLogin = (req, res) => {
  // ✅ FIXED - Token se userId nikalo aur state me bhejo
  const redirectUri = `${process.env.BACKEND_URL}/auth/github/callback`;

  // Token se user ID nikalne ki koshish
  let stateParam = "login";
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      stateParam = `connect_${decoded.id}`;
    } catch (e) {
      stateParam = "login";
    }
  }

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=read:user user:email repo` +
    `&state=${stateParam}`;

  res.redirect(url);
};

// ─── GitHub Callback ────────────────────────────────────
const githubCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
  }

  try {
    // 1. exchange code → token
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

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }

    // 2. GitHub profile
    const ghProfile = await fetchGithubProfile(null, accessToken);

    // 3. stats
    const [totalCommits, streak] = await Promise.all([
      fetchTotalCommits(ghProfile.login, accessToken),
      calculateUserStreak(ghProfile.login, accessToken),
    ]);

    const score = calculateScore({
      totalCommits,
      totalRepos: ghProfile.public_repos || 0,
      currentStreak: streak.currentStreak,
    });

    const updateData = {
      githubId: String(ghProfile.id),
      githubUsername: ghProfile.login,
      avatar: ghProfile.avatar_url,
      githubConnected: true,
      totalRepos: ghProfile.public_repos,
      totalCommits,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCommitDate: streak.lastCommitDate,
      score,
      lastRefreshed: new Date(),
    };

    // ✅ FIXED - existing user connect
    if (state && state.startsWith("connect_")) {
      const userId = state.replace("connect_", "");
      await User.findByIdAndUpdate(userId, updateData);
      
      // ✅ ?github=connected add kiya
      return res.redirect(
        `${process.env.CLIENT_URL}/dashboard?github=connected`
      );
    }

    // new / login
    const user = await User.findOneAndUpdate(
      { githubId: String(ghProfile.id) },
      {
        ...updateData,
        username: ghProfile.login,
        email: ghProfile.email || "",
      },
      { new: true, upsert: true }
    );

    const jwt = generateToken(user._id);

    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${jwt}`);
  } catch (err) {
    console.error(err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// ─── Logout ─────────────────────────────────────────────
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