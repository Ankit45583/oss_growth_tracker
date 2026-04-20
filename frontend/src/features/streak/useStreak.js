import { useCallback } from "react";

const useStreak = (user) => {
  const currentStreak = Number(user?.currentStreak ?? 0);
  const longestStreak = Number(user?.longestStreak ?? 0);
  const lastCommitDate = user?.lastCommitDate || null;

  const getStreakBadge = useCallback((streak) => {
    if (streak >= 30) return { label: "Streak Master", emoji: "🔥" };
    if (streak >= 14) return { label: "On Fire", emoji: "⚡" };
    if (streak >= 7) return { label: "Week Warrior", emoji: "💪" };
    if (streak >= 3) return { label: "Getting Warm", emoji: "✨" };
    if (streak >= 1) return { label: "Just Started", emoji: "🌟" };
    return { label: "No Streak", emoji: "💤" };
  }, []);

  const getDaysAgo = useCallback((date) => {
    if (!date) return null;
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }, []);

  return {
    currentStreak,
    longestStreak,
    lastCommitDate,
    lastCommitText: getDaysAgo(lastCommitDate),
    streakBadge: getStreakBadge(currentStreak),
  };
};

export default useStreak;