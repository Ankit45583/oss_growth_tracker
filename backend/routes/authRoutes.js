// routes/authRoutes.js

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  connectGithubStart,
  githubLogin,
  githubCallback,
  logout,
} = require("../controllers/authController");

// routes/authRoutes.js me top pe add karo temporarily

router.post("/register", (req, res, next) => {
  console.log("Body received:", req.body);  // ← debug
  console.log("Headers:", req.headers);     // ← debug
  next();
}, register);

// POST /auth/register        → Register
// POST /auth/login           → Login
// GET  /auth/github          → GitHub OAuth start (direct login)
// GET  /auth/github/connect  → GitHub connect (existing user)
// GET  /auth/github/callback → GitHub callback
// POST /auth/logout          → Logout

router.post("/register",         register);
router.post("/login",            login);
router.get("/github",            githubLogin);
router.get("/github/connect",    protect, connectGithubStart);
router.get("/github/callback",   githubCallback);
router.post("/logout",           protect, logout);

module.exports = router;