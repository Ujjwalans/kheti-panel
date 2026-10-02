const express = require("express");
const router = express.Router();
const { estimate, listCrops, getHistory } = require("../controllers/yieldController");

router.post("/estimate", estimate);
router.get("/crops", listCrops);
router.get("/history", getHistory);

module.exports = router;
