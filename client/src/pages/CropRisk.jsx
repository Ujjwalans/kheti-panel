import React, { useState } from "react";
import api from "../api";

function RiskCard({ title, value }) {
  return (
    <div className="risk-card">
      <span>{title}</span>

      <strong className={`risk-${value.toLowerCase()}`}>
        {value}
      </strong>
    </div>
  );
}

export default function CropRisk() {
  const [form, setForm] = useState({
    crop: "Wheat",
    temperature: 30,
    humidity: 75,
    rainProbability: 60,
    soilMoisture: 60,
    diseaseDetected: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function change(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  }

  async function calculate(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.post(
        "/risk/calculate",
        {
          ...form,
          temperature: Number(
            form.temperature
          ),
          humidity: Number(form.humidity),
          rainProbability: Number(
            form.rainProbability
          ),
          soilMoisture: Number(
            form.soilMoisture
          ),
        }
      );

      setResult(data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to calculate crop risk."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="eyebrow">
          AGRICULTURAL RISK ENGINE
        </span>

        <h1>Crop Risk</h1>

        <p>
          Identify major crop risks using weather,
          moisture and disease information.
        </p>
      </div>

      <div className="feature-grid">
        <form
          className="feature-card"
          onSubmit={calculate}
        >
          <h2>Current Conditions</h2>

          <label>Crop</label>
          <input
            name="crop"
            value={form.crop}
            onChange={change}
          />

          <label>Temperature °C</label>
          <input
            name="temperature"
            type="number"
            value={form.temperature}
            onChange={change}
          />

          <label>Humidity %</label>
          <input
            name="humidity"
            type="number"
            value={form.humidity}
            onChange={change}
          />

          <label>Rain probability %</label>
          <input
            name="rainProbability"
            type="number"
            value={form.rainProbability}
            onChange={change}
          />

          <label>Soil moisture %</label>
          <input
            name="soilMoisture"
            type="number"
            value={form.soilMoisture}
            onChange={change}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="diseaseDetected"
              checked={form.diseaseDetected}
              onChange={change}
            />

            Disease detected
          </label>

          <button
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Calculating..."
              : "Calculate Crop Risk"}
          </button>
        </form>

        {result && (
          <div className="feature-card">
            <span className="eyebrow">
              CROP RISK
            </span>

            <h2>{result.overall} RISK</h2>

            <div className="risk-grid">
              <RiskCard
                title="Waterlogging"
                value={
                  result.risks.waterlogging
                }
              />

              <RiskCard
                title="Fungal Disease"
                value={
                  result.risks.fungalDisease
                }
              />

              <RiskCard
                title="Heat Stress"
                value={
                  result.risks.heatStress
                }
              />

              <RiskCard
                title="Pest Risk"
                value={
                  result.risks.pestRisk
                }
              />
            </div>

            <h3>Recommended Actions</h3>

            <ul>
              {result.recommendations?.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}