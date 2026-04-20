// src/features/badges/useBadges.js

import { useMemo } from "react";

const BADGES = [
  { min: 1000, label: "Legend",       emoji: "🏆", color: "#e3b341" },
  { min: 500,  label: "Expert",       emoji: "💎", color: "#58a6ff" },
  { min: 200,  label: "Pro",          emoji: "🥇", color: "#a371f7" },
  { min: 100,  label: "Advanced",     emoji: "🥈", color: "#8b949e" },
  { min: 50,   label: "Intermediate", emoji: "🥉", color: "#f0883e" },
  { min: 10,   label: "Beginner",     emoji: "🌱", color: "#3fb950" },
  { min: 0,    label: "Newcomer",     emoji: "👋", color: "#484f58" },
];

const useBadges = (totalCommits = 0) => {
  const commits = Number(totalCommits ?? 0);

  const currentBadge = useMemo(() => {
    return (
      BADGES.find((b) => commits >= b.min) ||
      BADGES[BADGES.length - 1]
    );
  }, [commits]);

  const nextBadge = useMemo(() => {
    const idx = BADGES.findIndex((b) => b.label === currentBadge.label);
    return idx > 0 ? BADGES[idx - 1] : null;
  }, [currentBadge]);

  const progress = useMemo(() => {
    if (!nextBadge) return 100;
    return Math.min(
      ((commits - currentBadge.min) /
        (nextBadge.min - currentBadge.min)) *
        100,
      100
    );
  }, [commits, currentBadge, nextBadge]);

  const commitsNeeded = nextBadge
    ? nextBadge.min - commits
    : 0;

  return {
    allBadges:    BADGES,
    currentBadge,
    nextBadge,
    progress,
    commitsNeeded,
    commits,
  };
};

export default useBadges;