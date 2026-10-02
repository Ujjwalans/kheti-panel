# Kheti Panel — MERN Farm Intelligence Suite

A full MERN app with four modules:

1. **Disease Scanner** — upload a crop photo → Express sends it to Hugging Face (vision) → diagnosis is saved in MongoDB and returned.
2. **Weather Outlook** — describe current conditions → Hugging Face drafts an illustrative 5-day advisory (not a live weather feed — see note below).
3. **Yield & Fertilizer** — a transparent heuristic formula (server-side, `server/utils/yieldModel.js`) estimates yield; a separate call asks Hugging Face for a fertilizer plan.
4. **Storage Monitor** — the React client simulates sensor drift and POSTs readings to the same `/api/storage/reading` endpoint real IoT hardware would use; the server checks them against safe ranges and raises alerts.

## Stack

- **M**ongoDB + Mongoose
- **E**xpress
- **R**eact (Vite) + React Router
- **N**ode.js
- Hugging Face (`@huggingface/inference`) called **only from the server** — your API key never reaches the browser.

## Project layout

```
kheti-panel/
  server/            Express API
    config/db.js
    models/          Mongoose schemas
    routes/          Express routers
    controllers/     Route handlers
    utils/           Hugging Face client, yield model, storage thresholds
    middleware/       multer upload + error handler
    server.js
  client/            React (Vite) app
    src/
      api/client.js   axios wrapper for the backend
      components/     Navbar, Gauge (shared SVG dial)
      pages/          Overview, DiseaseScanner, Weather, YieldFertilizer, Storage
```

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI and HF_TOKEN
npm install
npm run dev        # nodemon, http://localhost:5000
```

You need:
- A MongoDB instance (local `mongod`, Docker, or a free MongoDB Atlas cluster) — put its connection string in `MONGO_URI`.
- A Hugging Face User Access Token from https://huggingface.co/settings/tokens — put it in `HF_TOKEN`. This powers the Disease Scanner and the AI text in Weather/Fertilizer.

### 2. Frontend

```bash
cd client
cp .env.example .env.local   # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev         # http://localhost:5173
```

The Vite dev server also proxies `/api` to `localhost:5000`, so it works even without `.env.local` as long as the ports match the defaults.

## API reference

| Method | Route | Body / Params | Notes |
|---|---|---|---|
| POST | `/api/disease/analyze` | multipart, field `image` | Runs Hugging Face vision, saves + returns diagnosis |
| GET | `/api/disease/history?limit=` | — | Recent scans |
| POST | `/api/weather/outlook` | `{location, season, sky, temperature, humidity, rain7, crop}` | Hugging Face-generated advisory |
| GET | `/api/weather/history?limit=` | — | Recent outlooks |
| POST | `/api/yield/estimate` | `{crop, area, irrigation, rainfall, temperature, fertilizer, soil}` | Heuristic model, no AI call |
| GET | `/api/yield/crops` | — | Supported crops + baselines |
| POST | `/api/fertilizer/recommend` | `{crop, soil, area, nitrogen, phosphorus, potassium, ph}` | Hugging Face-generated plan |
| GET | `/api/storage/thresholds` | — | Safe ranges per commodity |
| POST | `/api/storage/reading` | `{commodity, temp, hum, gas, source?}` | Persists reading, returns any alerts raised |
| GET | `/api/storage/history/:commodity?limit=` | — | Recent readings, oldest→newest |
| GET | `/api/storage/alerts/:commodity?limit=` | — | Recent alerts |

## Honest notes on scope

- **Live AI**: Disease Scanner and the text generation in Weather/Fertilizer are real Hugging Face calls happening server-side.
- **Weather is illustrative, not a forecast**: there's no live meteorological data source wired in. To make it real, swap the prompt-based advisory for a call to a weather API (IMD, OpenWeather, etc.) in `weatherController.js`, and optionally keep Hugging Face to turn the numbers into farmer-facing advice.
- **Yield model is a heuristic, not trained ML**: `server/utils/yieldModel.js` is a small, explainable formula. To make it a real ML model, you'd train a regression/gradient-boosted model on historical yield + weather + soil data (e.g. district-level records from ICAR or state agri departments) and swap the function body for a call to that model (a Python microservice via REST, or a JS inference runtime).
- **Storage sensors are simulated client-side**: the React app generates the drifting numbers and posts them to `/api/storage/reading`. Real hardware (e.g. a DHT22 for temp/humidity, an MQ-135 for gas, wired to an ESP32/Raspberry Pi) would POST to that exact same endpoint — no backend changes needed to go from simulated to real sensors.

## Note on this build environment

This project was authored in a sandbox with no network access, so it hasn't been `npm install`-ed or run here — you'll do that locally. The code follows standard, current MERN patterns, but give it a first run and let me know if anything needs adjusting.
