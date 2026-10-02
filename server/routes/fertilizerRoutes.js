const express = require("express");
const router = express.Router();
const { recommend, getHistory } = require("../controllers/fertilizerController");

router.post("/recommend", recommend);
router.get("/history", getHistory);

module.exports = router;
