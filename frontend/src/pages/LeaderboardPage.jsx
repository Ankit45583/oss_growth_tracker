// LeaderboardPage.jsx
import React, { useState, useEffect } from "react";
import { leaderboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import "./LeaderboardPage.css";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

const RankCell = ({ rank }) =>
  MEDALS[rank] ? (
    <span className="lb-medal">{MEDALS[rank]}</span>
  ) : (
    <span className="lb-rank-num">#{rank}</span>
  );

const LeaderboardPage = () => {
  const { user: me } = useAuth();
  const [board,   setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => { fetchBoard(); }, []);

  const fetchBoard = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await leaderboardService.getLeaderboard();

    // ✅ SAFE CHECK
    if (Array.isArray(res.data)) {
      setBoard(res.data);
    } else if (Array.isArray(res.data.leaderboard)) {
      setBoard(res.data.leaderboard);
    } else {
      console.log("Invalid leaderboard:", res.data);
      setBoard([]);
      setError(res.data.message || "Invalid data received");
    }

  } catch (e) {
    setBoard([]); // ✅ important
    setError("Failed to load leaderboard. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const myEntry = board.find((u) => u.username === me?.username);

  return (
    <div className="page-wrapper anim-fade">
      {/* Header */}
      <div className="lb-header">
        <h1 className="lb-title">🏆 Leaderboard</h1>
        <p className="text-muted">Top contributors ranked by recent commit activity</p>
      </div>

      {/* My rank highlight */}
      {myEntry && (
        <div className="lb-my-rank anim-slide">
          <div className="lb-my-rank-left">
            <RankCell rank={myEntry.rank} />
            <img src={myEntry.avatar} alt="" className="lb-my-avatar" />
            <div>
              <p className="lb-my-name">You ({myEntry.username})</p>
              <p className="lb-my-sub">
                Rank #{myEntry.rank} · {myEntry.totalCommits} recent commits
              </p>
            </div>
          </div>
          <span className="lb-my-badge">{myEntry.badge?.emoji} {myEntry.badge?.label}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading leaderboard..." />
      ) : error ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "var(--accent-red)", marginBottom: "16px" }}>⚠️ {error}</p>
          <button onClick={fetchBoard} className="btn-secondary">Try Again</button>
        </div>
      ) : (
        <div className="card lb-table-card">
          {/* Table head */}
          <div className="lb-thead">
            <span className="lb-col-rank">Rank</span>
            <span className="lb-col-user">Developer</span>
            <span className="lb-col-repos">Repos</span>
            <span className="lb-col-commits">Commits</span>
            <span className="lb-col-badge">Badge</span>
          </div>

          {/* Rows */}
          {board.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>👻</p>
              <p style={{ fontWeight: 600, marginBottom: "6px" }}>No users yet!</p>
              <p className="text-muted">Be the first to log in and claim rank #1.</p>
            </div>
          ) : (
            board.map((entry, i) => {
              const isMe  = entry.username === me?.username;
              const isTop = entry.rank <= 3;
              return (
                <div
                  key={entry._id}
                  className={`lb-row
                    ${isMe  ? "lb-row-me"  : ""}
                    ${isTop ? "lb-row-top" : ""}
                  `}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="lb-col-rank">
                    <RankCell rank={entry.rank} />
                  </span>

                  <span className="lb-col-user lb-user-cell">
                    <img src={entry.avatar} alt="" className="lb-avatar" />
                    <div className="lb-user-info">
                      <a
                        href={`https://github.com/${entry.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`lb-username ${isMe ? "lb-username-me" : ""}`}
                      >
                        {entry.username}
                        {isMe && <span className="lb-you-tag">you</span>}
                      </a>
                    </div>
                  </span>

                  <span className="lb-col-repos lb-stat">{entry.totalRepos}</span>

                  <span className={`lb-col-commits lb-stat lb-commits ${isTop ? "lb-commits-top" : ""}`}>
                    {entry.totalCommits.toLocaleString()}
                  </span>

                  <span className="lb-col-badge lb-badge-cell">
                    <span className="lb-badge-emoji">{entry.badge?.emoji}</span>
                    <span className="lb-badge-label">{entry.badge?.label}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      <p className="lb-footer-note">
        Rankings based on recent GitHub public event activity (last 100 events).
        Refresh your stats on the dashboard to update your position.
      </p>
    </div>
  );
};

export default LeaderboardPage;