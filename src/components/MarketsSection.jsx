import React, { useState, useEffect } from "react";
import { Link } from "../lib/router";


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

  // Commodities (Gold / Silver) state
  const [metalType, setMetalType] = useState("gold"); // "gold" | "silver"
  const [metalRange, setMetalRange] = useState("1d");
  const [metalData, setMetalData] = useState(null);
  const [metalLoading, setMetalLoading] = useState(true);

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

  // Fetch Gold/Silver Commodities Chart Data
  useEffect(() => {
    let isCurrent = true;
    async function fetchMetal() {
      setMetalLoading(true);
      try {
        const res = await fetch(`/api/commodities-chart?metal=${metalType}&range=${metalRange}`);
        if (!res.ok) throw new Error("Failed to fetch commodities chart");
        const data = await res.json();
        if (isCurrent) {
          setMetalData(data);
        }
      } catch (err) {
        console.error("Error fetching commodities chart:", err);
      } finally {
        if (isCurrent) setMetalLoading(false);
      }
    }
    fetchMetal();
    return () => { isCurrent = false; };
  }, [metalType, metalRange]);

  // Chart net change coloring
  const isNetPositive = chartData ? chartData.change >= 0 : true;
  const chartStrokeColor = isNetPositive ? "#22c55e" : "var(--veritas-red)";
  const chartFillId = `gradient-${chartSymbol}-${chartRange}`;

  // Commodities chart coloring
  const isMetalPositive = metalData ? metalData.change >= 0 : true;
  const metalStrokeColor = isMetalPositive ? "#22c55e" : "var(--veritas-red)";
  const metalFillId = `gradient-metal-${metalType}-${metalRange}`;
  const metalLabel = metalType === "gold" ? "Gold" : "Silver";

  // Brief analysis helper
  function getMetalAnalysis() {
    if (!metalData) return null;
    const pct = metalData.changePercent;
    const absPct = Math.abs(pct);
    const dir = pct >= 0 ? "up" : "down";
    const metalName = metalType === "gold" ? "Gold" : "Silver";

    if (absPct > 2) {
      return `${metalName} is trending sharply ${dir} with significant ${pct >= 0 ? "buying" : "selling"} pressure. ${pct >= 0 ? "Safe-haven demand is driving prices higher." : "Profit-taking and a stronger dollar are weighing on prices."}`;
    } else if (absPct > 0.5) {
      return `${metalName} is ${dir} modestly as markets digest macro cues. ${pct >= 0 ? "Inflation hedging flows remain supportive." : "Risk-on sentiment is limiting upside."}`;
    } else {
      return `${metalName} is trading nearly flat in a consolidation phase. Traders await fresh catalysts from central bank commentary and economic data.`;
    }
  }

  // Compute high/low and key levels from chart points
  function getMetalStats() {
    if (!metalData || !metalData.points || metalData.points.length < 2) return null;
    const values = metalData.points.map((p) => p.value);
    const high = Math.max(...values);
    const low = Math.min(...values);
    const open = values[0];
    const close = values[values.length - 1];
    const volatility = ((high - low) / low * 100).toFixed(2);
    // Support / Resistance as simple estimates
    const support = (low - (high - low) * 0.236).toFixed(2);
    const resistance = (high + (high - low) * 0.236).toFixed(2);
    return { high, low, open, close, volatility, support, resistance };
  }

  function getMetalOutlook() {
    const metalName = metalType === "gold" ? "Gold" : "Silver";
    if (!metalData) return "";
    const pct = metalData.changePercent;
    if (metalType === "gold") {
      if (pct >= 1) return "Bullish outlook — strong momentum with central bank buying and geopolitical hedging supporting prices.";
      if (pct >= 0) return "Mildly bullish — consolidating near highs. Watch for breakout above resistance for continuation.";
      if (pct > -1) return "Neutral to bearish — taking a breather amid dollar strength. Key support levels being tested.";
      return "Bearish pressure — risk appetite improving and yields rising, reducing gold's appeal as a safe haven.";
    } else {
      if (pct >= 1) return "Bullish — industrial demand and green energy tailwinds lifting silver alongside gold.";
      if (pct >= 0) return "Mildly bullish — silver benefits from dual industrial and monetary demand. Tracking gold's moves.";
      if (pct > -1) return "Neutral — silver consolidating within range. Industrial output data could provide next catalyst.";
      return "Under pressure — weak industrial outlook and stronger dollar weighing on silver prices.";
    }
  }

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

        {/* RIGHT COLUMN: Movers & Commodities Panels (approx 65% width) */}
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

          {/* COLUMN 3: Gold & Silver Commodities Chart */}
          <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-4.5">
            <div>
              {/* Heading with Metal Toggle */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <h4 className="font-sans font-bold text-sm tracking-tight text-white">
                  {metalLabel}
                </h4>
                {/* Gold / Silver Toggle Switch */}
                <div className="flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 rounded p-0.5">
                  <button
                    onClick={() => { setMetalType("gold"); setMetalRange("1d"); }}
                    className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded transition-all ${
                      metalType === "gold"
                        ? "bg-amber-500/15 text-amber-400 shadow-sm"
                        : "bg-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Gold
                  </button>
                  <button
                    onClick={() => { setMetalType("silver"); setMetalRange("1d"); }}
                    className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded transition-all ${
                      metalType === "silver"
                        ? "bg-slate-400/15 text-slate-300 shadow-sm"
                        : "bg-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Silver
                  </button>
                </div>
              </div>

              {/* Price Details */}
              {metalLoading && !metalData ? (
                <div className="h-12 flex flex-col justify-center">
                  <div className="h-6 w-32 rounded bg-neutral-900 animate-pulse mb-1" />
                  <div className="h-3.5 w-24 rounded bg-neutral-900 animate-pulse" />
                </div>
              ) : metalData ? (
                <div className="mb-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-sans text-xl font-bold tracking-tight text-white leading-none">
                      ${metalData.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] font-medium text-neutral-500 uppercase">{metalData.currency || "USD"}/oz</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10.5px] font-bold font-mono mt-0.5 ${
                      isMetalPositive ? "text-[#22c55e]" : "text-[var(--veritas-red)]"
                    }`}
                  >
                    <span>{isMetalPositive ? "▲" : "▼"}</span>
                    <span>{Math.abs(metalData.change).toFixed(2)}</span>
                    <span>({isMetalPositive ? "+" : ""}{metalData.changePercent.toFixed(2)}%)</span>
                  </span>
                </div>
              ) : (
                <div className="text-neutral-500 text-xs py-3">Failed to load data</div>
              )}

              {/* Mini Area Chart */}
              <div className="w-full h-24 relative my-1.5 flex items-center justify-center">
                {metalLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/10 rounded border border-neutral-900/50">
                    <div className="markets-section-shimmer absolute inset-0 rounded" />
                    <span className="text-neutral-500 text-[10px] font-medium z-10">Loading...</span>
                  </div>
                ) : metalData && isMounted && RechartsComponent ? (
                  <div className="absolute inset-0">
                    <RechartsComponent.ResponsiveContainer width="100%" height="100%">
                      <RechartsComponent.AreaChart
                        data={metalData.points}
                        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                      >
                        <defs>
                          <linearGradient id={metalFillId} x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={metalType === "gold" ? "#f59e0b" : "#94a3b8"}
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor={metalType === "gold" ? "#f59e0b" : "#94a3b8"}
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <RechartsComponent.XAxis dataKey="timestamp" hide={true} domain={["auto", "auto"]} />
                        <RechartsComponent.YAxis hide={true} domain={["auto", "auto"]} />
                        <RechartsComponent.Tooltip
                          contentStyle={{
                            backgroundColor: "#0d0d0d",
                            border: "1px solid #262626",
                            borderRadius: "4px",
                            color: "#f5f5f5",
                            fontSize: "10px",
                            padding: "4px 6px",
                          }}
                          labelFormatter={(label) => {
                            try {
                              return new Intl.DateTimeFormat("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              }).format(new Date(label));
                            } catch {
                              return "";
                            }
                          }}
                          formatter={(val) => [`$${val.toFixed(2)}`, "Price"]}
                        />
                        <RechartsComponent.Area
                          type="monotone"
                          dataKey="value"
                          stroke={metalStrokeColor}
                          strokeWidth={1.5}
                          fillOpacity={1}
                          fill={`url(#${metalFillId})`}
                        />
                      </RechartsComponent.AreaChart>
                    </RechartsComponent.ResponsiveContainer>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 rounded border border-neutral-900/50">
                    <span className="text-neutral-500 text-[10px]">Chart not available</span>
                  </div>
                )}
              </div>

              {/* Range Selector Pills */}
              <div className="flex flex-wrap items-center gap-0.5 bg-neutral-900/50 border border-neutral-800 p-0.5 rounded mt-1.5">
                {["1D", "5D", "1M", "6M", "1Y", "5Y", "MAX"].map((rangeStr) => {
                  const lowerRange = rangeStr.toLowerCase();
                  const isActive = metalRange === lowerRange;
                  return (
                    <button
                      key={`metal-${rangeStr}`}
                      onClick={() => setMetalRange(lowerRange)}
                      className={`flex-1 text-[9px] font-bold py-0.5 px-0.5 rounded transition-all select-none uppercase ${
                        isActive
                          ? metalType === "gold"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-400/20 text-slate-300"
                          : "text-neutral-500 hover:text-white hover:bg-neutral-800/40"
                      }`}
                    >
                      {rangeStr}
                    </button>
                  );
                })}
              </div>

              {/* Extended Analysis: High/Low, Key Levels, Outlook */}
              {metalData && (() => {
                const stats = getMetalStats();
                if (!stats) return null;
                return (
                  <div className="mt-2.5 border-t border-neutral-800/60 pt-2">
                    {/* Session High / Low bar */}
                    <div className="flex items-center justify-between text-[9px] text-neutral-500 font-medium mb-1.5">
                      <span>Low <span className="text-neutral-300 font-bold">${stats.low.toFixed(2)}</span></span>
                      <span className="text-[8px] uppercase tracking-wider text-neutral-600">Range</span>
                      <span>High <span className="text-neutral-300 font-bold">${stats.high.toFixed(2)}</span></span>
                    </div>
                    {/* Visual range bar */}
                    <div className="relative h-1 rounded-full bg-neutral-800 mb-2.5 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                          width: `${Math.max(5, Math.min(95, ((stats.close - stats.low) / (stats.high - stats.low)) * 100))}%`,
                          background: metalType === "gold"
                            ? "linear-gradient(90deg, #92400e, #f59e0b)"
                            : "linear-gradient(90deg, #475569, #94a3b8)",
                        }}
                      />
                    </div>

                    {/* Key Levels */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      <div className="bg-neutral-900/60 border border-neutral-800/40 rounded px-1.5 py-1 text-center">
                        <div className="text-[7.5px] uppercase tracking-wider text-neutral-600 font-bold">Open</div>
                        <div className="text-[10px] font-mono font-semibold text-neutral-300">${stats.open.toFixed(2)}</div>
                      </div>
                      <div className="bg-neutral-900/60 border border-neutral-800/40 rounded px-1.5 py-1 text-center">
                        <div className="text-[7.5px] uppercase tracking-wider text-neutral-600 font-bold">Prev Close</div>
                        <div className="text-[10px] font-mono font-semibold text-neutral-300">${metalData.previousClose.toFixed(2)}</div>
                      </div>
                      <div className="bg-neutral-900/60 border border-neutral-800/40 rounded px-1.5 py-1 text-center">
                        <div className="text-[7.5px] uppercase tracking-wider text-neutral-600 font-bold">Volatility</div>
                        <div className="text-[10px] font-mono font-semibold text-neutral-300">{stats.volatility}%</div>
                      </div>
                    </div>

                    {/* Support / Resistance */}
                    <div className="flex items-center justify-between text-[8.5px] font-medium mb-2">
                      <span className="text-emerald-500/80">
                        Support: <span className="font-mono font-bold">${stats.support}</span>
                      </span>
                      <span className="text-[var(--veritas-red)]/80">
                        Resistance: <span className="font-mono font-bold">${stats.resistance}</span>
                      </span>
                    </div>

                    {/* Market Outlook */}
                    <div className="bg-neutral-900/40 border border-neutral-800/30 rounded px-2 py-1.5">
                      <div className="text-[8px] uppercase tracking-wider text-neutral-600 font-bold mb-0.5">Outlook</div>
                      <p className="text-[9px] leading-relaxed text-neutral-400 font-medium">
                        {getMetalOutlook()}
                      </p>
                    </div>
                  </div>
                );
              })()}
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
