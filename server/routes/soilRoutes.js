const express = require("express");

const {
  analyzeSoil,
  getLatestSoil,
} = require("../controllers/soilController");

const router = express.Router();

router.post("/analyze", analyzeSoil);
router.get("/latest", getLatestSoil);

module.exports = router;