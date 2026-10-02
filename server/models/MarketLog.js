const mongoose = require("mongoose");

const marketLogSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    previousPrice: {
      type: Number,
      default: null,
    },

    trend: {
      type: String,
      enum: ["increasing", "decreasing", "stable"],
      default: "stable",
    },

    prediction: {
      type: String,
    },

    decision: {
      type: String,
      enum: ["HOLD", "SELL", "WAIT"],
      default: "WAIT",
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },

    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MarketLog", marketLogSchema);