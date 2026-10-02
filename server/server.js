require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Existing routes
const diseaseRoutes = require("./routes/diseaseRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const yieldRoutes = require("./routes/yieldRoutes");
const fertilizerRoutes = require("./routes/fertilizerRoutes");
const storageRoutes = require("./routes/storageRoutes");

// New agriculture intelligence routes
const marketRoutes = require("./routes/marketRoutes");
const soilRoutes = require("./routes/soilRoutes");
const riskRoutes = require("./routes/riskRoutes");
const khetiAIRoutes = require("./routes/khetiAIRoutes");

const app = express();

// =========================================================
// CORS
// =========================================================

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// =========================================================
// MIDDLEWARE
// =========================================================

app.use(express.json());

// =========================================================
// API HEALTH CHECK
// =========================================================

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "kheti-panel-api",

    // OpenRouter configuration
    openRouterConfigured: Boolean(
      process.env.OPENROUTER_API_KEY
    ),

    openRouterModel:
      process.env.OPENROUTER_MODEL ||
      "google/gemma-4-26b-a4b-it:free",

    // Kept for backward compatibility with old setup
    huggingFaceConfigured: Boolean(
      process.env.HF_TOKEN
    ),

    huggingFaceModel:
      process.env.HF_MODEL ||
      "Qwen/Qwen2.5-VL-3B-Instruct",

    huggingFaceProvider:
      process.env.HF_PROVIDER ||
      "novita",
  });
});

// =========================================================
// EXISTING AGRICULTURE MODULES
// =========================================================

app.use(
  "/api/disease",
  diseaseRoutes
);

app.use(
  "/api/weather",
  weatherRoutes
);

app.use(
  "/api/yield",
  yieldRoutes
);

app.use(
  "/api/fertilizer",
  fertilizerRoutes
);

app.use(
  "/api/storage",
  storageRoutes
);

// =========================================================
// NEW HACKATHON MODULES
// =========================================================

// Market Intelligence
app.use(
  "/api/market",
  marketRoutes
);

// Soil Advisor
app.use(
  "/api/soil",
  soilRoutes
);

// Crop Risk Engine
app.use(
  "/api/risk",
  riskRoutes
);

// Unified Kheti AI
app.use(
  "/api/kheti-ai",
  khetiAIRoutes
);

// =========================================================
// ERROR HANDLING
// =========================================================

app.use(notFound);
app.use(errorHandler);

// =========================================================
// SERVER
// =========================================================

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `[server] Kheti Panel API listening on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "[server] failed to start:",
      err.message
    );

    process.exit(1);
  });