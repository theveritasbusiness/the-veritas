import React, { useState, useEffect } from "react";
import { Link } from "../lib/router";
import ipoCalendar from "../content/ipoCalendar";

// Simple helper to format price numbers in Indian currency style
function formatCurrency(val, isIndex = false) {
  if (val == null || isNaN(val)) return "--";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(val);
}

// Inline responsive Area Chart component using Recharts
// Dynamically imported client-side to prevent SSR mismatch errors in Next.js
let RechartsComponent = null;

export default function MarketsSection() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Local States
  const [chartSymbol, setChartSymbol] = useState("nifty"); // "nifty" | "sensex"
  const [chartRange, setChartRange] = useState("1d"); // "1d" | "5d" | "1m" | "6m" | "1y" | "5y" | "max"
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);

  const [gainersExchange, setGainersExchange] = useState("nse"); // "nse" | "bse"
  const [gainersData, setGainersData] = useState([]);
  const [gainersLoading, setGainersLoading] = useState(true);

  const [losersExchange, setLosersExchange] = useState("nse"); // "nse" | "bse"
  const [losersData, setLosersData] = useState([]);
  const [losersLoading, setLosersLoading] = useState(true);

  // Set mounted state and dynamically load Recharts client-side
  useEffect(() => {
    setIsMounted(true);
    // Dynamic import inside useEffect is safe and avoids SSR issues
    const loadRecharts = async () => {
      try {
        RechartsComponent = await import("recharts");
        // Force state update to re-render chart now that Recharts is loaded
        setChartData((prev) => (prev ? { ...prev } : null));
      } catch (err) {
        console.error("Failed to load recharts dynamically:", err);
      }
    };
    loadRecharts();
  }, []);

  // Fetch Chart Data
  useEffect(() => {
    let isCurrent = true;
    async function fetchChart() {
      setChartLoading(true);
      try {
        const res = await fetch(`/api/market-chart?symbol=${chartSymbol}&range=${chartRange}`);
        if (!res.ok) throw new Error("Failed to fetch chart");
        const data = await res.json();
        if (isCurrent) {
          setChartData(data);
        }
      } catch (err) {
        console.error("Error fetching market chart:", err);
      } finally {
        if (isCurrent) setChartLoading(false);
      }
    }
    fetchChart();
    return () => { isCurrent = false; };
  }, [chartSymbol, chartRange]);

  // Fetch Top Gainers Data
  useEffect(() => {
    let isCurrent = true;
    async function fetchGainers() {
      setGainersLoading(true);
      try {
        const res = await fetch(`/api/market-movers?exchange=${gainersExchange}&type=gainers`);
        if (!res.ok) throw new Error("Failed to fetch gainers");
        const data = await res.json();
        if (isCurrent) {
          setGainersData(data);
        }
      } catch (err) {
        console.error("Error fetching gainers:", err);
      } finally {
        if (isCurrent) setGainersLoading(false);
      }
    }
    fetchGainers();
    return () => { isCurrent = false; };
  }, [gainersExchange]);

  // Fetch Top Losers Data
  useEffect(() => {
    let isCurrent = true;
    async function fetchLosers() {
      setLosersLoading(true);
      try {
        const res = await fetch(`/api/market-movers?exchange=${losersExchange}&type=losers`);
        if (!res.ok) throw new Error("Failed to fetch losers");
        const data = await res.json();
        if (isCurrent) {
          setLosersData(data);
        }
      } catch (err) {
        console.error("Error fetching losers:", err);
      } finally {
        if (isCurrent) setLosersLoading(false);
      }
    }
    fetchLosers();
    return () => { isCurrent = false; };
  }, [losersExchange]);

  // Chart net change coloring
  const isNetPositive = chartData ? chartData.change >= 0 : true;
  const chartStrokeColor = isNetPositive ? "#22c55e" : "var(--veritas-red)";
  const chartFillId = `gradient-${chartSymbol}-${chartRange}`;

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 mt-6 sm:mt-8">
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        
        {/* LEFT COLUMN: Chart Card (approx 35% width) */}
        <div className="w-full lg:w-[35%] flex flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
          <div>
            {/* Header / Title */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-[1.1rem] tracking-tight text-white">
                Markets Action
              </h3>
              
              {/* Radio Toggle */}
              <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-300">
                  <input
                    type="radio"
                    name="index-selector"
                    checked={chartSymbol === "sensex"}
                    onChange={() => setChartSymbol("sensex")}
                    className="accent-[var(--veritas-red)] cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Sensex</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-300">
                  <input
                    type="radio"
                    name="index-selector"
                    checked={chartSymbol === "nifty"}
                    onChange={() => setChartSymbol("nifty")}
                    className="accent-[var(--veritas-red)] cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Nifty</span>
                </label>
              </div>
            </div>

            {/* Price Details */}
            {chartLoading && !chartData ? (
              <div className="h-16 flex flex-col justify-center">
                <div className="h-8 w-44 rounded bg-neutral-900 animate-pulse mb-1.5" />
                <div className="h-4 w-32 rounded bg-neutral-900 animate-pulse" />
              </div>
            ) : chartData ? (
              <div className="mb-4">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="font-sans text-[2rem] font-bold tracking-tight text-white leading-none">
                    {formatCurrency(chartData.price)}
                  </span>
                  
                  {/* Change badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-bold font-mono ${
                      isNetPositive ? "text-[#22c55e]" : "text-[var(--veritas-red)]"
                    }`}
                  >
                    <span>{isNetPositive ? "▲" : "▼"}</span>
                    <span>{Math.abs(chartData.change).toFixed(2)}</span>
                    <span>({isNetPositive ? "+" : ""}{chartData.changePercent.toFixed(2)}%)</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-xs py-4">Failed to load index data</div>
            )}
          </div>

          {/* Line Chart Area */}
          <div className="w-full h-44 relative my-3 flex items-center justify-center">
            {chartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/10 rounded border border-neutral-900/50">
                <div className="markets-section-shimmer absolute inset-0 rounded" />
                <span className="text-neutral-500 text-xs font-medium z-10">Loading chart data...</span>
              </div>
            ) : chartData && isMounted && RechartsComponent ? (
              <div className="absolute inset-0">
                <RechartsComponent.ResponsiveContainer width="100%" height="100%">
                  <RechartsComponent.AreaChart
                    data={chartData.points}
                    margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                  >
                    <defs>
                      <linearGradient id={chartFillId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={chartStrokeColor}
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartStrokeColor}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <RechartsComponent.XAxis
                      dataKey="timestamp"
                      hide={true}
                      domain={["auto", "auto"]}
                    />
                    <RechartsComponent.YAxis
                      hide={true}
                      domain={["auto", "auto"]}
                    />
                    <RechartsComponent.Tooltip
                      contentStyle={{
                        backgroundColor: "#0d0d0d",
                        border: "1px solid #262626",
                        borderRadius: "4px",
                        color: "#f5f5f5",
                        fontSize: "11px",
                        padding: "6px 8px"
                      }}
                      labelFormatter={(label) => {
                        try {
                          return new Intl.DateTimeFormat("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short"
                          }).format(new Date(label));
                        } catch {
                          return "";
                        }
                      }}
                      formatter={(val) => [formatCurrency(val), "Price"]}
                    />
                    <RechartsComponent.Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartStrokeColor}
                      strokeWidth={1.8}
                      fillOpacity={1}
                      fill={`url(#${chartFillId})`}
                    />
                  </RechartsComponent.AreaChart>
                </RechartsComponent.ResponsiveContainer>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 rounded border border-neutral-900/50">
                <span className="text-neutral-500 text-xs">Chart not available</span>
              </div>
            )}
          </div>

          {/* Range Selector and Updated timestamp */}
          <div className="mt-2">
            {/* Pill range buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-neutral-900/50 border border-neutral-800 p-0.5 rounded">
              {["1D", "5D", "1M", "6M", "1Y", "5Y", "MAX"].map((rangeStr) => {
                const lowerRange = rangeStr.toLowerCase();
                const isActive = chartRange === lowerRange;
                return (
                  <button
                    key={rangeStr}
                    onClick={() => setChartRange(lowerRange)}
                    className={`flex-1 text-[10px] font-bold py-1 px-1 rounded transition-all select-none uppercase ${
                      isActive
                        ? "bg-[var(--veritas-red)] text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                    }`}
                  >
                    {rangeStr}
                  </button>
                );
              })}
            </div>
            
            {/* Updated string */}
            <div className="mt-2.5 text-[9.5px] text-neutral-500 font-medium tracking-wide">
              {chartData ? (
                <span>
                  Last updated: Today | {chartData.asOf || "--:--"} {chartData.isFallback ? "(Fallback Data)" : ""}
                </span>
              ) : (
                <span>Updating indices...</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Movers & IPO Panels (approx 65% width) */}
        <div className="w-full lg:w-[65%] grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* COLUMN 1: Top Gainers */}
          <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-4.5">
            <div>
              {/* Heading and link */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <h4 className="font-sans font-bold text-sm tracking-tight text-white">
                  Top Gainers
                </h4>
                <a href="#gainers" className="text-[10px] font-bold text-neutral-500 hover:text-[var(--veritas-red)] transition-colors uppercase">
                  more &rarr;
                </a>
              </div>

              {/* Tab Toggle */}
              <div className="flex gap-1.5 mb-3.5">
                {["nse", "bse"].map((ex) => (
                  <button
                    key={`gainer-${ex}`}
                    onClick={() => setGainersExchange(ex)}
                    className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded border transition-all ${
                      gainersExchange === ex
                        ? "bg-[var(--veritas-red)]/10 text-[var(--veritas-red)] border-[var(--veritas-red)]/35"
                        : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-700 hover:text-neutral-300"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Movers List */}
              <div className="space-y-2">
                {gainersLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`gainer-shimmer-${idx}`} className="flex items-center justify-between py-1 animate-pulse">
                      <div className="h-6 w-16 bg-neutral-900 rounded" />
                      <div className="h-6 w-24 bg-neutral-900 rounded" />
                    </div>
                  ))
                ) : gainersData.length > 0 ? (
                  gainersData.map((mover) => (
                    <div
                      key={`gainer-${mover.symbol}`}
                      className="flex items-center justify-between py-1.5 border-b border-neutral-900 last:border-b-0 hover:bg-neutral-900/10 px-0.5 transition-colors"
                    >
                      {/* Left side: Symbol */}
                      <span className="text-[11px] font-bold font-sans uppercase px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 select-none min-w-16 text-center">
                        {mover.symbol}
                      </span>
                      
                      {/* Right side: Price & Percent Change */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono text-neutral-200">
                          {formatCurrency(mover.price)}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                          +{mover.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 text-xs text-center py-6">No data found</div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Top Losers */}
          <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-4.5">
            <div>
              {/* Heading and link */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <h4 className="font-sans font-bold text-sm tracking-tight text-white">
                  Top Losers
                </h4>
                <a href="#losers" className="text-[10px] font-bold text-neutral-500 hover:text-[var(--veritas-red)] transition-colors uppercase">
                  more &rarr;
                </a>
              </div>

              {/* Tab Toggle */}
              <div className="flex gap-1.5 mb-3.5">
                {["nse", "bse"].map((ex) => (
                  <button
                    key={`loser-${ex}`}
                    onClick={() => setLosersExchange(ex)}
                    className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded border transition-all ${
                      losersExchange === ex
                        ? "bg-[var(--veritas-red)]/10 text-[var(--veritas-red)] border-[var(--veritas-red)]/35"
                        : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-700 hover:text-neutral-300"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Movers List */}
              <div className="space-y-2">
                {losersLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`loser-shimmer-${idx}`} className="flex items-center justify-between py-1 animate-pulse">
                      <div className="h-6 w-16 bg-neutral-900 rounded" />
                      <div className="h-6 w-24 bg-neutral-900 rounded" />
                    </div>
                  ))
                ) : losersData.length > 0 ? (
                  losersData.map((mover) => (
                    <div
                      key={`loser-${mover.symbol}`}
                      className="flex items-center justify-between py-1.5 border-b border-neutral-900 last:border-b-0 hover:bg-neutral-900/10 px-0.5 transition-colors"
                    >
                      {/* Left side: Symbol */}
                      <span className="text-[11px] font-bold font-sans uppercase px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 select-none min-w-16 text-center">
                        {mover.symbol}
                      </span>
                      
                      {/* Right side: Price & Percent Change */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono text-neutral-200">
                          {formatCurrency(mover.price)}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-bold font-mono bg-[var(--veritas-red)]/10 text-[var(--veritas-red)] px-1.5 py-0.5 rounded">
                          {mover.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 text-xs text-center py-6">No data found</div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: IPO Calendar */}
          <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-4.5">
            <div>
              {/* Heading and link */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <h4 className="font-sans font-bold text-sm tracking-tight text-white">
                  IPOs Calendar
                </h4>
                <a href="#ipos" className="text-[10px] font-bold text-neutral-500 hover:text-[var(--veritas-red)] transition-colors uppercase">
                  more &rarr;
                </a>
              </div>

              {/* Table Column Headers */}
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-dashed border-neutral-800 pb-1.5 mb-1 bg-transparent select-none">
                <span>Company</span>
                <span className="text-right">Price Band (Rs.)</span>
              </div>

              {/* List of 5 IPOs */}
              <div className="divide-y divide-neutral-900/50">
                {ipoCalendar.slice(0, 5).map((ipo, idx) => (
                  <div
                    key={`ipo-${ipo.company}`}
                    className={`flex items-center justify-between py-2 px-1 text-xs hover:bg-neutral-900/10 ${
                      idx % 2 === 0 ? "bg-neutral-900/20" : "bg-transparent"
                    }`}
                  >
                    {/* Left: Company Name + SME tag */}
                    <div className="flex flex-col justify-center max-w-[65%]">
                      <span className="font-medium text-neutral-200 break-words leading-tight">
                        {ipo.company}
                      </span>
                      {ipo.isSme && (
                        <span className="text-[9px] font-bold text-[var(--veritas-red)] tracking-wider mt-0.5 select-none uppercase">
                          SME IPO
                        </span>
                      )}
                    </div>

                    {/* Right: Price Range */}
                    <span className="text-right font-mono text-[11px] font-semibold text-neutral-400">
                      {ipo.priceRange}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Embedded Styles for custom animations and styles */}
      <style>{`
        .markets-section-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.0) 0%,
            rgba(255, 255, 255, 0.04) 50%,
            rgba(255, 255, 255, 0.0) 100%
          );
          background-size: 200% 100%;
          animation: marketsShimmerAnim 1.6s infinite linear;
        }

        @keyframes marketsShimmerAnim {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  );
}
