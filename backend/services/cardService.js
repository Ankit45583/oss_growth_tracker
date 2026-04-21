const nodeHtmlToImage = require("node-html-to-image");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const { fetchUserRepos } = require("./githubService");
const { generateCardHTML } = require("../utils/htmlTemplate");
const { getBadgeFromCommits } = require("../utils/scoreCalculator");
const { Readable } = require("stream");

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

// ✅ Puppeteer hataya - node-html-to-image use karo
const htmlToPng = async (html) => {
  try {
    console.log("[Card] Converting HTML to PNG...");
    const buffer = await nodeHtmlToImage({
      html,
      quality: 100,
      type: "png",
      puppeteerArgs: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-zygote",
          "--single-process",
        ],
      },
      beforeScreenshot: async (page) => {
        await page.setViewport({ width: 900, height: 500 });
      },
    });
    console.log("[Card] PNG generated successfully");
    return buffer;
  } catch (err) {
    console.error("[Card] HTML to PNG error:", err.message);
    throw err;
  }
};

const uploadToCloudinary = async (buffer, username) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("[Card] Cloudinary config check:", {
    cloud_name: cloudName || "MISSING",
    api_key: apiKey || "MISSING",
    api_secret: apiSecret ? "SET" : "MISSING",
  });

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing! Check Render environment variables."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "oss-tracker-cards",
        public_id: `card_${username}_${Date.now()}`,
        resource_type: "image",
        format: "png",
      },
      (error, result) => {
        if (error) {
          console.error("[Card] Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
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
  console.log("[Card] GitHub username:", user.githubUsername);
  console.log("[Card] Token:", user.githubAccessToken ? "YES" : "NO");

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

  const html = generateCardHTML(cardData);
  const pngBuffer = await htmlToPng(html);

  console.log("[Card] Uploading to Cloudinary...");
  const cardUrl = await uploadToCloudinary(pngBuffer, cardData.username);

  console.log("[Card] Done! URL:", cardUrl);
  return { cardUrl, cardData };
};
const cloudinary = require("cloudinary").v2;
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

// ✅ SVG Card banao - No puppeteer needed!
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
    badge,
  } = cardData;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#161b22;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#58a6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#79c0ff;stop-opacity:1" />
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="80" cy="80" r="45"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="900" height="500" fill="url(#bg)" rx="16"/>
  
  <!-- Border -->
  <rect width="898" height="498" x="1" y="1" fill="none" 
    stroke="#30363d" stroke-width="1" rx="16"/>

  <!-- Top accent line -->
  <rect width="900" height="3" fill="url(#accent)" rx="2"/>

  <!-- Avatar -->
  <image href="${avatar}" x="35" y="35" 
    width="90" height="90" clip-path="url(#avatarClip)"/>
  <circle cx="80" cy="80" r="45" fill="none" 
    stroke="#58a6ff" stroke-width="2"/>

  <!-- Username -->
  <text x="145" y="65" font-family="Arial,sans-serif" 
    font-size="28" font-weight="bold" fill="#e6edf3">
    @${username}
  </text>
  
  <!-- Badge -->
  <text x="145" y="95" font-family="Arial,sans-serif" 
    font-size="16" fill="#8b949e">
    ${badge?.emoji || "🌱"} ${badge?.label || "Beginner"}
  </text>

  <!-- OSS Tracker label -->
  <text x="145" y="120" font-family="Arial,sans-serif" 
    font-size="13" fill="#58a6ff">
    OSS Growth Tracker
  </text>

  <!-- Divider -->
  <line x1="35" y1="150" x2="865" y2="150" 
    stroke="#30363d" stroke-width="1"/>

  <!-- Stats Cards -->
  <!-- Commits -->
  <rect x="35" y="175" width="160" height="100" 
    fill="#161b22" rx="10" stroke="#30363d" stroke-width="1"/>
  <text x="115" y="220" font-family="Arial,sans-serif" 
    font-size="32" font-weight="bold" fill="#58a6ff" 
    text-anchor="middle">${totalCommits}</text>
  <text x="115" y="245" font-family="Arial,sans-serif" 
    font-size="13" fill="#8b949e" text-anchor="middle">
    Total Commits
  </text>
  <text x="115" y="265" font-family="Arial,sans-serif" 
    font-size="20" text-anchor="middle">💻</text>

  <!-- Repos -->
  <rect x="215" y="175" width="160" height="100" 
    fill="#161b22" rx="10" stroke="#30363d" stroke-width="1"/>
  <text x="295" y="220" font-family="Arial,sans-serif" 
    font-size="32" font-weight="bold" fill="#3fb950" 
    text-anchor="middle">${totalRepos}</text>
  <text x="295" y="245" font-family="Arial,sans-serif" 
    font-size="13" fill="#8b949e" text-anchor="middle">
    Repositories
  </text>
  <text x="295" y="265" font-family="Arial,sans-serif" 
    font-size="20" text-anchor="middle">📦</text>

  <!-- Current Streak -->
  <rect x="395" y="175" width="160" height="100" 
    fill="#161b22" rx="10" stroke="#30363d" stroke-width="1"/>
  <text x="475" y="220" font-family="Arial,sans-serif" 
    font-size="32" font-weight="bold" fill="#f78166" 
    text-anchor="middle">${currentStreak}</text>
  <text x="475" y="245" font-family="Arial,sans-serif" 
    font-size="13" fill="#8b949e" text-anchor="middle">
    Day Streak
  </text>
  <text x="475" y="265" font-family="Arial,sans-serif" 
    font-size="20" text-anchor="middle">🔥</text>

  <!-- Longest Streak -->
  <rect x="575" y="175" width="160" height="100" 
    fill="#161b22" rx="10" stroke="#30363d" stroke-width="1"/>
  <text x="655" y="220" font-family="Arial,sans-serif" 
    font-size="32" font-weight="bold" fill="#d2a8ff" 
    text-anchor="middle">${longestStreak}</text>
  <text x="655" y="245" font-family="Arial,sans-serif" 
    font-size="13" fill="#8b949e" text-anchor="middle">
    Best Streak
  </text>
  <text x="655" y="265" font-family="Arial,sans-serif" 
    font-size="20" text-anchor="middle">🏆</text>

  <!-- Score -->
  <rect x="755" y="175" width="110" height="100" 
    fill="#161b22" rx="10" stroke="#30363d" stroke-width="1"/>
  <text x="810" y="220" font-family="Arial,sans-serif" 
    font-size="28" font-weight="bold" fill="#ffa657" 
    text-anchor="middle">${score}</text>
  <text x="810" y="245" font-family="Arial,sans-serif" 
    font-size="13" fill="#8b949e" text-anchor="middle">Score</text>
  <text x="810" y="265" font-family="Arial,sans-serif" 
    font-size="20" text-anchor="middle">⭐</text>

  <!-- Divider -->
  <line x1="35" y1="300" x2="865" y2="300" 
    stroke="#30363d" stroke-width="1"/>

  <!-- Top Language -->
  <text x="35" y="335" font-family="Arial,sans-serif" 
    font-size="14" fill="#8b949e">Top Language:</text>
  <text x="160" y="335" font-family="Arial,sans-serif" 
    font-size="14" font-weight="bold" fill="#58a6ff">
    ${topLanguage || "N/A"}
  </text>

  <!-- Footer -->
  <text x="450" y="470" font-family="Arial,sans-serif" 
    font-size="12" fill="#484f58" text-anchor="middle">
    oss-growth-tracker.vercel.app
  </text>
</svg>`;
};

// ✅ Main function - No image upload needed
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

  // ✅ SVG generate karo - No puppeteer, No cloudinary needed!
  const svgCard = generateSVGCard(cardData);

  console.log("[Card] SVG card generated!");

  return {
    cardUrl: null,  // Ab URL nahi hoga
    svgCard,        // SVG directly bhejenge
    cardData,
  };
};

module.exports = { generateCard };
module.exports = { generateCard };