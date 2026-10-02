const express = require("express");
const router = express.Router();
const { generateOutlook, getHistory } = require("../controllers/weatherController");

router.post("/outlook", generateOutlook);
router.get("/history", getHistory);

module.exports = router;
