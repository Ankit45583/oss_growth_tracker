// src/utils/formatData.js

/**
 * Number ko readable format me karo
 * 1000 → 1k, 1500 → 1.5k
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return "—";
  const n = Number(num);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
};

/**
 * Date ko readable format me karo
 */
export const formatDate = (date) => {
  if (!date) return "Never";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    }).format(new Date(date));
  } catch {
    return "—";
  }
};

/**
 * Date + time format
 */
export const formatDateTime = (date) => {
  if (!date) return "Never";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month:  "short",
      day:    "numeric",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "—";
  }
};

/**
 * Kitne time pehle
 */
export const timeAgo = (date) => {
  if (!date) return "Never";
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return formatDate(date);
};

/**
 * GitHub username se avatar URL
 */
export const githubAvatar = (username, size = 80) => {
  if (!username) return "";
  return `https://github.com/${username}.png?size=${size}`;
};