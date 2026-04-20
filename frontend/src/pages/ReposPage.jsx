import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { repoService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import RepoCard from "../components/RepoCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./ReposPage.css";

const ReposPage = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("All");
  const [sortBy, setSortBy] = useState("updated");

  const ghConnected = user?.githubConnected || false;
  const ghUsername = user?.githubUsername || "";

  useEffect(() => {
    if (ghConnected) {
      fetchRepos();
    } else {
      setLoading(false);
    }
  }, [ghConnected]);

  const fetchRepos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await repoService.getRepos();
      const repoList = Array.isArray(res.data) ? res.data : [];
      setRepos(repoList);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  };

  const languages = ["All"];
  repos.forEach((r) => {
    if (r && r.language && !languages.includes(r.language)) {
      languages.push(r.language);
    }
  });
  languages.sort();

  const filtered = repos
    .filter((r) => {
      if (!r) return false;
      const q = search.toLowerCase();
      const nameMatch = (r.name || "").toLowerCase().includes(q);
      const descMatch = (r.description || "").toLowerCase().includes(q);
      const langMatch = lang === "All" || r.language === lang;
      return (nameMatch || descMatch) && langMatch;
    })
    .sort((a, b) => {
      if (sortBy === "stars") return (Number(b.stars) || 0) - (Number(a.stars) || 0);
      if (sortBy === "forks") return (Number(b.forks) || 0) - (Number(a.forks) || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

  /* ── GitHub not connected ── */
  if (!ghConnected) {
    return (
      <div className="page-wrapper anim-fade">
        <div className="repos-topbar">
          <div>
            <h1 className="dash-page-title">Repositories</h1>
            <p className="text-muted">Connect GitHub to view your repos</p>
          </div>
        </div>

        <div className="repos-empty-state">
          <div className="repos-empty-icon">🔗</div>
          <h2 className="repos-empty-title">GitHub Not Connected</h2>
          <p className="repos-empty-desc">
            To view your repositories, first connect your GitHub account from the Dashboard.
          </p>
          <div className="repos-empty-steps">
            <div className="repos-empty-step">
              <span className="repos-step-num">1</span>
              <span>Go to Dashboard</span>
            </div>
            <div className="repos-empty-step">
              <span className="repos-step-num">2</span>
              <span>Click "Connect GitHub Account"</span>
            </div>
            <div className="repos-empty-step">
              <span className="repos-step-num">3</span>
              <span>Authorize on GitHub</span>
            </div>
            <div className="repos-empty-step">
              <span className="repos-step-num">4</span>
              <span>Come back here to see repos</span>
            </div>
          </div>
          <Link to="/dashboard" className="repos-go-dashboard">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper anim-fade">
      {/* Header */}
      <div className="repos-topbar">
        <div>
          <h1 className="dash-page-title">Repositories</h1>
          <p className="text-muted">
            {loading ? "Loading..." : `${repos.length} repos from @${ghUsername}`}
          </p>
        </div>
        <button onClick={fetchRepos} disabled={loading} className="btn-secondary">
          <svg
            width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}
            style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>

      {/* Filters */}
      {!loading && repos.length > 0 && (
        <div className="card repos-filters">
          <div className="repos-filter-row">
            <div className="repos-search-wrap">
              <svg className="repos-search-icon" width="14" height="14" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="repos-search-input"
              />
            </div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="repos-select">
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="repos-select">
              <option value="updated">Recently Updated</option>
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Fetching repositories from GitHub..." />
      ) : error ? (
        <div className="repos-empty-state">
          <p className="repos-empty-icon">⚠️</p>
          <p className="repos-empty-title">{error}</p>
          <button onClick={fetchRepos} className="btn-secondary" style={{ marginTop: 16 }}>
            Try Again
          </button>
        </div>
      ) : repos.length === 0 ? (
        <div className="repos-empty-state">
          <p className="repos-empty-icon">📭</p>
          <p className="repos-empty-title">No repositories found</p>
          <p className="repos-empty-desc">
            No public repos found for @{ghUsername}. Create a repo on GitHub and refresh.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="repos-empty-state">
          <p className="repos-empty-icon">🔍</p>
          <p className="repos-empty-title">No matching repositories</p>
          <p className="repos-empty-desc">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearch(""); setLang("All"); }}
            className="btn-secondary"
            style={{ marginTop: 16 }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted" style={{ marginBottom: 16 }}>
            Showing {filtered.length} of {repos.length} repositories
          </p>
          <div className="repos-grid">
            {filtered.map((repo) => (
              <RepoCard key={repo.id || repo.name} repo={repo} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReposPage;