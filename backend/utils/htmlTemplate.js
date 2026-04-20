// utils/htmlTemplate.js

/**
 * GitHub Wrapped Card HTML Template
 */
const generateCardHTML = ({
  username,
  avatar,
  totalCommits,
  longestStreak,
  currentStreak,
  topLanguage,
  bestMonth,
  badge,
  score,
  totalRepos,
}) => {
  const badgeColors = {
    Legend:       { bg: "#e3b341", glow: "rgba(227,179,65,0.4)"  },
    Expert:       { bg: "#58a6ff", glow: "rgba(88,166,255,0.4)"  },
    Pro:          { bg: "#a371f7", glow: "rgba(163,113,247,0.4)" },
    Advanced:     { bg: "#8b949e", glow: "rgba(139,148,158,0.4)" },
    Intermediate: { bg: "#f0883e", glow: "rgba(240,136,62,0.4)"  },
    Beginner:     { bg: "#3fb950", glow: "rgba(63,185,80,0.4)"   },
    Newcomer:     { bg: "#484f58", glow: "rgba(72,79,88,0.4)"    },
  };

  const colors = badgeColors[badge?.label] || badgeColors.Newcomer;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 900px;
    height: 500px;
    font-family: 'Inter', -apple-system, sans-serif;
    background: #0d1117;
    overflow: hidden;
  }

  .card {
    width: 900px;
    height: 500px;
    background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 48px;
    overflow: hidden;
  }

  /* Background glow effects */
  .glow-1 {
    position: absolute;
    width: 400px;
    height: 400px;
    background: ${colors.glow};
    border-radius: 50%;
    filter: blur(120px);
    top: -100px;
    right: -80px;
    pointer-events: none;
  }

  .glow-2 {
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(35, 134, 54, 0.15);
    border-radius: 50%;
    filter: blur(100px);
    bottom: -80px;
    left: -60px;
    pointer-events: none;
  }

  /* Grid overlay */
  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(48, 54, 61, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(48, 54, 61, 0.3) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
    position: relative;
    z-index: 2;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid ${colors.bg};
    box-shadow: 0 0 20px ${colors.glow};
  }

  .user-text h1 {
    font-size: 24px;
    font-weight: 800;
    color: #e6edf3;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .user-text p {
    font-size: 13px;
    color: #8b949e;
    font-weight: 500;
  }

  .badge-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${colors.bg}22;
    border: 1.5px solid ${colors.bg}66;
    border-radius: 999px;
    padding: 8px 18px;
    box-shadow: 0 0 16px ${colors.glow};
  }

  .badge-emoji { font-size: 22px; }

  .badge-text {
    font-size: 15px;
    font-weight: 700;
    color: ${colors.bg};
  }

  /* Stats grid */
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    position: relative;
    z-index: 2;
    flex: 1;
  }

  .stat-box {
    background: rgba(22, 27, 34, 0.8);
    border: 1px solid #30363d;
    border-radius: 14px;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    backdrop-filter: blur(10px);
    transition: border-color 0.2s;
  }

  .stat-box:hover { border-color: #3d444d; }

  .stat-icon {
    font-size: 24px;
    margin-bottom: 12px;
    display: block;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 900;
    color: #e6edf3;
    letter-spacing: -1px;
    margin-bottom: 4px;
    line-height: 1;
  }

  .stat-value.highlight {
    color: ${colors.bg};
    text-shadow: 0 0 20px ${colors.glow};
  }

  .stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #484f58;
  }

  .stat-sub {
    font-size: 12px;
    color: #8b949e;
    margin-top: 6px;
    font-weight: 500;
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    position: relative;
    z-index: 2;
  }

  .footer-brand {
    font-size: 12px;
    color: #484f58;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .footer-score {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #8b949e;
  }

  .score-value {
    font-size: 15px;
    font-weight: 800;
    color: ${colors.bg};
  }

  /* Divider line */
  .stat-box.wide {
    grid-column: span 2;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(35, 134, 54, 0.1);
    border: 1px solid rgba(35, 134, 54, 0.25);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    color: #3fb950;
    font-weight: 600;
    margin-top: 8px;
    width: fit-content;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="grid-overlay"></div>

  <!-- Header -->
  <div class="header">
    <div class="user-info">
      <img src="${avatar}" alt="${username}" class="avatar" />
      <div class="user-text">
        <h1>@${username}</h1>
        <p>GitHub Wrapped 2024 · OSS Tracker</p>
      </div>
    </div>

    <div class="badge-pill">
      <span class="badge-emoji">${badge?.emoji || "👋"}</span>
      <span class="badge-text">${badge?.label || "Newcomer"}</span>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat-box">
      <span class="stat-icon">💻</span>
      <div>
        <div class="stat-value highlight">
          ${Number(totalCommits).toLocaleString()}
        </div>
        <div class="stat-label">Total Commits</div>
        <div class="stat-sub">All repositories</div>
      </div>
    </div>

    <div class="stat-box">
      <span class="stat-icon">🔥</span>
      <div>
        <div class="stat-value">
          ${longestStreak}
        </div>
        <div class="stat-label">Longest Streak</div>
        <div class="stat-sub">
          Current: ${currentStreak} days
        </div>
      </div>
    </div>

    <div class="stat-box">
      <span class="stat-icon">📦</span>
      <div>
        <div class="stat-value">
          ${totalRepos}
        </div>
        <div class="stat-label">Repositories</div>
        <div class="stat-sub">Public repos</div>
      </div>
    </div>

    <div class="stat-box">
      <span class="stat-icon">🌐</span>
      <div>
        <div class="stat-value" style="font-size:20px;">
          ${topLanguage || "—"}
        </div>
        <div class="stat-label">Top Language</div>
        <div class="tag">Most used</div>
      </div>
    </div>

    <div class="stat-box wide">
      <span class="stat-icon">📅</span>
      <div>
        <div class="stat-value" style="font-size:20px;">
          ${bestMonth || "—"}
        </div>
        <div class="stat-label">Most Active Month</div>
        <div class="stat-sub">Highest commit activity</div>
      </div>
    </div>

    <div class="stat-box wide">
      <span class="stat-icon">⭐</span>
      <div>
        <div class="stat-value highlight">
          ${Number(score).toLocaleString()}
        </div>
        <div class="stat-label">Total Score</div>
        <div class="stat-sub">Commits + Repos + Streak</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-brand">OSS CONTRIBUTION TRACKER</span>
    <div class="footer-score">
      <span>Score</span>
      <span class="score-value">${Number(score).toLocaleString()}</span>
    </div>
  </div>
</div>
</body>
</html>
  `;
};

module.exports = { generateCardHTML };