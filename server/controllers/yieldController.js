const YieldRecord = require("../models/YieldRecord");
const { estimateYield, CROP_DATA } = require("../utils/yieldModel");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/yield/estimate
const estimate = asyncHandler(async (req, res) => {
  const { crop, area, irrigation, rainfall, temperature, fertilizer, soil } = req.body;
  if (!crop || !area || !irrigation) {
    const err = new Error("crop, area and irrigation are required");
    err.status = 400;
    throw err;
  }

  const result = estimateYield({ crop, area, rainfall, temperature, fertilizer, irrigation });

  const saved = await YieldRecord.create({
    crop,
    area,
    irrigation,
    rainfall,
    temperature,
    fertilizer,
    soil,
    perHectare: result.perHectare,
    total: result.total,
    low: result.low,
    high: result.high,
    scores: result.scores,
  });

  res.status(201).json({ ...saved.toObject(), baseline: result.baseline });
});

// GET /api/yield/crops  -> list supported crops with baselines (for frontend dropdowns/comparisons)
const listCrops = asyncHandler(async (req, res) => {
  res.json(CROP_DATA);
});

// GET /api/yield/history?limit=20
const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const records = await YieldRecord.find().sort({ createdAt: -1 }).limit(limit);
  res.json(records);
});

module.exports = { estimate, listCrops, getHistory };
