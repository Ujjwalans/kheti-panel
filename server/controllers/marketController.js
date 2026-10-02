const MarketLog = require("../models/MarketLog");

const {
  askHuggingFace,
  parseJSONLoose,
} = require("../utils/huggingFaceClient");

async function analyzeMarket(req, res) {
  try {
    const {
      crop,
      location,
      quantity,
      currentPrice,
      previousPrice,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !crop ||
      !location ||
      quantity === undefined ||
      currentPrice === undefined
    ) {
      return res.status(400).json({
        message:
          "Crop, location, quantity and current price are required.",
      });
    }

    const current = Number(currentPrice);
    const qty = Number(quantity);

    if (!Number.isFinite(current) || current < 0) {
      return res.status(400).json({
        message: "Current price must be a valid number.",
      });
    }

    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({
        message: "Quantity must be a valid number.",
      });
    }

    const previous =
      previousPrice === "" ||
      previousPrice === null ||
      previousPrice === undefined
        ? null
        : Number(previousPrice);

    if (
      previous !== null &&
      (!Number.isFinite(previous) || previous < 0)
    ) {
      return res.status(400).json({
        message: "Previous price must be a valid number.",
      });
    }

    // =====================================================
    // BASIC PRICE TREND
    // =====================================================

    let basicTrend = "stable";

    if (previous !== null && previous > 0) {
      const changePercent =
        ((current - previous) / previous) * 100;

      if (changePercent >= 2) {
        basicTrend = "increasing";
      } else if (changePercent <= -2) {
        basicTrend = "decreasing";
      }
    }

    // =====================================================
    // AI PROMPT
    // =====================================================

    const systemPrompt = `
You are Kheti AI, an agricultural market intelligence assistant for Indian farmers.

Analyze the crop price information supplied by the farmer.

IMPORTANT RULES:

1. This is only an AI-based market trend estimation.
2. Do not claim that you have live mandi data.
3. Do not guarantee future prices.
4. Use only the information provided.
5. Return ONLY a JSON object.
6. Do not use markdown.
7. Do not use code fences.
8. Do not write any explanation before or after the JSON.
9. English only.

The JSON MUST have exactly these fields:

{
  "trend": "increasing|decreasing|stable",
  "prediction": "₹2400-₹2500 per quintal",
  "decision": "HOLD|SELL|WAIT",
  "confidence": 0,
  "reason": "short explanation"
}

Confidence must be a number from 0 to 100.
`;

    const userPrompt = `
Crop: ${crop}
Location: ${location}
Quantity: ${qty} quintal
Current price: ₹${current} per quintal
Previous price: ${
      previous === null
        ? "Not provided"
        : `₹${previous} per quintal`
    }

Basic calculated trend: ${basicTrend}

Return ONLY the required JSON object.
`;

    // =====================================================
    // ASK AI
    // =====================================================

    let parsed = null;

    try {
      const aiResponse = await askHuggingFace(
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
        700
      );

      console.log(
        "[market] Raw AI response:",
        aiResponse
      );

      parsed = parseJSONLoose(aiResponse);

      console.log(
        "[market] Parsed AI response:",
        parsed
      );
    } catch (aiError) {
      console.error(
        "[market] AI JSON parsing failed:",
        aiError.message
      );

      // ---------------------------------------------------
      // IMPORTANT:
      // We do NOT fail the entire market feature if the AI
      // returns malformed/non-JSON output.
      // ---------------------------------------------------

      parsed = {};
    }

    // =====================================================
    // SAFE AI VALUES
    // =====================================================

    let trend =
      parsed?.trend === "increasing" ||
      parsed?.trend === "decreasing" ||
      parsed?.trend === "stable"
        ? parsed.trend
        : basicTrend;

    let prediction =
      typeof parsed?.prediction === "string" &&
      parsed.prediction.trim()
        ? parsed.prediction.trim()
        : `₹${Math.round(
            current * 0.98
          )}-₹${Math.round(
            current * 1.05
          )} per quintal`;

    let decision =
      parsed?.decision === "HOLD" ||
      parsed?.decision === "SELL" ||
      parsed?.decision === "WAIT"
        ? parsed.decision
        : trend === "increasing"
        ? "HOLD"
        : trend === "decreasing"
        ? "SELL"
        : "WAIT";

    let confidence = Number(
      parsed?.confidence
    );

    if (!Number.isFinite(confidence)) {
      confidence =
        previous !== null
          ? 72
          : 55;
    }

    confidence = Math.min(
      100,
      Math.max(
        0,
        Math.round(confidence)
      )
    );

    let reason =
      typeof parsed?.reason === "string" &&
      parsed.reason.trim()
        ? parsed.reason.trim()
        : previous !== null
        ? `The current price is ${trend} compared with the previous recorded price.`
        : "There is not enough historical price information to estimate the market direction confidently.";

    // =====================================================
    // FINAL RESULT
    // =====================================================

    const result = {
      crop: String(crop).trim(),
      location: String(location).trim(),
      quantity: qty,

      currentPrice: current,
      previousPrice: previous,

      trend,
      prediction,
      decision,
      confidence,
      reason,
    };

    // =====================================================
    // SAVE TO MONGODB
    // =====================================================

    const saved = await MarketLog.create(
      result
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    res.json(saved);
  } catch (error) {
    console.error(
      "[market] Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to analyze agricultural market.",
    });
  }
}

// =========================================================
// GET LATEST MARKET RESULT
// =========================================================

async function getLatestMarket(
  req,
  res
) {
  try {
    const result =
      await MarketLog.findOne().sort({
        createdAt: -1,
      });

    res.json(
      result || null
    );
  } catch (error) {
    console.error(
      "[market/latest]",
      error
    );

    res.status(500).json({
      message:
        "Unable to load market information.",
    });
  }
}

module.exports = {
  analyzeMarket,
  getLatestMarket,
};