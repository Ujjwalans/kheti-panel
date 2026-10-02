const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    dosePerAcre: String,
    timing: String,
  },
  { _id: false }
);

const fertilizerPlanSchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    soil: String,
    area: Number,
    nitrogen: { type: String, enum: ["Low", "Medium", "High"] },
    phosphorus: { type: String, enum: ["Low", "Medium", "High"] },
    potassium: { type: String, enum: ["Low", "Medium", "High"] },
    ph: Number,
    npkRatio: String,
    products: [productSchema],
    organicAlternatives: [{ type: String }],
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FertilizerPlan", fertilizerPlanSchema);
