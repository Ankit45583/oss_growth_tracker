import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/api";
import StatCard from "../components/StatCard";
import BadgeDisplay from "../components/BadgeDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import ShareCard from "../components/ShareCard";
import useStreak from "../features/streak/useStreak";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [searchParams] = useSearchParams();

  const { currentStreak, longestStreak, lastCommitText, streakBadge } =
    useStreak(user);

  useEffect(() => {
    if (searchParams.get("github") === "connected") {
      setMsg(
        "GitHub connected successfully! Click Refresh Data to load your stats."
      );
      reloadUser();
    }
  }, [searchParams]);

  const reloadUser = async () => {
    try {
      const res = await userService.getUser();
      updateUser(res.data);
    } catch (e) {
      console.error("Reload user failed:", e);
    }
  };

  const clearMsgs = () => {
    setTimeout(() => {
      setMsg("");
      setErr("");
    }, 5000);
  };

  const handleRefresh = useCallback(async () => {
    if (!user?.githubConnected) {
      setErr("Connect GitHub first, then refresh.");
      clearMsgs();
      return;
    }

    setRefreshing(true);
    setMsg("");
    setErr("");

    try {
      const res = await userService.refreshStats();
      updateUser(res.data);
      setMsg("Stats refreshed!");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to refresh.");
    } finally {
      setRefreshing(false);
      clearMsgs();
    }
  }, [updateUser, user]);

  // ✅ FIXED - Simple function, no async, no try/catch
  const handleConnectGithub = () => {
    setConnecting(true);
    userService.connectGithub(); // Direct browser redirect
  };

  const fmtDate = (d) => {
    if (!d) return "Never";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(d));
    } catch {
      return "—";
    }
  };

  const fmtMonth = (d) => {
    if (!d) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return "—";
    }
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const ghConnected = user.githubConnected || false;
  const ghUsername = user.githubUsername || "";
  const totalRepos = Number(user.totalRepos ?? 0);
  const totalCommits = Number(user.totalCommits ?? 0);
  const score = Number(user.score ?? 0);

  return (
    <div className="page-wrapper anim-fade">
      {/* Top bar */}
      <div className="dash-topbar">
        <div>
          <h1 className="dash-page-title">Dashboard</h1>
          <p className="text-muted">Your open source contribution overview</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Share Card Button */}
          {ghConnected && (
            <ShareCard username={user.githubUsername || user.username} />
          )}

          {/* Refresh Button */}
          {ghConnected && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary"
            >
              {refreshing ? (
                <>
                  <div className="dash-btn-spinner" />
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          ✅ {msg}
        </div>
      )}
      {err && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          ❌ {err}
        </div>
      )}

      {/* Profile */}
      <div className="card dash-profile anim-slide">
        <div className="dash-profile-left">
          <div className="dash-avatar-wrap">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="dash-avatar"
              />
            ) : (
              <div
                className="dash-avatar"
                style={{
                  background: "var(--bg-hover)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  width: 76,
                  height: 76,
                  borderRadius: 14,
                }}
              >
                👤
              </div>
            )}
          </div>

          <div>
            <h2 className="dash-username">{user.username}</h2>
            {user.email && <p className="dash-email">{user.email}</p>}
            <div className="dash-meta">
              <span>📅 Member since {fmtMonth(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {!ghConnected ? (
        <div className="dash-github-section anim-slide">
          <div className="dash-github-header">
            <span className="dash-github-icon">🐙</span>
            <div>
              <h3 className="dash-github-title">GitHub Not Connected</h3>
              <p className="dash-github-desc">
                Connect your GitHub account to track repositories, commits,
                streaks, badges, and compete on the leaderboard.
              </p>
            </div>
          </div>

          <div className="dash-github-steps">
            <div className="dash-github-step">
              <span className="dash-step-num">1</span>
              <span>Click "Connect GitHub" below</span>
            </div>
            <div className="dash-github-step">
              <span className="dash-step-num">2</span>
              <span>Authorize the app on GitHub</span>
            </div>
            <div className="dash-github-step">
              <span className="dash-step-num">3</span>
              <span>Your repos, commits and streaks will appear here</span>
            </div>
          </div>

          <button
            onClick={handleConnectGithub}
            disabled={connecting}
            className="dash-connect-btn"
          >
            {connecting ? (
              <>
                <div className="dash-btn-spinner" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Connect GitHub Account
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="dash-connected-info anim-slide">
            <div className="dash-connected-left">
              <span>✅</span>
              <div>
                <p className="dash-connected-title">
                  GitHub Connected: <strong>@{ghUsername}</strong>
                </p>
                <p className="dash-connected-sub">
                  Last refreshed: {fmtDate(user.lastRefreshed)}
                </p>
              </div>
            </div>

            <a
              href={`https://github.com/${ghUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: 13, textDecoration: "none" }}
            >
              View GitHub ↗
            </a>
          </div>

          {/* Stats Grid */}
          <div className="dash-stats-grid">
            <StatCard
              icon="📦"
              label="Public Repositories"
              value={totalRepos}
              color="blue"
              subtitle={`From @${ghUsername}`}
            />

            <StatCard
              icon="💻"
              label="Total Commits"
              value={totalCommits}
              color="green"
              subtitle="Across all repos"
            />

            <StatCard
              icon="🔥"
              label="Current Streak"
              value={`${currentStreak} days`}
              color="yellow"
              subtitle={lastCommitText || "No commits yet"}
            />

            <StatCard
              icon="🏆"
              label="Longest Streak"
              value={`${longestStreak} days`}
              color="purple"
              subtitle="Personal best"
            />

            <StatCard
              icon="⭐"
              label="Score"
              value={score}
              color="blue"
              subtitle="Based on commits + streak"
            />

            <StatCard
              icon="🆔"
              label="App Account"
              value={user.username}
              color="purple"
              subtitle="Your app identity"
            />
          </div>

          <div className="dash-bottom-grid">
            <BadgeDisplay totalCommits={totalCommits} />

            <div className="card dash-tips anim-slide">
              <p className="section-title">💡 Insights & Tips</p>

              <div className="dash-tips-grid">
                <div className="dash-tip-item">
                  <span className="dash-tip-emoji">
                    {streakBadge?.emoji || "🔥"}
                  </span>
                  <div>
                    <p className="dash-tip-title">
                      Streak Status: {streakBadge?.label || "No Streak"}
                    </p>
                    <p className="dash-tip-desc">
                      {currentStreak > 0
                        ? `You're on a ${currentStreak}-day streak. Keep going!`
                        : "Make a commit today to start your streak."}
                    </p>
                  </div>
                </div>

                <div className="dash-tip-item">
                  <span className="dash-tip-emoji">🔄</span>
                  <div>
                    <p className="dash-tip-title">Refresh regularly</p>
                    <p className="dash-tip-desc">
                      Click Refresh Data to sync latest GitHub stats.
                    </p>
                  </div>
                </div>

                <div className="dash-tip-item">
                  <span className="dash-tip-emoji">📝</span>
                  <div>
                    <p className="dash-tip-title">Commit daily</p>
                    <p className="dash-tip-desc">
                      Daily commits help improve your streak and score.
                    </p>
                  </div>
                </div>

                <div className="dash-tip-item">
                  <span className="dash-tip-emoji">🏆</span>
                  <div>
                    <p className="dash-tip-title">Climb leaderboard</p>
                    <p className="dash-tip-desc">
                      More commits and stronger streaks improve your rank.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;