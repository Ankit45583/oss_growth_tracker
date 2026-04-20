// src/utils/downloadImage.js

/**
 * Image URL se download karo
 */
export const downloadImage = async (imageUrl, filename = "github-wrapped.png") => {
  try {
    const response = await fetch(imageUrl);
    const blob     = await response.blob();
    const url      = window.URL.createObjectURL(blob);

    const link    = document.createElement("a");
    link.href     = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback — new tab me open karo
    window.open(imageUrl, "_blank");
  }
};

/**
 * Image share karo Web Share API se
 */
export const shareImage = async (imageUrl, username) => {
  const shareData = {
    title: `${username}'s GitHub Wrapped`,
    text:  `Check out my GitHub Wrapped on OSS Tracker! 🚀`,
    url:   imageUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      console.log("Share cancelled:", err);
      return false;
    }
  } else {
    // Fallback — clipboard pe copy karo
    await navigator.clipboard.writeText(imageUrl);
    return "copied";
  }
};