// Reference safe-storage ranges. In production these would likely live in
// their own DB collection so an agronomist could tune them without a
// redeploy — kept as a constant here to keep the demo self-contained.

const STORAGE_TYPES = {
  wheat_grain: {
    label: "Wheat grain (dry store)",
    temp: { min: 15, max: 25, goodLo: 15, goodHi: 25 },
    hum: { min: 20, max: 90, goodLo: 45, goodHi: 65 },
    gas: { min: 0, max: 1000, goodLo: 0, goodHi: 400 },
  },
  rice_paddy: {
    label: "Rice / paddy (dry store)",
    temp: { min: 15, max: 25, goodLo: 15, goodHi: 25 },
    hum: { min: 20, max: 90, goodLo: 50, goodHi: 65 },
    gas: { min: 0, max: 1000, goodLo: 0, goodHi: 400 },
  },
  potato: {
    label: "Potato (cold store)",
    temp: { min: -2, max: 20, goodLo: 2, goodHi: 4 },
    hum: { min: 40, max: 100, goodLo: 85, goodHi: 95 },
    gas: { min: 0, max: 1000, goodLo: 0, goodHi: 300 },
  },
  onion: {
    label: "Onion (dry ventilated)",
    temp: { min: 0, max: 35, goodLo: 0, goodHi: 30 },
    hum: { min: 30, max: 100, goodLo: 65, goodHi: 70 },
    gas: { min: 0, max: 1000, goodLo: 0, goodHi: 350 },
  },
};

const METRIC_LABELS = { temp: "Temperature", hum: "Humidity", gas: "CO2 / off-gas" };
const METRIC_UNITS = { temp: "\u00b0C", hum: "%", gas: "ppm" };

/**
 * Compares a reading against a commodity's safe ranges and returns any
 * alerts that should be raised (empty array if everything is in range).
 */
function evaluateReading(commodity, { temp, hum, gas }) {
  const cfg = STORAGE_TYPES[commodity];
  if (!cfg) throw new Error(`Unknown commodity "${commodity}"`);

  const checks = [
    { metric: "temp", value: temp, ...cfg.temp },
    { metric: "hum", value: hum, ...cfg.hum },
    { metric: "gas", value: gas, ...cfg.gas },
  ];

  const alerts = [];
  for (const c of checks) {
    if (c.value < c.goodLo || c.value > c.goodHi) {
      const severe = c.value > c.goodHi * 1.15 || c.value < c.goodLo * 0.7;
      alerts.push({
        commodity,
        metric: c.metric,
        value: c.value,
        level: severe ? "bad" : "warn",
        message: `${METRIC_LABELS[c.metric]} out of safe range \u2014 reading ${c.value}${METRIC_UNITS[c.metric]} (safe: ${c.goodLo}\u2013${c.goodHi}${METRIC_UNITS[c.metric]})`,
      });
    }
  }
  return alerts;
}

module.exports = { STORAGE_TYPES, evaluateReading };
