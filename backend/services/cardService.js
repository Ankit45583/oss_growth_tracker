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

module.exports = { generateCard };