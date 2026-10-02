import { useState, useRef } from "react";
import { diseaseApi } from "../api/client.js";

function Section({ title, items }) {
  if (!items || !items.length) return null;
  return (
    <>
      <div className="subhead">{title}</div>
      <ul className="result-list">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </>
  );
}

export default function DiseaseScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await diseaseApi.analyze(file);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Couldn't complete the analysis. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <p className="eyebrow">Instrument 01</p>
      <h1 className="page-title">Disease &amp; pest scanner</h1>
      <p className="page-desc">
        Upload a clear photo of the affected leaf, stem, or fruit. The model looks for visual
        symptoms and returns a likely diagnosis with treatment options.
      </p>

      <div className="grid grid-2">
        <div className="card">
          <h3>Upload image</h3>
          <p className="hint">Close-up, good light, one plant part filling most of the frame works best.</p>
          <div
            className={"drop-zone" + (dragging ? " drag" : "")}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#A79E88" strokeWidth="1.5">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
              <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
            </svg>
            <div className="dz-text">Drop a photo here, or click to choose one</div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
          {preview && <img className="preview-img" src={preview} alt="preview" />}
          <button className="btn" disabled={!file || loading} onClick={analyze}>Analyze photo</button>
          {loading && <div className="loader"><div className="spinner" />Reading the image…</div>}
          {error && <div className="error-msg">{error}</div>}
        </div>

        <div className="card">
          <h3>Diagnosis</h3>
          <p className="hint">Results appear here after analysis.</p>
          {!result && <p style={{ color: "var(--paper-dim)", fontSize: 13 }}>No photo analyzed yet.</p>}
          {result && (
            <div>
              <div className="diag-header">
                <div className="diag-name">{result.name}</div>
                <span className={"tag " + (result.status === "healthy" ? "good" : result.status === "diseased" ? "bad" : "warn")}>
                  {result.status === "healthy" ? "Healthy" : result.status === "diseased" ? "Issue found" : "Uncertain"}
                </span>
              </div>
              <div className="conf-line">
                <div className="conf-bar"><div className="conf-fill" style={{ width: `${result.confidence || 0}%` }} /></div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--paper-dim)" }}>{result.confidence || 0}%</span>
              </div>
              <Section title="Symptoms observed" items={result.symptoms} />
              <Section title="Organic / cultural treatment" items={result.organicTreatment} />
              <Section title="Chemical treatment (if needed)" items={result.chemicalTreatment} />
              <Section title="Prevention going forward" items={result.prevention} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
