// routes/leaderboardRoutes.js

const express = require("express");
const router  = express.Router();
const { getLeaderboard } = require("../controllers/userController");

// GET /api/leaderboard → Top users
router.get("/leaderboard", getLeaderboard);

module.exports = router;