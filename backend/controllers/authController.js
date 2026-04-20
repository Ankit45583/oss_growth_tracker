// controllers/authController.js

const axios    = require("axios");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const { generateToken } = require("../middleware/auth");
const { fetchTotalCommits, fetchGithubProfile } = require("../services/githubService");
const { calculateUserStreak }  = require("../services/streakService");
const { calculateScore }       = require("../utils/scoreCalculator");

// ─── Helper: Clean user response ─────────────────────────────
const formatUser = (user) => ({
  _id:            user._id,
  githubId:       user.githubId        || "",
  githubUsername: user.githubUsername  || "",
  githubConnected: user.githubConnected || false,
  username:       user.username,
  avatar:         user.avatar          || "",
  email:          user.email           || "",
  totalRepos:     Number(user.totalRepos    ?? 0),
  totalCommits:   Number(user.totalCommits  ?? 0),
  currentStreak:  Number(user.currentStreak ?? 0),
  longestStreak:  Number(user.longestStreak ?? 0),
  lastCommitDate: user.lastCommitDate  || null,
  score:          Number(user.score    ?? 0),
  lastRefreshed:  user.lastRefreshed   || null,
  createdAt:      user.createdAt,
  badge:          user.badge,
  streakBadge:    user.streakBadge,
});

// ─── REGISTER ────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username:       username.toLowerCase(),
      email:          email.toLowerCase(),
      password:       hashedPassword,
      avatar:         `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      githubConnected: false,
      githubUsername:  "",
      currentStreak:  0,
      longestStreak:  0,
      score:          0,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      data:    formatUser(user),
    });
  } catch (error) {
    console.error("[Auth] Register error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      data:    formatUser(user),
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// ─── Connect GitHub START ────────────────────────────────────
const connectGithubStart = (req, res) => {
  try {
    const userId     = req.user._id;
    const redirectUri = `${process.env.BACKEND_URL}/auth/github/callback`;

    const githubUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(process.env.GITHUB_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent("read:user user:email repo")}` +
      `&state=connect_${userId}`;

    return res.json({ success: true, url: githubUrl });
  } catch (error) {
    console.error("[Auth] connectGithubStart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start GitHub connection.",
    });
  }
};

// ─── Direct GitHub Login ──────────────────────────────────────
const githubLogin = (req, res) => {
  const redirectUri = `${process.env.BACKEND_URL}/auth/github/callback`;

  const githubUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(process.env.GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent("read:user user:email repo")}`;

  return res.redirect(302, githubUrl);
};

// ─── GitHub Callback ──────────────────────────────────────────
const githubCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
  }

  try {
    // Step 1: Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:  `${process.env.BACKEND_URL}/auth/github/callback`,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }

    // Step 2: GitHub profile fetch
   // services/githubService.js
// SIRF YEH FUNCTION REPLACE KARO — baaki sab same

const fetchGithubProfile = async (username = null, accessToken = null) => {
  try {
    // Agar username nahi diya → logged-in user ka profile (OAuth)
    // Agar username diya → public profile
    const url = username
      ? `${GITHUB_API}/users/${username}`
      : `${GITHUB_API}/user`;

    const res = await axios.get(url, {
      headers: getHeaders(accessToken),
    });

    return res.data;
  } catch (error) {
    console.error("[GitHub] Profile fetch failed:", error.message);
    throw error;
  }
};  
    // Step 3: Parallel fetch commits + streak
    const [totalCommits, streakData] = await Promise.all([
      fetchTotalCommits(ghProfile.login, accessToken),
      calculateUserStreak(ghProfile.login, accessToken),
    ]);

    // Step 4: Score calculate
    const score = calculateScore({
      totalCommits,
      totalRepos:    ghProfile.public_repos || 0,
      currentStreak: streakData.currentStreak,
    });

    const updateData = {
      githubId:       String(ghProfile.id),
      githubUsername: ghProfile.login,
      avatar:         ghProfile.avatar_url   || "",
      githubConnected: true,
      totalRepos:     Number(ghProfile.public_repos || 0),
      totalCommits:   Number(totalCommits           || 0),
      currentStreak:  Number(streakData.currentStreak || 0),
      longestStreak:  Number(streakData.longestStreak || 0),
      lastCommitDate: streakData.lastCommitDate || null,
      score:          Number(score              || 0),
      lastRefreshed:  new Date(),
    };

    // ══════════════════════════════════════
    // CASE 1: Existing user GitHub connect
    // ══════════════════════════════════════
    if (state && state.startsWith("connect_")) {
      const userId = state.replace("connect_", "");
      console.log("[Auth] Connecting GitHub to user:", userId);

      await User.findByIdAndUpdate(userId, updateData);

      return res.redirect(`${process.env.CLIENT_URL}/dashboard?github=connected`);
    }

    // ══════════════════════════════════════
    // CASE 2: Direct GitHub login/signup
    // ══════════════════════════════════════
    console.log("[Auth] Direct GitHub login:", ghProfile.login);

    const user = await User.findOneAndUpdate(
      { githubId: String(ghProfile.id) },
      {
        ...updateData,
        username: ghProfile.login,
        email:    ghProfile.email || "",
      },
      { new: true, upsert: true, runValidators: true }
    );

    const jwtToken = generateToken(user._id);
    return res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${jwtToken}`
    );
  } catch (error) {
    console.error("[Auth] Callback error:", error.message);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// ─── Logout ───────────────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully." });
};

module.exports = {
  register,
  login,
  connectGithubStart,
  githubLogin,
  githubCallback,
  logout,
};