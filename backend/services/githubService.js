// services/githubService.js
// Tumhara existing fetchTotalCommits yahan move kiya — improved version

const axios = require("axios");

const GITHUB_API = "https://api.github.com";

/**
 * GitHub API headers banao
 */
const getHeaders = (accessToken = null) => {
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

/**
 * GitHub user profile fetch karo
 */
const fetchGithubProfile = async (username, accessToken = null) => {
  try {
    const res = await axios.get(`${GITHUB_API}/users/${username}`, {
      headers: getHeaders(accessToken),
    });
    return res.data;
  } catch (error) {
    console.error("[GitHub] Profile fetch failed:", error.message);
    throw error;
  }
};

/**
 * User ke repos fetch karo
 */
const fetchUserRepos = async (username, accessToken = null) => {
  try {
    const res = await axios.get(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`,
      { headers: getHeaders(accessToken) }
    );
    return res.data;
  } catch (error) {
    console.error("[GitHub] Repos fetch failed:", error.message);
    throw error;
  }
};

/**
 * Total commits fetch karo (3 fallback methods)
 * Tumhara existing logic — cleanly organized
 */
const fetchTotalCommits = async (username, accessToken = null) => {
  let totalCommits = 0;

  // Method 1: Search API
  try {
    const res = await axios.get(
      `${GITHUB_API}/search/commits?q=author:${username}`,
      {
        headers: {
          ...getHeaders(accessToken),
          Accept: "application/vnd.github.cloak-preview+json",
        },
      }
    );
    totalCommits = res.data.total_count || 0;
    if (totalCommits > 0) {
      console.log("[GitHub] Commits via Search API:", totalCommits);
      return totalCommits;
    }
  } catch (err) {
    console.log("[GitHub] Search API failed:", err.message);
  }

  // Method 2: Per repo commit count
  try {
    const repos = await fetchUserRepos(username, accessToken);

    for (const repo of repos.slice(0, 15)) {
      try {
        const res = await axios.get(
          `${GITHUB_API}/repos/${repo.full_name}/commits?author=${username}&per_page=1`,
          { headers: getHeaders(accessToken) }
        );

        const link = res.headers["link"] || "";
        if (link.includes('rel="last"')) {
          const match = link.match(/page=(\d+)>; rel="last"/);
          if (match) totalCommits += parseInt(match[1], 10);
        } else if (res.data.length > 0) {
          totalCommits += 1;
        }
      } catch {}
    }

    if (totalCommits > 0) {
      console.log("[GitHub] Commits via Repo method:", totalCommits);
      return totalCommits;
    }
  } catch (err) {
    console.log("[GitHub] Repo method failed:", err.message);
  }

  // Method 3: Public Events
  try {
    const res = await axios.get(
      `${GITHUB_API}/users/${username}/events/public?per_page=100`,
      { headers: getHeaders(accessToken) }
    );

    totalCommits = res.data
      .filter((e) => e.type === "PushEvent")
      .reduce((sum, e) => sum + (e.payload.commits?.length || 0), 0);

    console.log("[GitHub] Commits via Events:", totalCommits);
  } catch (err) {
    console.log("[GitHub] Events API failed:", err.message);
  }

  return totalCommits;
};

/**
 * User ke commit dates fetch karo (streak ke liye)
 */
const fetchCommitDates = async (username, accessToken = null) => {
  const commitDates = [];

  try {
    const repos = await fetchUserRepos(username, accessToken);

    for (const repo of repos.slice(0, 10)) {
      try {
        const res = await axios.get(
          `${GITHUB_API}/repos/${repo.full_name}/commits?author=${username}&per_page=100`,
          { headers: getHeaders(accessToken) }
        );

        res.data.forEach((commit) => {
          const date = commit.commit?.author?.date;
          if (date) commitDates.push(new Date(date));
        });
      } catch {}
    }
  } catch (err) {
    console.log("[GitHub] Commit dates fetch failed:", err.message);
  }

  return commitDates;
};

module.exports = {
  fetchGithubProfile,
  fetchUserRepos,
  fetchTotalCommits,
  fetchCommitDates,
};