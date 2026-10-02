const express = require("express");

const {
  analyzeMarket,
  getLatestMarket,
} = require("../controllers/marketController");

const router = express.Router();

router.post("/analyze", analyzeMarket);
router.get("/latest", getLatestMarket);

module.exports = router;