const User = require("../models/User");
const { fetchUserRepos } = require("./githubService");
const { getBadgeFromCommits } = require("../utils/scoreCalculator");

const getTopLanguage = (repos) => {
  const langCount = {};
  repos.forEach((repo) => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });
  if (Object.keys(langCount).length === 0) return null;
  return Object.entries(langCount).sort((a, b) => b[1] - a[1])[0][0];
};

const getBestMonth = (repos) => {
  const monthCount = {};
  repos.forEach((repo) => {
    if (repo.updated_at || repo.updatedAt) {
      const date = new Date(repo.updated_at || repo.updatedAt);
      const key = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      monthCount[key] = (monthCount[key] || 0) + 1;
    }
  });
  if (Object.keys(monthCount).length === 0) return null;
  return Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0][0];
};

// ✅ Beautiful GitHub Wrapped Style SVG Card
const generateSVGCard = (cardData) => {
  const {
    username,
    avatar,
    totalCommits,
    totalRepos,
    currentStreak,
    longestStreak,
    score,
    topLanguage,
    bestMonth,
    badge,
  } = cardData;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600">
  <defs>
    <!-- Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7b2ff7;stop-opacity:1" />
    </linearGradient>

    <linearGradient id="commitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#0091ea;stop-opacity:0.8" />
    </linearGradient>

    <linearGradient id="repoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00e676;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#00c853;stop-opacity:0.8" />
    </linearGradient>

    <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#ff5252;stop-opacity:0.8" />
    </linearGradient>

    <linearGradient id="bestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#ffa000;stop-opacity:0.8" />
    </linearGradient>

    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c471ed;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#7b2ff7;stop-opacity:0.8" />
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <clipPath id="avatarClip">
      <circle cx="100" cy="100" r="50"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1000" height="600" fill="url(#bgGrad)" rx="20"/>
  
  <!-- Outer Border Glow -->
  <rect width="996" height="596" x="2" y="2" fill="none" 
    stroke="url(#accentGrad)" stroke-width="2" rx="18" opacity="0.6"/>

  <!-- Top Banner -->
  <rect width="1000" height="5" fill="url(#accentGrad)" rx="20"/>

  <!-- Header Section -->
  <text x="500" y="50" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="32" font-weight="bold" fill="#ffffff" 
    text-anchor="middle" filter="url(#glow)">
    🎉 GitHub Wrapped 2026 🎉
  </text>

  <!-- Avatar Circle with Glow -->
  <circle cx="100" cy="140" r="55" fill="none" 
    stroke="url(#accentGrad)" stroke-width="3" filter="url(#glow)"/>
  <image href="${avatar}" x="50" y="90" 
    width="100" height="100" clip-path="url(#avatarClip)"/>

  <!-- Username -->
  <text x="180" y="130" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="36" font-weight="bold" fill="#ffffff">
    @${username}
  </text>

  <!-- Badge -->
  <text x="180" y="160" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="18" fill="#00d4ff">
    ${badge?.emoji || "🌱"} ${badge?.label || "Beginner Developer"}
  </text>

  <!-- Divider -->
  <line x1="50" y1="200" x2="950" y2="200" 
    stroke="url(#accentGrad)" stroke-width="2" opacity="0.5"/>

  <!-- Stats Grid -->
  
  <!-- Total Commits Card -->
  <rect x="50" y="230" width="180" height="140" 
    fill="url(#commitGrad)" rx="15" filter="url(#glow)" opacity="0.9"/>
  <text x="140" y="265" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="14" fill="#ffffff" text-anchor="middle" opacity="0.9">
    TOTAL COMMITS
  </text>
  <text x="140" y="310" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${totalCommits}
  </text>
  <text x="140" y="355" font-family="Arial" 
    font-size="32" text-anchor="middle">💻</text>

  <!-- Repositories Card -->
  <rect x="250" y="230" width="180" height="140" 
    fill="url(#repoGrad)" rx="15" filter="url(#glow)" opacity="0.9"/>
  <text x="340" y="265" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="14" fill="#ffffff" text-anchor="middle" opacity="0.9">
    REPOSITORIES
  </text>
  <text x="340" y="310" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${totalRepos}
  </text>
  <text x="340" y="355" font-family="Arial" 
    font-size="32" text-anchor="middle">📦</text>

  <!-- Current Streak Card -->
  <rect x="450" y="230" width="180" height="140" 
    fill="url(#streakGrad)" rx="15" filter="url(#glow)" opacity="0.9"/>
  <text x="540" y="265" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="14" fill="#ffffff" text-anchor="middle" opacity="0.9">
    CURRENT STREAK
  </text>
  <text x="540" y="310" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${currentStreak}
  </text>
  <text x="540" y="340" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="16" fill="#ffffff" text-anchor="middle">
    days
  </text>
  <text x="540" y="362" font-family="Arial" 
    font-size="24" text-anchor="middle">🔥</text>

  <!-- Longest Streak Card -->
  <rect x="650" y="230" width="180" height="140" 
    fill="url(#bestGrad)" rx="15" filter="url(#glow)" opacity="0.9"/>
  <text x="740" y="265" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="14" fill="#ffffff" text-anchor="middle" opacity="0.9">
    LONGEST STREAK
  </text>
  <text x="740" y="310" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${longestStreak}
  </text>
  <text x="740" y="340" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="16" fill="#ffffff" text-anchor="middle">
    days
  </text>
  <text x="740" y="362" font-family="Arial" 
    font-size="24" text-anchor="middle">🏆</text>

  <!-- Score Card -->
  <rect x="50" y="390" width="180" height="140" 
    fill="url(#scoreGrad)" rx="15" filter="url(#glow)" opacity="0.9"/>
  <text x="140" y="425" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="14" fill="#ffffff" text-anchor="middle" opacity="0.9">
    TOTAL SCORE
  </text>
  <text x="140" y="470" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${score}
  </text>
  <text x="140" y="515" font-family="Arial" 
    font-size="32" text-anchor="middle">⭐</text>

  <!-- Info Section -->
  <rect x="250" y="390" width="580" height="140" 
    fill="#1a1a2e" rx="15" stroke="url(#accentGrad)" 
    stroke-width="2" opacity="0.8"/>

  <!-- Top Language -->
  <text x="280" y="425" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="16" fill="#00d4ff" font-weight="bold">
    🌟 Top Language:
  </text>
  <text x="280" y="455" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="24" fill="#ffffff" font-weight="bold">
    ${topLanguage || "Not Available"}
  </text>

  <!-- Best Month -->
  <text x="280" y="490" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="16" fill="#00d4ff" font-weight="bold">
    📅 Most Active Month:
  </text>
  <text x="280" y="520" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="20" fill="#ffffff">
    ${bestMonth || "Not Available"}
  </text>

  <!-- Footer -->
  <text x="500" y="575" font-family="'Segoe UI', Arial, sans-serif" 
    font-size="14" fill="#7b2ff7" text-anchor="middle">
    Generated by OSS Growth Tracker • oss-growth-tracker.vercel.app
  </text>
</svg>`;
};

const generateCard = async (username) => {
  console.log("[Card] Generating card for:", username);

  const user = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { githubUsername: username },
    ],
  }).select("+githubAccessToken");

  if (!user) {
    throw new Error("User not found.");
  }

  console.log("[Card] User found:", user.username);

  let repos = [];
  try {
    if (user.githubUsername) {
      repos = await fetchUserRepos(
        user.githubUsername,
        user.githubAccessToken || null
      );
    }
  } catch (err) {
    console.log("[Card] Could not fetch repos:", err.message);
    repos = [];
  }

  const topLanguage = getTopLanguage(repos);
  const bestMonth = getBestMonth(repos);
  const badge = getBadgeFromCommits(user.totalCommits || 0);

  const cardData = {
    username: user.githubUsername || user.username,
    avatar: user.avatar || `https://github.com/${user.githubUsername}.png`,
    totalCommits: Number(user.totalCommits || 0),
    longestStreak: Number(user.longestStreak || 0),
    currentStreak: Number(user.currentStreak || 0),
    totalRepos: Number(user.totalRepos || 0),
    score: Number(user.score || 0),
    topLanguage,
    bestMonth,
    badge,
  };

  console.log("[Card] Card data ready:", cardData);

  const svgCard = generateSVGCard(cardData);
  console.log("[Card] Beautiful SVG card generated!");

  return {
    cardUrl: null,
    svgCard,
    cardData,
  };
};

module.exports = { generateCard };