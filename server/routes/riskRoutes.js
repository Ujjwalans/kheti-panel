const express = require("express");

const {
  calculateRisk,
} = require("../controllers/riskController");

const router = express.Router();

router.post("/calculate", calculateRisk);

module.exports = router;