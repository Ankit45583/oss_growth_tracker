// config/github.js

const GITHUB_API = "https://api.github.com";

const getHeaders = (accessToken = null) => {
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

module.exports = { GITHUB_API, getHeaders };