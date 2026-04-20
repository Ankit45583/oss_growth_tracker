// routes/cardRoutes.js

const express    = require("express");
const router     = express.Router();
const { generateCardController } = require("../controllers/cardController");
const { protect } = require("../middleware/auth");

// GET /api/card/generate/:username
// Protected — sirf logged in user apna card bana sake
router.get("/card/generate/:username", protect, generateCardController);

module.exports = router;