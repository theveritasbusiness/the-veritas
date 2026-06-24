import React, { useEffect, useMemo, useState } from "react";

function formatValue(item) {
  if (item.value == null || Number.isNaN(item.value)) return "--";

  const isCurrencyLike =
    item.label.includes("GOLD") ||
    item.label.includes("SILVER") ||
    item.label.includes("CRUDE") ||
    item.label.includes("DOLLAR");

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: isCurrencyLike || item.value < 100 ? 2 : 0
  }).format(item.value);
}

function formatChange(value) {
  if (value == null || Number.isNaN(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export default function MarketTickerTape() {
  const [items, setItems] = useState([]);
  const [asOf, setAsOf] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/market-tape");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load market tape");

        if (isMounted) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setAsOf(data.asOf || "");
        }
      } catch (error) {
        console.error("Market tape load failed:", error);
      }
    }

    load();
    const intervalId = setInterval(load, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => item && item.value != null && !Number.isNaN(item.value)),
    [items]
  );

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
      <div className="market-strip rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="market-strip-marquee">
          <div className="market-strip-track">
            <div className="market-strip-anchor">
              <span className="market-strip-dot" aria-hidden="true" />
              <span>Live Markets</span>
              {asOf ? <span className="market-strip-time">Updated {asOf}</span> : null}
            </div>
            {(visibleItems.length ? [...visibleItems, ...visibleItems] : Array.from({ length: 10 })).map(
              (item, index) =>
                item ? (
                  <div key={`${item.label}-${index}`} className="market-card">
                    <div className="market-card-label">{item.label}</div>
                    <div
                      className={`market-card-change ${
                        item.change > 0 ? "up" : item.change < 0 ? "down" : "flat"
                      }`}
                    >
                      <span className="market-card-value">{formatValue(item)}</span>
                      <span className="market-card-arrow" aria-hidden="true">
                        {item.change > 0 ? "▲" : item.change < 0 ? "▼" : "•"}
                      </span>
                      <span>{formatChange(item.change)}</span>
                      <span className="market-card-percent">{formatPercent(item.changePercent)}</span>
                    </div>
                  </div>
                ) : (
                  <div key={`skeleton-${index}`} className="market-card market-card-skeleton" />
                )
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

        .market-strip {
          font-family: "Roboto", sans-serif;
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            0 8px 24px rgba(0, 0, 0, 0.16);
        }

        .market-strip-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #de0216;
          box-shadow: 0 0 14px rgba(222, 2, 22, 0.5);
        }

        .market-strip-anchor {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          white-space: nowrap;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          background: linear-gradient(90deg, rgba(222, 2, 22, 0.12), rgba(0, 0, 0, 0));
          color: #f5f5f5;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .market-strip-time {
          color: #8b8b8b;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .market-strip-marquee {
          overflow: hidden;
        }

        .market-strip-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marketScroll 72s linear infinite;
        }

        .market-strip:hover .market-strip-track {
          animation-play-state: paused;
        }

        .market-card {
          min-width: 260px;
          padding: 12px 16px;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.01);
        }

        .market-card-label {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a4a4a4;
          white-space: nowrap;
        }

        .market-card-value,
        .market-card-change {
          font-family: "Roboto", sans-serif;
        }

        .market-card-value {
          font-size: 0.98rem;
          font-weight: 500;
          color: #f8f8f8;
        }

        .market-card-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 400;
          white-space: nowrap;
        }

        .market-card-change.up {
          color: #22c55e;
        }

        .market-card-change.down {
          color: #ef4444;
        }

        .market-card-change.flat {
          color: #a3a3a3;
        }

        .market-card-arrow {
          font-size: 0.78rem;
          line-height: 1;
        }

        .market-card-percent {
          opacity: 0.9;
        }

        .market-card-skeleton {
          min-width: 260px;
          min-height: 52px;
          background:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 0%,
              rgba(255, 255, 255, 0.07) 50%,
              rgba(255, 255, 255, 0.03) 100%
            );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite linear;
        }

        @keyframes marketScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .market-strip-anchor {
            padding: 0 12px;
          }

          .market-card {
            min-width: 220px;
            padding: 10px 12px;
            gap: 10px;
          }

          .market-strip-time {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
