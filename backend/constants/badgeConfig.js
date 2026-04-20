// constants/badgeConfig.js

const BADGES = [
  { minCommits: 1000, label: "Legend",       emoji: "🏆" },
  { minCommits: 500,  label: "Expert",       emoji: "💎" },
  { minCommits: 200,  label: "Pro",          emoji: "🥇" },
  { minCommits: 100,  label: "Advanced",     emoji: "🥈" },
  { minCommits: 50,   label: "Intermediate", emoji: "🥉" },
  { minCommits: 10,   label: "Beginner",     emoji: "🌱" },
  { minCommits: 0,    label: "Newcomer",     emoji: "👋" },
];

// Streak badges
const STREAK_BADGES = [
  { minDays: 30, label: "Streak Master",  emoji: "🔥" },
  { minDays: 14, label: "On Fire",        emoji: "⚡" },
  { minDays: 7,  label: "Week Warrior",   emoji: "💪" },
  { minDays: 3,  label: "Getting Warm",   emoji: "✨" },
  { minDays: 1,  label: "Just Started",   emoji: "🌟" },
  { minDays: 0,  label: "No Streak",      emoji: "💤" },
];

module.exports = { BADGES, STREAK_BADGES };