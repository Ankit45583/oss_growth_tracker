// services/cardService.js

const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const { fetchUserRepos } = require("./githubService");
const { generateCardHTML } = require("../utils/htmlTemplate");
const { getBadgeFromCommits } = require("../utils/scoreCalculator");
const { Readable } = require("stream");

// ❌ PURANA — top pe config mat karo
// cloudinary.config({...})

// Top language nikalo
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

// Best month nikalo
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

// HTML → PNG
const htmlToPng = async (html) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 500 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const screenshotBuffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 900, height: 500 },
      omitBackground: false,
    });

    return screenshotBuffer;
  } finally {
    if (browser) await browser.close();
  }
};

// PNG → Cloudinary
const uploadToCloudinary = async (buffer, username) => {
  // ✅ NAYA — config yahan karo (env load hone ke baad)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Debug — check karo values aa rahi hain
  console.log("[Card] Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        "oss-tracker-cards",
        public_id:     `card_${username}_${Date.now()}`,
        resource_type: "image",
        format:        "png",
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

    const { Readable } = require("stream");
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Main function
const generateCard = async (username) => {
  console.log("[Card] Generating card for:", username);

  const user = await User.findOne({
    $or: [
      { username:       username.toLowerCase() },
      { githubUsername: username },
    ],
  });

  if (!user) {
    throw new Error("User not found.");
  }

  let repos = [];
  try {
    repos = await fetchUserRepos(user.githubUsername || user.username);
  } catch (err) {
    console.log("[Card] Could not fetch repos:", err.message);
  }

  const topLanguage = getTopLanguage(repos);
  const bestMonth   = getBestMonth(repos);
  const badge       = getBadgeFromCommits(user.totalCommits || 0);

  const cardData = {
    username:      user.githubUsername || user.username,
    avatar:        user.avatar || `https://github.com/${user.githubUsername}.png`,
    totalCommits:  Number(user.totalCommits  || 0),
    longestStreak: Number(user.longestStreak || 0),
    currentStreak: Number(user.currentStreak || 0),
    totalRepos:    Number(user.totalRepos    || 0),
    score:         Number(user.score         || 0),
    topLanguage,
    bestMonth,
    badge,
  };

  console.log("[Card] Card data:", cardData);

  const html      = generateCardHTML(cardData);
  console.log("[Card] Generating PNG with Puppeteer...");
  const pngBuffer = await htmlToPng(html);

  console.log("[Card] Uploading to Cloudinary...");
  const cardUrl = await uploadToCloudinary(pngBuffer, cardData.username);

  console.log("[Card] Card URL:", cardUrl);

  return { cardUrl, cardData };
};

module.exports = { generateCard };