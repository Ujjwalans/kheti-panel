const StorageReading = require("../models/StorageReading");
const StorageAlert = require("../models/StorageAlert");
const { STORAGE_TYPES, evaluateReading } = require("../utils/storageThresholds");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/storage/thresholds
// Frontend uses this to draw gauges without hardcoding safe ranges itself.
const getThresholds = asyncHandler(async (req, res) => {
  res.json(STORAGE_TYPES);
});

// POST /api/storage/reading
// Body: { commodity, temp, hum, gas, source? }
// In this demo the React app generates simulated readings and posts them
// here on an interval. A real deployment would have IoT sensors (e.g. a
// DHT22 for temp/humidity, an MQ-135 for gas) POST to this same endpoint.
const submitReading = asyncHandler(async (req, res) => {
  const { commodity, temp, hum, gas, source } = req.body;
  if (!commodity || temp == null || hum == null || gas == null) {
    const err = new Error("commodity, temp, hum and gas are required");
    err.status = 400;
    throw err;
  }
  if (!STORAGE_TYPES[commodity]) {
    const err = new Error(`Unknown commodity "${commodity}"`);
    err.status = 400;
    throw err;
  }

  const reading = await StorageReading.create({
    commodity,
    temp,
    hum,
    gas,
    source: source === "sensor" ? "sensor" : "simulated",
  });

  const alerts = evaluateReading(commodity, { temp, hum, gas });
  const savedAlerts = alerts.length ? await StorageAlert.insertMany(alerts) : [];

  res.status(201).json({ reading, alerts: savedAlerts });
});

// GET /api/storage/history/:commodity?limit=50
const getHistory = asyncHandler(async (req, res) => {
  const { commodity } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const readings = await StorageReading.find({ commodity }).sort({ createdAt: -1 }).limit(limit);
  res.json(readings.reverse());
});

// GET /api/storage/alerts/:commodity?limit=25
const getAlerts = asyncHandler(async (req, res) => {
  const { commodity } = req.params;
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const alerts = await StorageAlert.find({ commodity }).sort({ createdAt: -1 }).limit(limit);
  res.json(alerts);
});

module.exports = { getThresholds, submitReading, getHistory, getAlerts };
