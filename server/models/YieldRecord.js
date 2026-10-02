const mongoose = require("mongoose");

const yieldRecordSchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    area: { type: Number, required: true },
    irrigation: { type: String, enum: ["yes", "no"], required: true },
    rainfall: Number,
    temperature: Number,
    fertilizer: Number,
    soil: String,
    perHectare: Number,
    total: Number,
    low: Number,
    high: Number,
    scores: {
      rainScore: Number,
      tempScore: Number,
      fertScore: Number,
      irrigScore: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YieldRecord", yieldRecordSchema);
