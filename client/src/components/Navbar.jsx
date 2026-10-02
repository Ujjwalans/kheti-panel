import { NavLink } from "react-router-dom";

const ICONS = {
  overview:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',

  disease:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21c-5-3-8-7-8-12a8 8 0 0116 0c0 5-3 9-8 12z"/><path d="M12 21V9"/></svg>',

  weather:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17a4 4 0 01-.6-7.96A5.5 5.5 0 0117 8a4.5 4.5 0 01-.5 9H7z"/></svg>',

  yield:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>',

  storage:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="7" width="16" height="13" rx="1.5"/><path d="M8 7V5a4 4 0 018 0v2"/></svg>',

  // NEW: Market Intelligence
  market:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l4-4 3 2 5-6"/><path d="M16 7h3v3"/></svg>',

  // NEW: Soil Advisor
  soil:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 20c4-2 7-5 7-10V5"/><path d="M12 10c2-4 5-5 8-5 0 5-3 8-8 8"/><path d="M5 20h14"/></svg>',

  // NEW: Crop Risk
  risk:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l9 4v5c0 5-3.5 8-9 10-5.5-2-9-5-9-10V7l9-4z"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".7" fill="currentColor"/></svg>',

  // NEW: Kheti AI
  ai:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="6" width="16" height="12" rx="3"/><path d="M8 10h.01M16 10h.01"/><path d="M9 14h6"/><path d="M12 2v4M2 12h2M20 12h2"/></svg>',
};

const LINKS = [
  {
    to: "/",
    key: "overview",
    label: "Overview",
    end: true,
  },

  {
    to: "/disease",
    key: "disease",
    label: "Disease Scanner",
  },

  {
    to: "/weather",
    key: "weather",
    label: "Weather",
  },

  {
    to: "/yield",
    key: "yield",
    label: "Yield & Fertilizer",
  },

  {
    to: "/storage",
    key: "storage",
    label: "Storage Monitor",
  },

  // =====================================================
  // NEW SMART AGRICULTURE FEATURES
  // =====================================================

  {
    to: "/market",
    key: "market",
    label: "Market Intelligence",
  },

  {
    to: "/soil",
    key: "soil",
    label: "Soil Advisor",
  },

  {
    to: "/crop-risk",
    key: "risk",
    label: "Crop Risk",
  },

  {
    to: "/kheti-ai",
    key: "ai",
    label: "Kheti AI",
  },
];

export default function Navbar() {
  return (
    <header>
      <div className="header-inner">

        {/* BRAND */}
        <NavLink to="/" className="brand">
          <svg
            width="34"
            height="34"
            viewBox="0 0 40 40"
            fill="none"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="#D9A62B"
              strokeWidth="1.4"
            />

            <path
              d="M20 8c-6 4-8 10-6 18 6 2 12 0 16-6 2-6-2-10-10-12z"
              fill="#7E9B5E"
            />

            <path
              d="M20 8c4 5 5 12 2 20"
              stroke="#516B3B"
              strokeWidth="1.1"
              fill="none"
            />
          </svg>

          <div className="brand-text">
            <span className="name">
              Kheti Panel
            </span>

            <span className="sub">
              Farm Instrument Suite
            </span>
          </div>
        </NavLink>

        {/* NAVIGATION */}
        <nav>
          {LINKS.map((l) => (
            <NavLink
              key={l.key}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                "nav-btn" +
                (isActive ? " active" : "")
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: ICONS[l.key],
                }}
              />

              <span>
                {l.label}
              </span>
            </NavLink>
          ))}
        </nav>

      </div>
    </header>
  );
}