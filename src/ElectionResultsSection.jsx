"use client";

import { useEffect, useState, useRef } from "react";

const API_BASE = "https://veritas-backend-dktb.onrender.com";

// Party color map — add/edit as needed
const PARTY_COLORS = {
  "Dravida Munnetra Kazhagam": "#E63946",
  "DMK": "#E63946",
  "All India Anna Dravida Munnetra Kazhagam": "#2ECC71",
  "AIADMK": "#2ECC71",
  "Tamilaga Vettri Kazhagam": "#9B59B6",
  "TVK": "#9B59B6",
  "Bharatiya Janata Party": "#FF6B00",
  "BJP": "#FF6B00",
  "Indian National Congress": "#1A6FD4",
  "INC": "#1A6FD4",
  "Naam Tamilar Katchi": "#F1C40F",
  "NTK": "#F1C40F",
  "Communist Party of India (Marxist)": "#CC0000",
  "CPI(M)": "#CC0000",
  "Pattali Makkal Katchi": "#E91E63",
  "PMK": "#E91E63",
  "Desiya Murpokku Dravida Kazhagam": "#00BCD4",
  "DMDK": "#00BCD4",
};

function getPartyColor(party) {
  if (!party) return "#888";
  for (const key of Object.keys(PARTY_COLORS)) {
    if (party.toLowerCase().includes(key.toLowerCase())) return PARTY_COLORS[key];
  }
  // deterministic fallback color from party name
  let hash = 0;
  for (let i = 0; i < party.length; i++) hash = party.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

function abbreviateParty(party) {
  const abbrs = {
    "Dravida Munnetra Kazhagam": "DMK",
    "All India Anna Dravida Munnetra Kazhagam": "AIADMK",
    "Tamilaga Vettri Kazhagam": "TVK",
    "Bharatiya Janata Party": "BJP",
    "Indian National Congress": "INC",
    "Naam Tamilar Katchi": "NTK",
    "Communist Party of India (Marxist)": "CPI(M)",
    "Communist Party of India": "CPI",
    "Pattali Makkal Katchi": "PMK",
    "Desiya Murpokku Dravida Kazhagam": "DMDK",
    "Bahujan Samaj Party": "BSP",
    "Amma Makkal Munnettra Kazagam": "AMMK",
  };
  for (const [full, short] of Object.entries(abbrs)) {
    if (party.includes(full)) return short;
  }
  // auto-abbreviate: take first letter of each word, max 5 chars
  return party
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 5) || party.slice(0, 6).toUpperCase();
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function SkeletonBar() {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "24px 0 0" }}>
      {[120, 90, 70, 60, 50, 45].map((w, i) => (
        <div key={i} className="er-skeleton" style={{ width: w, height: 52, borderRadius: 6 }} />
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="er-grid">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="er-skeleton er-skeleton-card" />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ElectionResultsSection() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [data, setData] = useState(null);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const gridRef = useRef(null);

  // Fetch available states on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/elections/states`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.states.length > 0) {
          setStates(json.states);
          setSelectedState(json.states[0]);
        } else {
          setError("No election data available.");
        }
      })
      .catch(() => setError("Could not connect to election data service."))
      .finally(() => setLoadingStates(false));
  }, []);

  // Fetch results when state changes
  useEffect(() => {
    if (!selectedState) return;
    setLoadingResults(true);
    setData(null);
    setShowAll(false);
    setSearchQuery("");
    setError(null);
    fetch(`${API_BASE}/api/elections/results?state=${encodeURIComponent(selectedState)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json);
        else setError(json.error || "Failed to load results.");
      })
      .catch(() => setError("Failed to fetch results. Please try again."))
      .finally(() => setLoadingResults(false));
  }, [selectedState]);

  const filteredConstituencies = data?.constituencies?.filter(
    (c) =>
      c.ac_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.party.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const displayedConstituencies = showAll ? filteredConstituencies : filteredConstituencies.slice(0, 9);

  const totalSeats = data?.totalConstituencies || 0;
  const winner = data?.partySummary?.[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .er-section {
          background: #0a0a0a;
          border-top: 1px solid #1e1e1e;
          padding: 64px 0 80px;
          font-family: 'IBM Plex Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .er-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #cc0000 30%, #cc0000 70%, transparent);
        }

        .er-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .er-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .er-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 32px;
        }

        .er-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #cc0000;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .er-label::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #cc0000;
          border-radius: 50%;
          animation: er-pulse 2s infinite;
        }

        @keyframes er-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .er-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 40px);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .er-title span {
          color: #cc0000;
        }

        /* State Dropdown */
        .er-dropdown-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .er-dropdown-label {
          font-size: 10px;
          color: #555;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'IBM Plex Mono', monospace;
        }

        .er-dropdown {
          background: #111;
          border: 1px solid #2a2a2a;
          color: #fff;
          padding: 10px 36px 10px 14px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          transition: border-color 0.2s;
          min-width: 200px;
        }

        .er-dropdown:hover, .er-dropdown:focus {
          border-color: #cc0000;
          outline: none;
        }

        /* Divider */
        .er-divider {
          height: 1px;
          background: linear-gradient(90deg, #1e1e1e, #2a2a2a 50%, #1e1e1e);
          margin-bottom: 28px;
        }

        /* Majority banner */
        .er-majority-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: #111;
          border: 1px solid #1e1e1e;
          border-left: 3px solid var(--winner-color, #cc0000);
          border-radius: 4px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .er-majority-text {
          font-size: 12px;
          color: #888;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.05em;
        }

        .er-majority-party {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
        }

        .er-majority-seats {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--winner-color, #cc0000);
          margin-left: auto;
        }

        .er-majority-seats span {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          color: #555;
          font-weight: 400;
          margin-left: 4px;
        }

        /* Party tally bar */
        .er-tally-bar {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
          gap: 1px;
        }

        .er-tally-segment {
          height: 100%;
          transition: flex 0.6s ease;
        }

        /* Party chips */
        .er-parties {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }

        .er-party-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 4px;
          cursor: default;
          transition: border-color 0.2s, transform 0.15s;
        }

        .er-party-chip:hover {
          border-color: #333;
          transform: translateY(-1px);
        }

        .er-party-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .er-party-abbr {
          font-size: 11px;
          font-weight: 600;
          color: #ccc;
          letter-spacing: 0.03em;
          font-family: 'IBM Plex Mono', monospace;
        }

        .er-party-seats {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }

        .er-party-name-full {
          font-size: 10px;
          color: #555;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Details toggle */
        .er-details-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .er-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: 1px solid #cc0000;
          color: #cc0000;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .er-toggle-btn:hover {
          background: #cc0000;
          color: #fff;
        }

        .er-toggle-btn svg {
          transition: transform 0.3s ease;
        }

        .er-toggle-btn.open svg {
          transform: rotate(180deg);
        }

        /* Search */
        .er-search {
          background: #111;
          border: 1px solid #2a2a2a;
          color: #fff;
          padding: 9px 14px 9px 36px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px;
          border-radius: 4px;
          width: 220px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 10px center;
          transition: border-color 0.2s;
        }

        .er-search:focus {
          outline: none;
          border-color: #444;
        }

        .er-search::placeholder { color: #444; }

        /* Grid */
        .er-grid-wrap {
          max-height: 520px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a #111;
          animation: er-slidein 0.35s ease;
        }

        @keyframes er-slidein {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .er-grid-wrap::-webkit-scrollbar { width: 4px; }
        .er-grid-wrap::-webkit-scrollbar-track { background: #111; }
        .er-grid-wrap::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

        .er-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1px;
          background: #1a1a1a;
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }

        .er-card {
          background: #0f0f0f;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: background 0.15s;
          position: relative;
          overflow: hidden;
        }

        .er-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--card-color, #333);
        }

        .er-card:hover {
          background: #141414;
        }

        .er-card-no {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          color: #444;
          letter-spacing: 0.1em;
        }

        .er-card-ac {
          font-size: 12px;
          font-weight: 600;
          color: #ccc;
          letter-spacing: 0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .er-card-candidate {
          font-size: 11px;
          color: #888;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .er-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 6px;
        }

        .er-card-party-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 2px;
          letter-spacing: 0.05em;
        }

        .er-card-votes {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #555;
        }

        /* Show more button */
        .er-show-more {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #666;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          cursor: pointer;
          text-align: center;
          transition: color 0.2s, border-color 0.2s;
        }

        .er-show-more:hover {
          color: #fff;
          border-color: #444;
        }

        /* Error */
        .er-error {
          padding: 32px;
          text-align: center;
          color: #cc0000;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          border: 1px solid #2a0000;
          border-radius: 4px;
          background: #0d0000;
        }

        /* Skeleton */
        .er-skeleton {
          background: linear-gradient(90deg, #111 25%, #181818 50%, #111 75%);
          background-size: 200% 100%;
          animation: er-shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .er-skeleton-card {
          height: 90px;
        }

        @keyframes er-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .er-count-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #555;
          padding: 2px 8px;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
        }

        @media (max-width: 640px) {
          .er-header { flex-direction: column; }
          .er-dropdown-wrap { align-items: flex-start; }
          .er-dropdown { min-width: 100%; }
          .er-details-toggle { flex-direction: column; align-items: flex-start; }
          .er-search { width: 100%; }
          .er-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
        }
      `}</style>

      <section className="er-section">
        <div className="er-noise" />
        <div className="er-container">

          {/* Header */}
          <div className="er-header">
            <div>
              <div className="er-label">Election Results 2026</div>
              <h2 className="er-title">
                Assembly <span>Election</span> Results
              </h2>
            </div>

            {!loadingStates && states.length > 0 && (
              <div className="er-dropdown-wrap">
                <span className="er-dropdown-label">Select State</span>
                <select
                  className="er-dropdown"
                  value={selectedState || ""}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="er-divider" />

          {/* Error state */}
          {error && <div className="er-error">⚠ {error}</div>}

          {/* Loading skeleton */}
          {(loadingStates || loadingResults) && !error && (
            <>
              <SkeletonBar />
              <div style={{ marginTop: 16 }}>
                <SkeletonBar />
              </div>
            </>
          )}

          {/* Results loaded */}
          {data && !loadingResults && (
            <>
              {/* Majority banner */}
              {winner && (
                <div
                  className="er-majority-banner"
                  style={{ "--winner-color": getPartyColor(winner.party) }}
                >
                  <div>
                    <div className="er-majority-text">LEADING PARTY</div>
                    <div className="er-majority-party">{winner.party}</div>
                  </div>
                  <div className="er-majority-seats">
                    {winner.seats}
                    <span>/ {totalSeats} seats</span>
                  </div>
                </div>
              )}

              {/* Proportional tally bar */}
              <div className="er-tally-bar">
                {data.partySummary.map((p) => (
                  <div
                    key={p.party}
                    className="er-tally-segment"
                    title={`${p.party}: ${p.seats} seats`}
                    style={{
                      flex: p.seats,
                      background: getPartyColor(p.party),
                    }}
                  />
                ))}
              </div>

              {/* Party chips */}
              <div className="er-parties">
                {data.partySummary.map((p) => (
                  <div key={p.party} className="er-party-chip">
                    <div
                      className="er-party-dot"
                      style={{ background: getPartyColor(p.party) }}
                    />
                    <div>
                      <div className="er-party-abbr">{abbreviateParty(p.party)}</div>
                      <div className="er-party-name-full">{p.party}</div>
                    </div>
                    <div className="er-party-seats">{p.seats}</div>
                  </div>
                ))}
              </div>

              {/* Details toggle */}
              <div className="er-details-toggle">
                <button
                  className={`er-toggle-btn ${showAll ? "open" : ""}`}
                  onClick={() => {
                    setShowAll((v) => !v);
                    if (!showAll) setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                  }}
                >
                  {showAll ? "Hide Constituencies" : "View All Constituencies"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showAll && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="er-count-badge">{filteredConstituencies.length} results</span>
                    <input
                      className="er-search"
                      placeholder="Search seat, candidate, party…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Constituency grid */}
              {showAll && (
                <div ref={gridRef} className="er-grid-wrap">
                  {filteredConstituencies.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#555", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                      No results match your search.
                    </div>
                  ) : (
                    <div className="er-grid">
                      {displayedConstituencies.map((c) => {
                        const color = getPartyColor(c.party);
                        const abbr = abbreviateParty(c.party);
                        return (
                          <div
                            key={`${c.ac_no}-${c.candidate}`}
                            className="er-card"
                            style={{ "--card-color": color }}
                          >
                            <div className="er-card-no">AC {c.ac_no}</div>
                            <div className="er-card-ac">{c.ac_name}</div>
                            <div className="er-card-candidate">{c.candidate}</div>
                            <div className="er-card-bottom">
                              <div
                                className="er-card-party-badge"
                                style={{
                                  background: `${color}22`,
                                  color: color,
                                  border: `1px solid ${color}44`,
                                }}
                              >
                                {abbr}
                              </div>
                              <div className="er-card-votes">
                                {Number(c.total_votes).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!searchQuery && filteredConstituencies.length > displayedConstituencies.length && (
                    <button
                      className="er-show-more"
                      onClick={() => setShowAll(true)}
                    >
                      Scroll to see all {filteredConstituencies.length} constituencies ↓
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </section>
    </>
  );
}
