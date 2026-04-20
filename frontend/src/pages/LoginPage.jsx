import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const FEATURES = [
  { emoji: "📊", text: "Track repos & recent commits" },
  { emoji: "🏆", text: "Compete on the leaderboard" },
  { emoji: "🎖️", text: "Earn badges for milestones" },
  { emoji: "🔄", text: "One-click GitHub data sync" },
];

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const e = searchParams.get("error");
    if (e === "no_code") setError("Authorization was denied.");
    else if (e === "token_failed") setError("GitHub authentication failed.");
    else if (e === "server_error") setError("Server error. Try again.");
    else if (e) setError("Authentication failed.");
  }, [searchParams]);

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-container anim-slide">
        <div className="login-header">
          <div className="login-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <h1 className="login-title">OSS Contribution Tracker</h1>
          <p className="login-subtitle">
            Track your open source journey. Compete with developers worldwide.
          </p>
        </div>

        <div className="card login-card">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <ul className="login-features">
            {FEATURES.map((f) => (
              <li key={f.text} className="login-feature-item">
                <span className="login-feature-emoji">{f.emoji}</span>
                <span className="login-feature-text">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Continue with GitHub → pehle signin page pe jao with auto_github flag */}
          <a href="/signin?then=github" className="login-github-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </a>

          <p className="login-note">
            You'll create an account first, then connect GitHub.
          </p>

          <div className="login-or-signin">
            <span className="login-or-line" />
            <span className="login-or-text">or</span>
            <span className="login-or-line" />
          </div>

          <a href="/signin" className="login-signin-link">
            Sign in with Email & Password
          </a>
        </div>

        <p className="login-footer">Open source. No ads. No tracking. ❤️</p>
      </div>
    </div>
  );
};

export default LoginPage;