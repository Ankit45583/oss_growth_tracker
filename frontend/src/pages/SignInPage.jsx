import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService, userService } from "../services/api";
import "./SignInPage.css";

const SignInPage = () => {
  const { isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const autoGithub = searchParams.get("then") === "github";

  useEffect(() => {
    if (isAuthenticated) {
      if (autoGithub) {
        handleAutoGithubConnect();
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated]);

  const handleAutoGithubConnect = async () => {
    try {
      const res = await userService.connectGithub();
      if (res.url) {
        window.location.href = res.url;
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Auto GitHub connect failed:", err);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          setError("Email and password are required.");
          setLoading(false);
          return;
        }

        const res = await authService.login(email.trim(), password);
        console.log("Login response:", res);

        updateUser(res.data);

        if (autoGithub) {
          const ghRes = await userService.connectGithub();
          if (ghRes.url) {
            window.location.href = ghRes.url;
            return;
          }
        }

        navigate("/dashboard", { replace: true });
      } else {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }

        if (username.trim().length < 3) {
          setError("Username must be at least 3 characters.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        const res = await authService.register(
          username.trim(),
          email.trim(),
          password
        );

        console.log("Register response:", res);

        updateUser(res.data);

        if (autoGithub) {
          const ghRes = await userService.connectGithub();
          if (ghRes.url) {
            window.location.href = ghRes.url;
            return;
          }
        }

        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("SignInPage error:", err);
      console.error("Error response:", err.response?.data);

      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="signin-page">
      <div className="signin-blob signin-blob-1" />
      <div className="signin-blob signin-blob-2" />

      <div className="signin-container anim-slide">
        <div className="signin-header">
          <div className="signin-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <h1 className="signin-title">
            {isLogin ? "Sign In" : "Create Account"}
          </h1>
          <p className="signin-subtitle">
            {autoGithub
              ? "Create an account first, then we'll connect your GitHub"
              : isLogin
              ? "Sign in to access your dashboard"
              : "Create an account to get started"}
          </p>
        </div>

        <div className="card signin-card">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="signin-form">
            {!isLogin && (
              <div className="signin-field">
                <label className="signin-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="choose a username"
                  className="signin-input"
                  disabled={loading}
                />
              </div>
            )}

            <div className="signin-field">
              <label className="signin-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="signin-input"
                disabled={loading}
              />
            </div>

            <div className="signin-field">
              <label className="signin-label">Password</label>
              <div className="signin-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Enter password" : "Min 6 characters"}
                  className="signin-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="signin-eye"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="signin-field">
                <label className="signin-label">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="signin-input"
                  disabled={loading}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="signin-submit">
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="signin-toggle-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="signin-toggle-btn" onClick={toggleMode}>
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

          <Link to="/login" className="signin-back-link">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;