// controllers/userController.js

const User = require("../models/User");
const { getUserRepos }        = require("../services/repoService");
const { fetchGithubProfile, fetchTotalCommits } = require("../services/githubService");
const { calculateUserStreak } = require("../services/streakService");
const { calculateScore }      = require("../utils/scoreCalculator");
const { minutesAgo }          = require("../utils/dateHelper");

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
  updatedAt:      user.updatedAt,
  badge:          user.badge,
  streakBadge:    user.streakBadge,
});

// ─── GET /api/user ────────────────────────────────────────────
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("[User] getUser:", user.username);

    res.json({
      success: true,
      data: formatUser(user),
    });
  } catch (error) {
    console.error("[User] getUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data.",
    });
  }
};

// ─── GET /api/repos ───────────────────────────────────────────
const getRepos = async (req, res) => {
  try {
    const username = req.user.githubUsername;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "GitHub username not found. Please connect GitHub first.",
      });
    }

    console.log("[Repo] Fetching repos for:", username);

    const repos = await getUserRepos(username);

    res.json({
      success: true,
      count:   repos.length,
      data:    repos,
    });
  } catch (error) {
    console.error("[Repo] getRepos error:", error.message);

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: "GitHub API rate limit exceeded. Try again later.",
      });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "GitHub user not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch repositories.",
    });
  }
};

// ─── POST /api/user/refresh ───────────────────────────────────
const refreshStats = async (req, res) => {
  try {
    const username = req.user.githubUsername || req.user.username;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "GitHub username not found.",
      });
    }

    // Rate limit check: 2 minute gap
    if (req.user.lastRefreshed) {
      const mins = minutesAgo(req.user.lastRefreshed);
      if (mins < 2) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(2 - mins)} more minute(s) before refreshing.`,
        });
      }
    }

    console.log("[Refresh] Refreshing stats for:", username);

    // Parallel fetch — faster
    const [profile, totalCommits, streakData] = await Promise.all([
      fetchGithubProfile(username),
      fetchTotalCommits(username),
      calculateUserStreak(username),
    ]);

    const score = calculateScore({
      totalCommits,
      totalRepos:    profile.public_repos || 0,
      currentStreak: streakData.currentStreak,
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        totalRepos:     Number(profile.public_repos    || 0),
        totalCommits:   Number(totalCommits            || 0),
        currentStreak:  Number(streakData.currentStreak || 0),
        longestStreak:  Number(streakData.longestStreak || 0),
        lastCommitDate: streakData.lastCommitDate || null,
        score:          Number(score              || 0),
        lastRefreshed:  new Date(),
      },
      { new: true }
    );

    console.log(`[Refresh] Done — ${username}: Repos=${profile.public_repos}, Commits=${totalCommits}, Streak=${streakData.currentStreak}`);

    res.json({
      success: true,
      message: "Stats refreshed successfully!",
      data:    formatUser(updatedUser),
    });
  } catch (error) {
    console.error("[Refresh] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to refresh stats.",
    });
  }
};

// ─── GET /api/leaderboard ─────────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const { getLeaderboard: fetchLeaderboard } = require("../services/leaderboardService");
    const leaderboard = await fetchLeaderboard(50);

    res.json({
      success: true,
      count:   leaderboard.length,
      data:    leaderboard,
    });
  } catch (error) {
    console.error("[Leaderboard] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard.",
    });
  }
};

module.exports = { getUser, getRepos, refreshStats, getLeaderboard };