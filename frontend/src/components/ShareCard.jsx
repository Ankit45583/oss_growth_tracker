import React, { useState } from "react";
import { cardApiService } from "../services/card.api";
import "./ShareCard.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

const ShareCard = ({ username }) => {
  const [loading, setLoading] = useState(false);
  const [svgCard, setSvgCard] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSvgCard(null);

    try {
      const res = await cardApiService.generateCard(username);

      if (res.success && res.svgCard) {
        setSvgCard(res.svgCard);
        setShowModal(true);
      } else {
        setError("Card generation failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate card. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ PNG download — backend ?format=png endpoint hit karo
  // Edge mein SVG download hone ka bug fix
  const handleDownload = () => {
  if (!svgCard) return;

  const svgBlob = new Blob([svgCard], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${username}-github-wrapped.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, "image/png");
  };

  img.src = url;
};
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://oss-growth-tracker.vercel.app/dashboard`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="share-card-btn"
      >
        {loading ? (
          <>
            <div className="share-card-spinner" />
            Generating...
          </>
        ) : (
          <>
            <span>🎴</span>
            Generate Wrapped Card
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Modal */}
      {showModal && svgCard && (
        <div className="share-modal-overlay" onClick={handleClose}>
          <div
            className="share-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 960, width: "95vw" }} // ← full card visible
          >
            {/* Modal Header */}
            <div className="share-modal-header">
              <h3 className="share-modal-title">
                🎉 Your GitHub Wrapped Card
              </h3>
              <button className="share-modal-close" onClick={handleClose}>
                ✕
              </button>
            </div>

            {/* SVG Preview — full width, nothing cut off */}
            <div className="share-modal-preview">
              <div
                dangerouslySetInnerHTML={{ __html: svgCard }}
                style={{
                  width: "100%",
                  margin: "0 auto",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #30363d",
                  lineHeight: 0, // removes extra space below SVG
                }}
              />
            </div>

            {/* Actions */}
            <div className="share-modal-actions">
              {/* ✅ PNG Download — real image file, not SVG */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="share-action-btn share-download-btn"
              >
                {downloading ? "⏳ Downloading..." : "⬇️ Download Card"}
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="share-action-btn share-share-btn"
              >
                {copied ? "✅ Copied!" : "🔗 Copy Link"}
              </button>

              {/* Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=Check out my GitHub Wrapped on OSS Growth Tracker! 🚀 @${username}&url=${encodeURIComponent(
                  "https://oss-growth-tracker.vercel.app"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-action-btn share-twitter-btn"
              >
                🐦 Share on Twitter
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  "https://oss-growth-tracker.vercel.app"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-action-btn share-linkedin-btn"
              >
                💼 Share on LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareCard;