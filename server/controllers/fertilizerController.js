const FertilizerPlan = require("../models/FertilizerPlan");
const { askHuggingFace, parseJSONLoose } = require("../utils/huggingFaceClient");
const { asyncHandler } = require("../middleware/errorHandler");

const SYSTEM_PROMPT = `You are an agronomist assistant giving a fertilizer plan for a smallholder farm in India. Respond with ONLY valid JSON in this shape:
{"npkRatio":"e.g. 120:60:40","products":[{"name":"","dosePerAcre":"","timing":""}],"organicAlternatives":["..."],"notes":"1-2 sentences, mention pH if relevant"}
Keep it concise and practical, 2-4 products max.`;

// POST /api/fertilizer/recommend
const recommend = asyncHandler(async (req, res) => {
  const { crop, soil, area, nitrogen, phosphorus, potassium, ph } = req.body;
  if (!crop) {
    const err = new Error("crop is required");
    err.status = 400;
    throw err;
  }

  const userText = `Crop: ${crop}
Soil type: ${soil || "not specified"}
Area: ${area ?? "not specified"} hectares
Soil Nitrogen: ${nitrogen || "Medium"}
Soil Phosphorus: ${phosphorus || "Medium"}
Soil Potassium: ${potassium || "Medium"}
Soil pH: ${ph ?? "not specified"}
Give a fertilizer plan as JSON.`;

  const text = await askHuggingFace({ system: SYSTEM_PROMPT, userText });
  const parsed = parseJSONLoose(text);

  const saved = await FertilizerPlan.create({
    crop,
    soil,
    area,
    nitrogen,
    phosphorus,
    potassium,
    ph,
    npkRatio: parsed.npkRatio,
    products: parsed.products || [],
    organicAlternatives: parsed.organicAlternatives || [],
    notes: parsed.notes,
  });

  res.status(201).json(saved);
});

// GET /api/fertilizer/history?limit=20
const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const plans = await FertilizerPlan.find().sort({ createdAt: -1 }).limit(limit);
  res.json(plans);
});

module.exports = { recommend, getHistory };
