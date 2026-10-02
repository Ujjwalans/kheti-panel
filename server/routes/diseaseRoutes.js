const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { analyzeImage, getHistory } = require("../controllers/diseaseController");

router.post("/analyze", upload.single("image"), analyzeImage);
router.get("/history", getHistory);

module.exports = router;
