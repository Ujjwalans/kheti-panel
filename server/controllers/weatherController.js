const WeatherLog = require("../models/WeatherLog");
const {
  askHuggingFace,
  parseJSONLoose,
} = require("../utils/huggingFaceClient");
const { asyncHandler } = require("../middleware/errorHandler");

const SYSTEM_PROMPT = `
You are an agricultural weather advisory assistant for Indian farmers.

IMPORTANT LANGUAGE RULE:
- Respond ONLY in English.
- Do NOT use Chinese, Hindi, or any other language.
- Every field and every sentence must be written in English.
- Never mix languages.

Provide practical, simple advice suitable for farmers in India.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any explanation outside the JSON.

Return EXACTLY this structure:

{
  "outlookSummary": "Short 2-3 sentence weather summary in English",
  "riskLevel": "low|moderate|high",
  "riskReason": "Short explanation of why this risk level applies",
  "days": [
    {
      "day": "Day 1",
      "condition": "Short weather condition",
      "tempRange": "28-34°C"
    },
    {
      "day": "Day 2",
      "condition": "Short weather condition",
      "tempRange": "27-33°C"
    },
    {
      "day": "Day 3",
      "condition": "Short weather condition",
      "tempRange": "27-34°C"
    },
    {
      "day": "Day 4",
      "condition": "Short weather condition",
      "tempRange": "28-35°C"
    },
    {
      "day": "Day 5",
      "condition": "Short weather condition",
      "tempRange": "28-35°C"
    }
  ],
  "actions": [
    "Practical farming action",
    "Practical farming action",
    "Practical farming action",
    "Practical farming action"
  ]
}

IMPORTANT:
- Always provide exactly 5 days.
- Always provide at least 3 recommended actions.
- Keep conditions and actions concise.
- Use Celsius for temperature.
- Do not claim this is real meteorological data.
- Make the advice plausible based on the provided conditions.
`;


// POST /api/weather/outlook
const generateOutlook = asyncHandler(async (req, res) => {
  const {
    location,
    season,
    sky,
    temperature,
    humidity,
    rain7,
    crop,
  } = req.body;

  if (!location) {
    const err = new Error("location is required");
    err.status = 400;
    throw err;
  }

  const userText = `
Location: ${location}
Season: ${season || "not specified"}
Current sky: ${sky || "not specified"}
Temperature: ${temperature ?? "not specified"} C
Humidity: ${humidity ?? "not specified"}%
Rain in last 7 days: ${rain7 || "not specified"}
Crop: ${crop || "general field crops"}

Create a plausible 5-day agricultural weather outlook and farming advisory.
`;

  const text = await askHuggingFace({
    system: SYSTEM_PROMPT,
    userText,
    maxTokens: 1400,
  });

  console.log("[weather] AI response:");
  console.log(text);

  const parsed = parseJSONLoose(text);

  // Basic validation
  const days = Array.isArray(parsed.days)
    ? parsed.days.slice(0, 5).map((day, index) => ({
        day: day.day || `Day ${index + 1}`,
        condition: day.condition || "Conditions unavailable",
        tempRange: day.tempRange || "Not available",
      }))
    : [];

  const actions = Array.isArray(parsed.actions)
    ? parsed.actions
    : [];

  const saved = await WeatherLog.create({
    location,
    season,
    sky,
    temperature,
    humidity,
    rain7,
    crop,

    outlookSummary:
      parsed.outlookSummary || "Weather outlook generated.",

    riskLevel:
      parsed.riskLevel || "moderate",

    riskReason:
      parsed.riskReason || "Risk assessment based on the provided conditions.",

    days,

    actions,
  });

  res.status(201).json(saved);
});


// GET /api/weather/history?limit=20
const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(
    Number(req.query.limit) || 20,
    100
  );

  const logs = await WeatherLog.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(logs);
});


module.exports = {
  generateOutlook,
  getHistory,
};