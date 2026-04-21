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

// ---------------- SVG GENERATOR ----------------
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
<svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">

  <!-- BACKGROUND -->
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <radialGradient id="glow" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <rect width="100%" height="100%" rx="20" fill="url(#bg)"/>
  <rect width="100%" height="100%" rx="20" fill="url(#glow)"/>

  <!-- PROFILE -->
  <image href="${avatar}" x="60" y="60" width="80" height="80"
    clip-path="circle(40px at 40px 40px)"/>
  <circle cx="100" cy="100" r="45"
    stroke="#22c55e" stroke-width="4" fill="none"/>

  <text x="170" y="90" fill="white" font-size="32" font-weight="700">
    @${username}
  </text>

  <text x="170" y="120" fill="#94a3b8" font-size="18">
    GitHub Wrapped 2024 • OSS Tracker
  </text>

  <!-- BADGE -->
  <rect x="950" y="70" rx="25" ry="25" width="180" height="50" fill="#052e16"/>
  <text x="970" y="100" fill="#22c55e" font-size="18">
    ${badge?.emoji || "🌱"} ${badge?.label || "Beginner"}
  </text>

  <!-- TOP ROW (4 CARDS) -->
  ${card(60,180,"💻","Total Commits",totalCommits,"All repositories")}
  ${card(340,180,"🔥","Longest Streak",longestStreak,`Current: ${currentStreak} days`)}
  ${card(620,180,"📦","Repositories",totalRepos,"Public repos")}
  ${card(900,180,"🌐","Top Language",topLanguage || "N/A","Most used")}

  <!-- BOTTOM ROW (2 CARDS) -->
  ${bigCard(60,400,"📅",bestMonth || "N/A","Most Active Month","Highest commit activity")}
  ${bigCard(620,400,"⭐",score,"Total Score","Commits + Repos + Streak")}

</svg>
`;

  function card(x, y, icon, title, value, sub) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="240" height="160"
        rx="20" fill="#0f172a" stroke="#1e293b"/>

      <text x="${x + 20}" y="${y + 35}" font-size="20">${icon}</text>

      <text x="${x + 20}" y="${y + 65}" fill="#94a3b8" font-size="14">
        ${title}
      </text>

      <text x="${x + 20}" y="${y + 105}" fill="white" font-size="34" font-weight="700">
        ${value}
      </text>

      <text x="${x + 20}" y="${y + 135}" fill="#64748b" font-size="13">
        ${sub}
      </text>
    </g>`;
  }

  function bigCard(x, y, icon, value, title, sub) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="500" height="180"
        rx="20" fill="#0f172a" stroke="#1e293b"/>

      <text x="${x + 20}" y="${y + 45}" font-size="24">${icon}</text>

      <text x="${x + 20}" y="${y + 85}" fill="white" font-size="28" font-weight="700">
        ${value}
      </text>

      <text x="${x + 20}" y="${y + 115}" fill="#94a3b8" font-size="16">
        ${title}
      </text>

      <text x="${x + 20}" y="${y + 140}" fill="#64748b" font-size="14">
        ${sub}
      </text>
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