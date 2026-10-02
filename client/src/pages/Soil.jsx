import React, { useState } from "react";
import api from "../api";

export default function Soil() {
  const [form, setForm] = useState({
    crop: "Wheat",
    soilType: "Loamy",
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    area: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function analyze(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.post(
        "/soil/analyze",
        form
      );

      setResult(data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to analyze soil."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="eyebrow">
          SMART SOIL ADVISOR
        </span>

        <h1>Soil Advisor</h1>

        <p>
          Analyze basic soil information and receive
          crop-specific recommendations.
        </p>
      </div>

      <div className="feature-grid">
        <form
          className="feature-card"
          onSubmit={analyze}
        >
          <h2>Soil Information</h2>

          <label>Crop</label>
          <input
            name="crop"
            value={form.crop}
            onChange={change}
          />

          <label>Soil type</label>
          <select
            name="soilType"
            value={form.soilType}
            onChange={change}
          >
            <option>Loamy</option>
            <option>Clay</option>
            <option>Sandy</option>
            <option>Silty</option>
            <option>Black Soil</option>
            <option>Red Soil</option>
            <option>Alluvial Soil</option>
          </select>

          <label>pH</label>
          <input
            name="ph"
            type="number"
            step="0.1"
            placeholder="6.5"
            value={form.ph}
            onChange={change}
          />

          <label>Nitrogen</label>
          <input
            name="nitrogen"
            type="number"
            placeholder="kg/ha"
            value={form.nitrogen}
            onChange={change}
          />

          <label>Phosphorus</label>
          <input
            name="phosphorus"
            type="number"
            placeholder="kg/ha"
            value={form.phosphorus}
            onChange={change}
          />

          <label>Potassium</label>
          <input
            name="potassium"
            type="number"
            placeholder="kg/ha"
            value={form.potassium}
            onChange={change}
          />

          <label>Farm area (acres)</label>
          <input
            name="area"
            type="number"
            step="0.1"
            value={form.area}
            onChange={change}
          />

          <button
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Soil"}
          </button>
        </form>

        {result && (
          <div className="feature-card">
            <span className="eyebrow">
              SOIL ANALYSIS
            </span>

            <h2>{result.soilHealth}</h2>

            <section>
              <h3>Detected Issues</h3>

              <ul>
                {result.issues?.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </section>

            <section>
              <h3>Fertilizer Suggestions</h3>

              <ul>
                {result.fertilizer?.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </section>

            <section>
              <h3>Recommendations</h3>

              <ul>
                {result.recommendations?.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </section>

            <small>
              Recommendations are general guidance
              and should be validated with soil-test
              results where available.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}