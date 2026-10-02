const {
  askHuggingFace,
} = require("../utils/huggingFaceClient");

async function askKhetiAI(req, res) {
  try {
    const {
      message,
      context = {},
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question.",
      });
    }

    const systemPrompt = `
You are Kheti AI, an agricultural assistant designed for Indian farmers.

You can help with:

- Weather
- Crop planning
- Crop diseases
- Soil
- Fertilizer
- Irrigation
- Yield
- Storage
- Agricultural markets
- Harvest decisions

Rules:

1. Give simple practical answers.
2. Use Indian agricultural context when appropriate.
3. Never claim certainty about future weather or market prices.
4. Never pretend that AI advice is a replacement for agricultural experts.
5. Do not provide dangerous pesticide instructions.
6. Do not recommend unsafe chemical mixtures.
7. If a serious crop problem is described, recommend contacting a local agriculture expert.
8. English only.
9. Do not use markdown tables.
10. Keep answers concise but useful.
`;

    const userPrompt = `
FARMER CONTEXT

Crop:
${context.crop || "Not provided"}

Location:
${context.location || "Not provided"}

Soil:
${context.soilType || "Not provided"}

Weather risk:
${context.weatherRisk || "Not provided"}

Crop risk:
${context.cropRisk || "Not provided"}

MARKET:
${context.marketTrend || "Not provided"}

FARMER QUESTION:
${message}
`;

    const reply = await askHuggingFace(
      [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      900
    );

    res.json({
      reply: String(reply || "").trim(),
    });
  } catch (error) {
    console.error("[kheti-ai]", error);

    res.status(500).json({
      message:
        error.message ||
        "Kheti AI is temporarily unavailable.",
    });
  }
}

module.exports = {
  askKhetiAI,
};