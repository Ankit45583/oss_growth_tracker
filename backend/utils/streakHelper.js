// utils/streakHelper.js

const { isSameDay, getToday, getYesterday } = require("./dateHelper");

/**
 * Commit dates se streak calculate karo
 * @param {Date[]} commitDates - sorted (latest first) commit dates array
 * @returns {{ currentStreak, longestStreak, lastCommitDate }}
 */
const calculateStreakFromDates = (commitDates) => {
  if (!commitDates || commitDates.length === 0) {
    return {
      currentStreak:  0,
      longestStreak:  0,
      lastCommitDate: null,
    };
  }

  // Sort dates latest first
  const sorted = [...commitDates]
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  const today     = getToday();
  const yesterday = getYesterday();

  // Last commit date
  const lastCommitDate = sorted[0];

  // Agar last commit aaj ya kal nahi toh streak 0
  const isActive =
    isSameDay(lastCommitDate, today) ||
    isSameDay(lastCommitDate, yesterday);

  if (!isActive) {
    return {
      currentStreak:  0,
      longestStreak:  calculateLongestStreak(sorted),
      lastCommitDate,
    };
  }

  // Current streak calculate karo
  let currentStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i - 1]);

    // Date difference in days
    const diffDays = Math.round(
      (prev.setHours(0,0,0,0) - curr.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak:  Math.max(currentStreak, calculateLongestStreak(sorted)),
    lastCommitDate,
  };
};

/**
 * Longest streak find karo dates array se
 */
const calculateLongestStreak = (sortedDates) => {
  if (!sortedDates || sortedDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);

    const diffDays = Math.round(
      (prev.setHours(0,0,0,0) - curr.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

module.exports = {
  calculateStreakFromDates,
  calculateLongestStreak,
};