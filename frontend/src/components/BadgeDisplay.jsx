import React from "react";
import "./BadgeDisplay.css";

const BADGES = [
  { min: 1000, label: "Legend",       emoji: "🏆", color: "#e3b341" },
  { min: 500,  label: "Expert",       emoji: "💎", color: "#58a6ff" },
  { min: 200,  label: "Pro",          emoji: "🥇", color: "#a371f7" },
  { min: 100,  label: "Advanced",     emoji: "🥈", color: "#8b949e" },
  { min: 50,   label: "Intermediate", emoji: "🥉", color: "#f0883e" },
  { min: 10,   label: "Beginner",     emoji: "🌱", color: "#3fb950" },
  { min: 0,    label: "Newcomer",     emoji: "👋", color: "#484f58" },
];

const BadgeDisplay = ({ totalCommits }) => {
  const commits = Number(totalCommits ?? 0);

  const current =
    BADGES.find((b) => commits >= b.min) || BADGES[BADGES.length - 1];

  const currentIndex = BADGES.findIndex((b) => b.label === current.label);
  const nextBadge = currentIndex > 0 ? BADGES[currentIndex - 1] : null;

  const progress = nextBadge
    ? Math.min(((commits - current.min) / (nextBadge.min - current.min)) * 100, 100)
    : 100;

  return (
    <div className="badge-card card anim-slide">
      <p className="section-title">Your Badge</p>

      <div className="badge-current" style={{ borderColor: current.color + "44" }}>
        <div className="badge-emoji-wrap" style={{ background: current.color + "22" }}>
          <span className="badge-emoji">{current.emoji}</span>
        </div>

        <p className="badge-label" style={{ color: current.color }}>
          {current.label}
        </p>

        <p className="badge-commits">
          {commits.toLocaleString()} commits
        </p>

        {nextBadge && (
          <div className="badge-progress-section">
            <div className="badge-progress-labels">
              <span>{current.label}</span>
              <span>
                → {nextBadge.label} ({nextBadge.min})
              </span>
            </div>
            <div className="badge-progress-track">
              <div
                className="badge-progress-fill"
                style={{
                  width: `${progress}%`,
                  background: current.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="badge-all-label">All Badges</p>

      <div className="badge-list">
        {BADGES.map((b) => (
          <div
            key={b.label}
            className={`badge-pill ${
              commits >= b.min ? "badge-pill-earned" : "badge-pill-locked"
            }`}
            style={
              commits >= b.min
                ? { borderColor: b.color + "66", background: b.color + "11" }
                : {}
            }
            title={`${b.label}: ${b.min}+ commits`}
          >
            <span>{b.emoji}</span>
            <span className="badge-pill-label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeDisplay;