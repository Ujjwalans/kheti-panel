// A small arc gauge used across Yield and Storage screens — the app's
// recurring "instrument dial" visual identity.

function zoneColor(frac, goodLoFrac, goodHiFrac) {
  if (frac >= goodLoFrac && frac <= goodHiFrac) return "var(--good)";
  if (frac >= goodLoFrac - 0.15 && frac <= goodHiFrac + 0.15) return "var(--warn)";
  return "var(--danger)";
}

export default function Gauge({ value, min, max, label, unit, goodLo, goodHi, size = 150 }) {
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const goodLoFrac = (goodLo - min) / (max - min);
  const goodHiFrac = (goodHi - min) / (max - min);
  const color = zoneColor(frac, goodLoFrac, goodHiFrac);

  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 145;
  const sweep = 250;

  const toXY = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const arcPath = (a0, a1) => {
    const [x0, y0] = toXY(a0);
    const [x1, y1] = toXY(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const valAngle = startAngle + sweep * frac;

  return (
    <div className="gauge-wrap">
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
        <path d={arcPath(startAngle, startAngle + sweep)} stroke="var(--bg-raised)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path
          d={arcPath(startAngle + sweep * goodLoFrac, startAngle + sweep * goodHiFrac)}
          stroke="var(--leaf-deep)"
          strokeWidth="10"
          fill="none"
          opacity="0.55"
        />
        <path d={arcPath(startAngle, valAngle)} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3" fill={color} />
      </svg>
      <div className="gauge-value" style={{ color }}>{value}</div>
      <div className="gauge-unit">{unit}</div>
      <div className="gauge-label">{label}</div>
    </div>
  );
}
