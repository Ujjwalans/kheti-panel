const mongoose = require("mongoose");

const storageAlertSchema = new mongoose.Schema(
  {
    commodity: { type: String, required: true, index: true },
    metric: { type: String, enum: ["temp", "hum", "gas"], required: true },
    value: { type: Number, required: true },
    level: { type: String, enum: ["warn", "bad"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

storageAlertSchema.index({ commodity: 1, createdAt: -1 });

module.exports = mongoose.model("StorageAlert", storageAlertSchema);
