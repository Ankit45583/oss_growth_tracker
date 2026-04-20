// RepoCard.jsx
import React from "react";
import "./RepoCard.css";

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6",
  Python: "#3572a5",     Java: "#b07219",
  "C++": "#f34b7d",      Go: "#00add8",
  Rust: "#dea584",       HTML: "#e34c26",
  CSS: "#563d7c",        Ruby: "#701516",
  PHP: "#4f5d95",        Swift: "#f05138",
  Kotlin: "#a97bff",     Dart: "#00b4ab",
};

const RepoCard = ({ repo }) => {
  const color = LANG_COLORS[repo.language] || "#8b949e";

  return (
    <div className="repo-card anim-fade">
      <div className="repo-card-top">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-name"
        >
          {repo.name}
        </a>
        {repo.isPrivate && <span className="repo-private-badge">Private</span>}
      </div>

      <p className="repo-desc">
        {repo.description || "No description provided."}
      </p>

      <div className="repo-meta">
        {repo.language && (
          <span className="repo-lang">
            <span className="repo-lang-dot" style={{ background: color }} />
            {repo.language}
          </span>
        )}
        <span className="repo-stat">⭐ {repo.stars}</span>
        <span className="repo-stat">🍴 {repo.forks}</span>
      </div>
    </div>
  );
};

export default RepoCard;