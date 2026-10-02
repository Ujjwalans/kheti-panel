const SoilLog = require("../models/SoilLog");

const {
  askHuggingFace,
  parseJSONLoose,
} = require("../utils/huggingFaceClient");

async function analyzeSoil(req, res) {
  try {
    const {
      crop,
      soilType,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      area,
    } = req.body;

    if (!crop || !soilType) {
      return res.status(400).json({
        message: "Crop and soil type are required.",
      });
    }

    const phValue =
      ph === "" || ph === null || ph === undefined
        ? null
        : Number(ph);

    const nitrogenValue =
      nitrogen === "" ||
      nitrogen === null ||
      nitrogen === undefined
        ? null
        : Number(nitrogen);

    const phosphorusValue =
      phosphorus === "" ||
      phosphorus === null ||
      phosphorus === undefined
        ? null
        : Number(phosphorus);

    const potassiumValue =
      potassium === "" ||
      potassium === null ||
      potassium === undefined
        ? null
        : Number(potassium);

    const areaValue =
      area === "" ||
      area === null ||
      area === undefined
        ? null
        : Number(area);

    const issues = [];
    const fertilizer = [];
    const recommendations = [];

    // -----------------------------
    // BASIC SOIL ANALYSIS
    // -----------------------------

    if (phValue !== null && Number.isFinite(phValue)) {
      if (phValue < 5.5) {
        issues.push("Soil may be strongly acidic.");
      } else if (phValue < 6.0) {
        issues.push("Soil may be moderately acidic.");
      } else if (phValue > 8.0) {
        issues.push("Soil may be alkaline.");
      }
    }

    if (
      nitrogenValue !== null &&
      Number.isFinite(nitrogenValue)
    ) {
      if (nitrogenValue < 140) {
        issues.push("Nitrogen level may be low.");

        fertilizer.push(
          "Consider nitrogen supplementation based on soil-test recommendations."
        );
      }
    }

    if (
      phosphorusValue !== null &&
      Number.isFinite(phosphorusValue)
    ) {
      if (phosphorusValue < 10) {
        issues.push("Phosphorus level may be low.");

        fertilizer.push(
          "Consider phosphorus fertilizer based on soil-test recommendations."
        );
      }
    }

    if (
      potassiumValue !== null &&
      Number.isFinite(potassiumValue)
    ) {
      if (potassiumValue < 120) {
        issues.push("Potassium level may be low.");

        fertilizer.push(
          "Consider potassium supplementation based on soil-test recommendations."
        );
      }
    }

    recommendations.push(
      "Maintain appropriate soil moisture for the selected crop."
    );

    recommendations.push(
      "Use soil-test results when planning fertilizer application."
    );

    recommendations.push(
      "Add organic matter such as well-decomposed compost where appropriate."
    );

    let calculatedHealth = "Good";

    if (issues.length >= 2) {
      calculatedHealth = "Poor";
    } else if (issues.length === 1) {
      calculatedHealth = "Moderate";
    }

    // -----------------------------
    // AI ANALYSIS
    // -----------------------------

    const systemPrompt = `
You are Kheti AI, an agricultural soil advisor for Indian farmers.

Analyze the soil information supplied by the farmer.

IMPORTANT RULES:

1. Give general agricultural guidance only.
2. Do not claim laboratory-level certainty.
3. Do not pretend to have live soil data.
4. Do not prescribe dangerous chemical usage.
5. Do not recommend unsafe chemical mixtures.
6. Return ONLY a JSON object.
7. Do not use markdown.
8. Do not use code fences.
9. Do not write anything before or after the JSON.
10. English only.

Return exactly:

{
  "soilHealth": "Good|Moderate|Poor",
  "issues": [],
  "fertilizer": [],
  "recommendations": []
}
`;

    const userPrompt = `
Crop: ${crop}
Soil type: ${soilType}

pH:
${phValue === null ? "Not provided" : phValue}

Nitrogen:
${nitrogenValue === null ? "Not provided" : nitrogenValue}

Phosphorus:
${phosphorusValue === null ? "Not provided" : phosphorusValue}

Potassium:
${potassiumValue === null ? "Not provided" : potassiumValue}

Farm area:
${areaValue === null ? "Not provided" : `${areaValue} acres`}

Return ONLY the JSON object.
`;

    let parsed = {};

    try {
      const aiResponse = await askHuggingFace(
        [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        900
      );

      console.log(
        "[soil] Raw AI response:",
        aiResponse
      );

      parsed = parseJSONLoose(aiResponse);

      console.log(
        "[soil] Parsed AI response:",
        parsed
      );
    } catch (aiError) {
      // IMPORTANT:
      // AI failure must NOT break the Soil feature.

      console.error(
        "[soil] AI request/JSON failed:",
        aiError.message
      );

      parsed = {};
    }

    // -----------------------------
    // SAFE FALLBACK
    // -----------------------------

    const finalHealth =
      parsed?.soilHealth === "Good" ||
      parsed?.soilHealth === "Moderate" ||
      parsed?.soilHealth === "Poor"
        ? parsed.soilHealth
        : calculatedHealth;

    const finalIssues =
      Array.isArray(parsed?.issues) &&
      parsed.issues.length > 0
        ? parsed.issues
        : issues;

    const finalFertilizer =
      Array.isArray(parsed?.fertilizer) &&
      parsed.fertilizer.length > 0
        ? parsed.fertilizer
        : fertilizer;

    const finalRecommendations =
      Array.isArray(parsed?.recommendations) &&
      parsed.recommendations.length > 0
        ? parsed.recommendations
        : recommendations;

    const result = {
      crop: String(crop).trim(),
      soilType: String(soilType).trim(),

      ph: phValue,
      nitrogen: nitrogenValue,
      phosphorus: phosphorusValue,
      potassium: potassiumValue,
      area: areaValue,

      soilHealth: finalHealth,
      issues: finalIssues,
      fertilizer: finalFertilizer,
      recommendations: finalRecommendations,
    };

    console.log(
      "[soil] Final result:",
      result
    );

    const saved =
      await SoilLog.create(result);

    return res.json(saved);

  } catch (error) {
    console.error(
      "[soil] FATAL ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to analyze soil.",
    });
  }
}

async function getLatestSoil(req, res) {
  try {
    const result =
      await SoilLog.findOne().sort({
        createdAt: -1,
      });

    return res.json(
      result || null
    );
  } catch (error) {
    console.error(
      "[soil/latest]",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load soil information.",
    });
  }
}

module.exports = {
  analyzeSoil,
  getLatestSoil,
};