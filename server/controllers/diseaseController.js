const DiseaseScan = require("../models/DiseaseScan");
const { askHuggingFaceWithImage, parseJSONLoose } = require("../utils/huggingFaceClient");
const { asyncHandler } = require("../middleware/errorHandler");

const SYSTEM_PROMPT = `You are an agricultural plant pathology assistant. Examine the crop photo for visible disease, pest damage, or nutrient-deficiency symptoms. Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"status":"healthy|diseased|uncertain","name":"short name of the issue, or Healthy Plant","confidence":0-100,"symptoms":["..."],"organicTreatment":["..."],"chemicalTreatment":["..."],"prevention":["..."]}
Keep each list item under 14 words. If the image is not a plant, set status to uncertain and explain briefly in name.`;

// POST /api/disease/analyze  (multipart/form-data, field name "image")
const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error("No image uploaded — attach it under the 'image' field.");
    err.status = 400;
    throw err;
  }

  const base64Data = req.file.buffer.toString("base64");
  const text = await askHuggingFaceWithImage({
    system: SYSTEM_PROMPT,
    instruction: "Analyze this crop photo and return the JSON as instructed.",
    base64Data,
    mediaType: req.file.mimetype,
  });

  const parsed = parseJSONLoose(text);

  const saved = await DiseaseScan.create({
    imageMimeType: req.file.mimetype,
    status: parsed.status,
    name: parsed.name,
    confidence: parsed.confidence,
    symptoms: parsed.symptoms || [],
    organicTreatment: parsed.organicTreatment || [],
    chemicalTreatment: parsed.chemicalTreatment || [],
    prevention: parsed.prevention || [],
  });

  res.status(201).json(saved);
});

// GET /api/disease/history?limit=20
const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const scans = await DiseaseScan.find().sort({ createdAt: -1 }).limit(limit);
  res.json(scans);
});

module.exports = { analyzeImage, getHistory };
