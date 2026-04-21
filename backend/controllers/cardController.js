const { generateCard } = require("../services/cardService");

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

    const { svgCard, cardData } = await generateCard(username);

    // ✅ SVG directly bhejo
    return res.json({
      success: true,
      svgCard,  // Frontend SVG render karega
      cardData,
    });

  } catch (error) {
    console.error("[Card] Controller error:", error.message);

    if (error.message === "User not found.") {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate card.",
    });
  }
};

module.exports = { generateCardController };