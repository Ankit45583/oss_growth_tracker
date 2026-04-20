// jobs/syncJob.js
// Har 6 ghante me automatically sab users ke stats refresh karo

const cron = require("node-cron");
const User = require("../models/User");
const { fetchGithubProfile, fetchTotalCommits } = require("../services/githubService");
const { calculateUserStreak } = require("../services/streakService");

/**
 * Single user ke stats sync karo
 */
const syncUserStats = async (user) => {
  try {
    if (!user.githubUsername) return;

    console.log(`[SyncJob] Syncing: ${user.username}`);

    const profile = await fetchGithubProfile(user.githubUsername);
    const totalCommits = await fetchTotalCommits(user.githubUsername);

    await User.findByIdAndUpdate(user._id, {
      totalRepos:    Number(profile.public_repos || 0),
      totalCommits:  Number(totalCommits         || 0),
      lastRefreshed: new Date(),
    });

    console.log(`[SyncJob] ✅ Done: ${user.username}`);
  } catch (error) {
    console.error(`[SyncJob] ❌ Failed for ${user.username}:`, error.message);
  }
};

/**
 * Sab GitHub connected users sync karo
 */
const syncAllUsers = async () => {
  try {
    console.log("[SyncJob] 🚀 Starting sync for all users...");

    const users = await User.find({ githubConnected: true }).select(
      "username githubUsername lastRefreshed"
    );

    console.log(`[SyncJob] Found ${users.length} GitHub connected users`);

    // Ek ek user sync karo (API rate limit ke liye delay)
    for (const user of users) {
      await syncUserStats(user);
      // 2 second delay between each user
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("[SyncJob] ✅ All users synced!");
  } catch (error) {
    console.error("[SyncJob] ❌ Sync failed:", error.message);
  }
};


const startSyncJob = () => {
  console.log("[SyncJob] ⏰ Cron job registered — runs every 6 hours");

  cron.schedule("0 */6 * * *", async () => {
    console.log("[SyncJob] ⏰ Cron triggered at:", new Date().toISOString());
    await syncAllUsers();
  });
};

module.exports = { startSyncJob, syncAllUsers };