// A transparent, explainable heuristic model — NOT a trained ML model.
// It stands in for what would, in production, be a regression / gradient-
// boosted model trained on historical district-level yield, weather and
// soil data. Swapping this module out for a real model call later should
// not require changing the route or the response shape.

const CROP_DATA = {
  wheat: { baseline: 3.5, rainOpt: [400, 650], tempOpt: [15, 22], fertRec: 60 },
  rice: { baseline: 2.7, rainOpt: [1000, 1500], tempOpt: [22, 32], fertRec: 65 },
  sugarcane: { baseline: 70, rainOpt: [1000, 1500], tempOpt: [25, 35], fertRec: 120 },
  potato: { baseline: 22, rainOpt: [500, 700], tempOpt: [15, 20], fertRec: 90 },
  mustard: { baseline: 1.3, rainOpt: [300, 450], tempOpt: [15, 25], fertRec: 40 },
  maize: { baseline: 3.0, rainOpt: [500, 800], tempOpt: [20, 30], fertRec: 55 },
};

function rangeScore(val, [lo, hi]) {
  if (val >= lo && val <= hi) return 1;
  const span = hi - lo;
  const dist = val < lo ? lo - val : val - hi;
  return Math.max(0.35, 1 - dist / span);
}

function estimateYield({ crop, area, rainfall, temperature, fertilizer, irrigation }) {
  const c = CROP_DATA[crop];
  if (!c) {
    const known = Object.keys(CROP_DATA).join(", ");
    throw new Error(`Unknown crop "${crop}". Supported crops: ${known}`);
  }

  const rainScore = rangeScore(Number(rainfall) || 0, c.rainOpt);
  const tempScore = rangeScore(Number(temperature) || 0, c.tempOpt);
  const fertScore = Math.max(0.4, 1 - Math.abs((Number(fertilizer) || 0) - c.fertRec) / c.fertRec);
  const irrigScore = irrigation === "yes" ? 1.08 : 0.88;

  const composite = rainScore * 0.3 + tempScore * 0.25 + fertScore * 0.25 + irrigScore * 0.2;
  const perHectare = c.baseline * composite;
  const total = perHectare * (Number(area) || 1);

  return {
    perHectare: round2(perHectare),
    total: round2(total),
    low: round2(total * 0.9),
    high: round2(total * 1.12),
    baseline: c.baseline,
    scores: {
      rainScore: round2(rainScore),
      tempScore: round2(tempScore),
      fertScore: round2(fertScore),
      irrigScore: round2(irrigScore),
    },
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { estimateYield, CROP_DATA };
