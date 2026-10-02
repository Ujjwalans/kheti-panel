import { useState, useEffect, useRef, useCallback } from "react";
import Gauge from "../components/Gauge.jsx";
import { storageApi } from "../api/client.js";

const LABELS = {
  wheat_grain: "Wheat grain (dry store)",
  rice_paddy: "Rice / paddy (dry store)",
  potato: "Potato (cold store)",
  onion: "Onion (dry ventilated)",
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round1(n) { return Math.round(n * 10) / 10; }

export default function Storage() {
  const [thresholds, setThresholds] = useState(null);
  const [commodity, setCommodity] = useState("wheat_grain");
  const [values, setValues] = useState(null);
  const [running, setRunning] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    storageApi.thresholds().then((data) => {
      setThresholds(data);
    }).catch((err) => console.error("Failed to load thresholds", err));
  }, []);

  useEffect(() => {
    if (!thresholds) return;
    const cfg = thresholds[commodity];
    setValues({
      temp: (cfg.temp.goodLo + cfg.temp.goodHi) / 2,
      hum: (cfg.hum.goodLo + cfg.hum.goodHi) / 2,
      gas: ((cfg.gas.goodLo + cfg.gas.goodHi) / 2) * 0.5,
    });
    setAlerts([]);
  }, [commodity, thresholds]);

  const postReading = useCallback(async (reading) => {
    try {
      const data = await storageApi.submitReading({ commodity, ...reading, source: "simulated" });
      if (data.alerts?.length) {
        setAlerts((prev) => [...data.alerts.reverse(), ...prev].slice(0, 25));
      }
    } catch (err) {
      console.error("Failed to submit reading", err);
    }
  }, [commodity]);

  const stepSim = useCallback(() => {
    if (!thresholds) return;
    const cfg = thresholds[commodity];
    setValues((prev) => {
      const next = {
        temp: clamp(prev.temp + (Math.random() - 0.5) * 0.8, cfg.temp.min, cfg.temp.max),
        hum: clamp(prev.hum + (Math.random() - 0.5) * 2.2, cfg.hum.min, cfg.hum.max),
        gas: clamp(prev.gas + (Math.random() - 0.5) * 15, cfg.gas.min, cfg.gas.max),
      };
      postReading({ temp: round1(next.temp), hum: round1(next.hum), gas: round1(next.gas) });
      return next;
    });
  }, [thresholds, commodity, postReading]);

  function toggleMonitoring() {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      intervalRef.current = setInterval(stepSim, 2200);
      setRunning(true);
    }
  }

  function simulateSpike() {
    if (!thresholds || !values) return;
    const cfg = thresholds[commodity];
    const next = {
      temp: clamp(values.temp + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 6 + 4), cfg.temp.min, cfg.temp.max),
      hum: clamp(values.hum + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 15 + 10), cfg.hum.min, cfg.hum.max),
      gas: clamp(values.gas + Math.random() * 250, cfg.gas.min, cfg.gas.max),
    };
    setValues(next);
    postReading({ temp: round1(next.temp), hum: round1(next.hum), gas: round1(next.gas) });
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (!thresholds || !values) {
    return (
      <section>
        <p className="eyebrow">Instrument 04</p>
        <h1 className="page-title">Storage condition monitor</h1>
        <p className="page-desc">Loading safe-range thresholds from the API…</p>
      </section>
    );
  }

  const cfg = thresholds[commodity];

  return (
    <section>
      <p className="eyebrow">Instrument 04</p>
      <h1 className="page-title">Storage condition monitor</h1>
      <p className="page-desc">
        Pick what's in the store and watch simulated sensor readings drift, posted to the same API
        route real hardware would use, with alerts when they leave the safe range.{" "}
        <span className="tag sim" style={{ marginLeft: 4 }}>Simulated sensors</span>
      </p>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label>Stored commodity</label>
            <select value={commodity} onChange={(e) => { clearInterval(intervalRef.current); setRunning(false); setCommodity(e.target.value); }}>
              {Object.keys(thresholds).map((key) => (
                <option key={key} value={key}>{LABELS[key] || key}</option>
              ))}
            </select>
          </div>
          <div className="sim-controls">
            <button className="btn btn-ghost" onClick={toggleMonitoring}>{running ? "Stop monitoring" : "Start monitoring"}</button>
            <button className="btn btn-ghost" onClick={simulateSpike}>Simulate a spike</button>
          </div>
        </div>

        <div className="storage-dials">
          <div className="card"><Gauge value={round1(values.temp)} min={cfg.temp.min} max={cfg.temp.max} label="Temperature" unit="°C" goodLo={cfg.temp.goodLo} goodHi={cfg.temp.goodHi} /></div>
          <div className="card"><Gauge value={round1(values.hum)} min={cfg.hum.min} max={cfg.hum.max} label="Relative Humidity" unit="%" goodLo={cfg.hum.goodLo} goodHi={cfg.hum.goodHi} /></div>
          <div className="card"><Gauge value={round1(values.gas)} min={cfg.gas.min} max={cfg.gas.max} label="CO₂ / off-gas buildup" unit="ppm" goodLo={cfg.gas.goodLo} goodHi={cfg.gas.goodHi} /></div>
        </div>

        <div className="divider" />
        <h3 style={{ marginBottom: 2 }}>Alert log</h3>
        <p className="hint">Newest first — pulled from the alerts the API persisted in MongoDB.</p>
        <div className="alert-log">
          {alerts.length === 0 && <p style={{ color: "var(--paper-dim)", fontSize: 12.5 }}>No alerts yet — start monitoring to begin.</p>}
          {alerts.map((a, i) => (
            <div className="alert-item" key={a._id || i}>
              <span className="alert-dot" style={{ background: a.level === "bad" ? "var(--danger)" : "var(--warn)" }} />
              <span className="alert-time">{new Date(a.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
