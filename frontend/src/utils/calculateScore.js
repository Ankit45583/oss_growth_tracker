// src/utils/calculateScore.js

/**
 * Frontend score calculator
 * Backend se same formula
 */
export const calculateScore = ({
  totalCommits  = 0,
  totalRepos    = 0,
  currentStreak = 0,
}) => {
  const commitScore = totalCommits  * 10;
  const repoScore   = totalRepos    * 5;
  const streakScore = currentStreak * 20;

  return commitScore + repoScore + streakScore;
};

/**
 * Score se rank label
 */
export const getScoreLabel = (score) => {
  if (score >= 10000) return { label: "Elite",       color: "#e3b341" };
  if (score >= 5000)  return { label: "Expert",      color: "#58a6ff" };
  if (score >= 2000)  return { label: "Advanced",    color: "#a371f7" };
  if (score >= 500)   return { label: "Intermediate",color: "#3fb950" };
  return               { label: "Beginner",          color: "#484f58" };
};