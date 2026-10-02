const mongoose = require("mongoose");

const storageReadingSchema = new mongoose.Schema(
  {
    commodity: { type: String, required: true, index: true },
    temp: { type: Number, required: true },
    hum: { type: Number, required: true },
    gas: { type: Number, required: true },
    source: { type: String, enum: ["simulated", "sensor"], default: "simulated" },
  },
  { timestamps: true }
);

// Keep queries for "latest N readings per commodity" fast.
storageReadingSchema.index({ commodity: 1, createdAt: -1 });

module.exports = mongoose.model("StorageReading", storageReadingSchema);
