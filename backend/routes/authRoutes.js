
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  githubLogin,
  githubCallback,
  logout,
} = require("../controllers/authController");

// ─── Auth Routes ───────────────────────────
router.post("/register", register);
router.post("/login", login);

// ─── GitHub OAuth ──────────────────────────
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

// ─── Logout ────────────────────────────────
router.post("/logout", logout);

module.exports = router;

