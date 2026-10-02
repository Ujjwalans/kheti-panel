const mongoose = require("mongoose");

const soilLogSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true,
    },

    soilType: {
      type: String,
      required: true,
      trim: true,
    },

    ph: {
      type: Number,
    },

    nitrogen: {
      type: Number,
    },

    phosphorus: {
      type: Number,
    },

    potassium: {
      type: Number,
    },

    area: {
      type: Number,
    },

    soilHealth: {
      type: String,
    },

    issues: [
      {
        type: String,
      },
    ],

    fertilizer: [
      {
        type: String,
      },
    ],

    recommendations: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SoilLog", soilLogSchema);