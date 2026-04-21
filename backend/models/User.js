const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: "",
      select: false,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubUsername: {
      type: String,
      default: "",
    },
    // ✅ NEW - Token save hoga
    githubAccessToken: {
      type: String,
      default: "",
      select: false,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    totalRepos: {
      type: Number,
      default: 0,
    },
    totalCommits: {
      type: Number,
      default: 0,
    },
    lastRefreshed: {
      type: Date,
      default: null,
    },
    githubConnected: {
      type: Boolean,
      default: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCommitDate: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("badge").get(function () {
  const c = this.totalCommits || 0;
  if (c >= 1000) return { label: "Legend",       emoji: "🏆" };
  if (c >= 500)  return { label: "Expert",       emoji: "💎" };
  if (c >= 200)  return { label: "Pro",          emoji: "🥇" };
  if (c >= 100)  return { label: "Advanced",     emoji: "🥈" };
  if (c >= 50)   return { label: "Intermediate", emoji: "🥉" };
  if (c >= 10)   return { label: "Beginner",     emoji: "🌱" };
  return          { label: "Newcomer",           emoji: "👋" };
});

userSchema.virtual("streakBadge").get(function () {
  const s = this.currentStreak || 0;
  if (s >= 30) return { label: "Streak Master", emoji: "🔥" };
  if (s >= 14) return { label: "On Fire",       emoji: "⚡" };
  if (s >= 7)  return { label: "Week Warrior",  emoji: "💪" };
  if (s >= 3)  return { label: "Getting Warm",  emoji: "✨" };
  if (s >= 1)  return { label: "Just Started",  emoji: "🌟" };
  return        { label: "No Streak",           emoji: "💤" };
});

userSchema.set("toJSON",   { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);