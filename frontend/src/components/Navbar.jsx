import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const NAV_LINKS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/repos", label: "Repositories" },
  { path: "/leaderboard", label: "Leaderboard" },
];

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  if (loading) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="navbar-logo"
        >
          <div className="navbar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <span className="navbar-logo-text">OSS Tracker</span>
        </Link>

        {isAuthenticated && (
          <div className="navbar-links">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`navbar-link ${isActive(l.path) ? "navbar-link-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="navbar-user" ref={dropRef}>
              <img
                src={user.avatar}
                alt={user.username}
                className="navbar-avatar"
                onClick={() => setDropOpen((p) => !p)}
              />

              {dropOpen && (
                <div className="navbar-dropdown anim-fade">
                  <div className="navbar-dropdown-header">
                    <img src={user.avatar} alt="" className="navbar-dropdown-avatar" />
                    <div>
                      <p className="navbar-dropdown-name">{user.username}</p>
                      <p className="navbar-dropdown-sub">Signed in via GitHub</p>
                    </div>
                  </div>

                  <div className="navbar-dropdown-divider" />

                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      className="navbar-dropdown-item"
                      onClick={() => setDropOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}

                  <div className="navbar-dropdown-divider" />

                  <button
                    className="navbar-dropdown-item navbar-dropdown-logout"
                    onClick={() => {
                      setDropOpen(false);
                      logout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="navbar-signin-btn"
              onClick={() => {
                console.log("Navbar Sign In clicked");
                window.location.assign("/login");
              }}
            >
              Sign In
            </button>
          )}

          {isAuthenticated && (
            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen((p) => !p)}
            >
              <span className={`hamburger-bar ${mobileOpen ? "bar-top-open" : ""}`} />
              <span className={`hamburger-bar ${mobileOpen ? "bar-mid-open" : ""}`} />
              <span className={`hamburger-bar ${mobileOpen ? "bar-bot-open" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {isAuthenticated && mobileOpen && (
        <div className="navbar-mobile anim-fade">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`navbar-mobile-link ${isActive(l.path) ? "navbar-mobile-link-active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="navbar-dropdown-divider" style={{ margin: "8px 0" }} />
          <button className="navbar-mobile-link navbar-dropdown-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;