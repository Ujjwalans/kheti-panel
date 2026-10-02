import React, { useState } from "react";
import api from "../api";

export default function Market() {
  const [form, setForm] = useState({
    crop: "Wheat",
    location: "Kanpur",
    quantity: "10",
    currentPrice: "",
    previousPrice: "",
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

    if (!form.currentPrice) {
      alert("Enter current market price.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "/market/analyze",
        {
          ...form,
          quantity: Number(form.quantity),
          currentPrice: Number(form.currentPrice),
          previousPrice:
            form.previousPrice === ""
              ? null
              : Number(form.previousPrice),
        }
      );

      setResult(data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to analyze market."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="eyebrow">
          AGRICULTURAL INTELLIGENCE
        </span>

        <h1>Market Intelligence</h1>

        <p>
          AI-based agricultural market trend
          estimation for better sell or hold decisions.
        </p>
      </div>

      <div className="feature-grid">
        <form
          className="feature-card"
          onSubmit={analyze}
        >
          <h2>Market Information</h2>

          <label>Crop</label>
          <input
            name="crop"
            value={form.crop}
            onChange={change}
          />

          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={change}
          />

          <label>Quantity (quintal)</label>
          <input
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={change}
          />

          <label>Current price / quintal</label>
          <input
            name="currentPrice"
            type="number"
            min="0"
            placeholder="2350"
            value={form.currentPrice}
            onChange={change}
          />

          <label>Previous price / quintal</label>
          <input
            name="previousPrice"
            type="number"
            min="0"
            placeholder="2250"
            value={form.previousPrice}
            onChange={change}
          />

          <button
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Market"}
          </button>
        </form>

        {result && (
          <div className="feature-card market-result">
            <span className="eyebrow">
              MARKET INTELLIGENCE
            </span>

            <h2>{result.crop}</h2>

            <p>{result.location}</p>

            <div className="market-price">
              ₹{Number(result.currentPrice).toLocaleString()}
              <small> / quintal</small>
            </div>

            <div
              className={`trend-badge ${result.trend}`}
            >
              {result.trend === "increasing"
                ? "↗ INCREASING"
                : result.trend === "decreasing"
                ? "↘ DECREASING"
                : "→ STABLE"}
            </div>

            <div className="prediction-box">
              <span>Expected range</span>
              <strong>
                {result.prediction}
              </strong>
            </div>

            <div className="decision-box">
              <span>AI Decision</span>
              <strong>{result.decision}</strong>
            </div>

            <div className="confidence">
              Confidence:{" "}
              <strong>{result.confidence}%</strong>
            </div>

            <p className="result-reason">
              {result.reason}
            </p>

            <small>
              AI-based estimation — not a guaranteed
              future market price.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}