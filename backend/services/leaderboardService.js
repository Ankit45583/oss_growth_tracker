// services/leaderboardService.js

const User = require("../models/User");
const { getBadgeFromCommits, calculateScore } = require("../utils/scoreCalculator");

/**
 * Top users leaderboard fetch karo
 */
const getLeaderboard = async (limit = 50) => {
  try {
    const users = await User.find({})
      .sort({ totalCommits: -1 })
      .limit(limit)
      .select("username avatar totalRepos totalCommits createdAt")
      .lean();

    const leaderboard = users.map((user, index) => {
      const commits = Number(user.totalCommits ?? 0);
      const repos   = Number(user.totalRepos   ?? 0);

      const badge = getBadgeFromCommits(commits);
      const score = calculateScore({
        totalCommits:  commits,
        totalRepos:    repos,
        currentStreak: 0, // Streak DB me save nahi — default 0
      });

      return {
        rank:         index + 1,
        _id:          user._id,
        username:     user.username,
        avatar:       user.avatar,
        totalRepos:   repos,
        totalCommits: commits,
        score,
        badge,
        createdAt:    user.createdAt,
      };
    });

    return leaderboard;
  } catch (error) {
    console.error("[Leaderboard] Error:", error.message);
    throw error;
  }
};

module.exports = { getLeaderboard };