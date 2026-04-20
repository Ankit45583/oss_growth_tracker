// services/streakService.js

const { fetchCommitDates } = require("./githubService");
const { calculateStreakFromDates } = require("../utils/streakHelper");
const { getStreakBadge } = require("../utils/scoreCalculator");

/**
 * User ki streak calculate karo GitHub se
 */
const calculateUserStreak = async (username, accessToken = null) => {
  try {
    console.log("[Streak] Calculating streak for:", username);

    const commitDates = await fetchCommitDates(username, accessToken);

    const { currentStreak, longestStreak, lastCommitDate } =
      calculateStreakFromDates(commitDates);

    const streakBadge = getStreakBadge(currentStreak);

    console.log(
      `[Streak] ${username}: Current=${currentStreak}, Longest=${longestStreak}`
    );

    return {
      currentStreak,
      longestStreak,
      lastCommitDate,
      streakBadge,
    };
  } catch (error) {
    console.error("[Streak] Error:", error.message);
    return {
      currentStreak:  0,
      longestStreak:  0,
      lastCommitDate: null,
      streakBadge:    { label: "No Streak", emoji: "💤" },
    };
  }
};

module.exports = { calculateUserStreak };