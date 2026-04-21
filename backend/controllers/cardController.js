// controllers/cardController.js
const { generateCard } = require("../services/cardService");
const sharp = require("sharp");

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

    // ?format=png → PNG file download (Edge fix)
    if (req.query.format === "png") {
      const pngBuffer = await sharp(Buffer.from(svgCard, "utf-8"))
        .png()
        .toBuffer();

      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${username}-github-wrapped.png"`
      );
      return res.send(pngBuffer);
    }

    // Default: SVG as JSON for frontend modal preview
    return res.json({
      success: true,
      svgCard,
      cardData,
    });

  } catch (error) {
    console.error("[Card] Controller error:", error.message);

    if (error.message === "User not found.") {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(500).json({ success: false, message: "Failed to generate card." });
  }
};

module.exports = { generateCardController };