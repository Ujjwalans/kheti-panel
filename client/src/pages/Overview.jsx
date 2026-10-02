import { Link } from "react-router-dom";
import Gauge from "../components/Gauge.jsx";

const MODULES = [
  { to: "/disease", label: "01 — Vision", title: "Disease Scanner", desc: "Photograph a leaf, get a working diagnosis and treatment options." },
  { to: "/weather", label: "02 — Advisory", title: "Weather Outlook", desc: "Short-term outlook and field actions from current conditions." },
  { to: "/yield", label: "03 — Estimate", title: "Yield & Fertilizer", desc: "Heuristic yield estimate plus a matching fertilizer plan." },
  { to: "/storage", label: "04 — Sensors", title: "Storage Monitor", desc: "Live dial readout for temperature, humidity and gas buildup." },
];

export default function Overview() {
  return (
    <section>
      <div className="hero">
        <div>
          <p className="eyebrow">Four instruments, one panel</p>
          <h1 className="page-title">Read the field before it tells you the hard way.</h1>
          <p className="page-desc">
            Scan a leaf, check the week ahead, estimate what a plot will yield, and keep an eye on
            what's already in the store — backed by a real Express/MongoDB API, not just a UI shell.
          </p>
        </div>
        <div className="hero-dial-wrap">
          <Gauge value={23} min={0} max={45} label="Store Temperature — Live Field Instrument" unit="°C" goodLo={15} goodHi={25} size={220} />
        </div>
      </div>

      <div className="module-list">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="module-item">
            <div className="m-label">{m.label}</div>
            <div className="m-title">{m.title}</div>
            <div className="m-desc">{m.desc}</div>
          </Link>
        ))}
      </div>

      <div className="card" style={{ marginTop: 28 }}>
        <h3>What's actually running here</h3>
        <p className="hint" style={{ marginBottom: 14 }}>
          Being upfront about scope, since not every module has real hardware or a trained model behind it:
        </p>
        <div className="row-2">
          <div>
            <span className="tag good">Live AI</span>
            <p style={{ fontSize: 12.5, color: "var(--paper-dim)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Disease Scanner and the advisory text in Weather &amp; Fertilizer call Claude from the
              Express backend (vision + reasoning) — genuine model output, not scripted, and the API
              key never touches the browser.
            </p>
          </div>
          <div>
            <span className="tag sim">Illustrative</span>
            <p style={{ fontSize: 12.5, color: "var(--paper-dim)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Yield Predictor uses a transparent heuristic formula (not a trained ML model), and
              Storage Monitor simulates sensor readings client-side and posts them to the same API
              route real IoT sensors would use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
