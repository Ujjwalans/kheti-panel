function calculateRisk(req, res) {
  try {
    const {
      temperature = 30,
      humidity = 70,
      rainProbability = 50,
      soilMoisture = 50,
      diseaseDetected = false,
      crop = "Crop",
    } = req.body;

    const temp = Number(temperature);
    const humidityValue = Number(humidity);
    const rain = Number(rainProbability);
    const moisture = Number(soilMoisture);

    let waterlogging = "LOW";
    let fungalDisease = "LOW";
    let heatStress = "LOW";
    let pestRisk = "LOW";

    if (
      rain >= 70 ||
      moisture >= 80
    ) {
      waterlogging = "HIGH";
    } else if (
      rain >= 45 ||
      moisture >= 60
    ) {
      waterlogging = "MODERATE";
    }

    if (
      humidityValue >= 80 &&
      (rain >= 50 || moisture >= 60)
    ) {
      fungalDisease = "HIGH";
    } else if (
      humidityValue >= 65
    ) {
      fungalDisease = "MODERATE";
    }

    if (temp >= 38) {
      heatStress = "HIGH";
    } else if (temp >= 34) {
      heatStress = "MODERATE";
    }

    if (
      diseaseDetected ||
      (humidityValue >= 75 && temp >= 28)
    ) {
      pestRisk = "MODERATE";
    }

    if (
      diseaseDetected &&
      humidityValue >= 80
    ) {
      pestRisk = "HIGH";
    }

    const levels = {
      LOW: 1,
      MODERATE: 2,
      HIGH: 3,
    };

    const overallScore = Math.max(
      levels[waterlogging],
      levels[fungalDisease],
      levels[heatStress],
      levels[pestRisk]
    );

    const overall =
      overallScore === 3
        ? "HIGH"
        : overallScore === 2
        ? "MODERATE"
        : "LOW";

    res.json({
      crop,

      overall,

      risks: {
        waterlogging,
        fungalDisease,
        heatStress,
        pestRisk,
      },

      inputs: {
        temperature: temp,
        humidity: humidityValue,
        rainProbability: rain,
        soilMoisture: moisture,
        diseaseDetected,
      },

      recommendations: [
        waterlogging === "HIGH"
          ? "Improve field drainage and avoid unnecessary irrigation."
          : "Continue monitoring field moisture.",

        fungalDisease === "HIGH"
          ? "Inspect leaves regularly for fungal symptoms."
          : "Continue routine disease monitoring.",

        heatStress === "HIGH"
          ? "Protect crops from heat stress and monitor irrigation needs."
          : "Monitor temperature changes.",

        pestRisk === "HIGH"
          ? "Inspect crops closely for pest activity."
          : "Continue regular pest scouting.",
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to calculate crop risk.",
    });
  }
}

module.exports = {
  calculateRisk,
};