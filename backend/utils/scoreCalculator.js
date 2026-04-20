// utils/scoreCalculator.js

const { BADGES, STREAK_BADGES } = require("../constants/badgeConfig");

/**
 * Commits + repos + streak se score calculate karo
 */
const calculateScore = ({ totalCommits = 0, totalRepos = 0, currentStreak = 0 }) => {
  const commitScore = totalCommits * 10;
  const repoScore   = totalRepos   * 5;
  const streakScore = currentStreak * 20;

  return commitScore + repoScore + streakScore;
};

/**
 * Commits se badge nikalo
 */
const getBadgeFromCommits = (totalCommits = 0) => {
  for (const badge of BADGES) {
    if (totalCommits >= badge.minCommits) {
      return { label: badge.label, emoji: badge.emoji };
    }
  }
  return { label: "Newcomer", emoji: "👋" };
};

/**
 * Streak se streak badge nikalo
 */
const getStreakBadge = (currentStreak = 0) => {
  for (const badge of STREAK_BADGES) {
    if (currentStreak >= badge.minDays) {
      return { label: badge.label, emoji: badge.emoji };
    }
  }
  return { label: "No Streak", emoji: "💤" };
};

module.exports = {
  calculateScore,
  getBadgeFromCommits,
  getStreakBadge,
};