import { useState } from "react";
import { weatherApi } from "../api/client.js";

export default function Weather() {
  const [form, setForm] = useState({
    location: "", season: "Kharif (monsoon)", sky: "Clear", temperature: 31, humidity: 64,
    rain7: "Moderate rain", crop: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function generate() {
    setLoading(true); setError(null);
    try {
      const data = await weatherApi.outlook(form);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Couldn't generate the outlook. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const riskTag = result?.riskLevel === "low" ? "good" : result?.riskLevel === "moderate" ? "warn" : "bad";

  return (
    <section>
      <p className="eyebrow">Instrument 02</p>
      <h1 className="page-title">Weather outlook &amp; advisory</h1>
      <p className="page-desc">
        Describe current conditions and Kheti Panel drafts a short-term outlook and field actions.{" "}
        <span className="tag sim" style={{ marginLeft: 4 }}>AI-generated, not live meteorological data</span>
      </p>

      <div className="grid grid-2">
        <div className="card">
          <h3>Current conditions</h3>
          <label>Location</label>
          <input type="text" placeholder="e.g. Kanpur, Uttar Pradesh" value={form.location} onChange={(e) => update("location", e.target.value)} />
          <div className="row-2">
            <div>
              <label>Season</label>
              <select value={form.season} onChange={(e) => update("season", e.target.value)}>
                <option>Kharif (monsoon)</option>
                <option>Rabi (winter)</option>
                <option>Zaid (summer)</option>
              </select>
            </div>
            <div>
              <label>Sky right now</label>
              <select value={form.sky} onChange={(e) => update("sky", e.target.value)}>
                <option>Clear</option>
                <option>Partly cloudy</option>
                <option>Overcast</option>
                <option>Light rain</option>
                <option>Heavy rain</option>
              </select>
            </div>
          </div>
          <div className="row-2">
            <div>
              <label>Temperature (°C)</label>
              <input type="number" value={form.temperature} onChange={(e) => update("temperature", e.target.value)} />
            </div>
            <div>
              <label>Humidity (%)</label>
              <input type="number" value={form.humidity} onChange={(e) => update("humidity", e.target.value)} />
            </div>
          </div>
          <label>Rain in the last 7 days</label>
          <select value={form.rain7} onChange={(e) => update("rain7", e.target.value)}>
            <option>None</option>
            <option>Light showers</option>
            <option>Moderate rain</option>
            <option>Heavy / continuous rain</option>
          </select>
          <label>Crop in the field (optional)</label>
          <input type="text" placeholder="e.g. wheat, sugarcane" value={form.crop} onChange={(e) => update("crop", e.target.value)} />
          <button className="btn" disabled={!form.location || loading} onClick={generate}>Generate outlook</button>
          {loading && <div className="loader"><div className="spinner" />Drafting the outlook…</div>}
          {error && <div className="error-msg">{error}</div>}
        </div>

        <div className="card">
          <h3>5-day outlook</h3>
          {!result && <p style={{ color: "var(--paper-dim)", fontSize: 13 }}>Fill in conditions and generate an outlook.</p>}
          {result && (
  <div className="weather-result">

    {/* Summary */}
    <div className="weather-summary">
      <p>
        {result.outlookSummary ||
          "Weather outlook generated based on the provided conditions."}
      </p>
    </div>

    {/* Risk */}
    <div className="risk-section">
      <span className={"tag " + riskTag}>
        {(result.riskLevel || "moderate").toUpperCase()} RISK
      </span>

      {result.riskReason && (
        <p className="risk-reason">
          {result.riskReason}
        </p>
      )}
    </div>

    {/* 5 Day Forecast */}
    <div className="subhead">
      5-Day Forecast
    </div>

    <div className="day-strip">
      {(result.days || []).map((d, i) => (
        <div className="day-card" key={i}>

          <div className="d-name">
            {d.day || `Day ${i + 1}`}
          </div>

          <div className="d-cond">
            {d.condition || "Conditions unavailable"}
          </div>

          <div className="d-temp">
            {d.tempRange || "Temperature unavailable"}
          </div>

        </div>
      ))}
    </div>

    {/* Recommended Actions */}
    {result.actions?.length > 0 && (
      <>
        <div className="subhead">
          Recommended farming actions
        </div>

        <ul className="result-list">
          {result.actions.map((action, i) => (
            <li key={i}>
              {action}
            </li>
          ))}
        </ul>
      </>
    )}

  </div>
)}
        </div>
      </div>
    </section>
  );
}
