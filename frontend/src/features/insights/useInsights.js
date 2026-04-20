// src/features/insights/useInsights.js

import { useMemo } from "react";

const useInsights = (user) => {
  const totalCommits  = Number(user?.totalCommits  ?? 0);
  const totalRepos    = Number(user?.totalRepos    ?? 0);
  const currentStreak = Number(user?.currentStreak ?? 0);
  const score         = Number(user?.score         ?? 0);

  // Score calculate (frontend side bhi)
  const calculatedScore = useMemo(() => {
    return totalCommits * 10 + totalRepos * 5 + currentStreak * 20;
  }, [totalCommits, totalRepos, currentStreak]);

  // Average commits per repo
  const avgCommitsPerRepo = useMemo(() => {
    if (totalRepos === 0) return 0;
    return Math.round(totalCommits / totalRepos);
  }, [totalCommits, totalRepos]);

  // Activity level
  const activityLevel = useMemo(() => {
    if (totalCommits >= 500) return { label: "Very Active",  color: "#e3b341" };
    if (totalCommits >= 200) return { label: "Active",       color: "#3fb950" };
    if (totalCommits >= 50)  return { label: "Moderate",     color: "#58a6ff" };
    if (totalCommits >= 10)  return { label: "Getting Started", color: "#a371f7" };
    return                    { label: "Just Joined",        color: "#484f58" };
  }, [totalCommits]);

  // Insights list
  const insights = useMemo(() => {
    const list = [];

    if (totalCommits === 0) {
      list.push({
        emoji: "🚀",
        text:  "Connect GitHub and make your first commit to get started!",
      });
    }

    if (currentStreak >= 7) {
      list.push({
        emoji: "🔥",
        text:  `Amazing! You're on a ${currentStreak}-day streak. Keep it up!`,
      });
    } else if (currentStreak === 0) {
      list.push({
        emoji: "💡",
        text:  "Start a streak by committing code today!",
      });
    }

    if (totalRepos > 20) {
      list.push({
        emoji: "📦",
        text:  `You have ${totalRepos} repos. Try to contribute to open source!`,
      });
    }

    if (totalCommits >= 100 && totalCommits < 500) {
      list.push({
        emoji: "📈",
        text:  `${500 - totalCommits} more commits to reach Expert badge!`,
      });
    }

    if (list.length === 0) {
      list.push({
        emoji: "✨",
        text:  "Keep committing daily to climb the leaderboard!",
      });
    }

    return list;
  }, [totalCommits, currentStreak, totalRepos]);

  return {
    totalCommits,
    totalRepos,
    currentStreak,
    score: score || calculatedScore,
    avgCommitsPerRepo,
    activityLevel,
    insights,
  };
};

export default useInsights;