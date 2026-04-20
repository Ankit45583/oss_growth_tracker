// src/components/ShareCard.jsx

import React, { useState } from "react";
import { cardApiService }   from "../services/card.api";
import { downloadImage, shareImage } from "../utils/downloadImage";
import "./ShareCard.css";

const ShareCard = ({ username }) => {
  const [loading,  setLoading]  = useState(false);
  const [cardUrl,  setCardUrl]  = useState(null);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setCardUrl(null);

    try {
      const res = await cardApiService.generateCard(username);

      if (res.success && res.cardUrl) {
        setCardUrl(res.cardUrl);
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

  const handleDownload = () => {
    if (cardUrl) {
      downloadImage(cardUrl, `${username}-github-wrapped.png`);
    }
  };

  const handleShare = async () => {
    if (!cardUrl) return;

    const result = await shareImage(cardUrl, username);

    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
      {showModal && cardUrl && (
        <div className="share-modal-overlay" onClick={handleClose}>
          <div
            className="share-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="share-modal-header">
              <h3 className="share-modal-title">
                🎉 Your GitHub Wrapped Card
              </h3>
              <button
                className="share-modal-close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {/* Card Preview */}
            <div className="share-modal-preview">
              <img
                src={cardUrl}
                alt="GitHub Wrapped Card"
                className="share-card-image"
              />
            </div>

            {/* Actions */}
            <div className="share-modal-actions">
              <button
                onClick={handleDownload}
                className="share-action-btn share-download-btn"
              >
                ⬇️ Download PNG
              </button>

              <button
                onClick={handleShare}
                className="share-action-btn share-share-btn"
              >
                {copied ? "✅ Link Copied!" : "🔗 Share Link"}
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=Check out my GitHub Wrapped! 🚀&url=${encodeURIComponent(cardUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-action-btn share-twitter-btn"
              >
                🐦 Share on Twitter
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`}
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