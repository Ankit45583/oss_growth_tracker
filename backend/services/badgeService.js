// services/badgeService.js

const { getBadgeFromCommits, getStreakBadge, calculateScore } =
  require("../utils/scoreCalculator");

/**
 * User ka complete badge info calculate karo
 */
const calculateUserBadges = ({
  totalCommits  = 0,
  totalRepos    = 0,
  currentStreak = 0,
}) => {
  const commitBadge = getBadgeFromCommits(totalCommits);
  const streakBadge = getStreakBadge(currentStreak);
  const score       = calculateScore({ totalCommits, totalRepos, currentStreak });

  return {
    commitBadge,
    streakBadge,
    score,
  };
};

module.exports = { calculateUserBadges };