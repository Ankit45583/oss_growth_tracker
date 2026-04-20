// routes/userRoutes.js

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const {
  getUser,
  getRepos,
  refreshStats,
} = require("../controllers/userController");

// GET  /api/user          → Profile
// GET  /api/repos         → GitHub repos
// POST /api/user/refresh  → Refresh stats

router.get("/user",          protect, getUser);
router.get("/repos",         protect, getRepos);
router.post("/user/refresh", protect, refreshStats);

module.exports = router;