// controllers/cardController.js

const { generateCard } = require("../services/cardService");

/**
 * GET /api/card/generate/:username
 */
const generateCardController = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    console.log("[Card] Request for:", username);

    const { cardUrl, cardData } = await generateCard(username);

    return res.json({
      success: true,
      cardUrl,
      data: cardData,
    });
  } catch (error) {
    console.error("[Card] Controller error:", error.message);

    if (error.message === "User not found.") {
      return res.status(404).json({
        success: false,
        message: "User not found. Make sure the username is correct.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate card. Please try again.",
    });
  }
};

module.exports = { generateCardController };