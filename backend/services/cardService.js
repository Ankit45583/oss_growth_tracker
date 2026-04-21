const User = require("../models/User");
const { fetchUserRepos } = require("./githubService");
const { getBadgeFromCommits } = require("../utils/scoreCalculator");

// ---------------- HELPERS ----------------
const getTopLanguage = (repos) => {
  const langCount = {};
  repos.forEach((repo) => {
    if (repo.language) {
      langCount[repo.language] =
        (langCount[repo.language] || 0) + 1;
    }
  });
  if (!Object.keys(langCount).length) return "N/A";
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
  if (!Object.keys(monthCount).length) return "N/A";
  return Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0][0];
};

// ---------------- MAIN SVG ----------------
const generateSVGCard = (data) => {
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
  } = data;

  return `
<svg width="1000" height="600" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">

  <!-- BACKGROUND -->
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <radialGradient id="glow" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <rect width="100%" height="100%" rx="20" fill="url(#bg)"/>
  <rect width="100%" height="100%" rx="20" fill="url(#glow)"/>

  <!-- PROFILE -->
  <image href="${avatar}" x="40" y="40" width="70" height="70"
    clip-path="circle(35px at 35px 35px)"/>
  <circle cx="75" cy="75" r="38"
    stroke="#22c55e" stroke-width="3" fill="none"/>

  <text x="130" y="70" fill="white" font-size="28" font-weight="600">
    @${username}
  </text>

  <text x="130" y="100" fill="#94a3b8" font-size="16">
    GitHub Wrapped 2024 • OSS Tracker
  </text>

  <!-- BADGE -->
  <rect x="820" y="50" rx="20" ry="20"
    width="140" height="40" fill="#052e16"/>
  <text x="835" y="75" fill="#22c55e" font-size="14">
    ${badge?.emoji || "🌱"} ${badge?.label || "Beginner"}
  </text>

  <!-- SMALL CARDS -->
  ${card(40,150,"💻","Total Commits",totalCommits,"All repositories")}
  ${card(260,150,"🔥","Longest Streak",longestStreak,"Current: ${currentStreak} days")}
  ${card(480,150,"📦","Repositories",totalRepos,"Public repos")}
  ${card(700,150,"🌐","Top Language",topLanguage,"Most used")}

  <!-- BIG CARDS -->
  ${bigCard(40,330,"📅",bestMonth,"Most Active Month","Highest commit activity")}
  ${bigCard(520,330,"⭐",score,"Total Score","Commits + Repos + Streak")}

</svg>
`;

  function card(x, y, icon, title, value, sub) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="200" height="130"
        rx="16" fill="#0f172a" stroke="#1e293b"/>
      <text x="${x+20}" y="${y+30}" font-size="18">${icon}</text>
      <text x="${x+20}" y="${y+55}" fill="#94a3b8" font-size="12">${title}</text>
      <text x="${x+20}" y="${y+90}" fill="white" font-size="26">${value}</text>
      <text x="${x+20}" y="${y+115}" fill="#64748b" font-size="12">${sub}</text>
    </g>`;
  }

  function bigCard(x, y, icon, value, title, sub) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="440" height="140"
        rx="16" fill="#0f172a" stroke="#1e293b"/>
      <text x="${x+20}" y="${y+40}" font-size="22">${icon}</text>
      <text x="${x+20}" y="${y+70}" fill="white" font-size="22">${value}</text>
      <text x="${x+20}" y="${y+95}" fill="#94a3b8" font-size="14">${title}</text>
      <text x="${x+20}" y="${y+115}" fill="#64748b" font-size="12">${sub}</text>
    </g>`;
  }
};

// ---------------- MAIN FUNCTION ----------------
const generateCard = async (username) => {
  const user = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { githubUsername: username },
    ],
  }).select("+githubAccessToken");

  if (!user) throw new Error("User not found");

  let repos = [];
  try {
    repos = await fetchUserRepos(
      user.githubUsername,
      user.githubAccessToken || null
    );
  } catch (e) {}

  const cardData = {
    username: user.githubUsername || user.username,
    avatar: user.avatar || `https://github.com/${user.githubUsername}.png`,
    totalCommits: user.totalCommits || 0,
    longestStreak: user.longestStreak || 0,
    currentStreak: user.currentStreak || 0,
    totalRepos: user.totalRepos || 0,
    score: user.score || 0,
    topLanguage: getTopLanguage(repos),
    bestMonth: getBestMonth(repos),
    badge: getBadgeFromCommits(user.totalCommits || 0),
  };

  const svgCard = generateSVGCard(cardData);

  return {
    svgCard,
    cardData,
  };
};

module.exports = { generateCard };