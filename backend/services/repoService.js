// services/repoService.js

const { fetchUserRepos } = require("./githubService");

/**
 * Repos fetch karo aur clean format me return karo
 */
const getUserRepos = async (username, accessToken = null) => {
  try {
    const rawRepos = await fetchUserRepos(username, accessToken);

    const repos = rawRepos.map((repo) => ({
      id:          repo.id,
      name:        repo.name,
      fullName:    repo.full_name,
      description: repo.description || "",
      url:         repo.html_url,
      stars:       Number(repo.stargazers_count ?? 0),
      forks:       Number(repo.forks_count      ?? 0),
      language:    repo.language    || "",
      isPrivate:   repo.private     || false,
      updatedAt:   repo.updated_at,
    }));

    console.log(`[Repo] Found ${repos.length} repos for ${username}`);
    return repos;
  } catch (error) {
    console.error("[Repo] Error:", error.message);
    throw error;
  }
};

module.exports = { getUserRepos };