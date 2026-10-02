const mongoose = require("mongoose");

const diseaseScanSchema = new mongoose.Schema(
  {
    imageMimeType: { type: String },
    status: { type: String, enum: ["healthy", "diseased", "uncertain"], required: true },
    name: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    symptoms: [{ type: String }],
    organicTreatment: [{ type: String }],
    chemicalTreatment: [{ type: String }],
    prevention: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiseaseScan", diseaseScanSchema);
