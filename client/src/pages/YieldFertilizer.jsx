import { useState } from "react";
import { yieldApi, fertilizerApi } from "../api/client.js";

export default function YieldFertilizer() {
  const [yForm, setYForm] = useState({
    crop: "wheat", area: 2, irrigation: "yes", rainfall: 550, temperature: 24, fertilizer: 55, soil: "Alluvial",
  });
  const [yLoading, setYLoading] = useState(false);
  const [yResult, setYResult] = useState(null);

  const [fForm, setFForm] = useState({ nitrogen: "Medium", phosphorus: "Low", potassium: "Medium", ph: 6.8 });
  const [fLoading, setFLoading] = useState(false);
  const [fError, setFError] = useState(null);
  const [fResult, setFResult] = useState(null);

  function updateY(field, value) { setYForm((f) => ({ ...f, [field]: value })); }
  function updateF(field, value) { setFForm((f) => ({ ...f, [field]: value })); }

  async function estimateYield() {
    setYLoading(true);
    try {
      const data = await yieldApi.estimate(yForm);
      setYResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setYLoading(false);
    }
  }

  async function getFertilizerPlan() {
    setFLoading(true); setFError(null);
    try {
      const data = await fertilizerApi.recommend({ crop: yForm.crop, soil: yForm.soil, area: yForm.area, ...fForm });
      setFResult(data);
    } catch (err) {
      console.error(err);
      setFError(err?.response?.data?.error || "Couldn't generate a plan. Try again.");
    } finally {
      setFLoading(false);
    }
  }

  const baseline = yResult?.baseline || 0;
  const perHectarePct = baseline ? Math.min(100, (yResult.perHectare / (baseline * 1.3)) * 100) : 0;
  const baselinePct = baseline ? Math.min(100, (baseline / (baseline * 1.3)) * 100) : 0;

  return (
    <section>
      <p className="eyebrow">Instrument 03</p>
      <h1 className="page-title">Yield estimate &amp; fertilizer plan</h1>
      <p className="page-desc">
        A transparent heuristic model estimates yield from field conditions, then Claude drafts a
        fertilizer plan against it. <span className="tag sim" style={{ marginLeft: 4 }}>Formula-based estimate</span>
      </p>

      <div className="grid grid-2">
        <div className="card">
          <h3>Field details</h3>
          <label>Crop</label>
          <select value={yForm.crop} onChange={(e) => updateY("crop", e.target.value)}>
            <option value="wheat">Wheat</option>
            <option value="rice">Rice (paddy)</option>
            <option value="sugarcane">Sugarcane</option>
            <option value="potato">Potato</option>
            <option value="mustard">Mustard</option>
            <option value="maize">Maize</option>
          </select>
          <div className="row-2">
            <div>
              <label>Area (hectares)</label>
              <input type="number" step="0.1" value={yForm.area} onChange={(e) => updateY("area", e.target.value)} />
            </div>
            <div>
              <label>Irrigation</label>
              <select value={yForm.irrigation} onChange={(e) => updateY("irrigation", e.target.value)}>
                <option value="yes">Irrigated</option>
                <option value="no">Rain-fed</option>
              </select>
            </div>
          </div>
          <div className="row-2">
            <div>
              <label>Season rainfall (mm)</label>
              <input type="number" value={yForm.rainfall} onChange={(e) => updateY("rainfall", e.target.value)} />
            </div>
            <div>
              <label>Avg. temperature (°C)</label>
              <input type="number" value={yForm.temperature} onChange={(e) => updateY("temperature", e.target.value)} />
            </div>
          </div>
          <label>Fertilizer applied (kg/acre, total NPK)</label>
          <input type="number" value={yForm.fertilizer} onChange={(e) => updateY("fertilizer", e.target.value)} />
          <label>Soil type</label>
          <select value={yForm.soil} onChange={(e) => updateY("soil", e.target.value)}>
            <option>Alluvial</option>
            <option>Loam</option>
            <option>Clay</option>
            <option>Sandy</option>
            <option>Black soil</option>
          </select>
          <button className="btn" disabled={yLoading} onClick={estimateYield}>Estimate yield</button>
        </div>

        <div className="card">
          <h3>Estimated output</h3>
          {!yResult && <p style={{ color: "var(--paper-dim)", fontSize: 13 }}>Enter field details and estimate.</p>}
          {yResult && (
            <div>
              <span className="yield-number">{yResult.total}</span>{" "}
              <span className="yield-unit">tonnes total ({yResult.perHectare} t/ha)</span>
              <p style={{ fontSize: 12.5, color: "var(--paper-dim)", marginTop: 6 }}>
                Likely range: {yResult.low}–{yResult.high} tonnes over {yForm.area} ha
              </p>
              <div className="bar-compare">
                <div className="bar-row">
                  <div className="bar-label"><span>This plot</span><span>{yResult.perHectare} t/ha</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${perHectarePct}%`, background: "var(--wheat)" }} /></div>
                </div>
                <div className="bar-row">
                  <div className="bar-label"><span>Typical baseline for {yForm.crop}</span><span>{baseline} t/ha</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${baselinePct}%`, background: "var(--sky)" }} /></div>
                </div>
              </div>
              <div className="factor-chips">
                <span className={"tag " + (yResult.scores.rainScore > 0.8 ? "good" : yResult.scores.rainScore > 0.6 ? "warn" : "bad")}>
                  Rainfall fit {Math.round(yResult.scores.rainScore * 100)}%
                </span>
                <span className={"tag " + (yResult.scores.tempScore > 0.8 ? "good" : yResult.scores.tempScore > 0.6 ? "warn" : "bad")}>
                  Temperature fit {Math.round(yResult.scores.tempScore * 100)}%
                </span>
                <span className={"tag " + (yResult.scores.fertScore > 0.8 ? "good" : yResult.scores.fertScore > 0.6 ? "warn" : "bad")}>
                  Fertilizer fit {Math.round(yResult.scores.fertScore * 100)}%
                </span>
                <span className={"tag " + (yForm.irrigation === "yes" ? "good" : "warn")}>
                  {yForm.irrigation === "yes" ? "Irrigated" : "Rain-fed"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 2 }}>Fertilizer recommendation</h3>
        <p className="hint">Uses the crop, soil type and area above, plus soil nutrient levels below.</p>
        <div className="row-3">
          <div>
            <label>Soil Nitrogen (N)</label>
            <select value={fForm.nitrogen} onChange={(e) => updateF("nitrogen", e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label>Soil Phosphorus (P)</label>
            <select value={fForm.phosphorus} onChange={(e) => updateF("phosphorus", e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label>Soil Potassium (K)</label>
            <select value={fForm.potassium} onChange={(e) => updateF("potassium", e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>
        <label>Soil pH</label>
        <input type="number" step="0.1" value={fForm.ph} onChange={(e) => updateF("ph", e.target.value)} />
        <button className="btn" disabled={fLoading} onClick={getFertilizerPlan}>Get fertilizer plan</button>
        {fLoading && <div className="loader"><div className="spinner" />Working out the plan…</div>}
        {fError && <div className="error-msg">{fError}</div>}
        {fResult && (
          <div style={{ marginTop: 16 }}>
            <span className="tag good">N:P:K — {fResult.npkRatio}</span>
            {fResult.products?.length > 0 && (
              <>
                <div className="subhead">Products &amp; dosage</div>
                {fResult.products.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line-soft)", fontSize: 13 }}>
                    <span>{p.name}</span>
                    <span style={{ color: "var(--paper-dim)", textAlign: "right" }}>{p.dosePerAcre} · {p.timing}</span>
                  </div>
                ))}
              </>
            )}
            {fResult.organicAlternatives?.length > 0 && (
              <>
                <div className="subhead">Organic alternatives</div>
                <ul className="result-list">
                  {fResult.organicAlternatives.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </>
            )}
            {fResult.notes && <p style={{ fontSize: 12.5, color: "var(--paper-dim)", marginTop: 10 }}>{fResult.notes}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
