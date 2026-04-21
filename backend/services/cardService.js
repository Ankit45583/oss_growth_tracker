const User = require("../models/User");
const { fetchUserRepos } = require("./githubService");
const { getBadgeFromCommits } = require("../utils/scoreCalculator");

// ---------------- HELPERS ----------------
const getTopLanguage = (repos) => {
  const langCount = {};
  repos.forEach((repo) => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
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

  // ── layout constants ──────────────────────────────────────────
  const W = 1200, H = 700;

  // grid-line pattern (subtle dark-green dots like the screenshot)
  const gridPattern = `
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1" fill="#1a3a2a" opacity="0.6"/>
    </pattern>`;

  // top-row card: x, y, icon char, title, big value, subtitle
  function card(x, y, icon, title, value, sub) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="258" height="168" rx="16" ry="16"
        fill="#0d1b2a" stroke="#1e2d3d" stroke-width="1"/>
      <text x="${x + 22}" y="${y + 42}" font-size="26" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif">${icon}</text>
      <text x="${x + 22}" y="${y + 72}" font-size="13" font-weight="600" letter-spacing="0.08em"
        fill="#4a6a7a" font-family="'Segoe UI',system-ui,sans-serif">${title.toUpperCase()}</text>
      <text x="${x + 22}" y="${y + 118}" font-size="42" font-weight="800"
        fill="#ffffff" font-family="'Segoe UI',system-ui,sans-serif">${value}</text>
      <text x="${x + 22}" y="${y + 148}" font-size="13" fill="#4a6a7a"
        font-family="'Segoe UI',system-ui,sans-serif">${sub}</text>
    </g>`;
  }

  // top-row card for "Top Language" — value in bold green, "Most used" pill
  function langCard(x, y, icon, title, value, sub) {
    return `
    <g>
      <rect x="${x}" y="${y}" width="258" height="168" rx="16" ry="16"
        fill="#0d1b2a" stroke="#1e2d3d" stroke-width="1"/>
      <text x="${x + 22}" y="${y + 42}" font-size="26" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif">${icon}</text>
      <text x="${x + 22}" y="${y + 72}" font-size="13" font-weight="600" letter-spacing="0.08em"
        fill="#4a6a7a" font-family="'Segoe UI',system-ui,sans-serif">${title.toUpperCase()}</text>
      <text x="${x + 22}" y="${y + 116}" font-size="30" font-weight="800"
        fill="#ffffff" font-family="'Segoe UI',system-ui,sans-serif">${value}</text>
      <!-- "Most used" green pill -->
      <rect x="${x + 22}" y="${y + 130}" width="80" height="26" rx="6"
        fill="#052e16"/>
      <text x="${x + 62}" y="${y + 148}" font-size="12" font-weight="600"
        fill="#22c55e" text-anchor="middle"
        font-family="'Segoe UI',system-ui,sans-serif">${sub}</text>
    </g>`;
  }

  // bottom big card
  function bigCard(x, y, icon, value, title, sub, valueColor) {
    const vc = valueColor || "#ffffff";
    return `
    <g>
      <rect x="${x}" y="${y}" width="534" height="188" rx="16" ry="16"
        fill="#0d1b2a" stroke="#1e2d3d" stroke-width="1"/>
      <text x="${x + 24}" y="${y + 52}" font-size="28" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif">${icon}</text>
      <text x="${x + 24}" y="${y + 102}" font-size="44" font-weight="800"
        fill="${vc}" font-family="'Segoe UI',system-ui,sans-serif">${value}</text>
      <text x="${x + 24}" y="${y + 134}" font-size="14" font-weight="600" letter-spacing="0.06em"
        fill="#4a6a7a" font-family="'Segoe UI',system-ui,sans-serif">${title.toUpperCase()}</text>
      <text x="${x + 24}" y="${y + 158}" font-size="13" fill="#4a6a7a"
        font-family="'Segoe UI',system-ui,sans-serif">${sub}</text>
    </g>`;
  }

  // badge pill top-right
  const badgeEmoji = badge?.emoji || "🌱";
  const badgeLabel = badge?.label || "Beginner";

  // card row positions
  const ROW1_Y = 190;
  const ROW2_Y = 420;
  const CARD_W = 258;
  const GAP = 16;
  const LEFT = 54;

  // 4 top cards spaced evenly across 1200px
  // total width needed: 4*258 + 3*16 = 1032 + 48 = 1080 → left margin = (1200-1080)/2 = 60
  const c1x = 60, c2x = 60 + CARD_W + GAP, c3x = 60 + 2*(CARD_W + GAP), c4x = 60 + 3*(CARD_W + GAP);
  // 2 bottom cards: each 534 wide, gap 16 → total 1084 → left = (1200-1084)/2 = 58
  const b1x = 58, b2x = 58 + 534 + GAP;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${gridPattern}
    <!-- deep navy-to-slightly-lighter navy bg -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020c14"/>
      <stop offset="100%" stop-color="#061220"/>
    </linearGradient>
    <!-- radial green glow top-right -->
    <radialGradient id="glow" cx="88%" cy="15%" r="55%">
      <stop offset="0%" stop-color="#16a34a" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="#052e16" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- background layers -->
  <rect width="${W}" height="${H}" rx="22" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" rx="22" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" rx="22" fill="url(#glow)"/>

  <!-- ── PROFILE ── -->
  <clipPath id="avatarClip">
    <circle cx="100" cy="95" r="40"/>
  </clipPath>
  <image href="${avatar}" x="60" y="55" width="80" height="80" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
  <!-- green ring around avatar -->
  <circle cx="100" cy="95" r="44" stroke="#22c55e" stroke-width="3.5" fill="none"/>

  <!-- username -->
  <text x="165" y="86" font-size="30" font-weight="700" fill="#ffffff"
    font-family="'Segoe UI',system-ui,sans-serif">@${username}</text>
  <!-- subtitle -->
  <text x="165" y="115" font-size="16" fill="#64748b"
    font-family="'Segoe UI',system-ui,sans-serif">GitHub Wrapped 2024 · OSS Tracker</text>

  <!-- ── BADGE pill top-right ── -->
  <rect x="966" y="68" width="178" height="52" rx="26" fill="#052e16"/>
  <text x="986" y="100" font-size="22" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif">${badgeEmoji}</text>
  <text x="1016" y="101" font-size="17" font-weight="600" fill="#22c55e"
    font-family="'Segoe UI',system-ui,sans-serif">${badgeLabel}</text>

  <!-- ── TOP ROW: 4 stat cards ── -->
  ${card(c1x, ROW1_Y, "💻", "Total Commits", totalCommits, "All repositories")}
  ${card(c2x, ROW1_Y, "🔥", "Longest Streak", longestStreak, `Current: ${currentStreak} days`)}
  ${card(c3x, ROW1_Y, "📦", "Repositories", totalRepos, "Public repos")}
  ${langCard(c4x, ROW1_Y, "🌐", "Top Language", topLanguage || "N/A", "Most used")}

  <!-- ── BOTTOM ROW: 2 wide cards ── -->
  ${bigCard(b1x, ROW2_Y, "📅", bestMonth || "N/A", "Most Active Month", "Highest commit activity", "#ffffff")}
  ${bigCard(b2x, ROW2_Y, "⭐", score, "Total Score", "Commits + Repos + Streak", "#22c55e")}

</svg>`;
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

  return { svgCard, cardData };
};

module.exports = { generateCard };