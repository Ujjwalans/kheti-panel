const mongoose = require("mongoose");

const weatherLogSchema = new mongoose.Schema(
  {
    // Location and current conditions
    location: {
      type: String,
      required: true,
      trim: true,
    },

    season: {
      type: String,
      trim: true,
    },

    sky: {
      type: String,
      trim: true,
    },

    temperature: {
      type: Number,
    },

    humidity: {
      type: Number,
    },

    rain7: {
      type: String,
      trim: true,
    },

    crop: {
      type: String,
      trim: true,
    },

    // AI-generated weather summary
    outlookSummary: {
      type: String,
      trim: true,
    },

    // Overall agricultural risk
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "moderate",
    },

    // Explanation for the risk level
    riskReason: {
      type: String,
      trim: true,
    },

    // Five-day AI forecast
    days: [
      {
        day: {
          type: String,
          trim: true,
        },

        condition: {
          type: String,
          trim: true,
        },

        tempRange: {
          type: String,
          trim: true,
        },
      },
    ],

    // Recommended actions for the farmer
    actions: [
      {
        type: String,
        trim: true,
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WeatherLog", weatherLogSchema);