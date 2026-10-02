const express = require("express");

const {
  askKhetiAI,
} = require("../controllers/khetiAIController");

const router = express.Router();

router.post("/chat", askKhetiAI);

module.exports = router;