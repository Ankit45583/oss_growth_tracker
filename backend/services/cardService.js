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

// ✅ Exact GitHub Wrapped Design
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

  const currentYear = new Date().getFullYear();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="mainBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    
    <!-- Card Gradients -->
    <linearGradient id="purple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#a78bfa"/>
    </linearGradient>
    
    <linearGradient id="blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb"/>
      <stop offset="100%" style="stop-color:#60a5fa"/>
    </linearGradient>
    
    <linearGradient id="green" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669"/>
      <stop offset="100%" style="stop-color:#34d399"/>
    </linearGradient>
    
    <linearGradient id="orange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ea580c"/>
      <stop offset="100%" style="stop-color:#fb923c"/>
    </linearGradient>
    
    <linearGradient id="pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#db2777"/>
      <stop offset="100%" style="stop-color:#f472b6"/>
    </linearGradient>

    <clipPath id="roundAvatar">
      <circle cx="400" cy="180" r="60"/>
    </clipPath>
  </defs>

  <!-- Main Background -->
  <rect width="800" height="1000" fill="url(#mainBg)" rx="24"/>
  
  <!-- Title -->
  <text x="400" y="80" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="48" font-weight="700" fill="#ffffff" text-anchor="middle">
    GitHub Wrapped
  </text>
  
  <text x="400" y="115" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="32" font-weight="600" fill="#8b949e" text-anchor="middle">
    ${currentYear}
  </text>

  <!-- Avatar -->
  <circle cx="400" cy="180" r="65" fill="none" stroke="#30363d" stroke-width="4"/>
  <image href="${avatar}" x="340" y="120" width="120" height="120" clip-path="url(#roundAvatar)"/>

  <!-- Username -->
  <text x="400" y="280" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="28" font-weight="600" fill="#ffffff" text-anchor="middle">
    @${username}
  </text>

  <!-- Badge -->
  <text x="400" y="315" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="18" font-weight="500" fill="#8b949e" text-anchor="middle">
    ${badge?.emoji || "🌱"} ${badge?.label || "Developer"}
  </text>

  <!-- Stats Cards -->
  
  <!-- Total Commits -->
  <rect x="60" y="360" width="330" height="160" fill="url(#purple)" rx="16"/>
  <text x="225" y="410" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.9">
    Total Commits
  </text>
  <text x="225" y="470" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">
    ${totalCommits.toLocaleString()}
  </text>

  <!-- Total Repos -->
  <rect x="410" y="360" width="330" height="160" fill="url(#blue)" rx="16"/>
  <text x="575" y="410" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.9">
    Repositories
  </text>
  <text x="575" y="470" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">
    ${totalRepos}
  </text>

  <!-- Current Streak -->
  <rect x="60" y="540" width="330" height="160" fill="url(#orange)" rx="16"/>
  <text x="225" y="590" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.9">
    Current Streak
  </text>
  <text x="225" y="650" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">
    ${currentStreak}
  </text>
  <text x="225" y="680" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="20" font-weight="500" fill="#ffffff" text-anchor="middle" opacity="0.8">
    days 🔥
  </text>

  <!-- Longest Streak -->
  <rect x="410" y="540" width="330" height="160" fill="url(#green)" rx="16"/>
  <text x="575" y="590" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.9">
    Longest Streak
  </text>
  <text x="575" y="650" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">
    ${longestStreak}
  </text>
  <text x="575" y="680" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="20" font-weight="500" fill="#ffffff" text-anchor="middle" opacity="0.8">
    days 🏆
  </text>

  <!-- Score -->
  <rect x="60" y="720" width="680" height="120" fill="url(#pink)" rx="16"/>
  <text x="400" y="765" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.9">
    Total Score
  </text>
  <text x="400" y="815" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="48" font-weight="700" fill="#ffffff" text-anchor="middle">
    ${score.toLocaleString()} ⭐
  </text>

  <!-- Additional Info -->
  <rect x="60" y="860" width="680" height="80" fill="#21262d" rx="12" stroke="#30363d" stroke-width="1"/>
  
  <text x="80" y="895" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="16" font-weight="600" fill="#8b949e">
    Top Language:
  </text>
  <text x="80" y="920" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="20" font-weight="600" fill="#58a6ff">
    ${topLanguage || "Not Available"}
  </text>

  <text x="400" y="895" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="16" font-weight="600" fill="#8b949e">
    Most Active:
  </text>
  <text x="400" y="920" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="20" font-weight="600" fill="#58a6ff">
    ${bestMonth || "N/A"}
  </text>

  <!-- Footer -->
  <text x="400" y="975" font-family="'SF Pro Display', -apple-system, Arial, sans-serif" 
    font-size="14" font-weight="500" fill="#484f58" text-anchor="middle">
    oss-growth-tracker.vercel.app
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

  const svgCard = generateSVGCard(cardData);
  console.log("[Card] Exact wrapped card generated!");

  return {
    cardUrl: null,
    svgCard,
    cardData,
  };
};

module.exports = { generateCard };