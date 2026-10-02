const express = require("express");
const router = express.Router();
const { getThresholds, submitReading, getHistory, getAlerts } = require("../controllers/storageController");

router.get("/thresholds", getThresholds);
router.post("/reading", submitReading);
router.get("/history/:commodity", getHistory);
router.get("/alerts/:commodity", getAlerts);

module.exports = router;
