import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "./lib/router";
import { API_BASE, AD_SLOT_HOME_INLINE } from "./lib/env";
import { isCategoryMatch } from "./content/categories";
import { getHeroImageUrl, getImagePresentation } from "./utils/cloudinary";
import Head from "next/head";
import MarketTickerTape from "./components/MarketTickerTape";
import AdSlot from "./components/AdSlot";

// ─── HELPERS ────────────────────────────────────────────────────────────────
function fmtINR(val) {
  if (val == null || isNaN(val)) return "--";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(val);
}

function fmtPct(val) {
  if (val == null || isNaN(val)) return "--";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

function fmtChange(val) {
  if (val == null || isNaN(val)) return "--";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}`;
}

function fmtVolume(val) {
  if (val == null) return "--";
  if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
  if (val >= 1e7) return (val / 1e7).toFixed(2) + "Cr";
  if (val >= 1e5) return (val / 1e5).toFixed(2) + "L";
  if (val >= 1e3) return (val / 1e3).toFixed(1) + "K";
  return val.toString();
}

function getTimeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
}

const NOW = new Date();
const DATE_STR = NOW.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
const TIME_STR = NOW.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

// ─── STATIC DATA ────────────────────────────────────────────────────────────

const SECTOR_DATA = [
  { name: "NIFTY IT", change: 1.32 }, { name: "NIFTY AUTO", change: 0.85 },
  { name: "NIFTY PHARMA", change: -0.42 }, { name: "NIFTY FMCG", change: -0.15 },
  { name: "NIFTY METAL", change: -0.18 }, { name: "NIFTY REALTY", change: -1.02 },
  { name: "NIFTY BANK", change: -1.15 }, { name: "NIFTY FIN SERVICE", change: -1.33 },
  { name: "NIFTY PSU BANK", change: -1.45 }, { name: "NIFTY MEDIA", change: -1.68 },
  { name: "NIFTY ENERGY", change: -1.32 }, { name: "NIFTY INFRA", change: -2.21 }
];

const FII_DII_DATA = {
  cash: { fii: -2956, dii: 3124, net: -768, date: "Jul 14, 2026" },
  fno: { fii: -1245, dii: 890, net: -355, date: "Jul 14, 2026" }
};

const FII_DII_CHART = [
  { date: "Jul 08", fii: -1200, dii: 1800 },
  { date: "Jul 09", fii: -800, dii: 2200 },
  { date: "Jul 10", fii: -2100, dii: 1500 },
  { date: "Jul 11", fii: 500, dii: 3000 },
  { date: "Jul 14", fii: -2956, dii: 3124 }
];

const MOST_ACTIVE = [
  { company: "RELIANCE", price: 2987.45, change: 24.65, changePct: 0.83, volume: "2.45M" },
  { company: "TATA MOTORS", price: 912.45, change: 45.85, changePct: 5.32, volume: "1.98M" },
  { company: "HDFC BANK", price: 1632.65, change: -46.90, changePct: -2.65, volume: "1.75M" },
  { company: "ICICI BANK", price: 1142.30, change: -28.65, changePct: -2.45, volume: "1.65M" },
  { company: "INFOSYS", price: 1489.30, change: 18.30, changePct: 1.24, volume: "1.32M" }
];

const GLOBAL_INDICES_ALL = {
  all: [
    { name: "Dow Jones", value: 44342.19, change: -120.83, changePct: -0.27 },
    { name: "S&P 500", value: 6280.46, change: -18.58, changePct: -0.29 },
    { name: "Nasdaq Composite", value: 20585.53, change: -47.83, changePct: -0.42 },
    { name: "FTSE 100", value: 8143.02, change: 24.16, changePct: 0.30 },
    { name: "DAX", value: 18453.72, change: -110.35, changePct: -0.60 },
    { name: "Hang Seng", value: 24321.42, change: -142.17, changePct: -0.58 },
    { name: "Shanghai Composite", value: 3567.45, change: 18.62, changePct: 0.52 }
  ],
  us: [
    { name: "Dow Jones", value: 44342.19, change: -120.83, changePct: -0.27 },
    { name: "S&P 500", value: 6280.46, change: -18.58, changePct: -0.29 },
    { name: "Nasdaq Composite", value: 20585.53, change: -47.83, changePct: -0.42 },
    { name: "Nikkei 225", value: 41621.35, change: -332.21, changePct: -0.80 }
  ],
  europe: [
    { name: "FTSE 100", value: 8143.02, change: 24.16, changePct: 0.30 },
    { name: "DAX", value: 18453.72, change: -110.35, changePct: -0.60 }
  ],
  asia: [
    { name: "Nikkei 225", value: 41621.35, change: -332.21, changePct: -0.80 },
    { name: "Hang Seng", value: 24321.42, change: -142.17, changePct: -0.58 },
    { name: "Shanghai Composite", value: 3567.45, change: 18.62, changePct: 0.52 }
  ]
};

const ECON_CALENDAR = [
  { time: "08:00 AM", event: "WPI Inflation (YoY)", country: "India", impact: "High", actual: "0.39%", forecast: "0.60%", previous: "-" },
  { time: "12:30 PM", event: "CPI Inflation (YoY)", country: "India", impact: "High", actual: "5.08%", forecast: "5.20%", previous: "4.87%" },
  { time: "04:00 PM", event: "Retail Sales (MoM)", country: "USA", impact: "Medium", actual: "0.30%", forecast: "0.40%", previous: "0.10%" },
  { time: "08:30 PM", event: "Fed Chair Powell Speaks", country: "USA", impact: "High", actual: "-", forecast: "-", previous: "-" }
];

const HEATMAP_SECTORS = [
  { name: "IT", change: 0.92, size: 3 },
  { name: "BANKING", change: -1.15, size: 3 },
  { name: "AUTO", change: 0.48, size: 2 },
  { name: "PHARMA", change: 0.78, size: 2 },
  { name: "FINANCIAL\nSERVICES", change: -0.65, size: 2 },
  { name: "FMCG", change: -0.12, size: 1.5 },
  { name: "METAL", change: -0.78, size: 1.5 },
  { name: "OIL & GAS", change: -1.12, size: 1.5 },
  { name: "POWER", change: -0.32, size: 1 },
  { name: "REALTY", change: -0.98, size: 1 },
  { name: "MEDIA", change: -0.28, size: 1 },
  { name: "TELECOM", change: -0.65, size: 1 },
  { name: "INFRA", change: -0.65, size: 1 },
  { name: "CONSUMER\nDURABLES", change: -0.41, size: 1 }
];

const MARKET_STATUS = {
  advances: 1126, declines: 2345, unchanged: 102, totalVolume: "4.21B"
};

const MARKET_PULSE = [
  { label: "Sensex", value: 77054.94, change: -0.72 },
  { label: "Nifty 50", value: 24542.10, change: -0.65 },
  { label: "Gold (USD/oz)", value: 4071.30, change: 1.64 },
  { label: "Silver (USD/oz)", value: 59.22, change: 2.15 },
  { label: "Brent Oil (USD/bbl)", value: 84.21, change: 1.12 },
  { label: "Bitcoin (USD)", value: 65432.10, change: 1.25 }
];

const MARKET_MOVERS_LINKS = [
  { label: "Top Gainers", count: 128, color: "#22c55e" },
  { label: "Top Losers", count: 124, color: "#ef4444" },
  { label: "52 Week High", count: 36, color: "#22c55e" },
  { label: "52 Week Low", count: 18, color: "#ef4444" },
  { label: "Most Active", count: 20, color: "#a3a3a3" },
  { label: "Highest Volume", count: 20, color: "#a3a3a3" }
];

const INDEX_CARDS = [
  { name: "NIFTY 50", value: 24542.10, change: -158.95, changePct: -0.66, time: "Jul 14, 3:30 PM IST" },
  { name: "BSE SENSEX", value: 77054.94, change: -561.46, changePct: -0.72, time: "Jul 14, 3:30 PM IST" },
  { name: "NIFTY BANK", value: 57462.30, change: -669.15, changePct: -1.15, time: "Jul 14, 3:30 PM IST" },
  { name: "NIFTY NEXT 50", value: 71825.45, change: -402.35, changePct: -0.56, time: "Jul 14, 3:30 PM IST" },
  // { name: "INDIA VIX", value: 13.75, change: 1.50, changePct: 12.24, time: "Jul 14, 3:30 PM IST" }
];

const WEEK52_DATA = { newHigh: 164, newLow: 73, highPct: 69, lowPct: 31 };

const TABS = ["Overview", "Indices", "Stocks", "Commodities", "Currencies", "Crypto", "Mutual Funds", "Bonds", "IPO", "Economic Calendar"];

const CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" }
];

const GAINERS_LOSERS_DATA = {
  nifty50: {
    gainers: [
      { name: "Tata Motors", price: 912.45, change: 5.32 },
      { name: "Maruti Suzuki", price: 12549.80, change: 2.18 },
      { name: "Tech Mahindra", price: 1287.50, change: 2.91 },
      { name: "HCL Technologies", price: 1686.40, change: 2.45 },
      { name: "UltraTech Cement", price: 11450.00, change: 2.12 }
    ],
    losers: [
      { name: "HDFC Bank", price: 1632.65, change: -3.65 },
      { name: "ICICI Bank", price: 1142.30, change: -2.18 },
      { name: "State Bank of India", price: 812.20, change: -2.15 },
      { name: "Infosys", price: 1489.30, change: -1.92 },
      { name: "Axis Bank", price: 1018.90, change: -1.78 }
    ]
  }
};

const GLOBAL_OVERVIEW = {
  us: [
    { name: "Dow Jones", value: 44342.19, change: -120.83, changePct: -0.27 },
    { name: "S&P 500", value: 6280.46, change: -18.58, changePct: -0.29 },
    { name: "Nasdaq Composite", value: 20585.53, change: -47.83, changePct: -0.42 },
    { name: "FTSE 100", value: 8143.02, change: 24.16, changePct: 0.30 },
    { name: "DAX", value: 18453.72, change: 110.35, changePct: 0.80 },
    { name: "Nikkei 225", value: 41621.35, change: -332.21, changePct: -0.80 }
  ],
  europe: [
    { name: "FTSE 100", value: 8143.02, change: 24.16, changePct: 0.30 },
    { name: "DAX", value: 18453.72, change: 110.35, changePct: 0.80 },
    { name: "CAC 40", value: 7524.11, change: -45.30, changePct: -0.60 }
  ],
  asia: [
    { name: "Nikkei 225", value: 41621.35, change: -332.21, changePct: -0.80 },
    { name: "Hang Seng", value: 24321.42, change: -142.17, changePct: -0.58 },
    { name: "Shanghai Composite", value: 3567.45, change: 18.62, changePct: 0.52 }
  ]
};


// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function MarketsPage({ initialArticles = [] }) {
  // ── State ──
  const [activeTab, setActiveTab] = useState("Overview");
  const [gainersTab, setGainersTab] = useState("nifty50");
  const [globalIdxTab, setGlobalIdxTab] = useState("all");
  const [globalOverviewTab, setGlobalOverviewTab] = useState("us");
  const [fiiDiiTab, setFiiDiiTab] = useState("cash");
  const [currencyFrom, setCurrencyFrom] = useState("USD");
  const [currencyTo, setCurrencyTo] = useState("INR");
  const [currencyAmount, setCurrencyAmount] = useState("1");
  const [currencyResult, setCurrencyResult] = useState(83.21);
  const [currencyRate, setCurrencyRate] = useState(83.21);
  const [marketArticles, setMarketArticles] = useState([]);
  const [tapeData, setTapeData] = useState(null);
  const [gainersData, setGainersData] = useState([]);
  const [losersData, setLosersData] = useState([]);

  // ── Fetch market tape data for index cards ──
  useEffect(() => {
    async function loadTape() {
      try {
        const res = await fetch("/api/market-tape");
        if (res.ok) {
          const data = await res.json();
          setTapeData(data);
        }
      } catch (err) {
        console.error("Failed to load tape:", err);
      }
    }
    loadTape();
  }, []);

  // ── Fetch market articles ──
  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch(`${API_BASE}/articles`);
        if (res.ok) {
          const data = await res.json();
          const filtered = (Array.isArray(data) ? data : []).filter(
            (a) => a.category && isCategoryMatch(a.category, "Markets")
          );
          setMarketArticles(filtered.slice(0, 10));
        }
      } catch (err) {
        console.error("Failed to load market articles:", err);
      }
    }
    loadArticles();
  }, []);

  // ── Fetch gainers/losers ──
  useEffect(() => {
    async function loadMovers() {
      try {
        const [gRes, lRes] = await Promise.all([
          fetch("/api/market-movers?exchange=nse&type=gainers"),
          fetch("/api/market-movers?exchange=nse&type=losers")
        ]);
        if (gRes.ok) setGainersData(await gRes.json());
        if (lRes.ok) setLosersData(await lRes.json());
      } catch (err) {
        console.error("Failed to load movers:", err);
      }
    }
    loadMovers();
  }, []);

  // ── Currency conversion ──
  const convertCurrency = useCallback(async () => {
    try {
      const res = await fetch(`/api/currency-convert?from=${currencyFrom}&to=${currencyTo}&amount=${currencyAmount}`);
      if (res.ok) {
        const data = await res.json();
        setCurrencyResult(data.result);
        setCurrencyRate(data.rate);
      }
    } catch (err) {
      console.error("Currency conversion failed:", err);
    }
  }, [currencyFrom, currencyTo, currencyAmount]);

  useEffect(() => {
    convertCurrency();
  }, [convertCurrency]);

  // ── Derived index card data from tape ──
  const liveIndexCards = useMemo(() => {
    if (!tapeData || !tapeData.items) return INDEX_CARDS;
    const mapping = {
      "NIFTY 50": "NIFTY 50",
      "BSE SENSEX": "BSE SENSEX",
      "NIFTY BANK": "NIFTY BANK",
      "NIFTY NEXT 50": "NIFTY NEXT 50",
      "INDIA VIX": "INDIA VIX"
    };
    return INDEX_CARDS.map((card) => {
      const tapeLabel = mapping[card.name];
      const tapeItem = tapeData.items.find((i) => i.label === tapeLabel);
      if (tapeItem && tapeItem.value != null) {
        return {
          ...card,
          value: tapeItem.value,
          change: tapeItem.change,
          changePct: tapeItem.changePercent,
          time: `${DATE_STR}, ${TIME_STR}`
        };
      }
      return card;
    });
  }, [tapeData]);

  // ── Live market pulse from tape ──
  const liveMarketPulse = useMemo(() => {
    if (!tapeData || !tapeData.items) return MARKET_PULSE;
    const pulseMapping = {
      "Sensex": "BSE SENSEX",
      "Nifty 50": "NIFTY 50",
      "Gold (USD/oz)": "GOLD (USD/OZ)",
      "Silver (USD/oz)": "SILVER (USD/OZ)",
      "Brent Oil (USD/bbl)": "CRUDE OIL (USD/BBL)",
      "Bitcoin (USD)": null
    };
    return MARKET_PULSE.map((item) => {
      const tapeLabel = pulseMapping[item.label];
      if (!tapeLabel) return item;
      const tapeItem = tapeData.items.find((i) => i.label === tapeLabel);
      if (tapeItem && tapeItem.value != null) {
        return { ...item, value: tapeItem.value, change: tapeItem.changePercent };
      }
      return item;
    });
  }, [tapeData]);

  // Featured article for the Top Market News section
  const featuredArticle = marketArticles[0] || null;
  const sideNewsArticles = marketArticles.slice(1, 5);

  // ── FII/DII bar chart max ──
  const fiiDiiBarMax = Math.max(
    ...FII_DII_CHART.map((d) => Math.max(Math.abs(d.fii), Math.abs(d.dii)))
  );

  // Breadth percentages
  const totalBreadth = MARKET_STATUS.advances + MARKET_STATUS.declines + MARKET_STATUS.unchanged;
  const advPct = Math.round((MARKET_STATUS.advances / totalBreadth) * 100);
  const decPct = Math.round((MARKET_STATUS.declines / totalBreadth) * 100);

  // ── RENDER ──
  return (
    <>
      <Head>
        <title>Markets — The Veritas</title>
        <meta name="description" content="Real-time market data, stock indices, commodities, global markets, and financial analysis from The Veritas." />
      </Head>

      <div className="mp-page">
        {/* ════════════════ LIVE MARKET TICKER TAPE ════════════════ */}
        <div className="pb-6">
          <MarketTickerTape />
        </div>
        

        {/* ════════════════ HERO + SIDEBAR ════════════════ */}
        <section className="mp-hero-section">
          <div className="mp-hero-main">
            <div className="mp-hero-overlay" />
            <div className="mp-hero-content">
              <div className="mp-breadcrumb">
                <span className="mp-breadcrumb-red">THE VERITAS</span>
                <span className="mp-breadcrumb-sep">&gt;</span>
                <span className="mp-breadcrumb-text">MARKET INTELLIGENCE</span>
              </div>
              <h1 className="mp-hero-title font-serif">Markets</h1>
              <h2 className="mp-hero-subtitle">
                Real-time data. Independent journalism.<br />
                Global insights. Smarter investment decisions.
              </h2>
            </div>
            {/* <div className="mp-customize-btn">
              <span>⚙ Customize Dashboard</span>
              <span className="mp-customize-chevron">▾</span>
            </div> */}
          </div>

          <aside className="mp-pulse-sidebar">
            <div className="mp-pulse-header">
              <h3>TODAY'S MARKET PULSE</h3>
              <div className="mp-pulse-status">
                <span className="mp-pulse-dot mp-pulse-dot--closed" />
                <span className="mp-pulse-status-text">Markets Closed</span>
              </div>
            </div>
            <div className="mp-pulse-list">
              {liveMarketPulse.map((item) => (
                <div key={item.label} className="mp-pulse-row">
                  <span className="mp-pulse-label">{item.label}</span>
                  <span className="mp-pulse-value">{fmtINR(item.value)}</span>
                  <span className={`mp-pulse-change ${item.change >= 0 ? "mp-green" : "mp-red"}`}>
                    {fmtPct(item.change)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mp-outlook">
              <h4 className="mp-outlook-title">EDITOR'S OUTLOOK</h4>
              <p className="mp-outlook-text">
                Banking weakness dragged Indian equities while precious metals gained amid global uncertainty.
              </p>
              <a href="#" className="mp-outlook-link">Read Full Analysis →</a>
            </div>
          </aside>
        </section>

        {/* ════════════════ TAB NAVIGATION ════════════════ */}
        {/* <nav className="mp-tabs-nav">
          <div className="mp-tabs-scroll">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`mp-tab ${activeTab === tab ? "mp-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Crypto"}
                {tab === "Mutual Funds"}
                {tab}
              </button>
            ))}
          </div>
        </nav> */}

        {/* ════════════════ INDEX CARDS + MARKET STATUS ════════════════ */}
        <section className="mp-indices-section">
          <div className="mp-indices-main">
            <div className="mp-index-cards-grid">
              {liveIndexCards.map((card) => {
                const isUp = card.change >= 0;
                return (
                  <div key={card.name} className="mp-index-card">
                    <div className="mp-index-card-name">{card.name}</div>
                    <div className="mp-index-card-value">{fmtINR(card.value)}</div>
                    <div className={`mp-index-card-change ${isUp ? "mp-green" : "mp-red"}`}>
                      {isUp ? "▲" : "▼"} {fmtChange(card.change)} ({fmtPct(card.changePct)})
                    </div>
                    <div className="mp-index-card-time">{card.time}</div>
                  </div>
                );
              })}
            </div>
            <div className="mp-indices-ad" style={{ marginTop: "0.75rem" }}>
              <AdSlot slot={AD_SLOT_HOME_INLINE} label="Sponsored" className="min-h-[140px] rounded-md !bg-[#0d0d0d] !border-[#262626]" />
            </div>
          </div>
          <div className="mp-status-sidebar">
            {/* <div className="mp-status-block">
              <h4 className="mp-status-title">MARKET STATUS</h4>
              <div className="mp-status-date">As on {DATE_STR}, {TIME_STR}</div>
              <div className="mp-status-grid">
                <div className="mp-status-item">
                  <div className="mp-status-item-label">Advances</div>
                  <div className="mp-status-item-value mp-green">{MARKET_STATUS.advances.toLocaleString()}</div>
                </div>
                <div className="mp-status-item">
                  <div className="mp-status-item-label">Declines</div>
                  <div className="mp-status-item-value mp-red">{MARKET_STATUS.declines.toLocaleString()}</div>
                </div>
                <div className="mp-status-item">
                  <div className="mp-status-item-label">Unchanged</div>
                  <div className="mp-status-item-value">{MARKET_STATUS.unchanged}</div>
                </div>
                <div className="mp-status-item">
                  <div className="mp-status-item-label">Total Volume</div>
                  <div className="mp-status-item-value">{MARKET_STATUS.totalVolume}</div>
                </div>
              </div>
              <div className="mp-breadth-section">
                <div className="mp-breadth-label">Market Breadth</div>
                <div className="mp-breadth-bar">
                  <div className="mp-breadth-bar-green" style={{ width: `${advPct}%` }} />
                  <div className="mp-breadth-bar-red" style={{ width: `${decPct}%` }} />
                </div>
                <div className="mp-breadth-legend">
                  <span className="mp-green">{advPct}%</span>
                  <span className="mp-red">{decPct}%</span>
                </div>
              </div>
            </div> */}

            <div className="mp-movers-sidebar-block">
              <div className="mp-movers-sidebar-header">
                <h4>MARKET MOVERS</h4>
                <a href="#" className="mp-view-all">View All</a>
              </div>
              {MARKET_MOVERS_LINKS.map((m) => (
                <div key={m.label} className="mp-movers-link-row">
                  <div className="mp-movers-link-left">
                    <span className="mp-movers-link-dot" style={{ background: m.color }} />
                    <span>{m.label}</span>
                  </div>
                  <span className="mp-movers-link-count" style={{ color: m.color }}>{m.count} →</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ TOP MARKET NEWS + GAINERS & LOSERS ════════════════ */}
        <section className="mp-news-section">
          <div className="mp-news-main">
            <div className="mp-section-header">
              <h2 className="mp-section-title">TOP MARKET NEWS <span className="mp-title-arrow">→</span></h2>
            </div>
            <div className="mp-news-grid">
              {/* Featured article */}
              <div className="mp-news-featured">
                {featuredArticle ? (
                  <Link to={`/article/${featuredArticle.slug}`} className="mp-news-featured-link">
                    <div className="mp-news-featured-img">
                      {featuredArticle.hero_image && (
                        <img
                          src={getHeroImageUrl(featuredArticle.hero_image, featuredArticle.hero_focus)}
                          alt={featuredArticle.title}
                          loading="lazy"
                          style={getImagePresentation(featuredArticle.hero_focus, featuredArticle.hero_crop)}
                        />
                      )}
                      <div className="mp-news-featured-overlay">
                        <span className="mp-badge mp-badge--pick">EDITOR'S PICK</span>
                        <h3 className="mp-news-featured-title">{featuredArticle.title}</h3>
                        {featuredArticle.subheadline && (
                          <p className="mp-news-featured-sub">{featuredArticle.subheadline}</p>
                        )}
                        <span className="mp-news-featured-cta">Read Full Story →</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="mp-news-featured-placeholder">
                    <div className="mp-news-placeholder-img" />
                    <div className="mp-news-featured-overlay">
                      <span className="mp-badge mp-badge--pick">EDITOR'S PICK</span>
                      <h3 className="mp-news-featured-title">Sensex falls 561 points as banking stocks decline</h3>
                      <p className="mp-news-featured-sub">IT & Auto stocks provide some support in a largely negative market as investors remain cautious ahead of key global data.</p>
                      <span className="mp-news-featured-cta">Read Full Story →</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Side news list */}
              <div className="mp-news-list">
                {(sideNewsArticles.length > 0 ? sideNewsArticles : [
                  { slug: "#", title: "RBI keeps repo rate unchanged; maintains neutral stance", category: "NIFTY 50", published_at: new Date(Date.now() - 15 * 60000).toISOString() },
                  { slug: "#", title: "Global markets trade mixed ahead of US CPI data", category: "GLOBAL", published_at: new Date(Date.now() - 30 * 60000).toISOString() },
                  { slug: "#", title: "Oil prices rise on supply concerns in Middle East", category: "COMMODITIES", published_at: new Date(Date.now() - 60 * 60000).toISOString() },
                  { slug: "#", title: "Nifty ends lower; banking and auto stocks drag", category: "MARKETS", published_at: new Date(Date.now() - 3 * 3600000).toISOString() }
                ]).map((article, idx) => (
                  <Link
                    key={article.slug + idx}
                    to={article.slug === "#" ? "#" : `/article/${article.slug}`}
                    className="mp-news-item"
                  >
                    <div className="mp-news-item-meta">
                      <span className="mp-news-item-time">{getTimeAgo(article.published_at)}</span>
                      <span className={`mp-news-item-cat mp-cat-badge`}>{article.category || "MARKETS"}</span>
                    </div>
                    <h4 className="mp-news-item-title">{article.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mp-gainers-losers">
            <div className="mp-section-header">
              <h2 className="mp-section-title">GAINERS & LOSERS</h2>
              <a href="#" className="mp-view-all-link">View All Stocks</a>
            </div>
            <div className="mp-gl-tabs">
              {["NIFTY 50", "NIFTY 100", "BSE 500"].map((tab) => (
                <button
                  key={tab}
                  className={`mp-gl-tab ${gainersTab === "nifty50" && tab === "NIFTY 50" ? "mp-gl-tab--active" : ""}`}
                  onClick={() => setGainersTab("nifty50")}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mp-gl-columns">
              <div className="mp-gl-col">
                <h5 className="mp-gl-col-title mp-green">TOP GAINERS</h5>
                {(gainersData.length > 0 ? gainersData.slice(0, 5) : GAINERS_LOSERS_DATA.nifty50.gainers).map((s, i) => (
                  <div key={i} className="mp-gl-row">
                    <span className="mp-gl-name">{s.name || s.symbol}</span>
                    <span className="mp-gl-price">₹{fmtINR(s.price)}</span>
                    <span className="mp-gl-change mp-green">{fmtPct(s.changePercent || s.change)}</span>
                  </div>
                ))}
              </div>
              <div className="mp-gl-col">
                <h5 className="mp-gl-col-title mp-red">TOP LOSERS</h5>
                {(losersData.length > 0 ? losersData.slice(0, 5) : GAINERS_LOSERS_DATA.nifty50.losers).map((s, i) => (
                  <div key={i} className="mp-gl-row">
                    <span className="mp-gl-name">{s.name || s.symbol}</span>
                    <span className="mp-gl-price">₹{fmtINR(s.price)}</span>
                    <span className="mp-gl-change mp-red">{fmtPct(s.changePercent || s.change)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ SECTOR PERF + FII/DII + 52 WEEK ════════════════ */}
        <section className="mp-three-col-section">
          {/* Sector Performance */}
          <div className="mp-panel mp-sector-panel">
            <div className="mp-section-header">
              <h2 className="mp-section-title">SECTOR PERFORMANCE</h2>
              <a href="#" className="mp-view-all">View All →</a>
            </div>
            <div className="mp-sector-grid">
              {SECTOR_DATA.map((s) => (
                <div key={s.name} className={`mp-sector-card ${s.change >= 0 ? "mp-sector-card--up" : "mp-sector-card--down"}`}>
                  <div className="mp-sector-name">{s.name}</div>
                  <div className={`mp-sector-change ${s.change >= 0 ? "mp-green" : "mp-red"}`}>
                    {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FII / DII Net Flow */}
          <div className="mp-panel mp-fii-panel">
            <div className="mp-section-header">
              <h2 className="mp-section-title">FII / DII NET FLOW</h2>
              <a href="#" className="mp-view-all">View More →</a>
            </div>
            <div className="mp-fii-tabs">
              <button className={`mp-fii-tab ${fiiDiiTab === "cash" ? "mp-fii-tab--active" : ""}`} onClick={() => setFiiDiiTab("cash")}>Cash Market</button>
              <button className={`mp-fii-tab ${fiiDiiTab === "fno" ? "mp-fii-tab--active" : ""}`} onClick={() => setFiiDiiTab("fno")}>F&O Market</button>
            </div>
            <div className="mp-fii-date">Data as on {FII_DII_DATA[fiiDiiTab].date}</div>
            <div className="mp-fii-summary">
              <div className="mp-fii-item">
                <span className="mp-fii-label">FII (Net)</span>
                <span className="mp-fii-value mp-red">
                  ₹{Math.abs(FII_DII_DATA[fiiDiiTab].fii).toLocaleString()} Cr
                  <br /><small className="mp-red">(Sell)</small>
                </span>
              </div>
              <div className="mp-fii-item">
                <span className="mp-fii-label">DII (Net)</span>
                <span className="mp-fii-value mp-green">
                  +₹{FII_DII_DATA[fiiDiiTab].dii.toLocaleString()} Cr
                  <br /><small className="mp-green">(Buy)</small>
                </span>
              </div>
              <div className="mp-fii-item">
                <span className="mp-fii-label">Net</span>
                <span className={`mp-fii-value ${FII_DII_DATA[fiiDiiTab].net >= 0 ? "mp-green" : "mp-red"}`}>
                  ₹{Math.abs(FII_DII_DATA[fiiDiiTab].net).toLocaleString()} Cr
                  <br /><small className={FII_DII_DATA[fiiDiiTab].net >= 0 ? "mp-green" : "mp-red"}>({FII_DII_DATA[fiiDiiTab].net >= 0 ? "Buy" : "Buy"})</small>
                </span>
              </div>
            </div>
            {/* Simple bar chart */}
            <div className="mp-fii-chart">
              <div className="mp-fii-chart-legend">
                <span className="mp-fii-legend-item"><span className="mp-fii-legend-dot mp-fii-legend-dot--fii" /> FII (Net)</span>
                <span className="mp-fii-legend-item"><span className="mp-fii-legend-dot mp-fii-legend-dot--dii" /> DII (Net)</span>
              </div>
              <div className="mp-fii-bars">
                {FII_DII_CHART.map((d, i) => (
                  <div key={i} className="mp-fii-bar-group">
                    <div className="mp-fii-bar-container">
                      <div
                        className="mp-fii-bar mp-fii-bar--fii"
                        style={{
                          height: `${Math.abs(d.fii) / fiiDiiBarMax * 60}px`,
                          background: d.fii >= 0 ? "#22c55e" : "#ef4444"
                        }}
                      />
                      <div
                        className="mp-fii-bar mp-fii-bar--dii"
                        style={{
                          height: `${Math.abs(d.dii) / fiiDiiBarMax * 60}px`,
                          background: d.dii >= 0 ? "#22c55e" : "#ef4444"
                        }}
                      />
                    </div>
                    <span className="mp-fii-bar-label">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
            <a href="#" className="mp-fii-detail-link">View Detailed FII / DII Data →</a>
          </div>

          {/* 52 Week High/Low + Market Breadth */}
          <div className="mp-panel mp-week52-panel">
            <div className="mp-section-header">
              <h2 className="mp-section-title">52 WEEK HIGH / LOW</h2>
              <a href="#" className="mp-view-all">View More →</a>
            </div>
            <div className="mp-week52-grid">
              <div className="mp-week52-col">
                <div className="mp-week52-label">New High</div>
                <div className="mp-week52-value mp-green" style={{ fontSize: "2rem" }}>{WEEK52_DATA.newHigh}</div>
              </div>
              <div className="mp-week52-col">
                <div className="mp-week52-label">New Low</div>
                <div className="mp-week52-value mp-red" style={{ fontSize: "2rem" }}>{WEEK52_DATA.newLow}</div>
              </div>
            </div>
            <div className="mp-week52-bars">
              <div className="mp-week52-bar-row">
                <div className="mp-week52-bar-track">
                  <div className="mp-week52-bar-fill mp-week52-bar-fill--green" style={{ width: `${WEEK52_DATA.highPct}%` }} />
                </div>
                <span className="mp-green" style={{ fontSize: "0.75rem", fontWeight: 700 }}>{WEEK52_DATA.highPct}%</span>
              </div>
              <div className="mp-week52-bar-row">
                <div className="mp-week52-bar-track">
                  <div className="mp-week52-bar-fill mp-week52-bar-fill--red" style={{ width: `${WEEK52_DATA.lowPct}%` }} />
                </div>
                <span className="mp-red" style={{ fontSize: "0.75rem", fontWeight: 700 }}>{WEEK52_DATA.lowPct}%</span>
              </div>
            </div>

            {/* Market Breadth mini */}
            <div className="mp-mini-breadth">
              <h4 className="mp-section-title" style={{ fontSize: "0.8rem", marginBottom: "0.75rem" }}>MARKET BREADTH</h4>
              <div className="mp-status-grid" style={{ gap: "0.5rem" }}>
                <div className="mp-status-item">
                  <div className="mp-status-item-label" style={{ fontSize: "0.65rem" }}>Advances</div>
                  <div className="mp-status-item-value mp-green" style={{ fontSize: "1.25rem" }}>{MARKET_STATUS.advances.toLocaleString()}</div>
                </div>
                <div className="mp-status-item">
                  <div className="mp-status-item-label" style={{ fontSize: "0.65rem" }}>Declines</div>
                  <div className="mp-status-item-value mp-red" style={{ fontSize: "1.25rem" }}>{MARKET_STATUS.declines.toLocaleString()}</div>
                </div>
                <div className="mp-status-item">
                  <div className="mp-status-item-label" style={{ fontSize: "0.65rem" }}>Unchanged</div>
                  <div className="mp-status-item-value" style={{ fontSize: "1.25rem" }}>{MARKET_STATUS.unchanged}</div>
                </div>
              </div>
              <div className="mp-breadth-bar" style={{ marginTop: "0.75rem" }}>
                <div className="mp-breadth-bar-green" style={{ width: `${advPct}%` }} />
                <div className="mp-breadth-bar-red" style={{ width: `${decPct}%` }} />
              </div>
              <div className="mp-breadth-legend" style={{ marginTop: "0.35rem" }}>
                <span className="mp-green">{advPct}%</span>
                <span className="mp-red">{decPct}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ MOST ACTIVE + GLOBAL INDICES + ECONOMIC CALENDAR ════════════════ */}
        <section className="mp-three-col-section">
          {/* Most Active Stocks */}
          <div className="mp-panel mp-active-panel">
            <div className="mp-section-header">
              <h2 className="mp-section-title">MOST ACTIVE STOCKS</h2>
              <a href="#" className="mp-view-all">View All →</a>
            </div>
            <div className="mp-table-wrapper">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Change %</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {MOST_ACTIVE.map((s) => (
                    <tr key={s.company}>
                      <td className="mp-table-company">{s.company}</td>
                      <td>₹{fmtINR(s.price)}</td>
                      <td className={s.change >= 0 ? "mp-green" : "mp-red"}>{fmtChange(s.change)}</td>
                      <td className={s.changePct >= 0 ? "mp-green" : "mp-red"}>{fmtPct(s.changePct)}</td>
                      <td>{s.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Indices */}
          <div className="mp-panel mp-global-panel">
            <div className="mp-section-header">
              <h2 className="mp-section-title">GLOBAL INDICES</h2>
              <a href="#" className="mp-view-all">View All →</a>
            </div>
            <div className="mp-gi-tabs">
              {["all", "us", "europe", "asia"].map((tab) => (
                <button
                  key={tab}
                  className={`mp-gi-tab ${globalIdxTab === tab ? "mp-gi-tab--active" : ""}`}
                  onClick={() => setGlobalIdxTab(tab)}
                >
                  {tab === "all" ? "All" : tab === "us" ? "US" : tab === "europe" ? "Europe" : "Asia"}
                </button>
              ))}
            </div>
            <div className="mp-table-wrapper">
              <table className="mp-table mp-table--compact">
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Value</th>
                    <th>Change</th>
                    <th>Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {(GLOBAL_INDICES_ALL[globalIdxTab] || []).map((idx) => (
                    <tr key={idx.name}>
                      <td className="mp-table-company">{idx.name}</td>
                      <td>{fmtINR(idx.value)}</td>
                      <td className={idx.change >= 0 ? "mp-green" : "mp-red"}>{fmtChange(idx.change)}</td>
                      <td className={idx.changePct >= 0 ? "mp-green" : "mp-red"}>{fmtPct(idx.changePct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Economic Calendar */}
          <div className="mp-panel mp-econ-panel">
            <div className="mp-section-header">
              <h2 className="mp-section-title">ECONOMIC CALENDAR</h2>
              <a href="#" className="mp-view-all">View Calendar →</a>
            </div>
            <div className="mp-econ-dates">
              {(() => {
                const today = new Date();
                const days = [];
                for (let i = 0; i < 7; i++) {
                  const d = new Date(today);
                  d.setDate(today.getDate() + i);
                  days.push({
                    label: d.toLocaleDateString("en-US", { weekday: "short" }),
                    date: d.getDate(),
                    month: d.toLocaleDateString("en-US", { month: "short" }),
                    isActive: i === 0
                  });
                }
                return days.map((d, i) => (
                  <button key={i} className={`mp-econ-date-btn ${d.isActive ? "mp-econ-date-btn--active" : ""}`}>
                    <span className="mp-econ-date-month">{d.month}</span>
                    <span className="mp-econ-date-num">{d.date}</span>
                    <span className="mp-econ-date-day">{d.label}</span>
                  </button>
                ));
              })()}
            </div>
            <div className="mp-table-wrapper">
              <table className="mp-table mp-table--econ">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Country</th>
                    <th>Impact</th>
                    <th>Actual</th>
                    <th>Forecast</th>
                    <th>Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {ECON_CALENDAR.map((ev, i) => (
                    <tr key={i}>
                      <td>{ev.time}</td>
                      <td className="mp-table-company">{ev.event}</td>
                      <td>
                        <span className={`mp-country-badge mp-country-badge--${ev.country.toLowerCase()}`}>
                          {ev.country === "India" ? "🇮🇳" : "🇺🇸"} {ev.country}
                        </span>
                      </td>
                      <td>
                        <span className={`mp-impact-badge mp-impact-badge--${ev.impact.toLowerCase()}`}>
                          {ev.impact}
                        </span>
                      </td>
                      <td>{ev.actual}</td>
                      <td>{ev.forecast}</td>
                      <td>{ev.previous}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ════════════════ GLOBAL MARKETS OVERVIEW + CURRENCY + HEATMAP ════════════════ */}
        <section className="mp-bottom-section">
          <div className="mp-bottom-left">
            {/* Global Markets Overview */}
            <div className="mp-panel">
              <div className="mp-section-header">
                <h2 className="mp-section-title">GLOBAL MARKETS OVERVIEW</h2>
                <a href="#" className="mp-view-all">View All →</a>
              </div>
              <div className="mp-go-tabs">
                {["us", "europe", "asia"].map((tab) => (
                  <button
                    key={tab}
                    className={`mp-go-tab ${globalOverviewTab === tab ? "mp-go-tab--active" : ""}`}
                    onClick={() => setGlobalOverviewTab(tab)}
                  >
                    {tab === "us" ? "US MARKETS" : tab === "europe" ? "EUROPE" : "ASIA"}
                  </button>
                ))}
              </div>
              <div className="mp-go-cards">
                {(GLOBAL_OVERVIEW[globalOverviewTab] || []).map((idx) => {
                  const isUp = idx.change >= 0;
                  return (
                    <div key={idx.name} className="mp-go-card">
                      <div className="mp-go-card-name">{idx.name}</div>
                      <div className="mp-go-card-value">{fmtINR(idx.value)}</div>
                      <div className={`mp-go-card-change ${isUp ? "mp-green" : "mp-red"}`}>
                        {isUp ? "▲" : "▼"}{fmtChange(idx.change)} ({fmtPct(idx.changePct)})
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mp-go-disclaimer">
                Market data is delayed by 15 minutes. Sources: NSE, BSE, Refinitiv, Investing.com
              </div>
            </div>

            {/* Sponsored Block */}
            <div className="mp-go-ad">
              <AdSlot slot={AD_SLOT_HOME_INLINE} label="Sponsored" className="min-h-[140px] rounded-md !bg-[#0d0d0d] !border-[#262626]" />
            </div>
          </div>
          <div className="mp-bottom-right">
            {/* Currency Converter */}
            <div className="mp-panel mp-currency-panel">
              <div className="mp-section-header">
                <h2 className="mp-section-title">CURRENCY CONVERTER</h2>
                <a href="#" className="mp-view-all">View More →</a>
              </div>
              <div className="mp-currency-form">
                <div className="mp-currency-row">
                  <label className="mp-currency-label">From</label>
                  <div className="mp-currency-input-group">
                    <select
                      className="mp-currency-select"
                      value={currencyFrom}
                      onChange={(e) => setCurrencyFrom(e.target.value)}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="mp-currency-input"
                      value={currencyAmount}
                      onChange={(e) => setCurrencyAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="mp-currency-row">
                  <label className="mp-currency-label">To</label>
                  <div className="mp-currency-input-group">
                    <select
                      className="mp-currency-select"
                      value={currencyTo}
                      onChange={(e) => setCurrencyTo(e.target.value)}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="mp-currency-input mp-currency-result"
                      value={currencyResult}
                      readOnly
                    />
                  </div>
                </div>
                <div className="mp-currency-rate">
                  1 {currencyFrom} = {currencyRate.toFixed(2)} {currencyTo}
                </div>
              </div>
            </div>

            {/* Market Heatmap */}
            <div className="mp-panel mp-heatmap-panel">
              <div className="mp-section-header">
                <h2 className="mp-section-title">MARKET HEATMAP</h2>
                <a href="#" className="mp-view-all">View Full Heatmap →</a>
              </div>
              <div className="mp-heatmap-grid">
                {HEATMAP_SECTORS.map((s) => {
                  const absChange = Math.abs(s.change);
                  let bg;
                  if (s.change > 0.5) bg = "#166534";
                  else if (s.change > 0) bg = "#14532d";
                  else if (s.change > -0.5) bg = "#7f1d1d";
                  else bg = "#991b1b";
                  return (
                    <div
                      key={s.name}
                      className="mp-heatmap-cell"
                      style={{
                        background: bg,
                        gridColumn: `span ${s.size >= 2.5 ? 2 : 1}`,
                        gridRow: `span ${s.size >= 2.5 ? 2 : 1}`
                      }}
                    >
                      <div className="mp-heatmap-name">{s.name}</div>
                      <div className={`mp-heatmap-change ${s.change >= 0 ? "mp-green" : "mp-red"}`}>
                        {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ QUICK LINKS ════════════════ */}
        {/* 
        <section className="mp-quick-links">
          {[
            { icon: "📅", title: "Earnings Calendar", desc: "Upcoming results & reports" },
            { icon: "🌐", title: "Global Markets", desc: "US, Europe, Asia overview" },
            { icon: "🗺️", title: "Market Heatmap", desc: "Live sector performance" },
            { icon: "🔍", title: "Stock Screener", desc: "Find stocks that matter" },
            { icon: "📊", title: "FII / DII Activity", desc: "Track institutional flows" },
            { icon: "💱", title: "Currency Converter", desc: "Real-time exchange rates" }
          ].map((link) => (
            <a key={link.title} href="#" className="mp-quick-link-card">
              <span className="mp-quick-link-icon">{link.icon}</span>
              <div className="mp-quick-link-text">
                <span className="mp-quick-link-title">{link.title}</span>
                <span className="mp-quick-link-desc">{link.desc}</span>
              </div>
              <span className="mp-quick-link-arrow">→</span>
            </a>
          ))}
        </section>
        */}

        {/* ════════════════ NEWSLETTER ════════════════ */}
        <div className="mp-newsletter-wrapper">
          <section className="mp-newsletter">
            <div className="mp-newsletter-left">
              <span className="mp-newsletter-icon">✉</span>
              <div>
                <h3 className="mp-newsletter-title">Stay ahead in the markets</h3>
                <p className="mp-newsletter-sub">Get daily market updates, insights and breaking news delivered to your inbox.</p>
              </div>
            </div>
            <div className="mp-newsletter-right">
              <input type="email" placeholder="Enter your email address" className="mp-newsletter-input" />
              <button className="mp-newsletter-btn">Subscribe</button>
            </div>
          </section>
        </div>

        {/* ════════════════ FOOTER DISCLAIMER ════════════════ */}
        <div className="mp-disclaimer">
          <span>Market data is delayed by 15 minutes. Sources: NSE, BSE, Refinitiv, Investing.com</span>
          <span>All times are in IST (UTC +5:30)</span>
        </div>

      </div>

      {/* ════════════════ EMBEDDED STYLES ════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .mp-page {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #0a0a0a;
          color: #e5e5e5;
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        /* ── COLORS ── */
        .mp-green { color: #22c55e !important; }
        .mp-red { color: #ef4444 !important; }

        /* ── HERO SECTION ── */
        .mp-hero-section {
          display: flex;
          gap: 0;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .mp-hero-main {
          flex: 1;
          position: relative;
          background: #040404;
          border: 1px solid #262626;
          border-radius: 8px 0 0 8px;
          padding: 0.85rem 1.5rem;
          min-height: 135px;
          overflow: hidden;
        }

        .mp-hero-main::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url('/markets-hero-bg.png') center/cover no-repeat;
          filter: contrast(1.3) brightness(1.15) saturate(1.25);
          opacity: 0.95;
          pointer-events: none;
        }

        .mp-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(4, 4, 4, 0.75) 0%, rgba(4, 4, 4, 0.25) 35%, transparent 75%);
          pointer-events: none;
        }

        .mp-hero-content {
          position: relative;
          z-index: 1;
        }

        .mp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          margin-top : 0.5rem;
        }
        .mp-breadcrumb-red { color: #de0216; }
        .mp-breadcrumb-sep { color: #525252; }
        .mp-breadcrumb-text { color: #737373; }

        .mp-hero-title {
          font-size: clamp(2rem, 5.5vw, 5rem);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }

        .mp-hero-subtitle {
          font-size: 1rem;
          color: #a3a3a3;
          line-height: 1.45;
          margin: 0;
        }

        .mp-customize-btn {
          position: absolute;
          top: 0.85rem;
          right: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #171717;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 0.25rem 0.6rem;
          color: #d4d4d4;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          z-index: 2;
          transition: border-color 0.2s;
        }
        .mp-customize-btn:hover { border-color: #525252; }
        .mp-customize-chevron { font-size: 0.65rem; color: #737373; }

        /* ── PULSE SIDEBAR ── */
        .mp-pulse-sidebar {
          width: 310px;
          min-width: 310px;
          background: #0d0d0d;
          border: 1px solid #262626;
          border-left: none;
          border-radius: 0 8px 8px 0;
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
        }

        .mp-pulse-header {
          margin-bottom: 0.4rem;
        }

        .mp-pulse-header h3 {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f5f5f5;
          margin: 0 0 0.25rem;
        }

        .mp-pulse-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .mp-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .mp-pulse-dot--closed {
          background: #ef4444;
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
        }
        .mp-pulse-status-text {
          font-size: 0.65rem;
          font-weight: 700;
          color: #ef4444;
        }

        .mp-pulse-list {
          flex: 1;
        }

        .mp-pulse-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0;
          border-bottom: 1px solid #1a1a1a;
          font-size: 0.68rem;
        }
        .mp-pulse-label { color: #a3a3a3; font-weight: 500; flex: 1; }
        .mp-pulse-value { color: #f5f5f5; font-weight: 700; font-family: 'Inter', monospace; margin-right: 0.6rem; font-size: 0.68rem; }
        .mp-pulse-change { font-weight: 700; font-size: 0.65rem; }

        .mp-outlook {
          margin-top: 0.4rem;
          padding-top: 0.4rem;
          border-top: 1px solid #262626;
        }
        .mp-outlook-title {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #de0216;
          margin: 0 0 0.25rem;
        }
        .mp-outlook-text {
          font-size: 0.68rem;
          color: #a3a3a3;
          line-height: 1.35;
          margin: 0 0 0.25rem;
        }
        .mp-outlook-link {
          font-size: 0.65rem;
          font-weight: 700;
          color: #de0216;
          text-decoration: none;
        }
        .mp-outlook-link:hover { text-decoration: underline; }

        /* ── TAB NAVIGATION ── */
        .mp-tabs-nav {
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
          border-bottom: 1px solid #262626;
        }
        .mp-tabs-scroll {
          display: flex;
          gap: 0;
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mp-tabs-scroll::-webkit-scrollbar { display: none; }

        .mp-tab {
          padding: 0.75rem 1.25rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: #737373;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .mp-tab:hover { color: #e5e5e5; }
        .mp-tab--active {
          color: #de0216;
          border-bottom-color: #de0216;
        }
        .mp-tab-icon { font-size: 0.85rem; }

        /* ── INDEX CARDS + STATUS ── */
        .mp-indices-section {
          display: flex;
          gap: 0;
          width: 100%;
          margin: 0 auto;
          padding: 1rem 1.5rem;
        }

        .mp-indices-main {
          flex: 1;
        }

        .mp-index-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .mp-index-card {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          padding: 1rem 1.25rem;
          transition: border-color 0.2s;
        }
        .mp-index-card:hover { border-color: #404040; }

        .mp-index-card-name {
          font-size: 0.7rem;
          font-weight: 700;
          color: #a3a3a3;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .mp-index-card-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
          font-family: 'Inter', monospace;
          margin-bottom: 0.25rem;
        }
        .mp-index-card-change {
          font-size: 0.72rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .mp-index-card-time {
          font-size: 0.62rem;
          color: #525252;
          font-weight: 500;
        }

        /* ── STATUS SIDEBAR ── */
        .mp-status-sidebar {
          width: 320px;
          min-width: 320px;
          padding-left: 1rem;
        }

        .mp-status-block {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
        }

        .mp-status-title {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5f5f5;
          margin: 0 0 0.25rem;
        }
        .mp-status-date {
          font-size: 0.62rem;
          color: #525252;
          margin-bottom: 0.75rem;
        }

        .mp-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .mp-status-item-label {
          font-size: 0.65rem;
          color: #737373;
          font-weight: 500;
          margin-bottom: 0.15rem;
        }
        .mp-status-item-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f5f5f5;
          font-family: 'Inter', monospace;
        }

        .mp-breadth-section { margin-top: 0.5rem; }
        .mp-breadth-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #a3a3a3;
          margin-bottom: 0.4rem;
        }
        .mp-breadth-bar {
          display: flex;
          height: 10px;
          border-radius: 5px;
          overflow: hidden;
          background: #171717;
        }
        .mp-breadth-bar-green { background: #22c55e; }
        .mp-breadth-bar-red { background: #ef4444; }
        .mp-breadth-legend {
          display: flex;
          justify-content: space-between;
          font-size: 0.68rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .mp-movers-sidebar-block {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          padding: 1rem 1.25rem;
        }
        .mp-movers-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .mp-movers-sidebar-header h4 {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5f5f5;
          margin: 0;
        }

        .mp-view-all, .mp-view-all-link {
          font-size: 0.65rem;
          font-weight: 700;
          color: #737373;
          text-decoration: none;
          transition: color 0.2s;
        }
        .mp-view-all:hover, .mp-view-all-link:hover { color: #de0216; }

        .mp-movers-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0;
          border-bottom: 1px solid #1a1a1a;
          font-size: 0.72rem;
        }
        .mp-movers-link-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #d4d4d4;
          font-weight: 500;
        }
        .mp-movers-link-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .mp-movers-link-count {
          font-weight: 700;
          font-size: 0.72rem;
        }

        /* ── LIVE BANNER ── */
        .mp-live-banner {
          width: calc(100% - 3rem);
          margin: 0.75rem auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          overflow: hidden;
          height: 48px;
        }

        .mp-live-banner-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
          white-space: nowrap;
          font-size: 0.72rem;
          font-weight: 800;
          color: #f5f5f5;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-right: 1px solid #262626;
          height: 100%;
        }
        .mp-live-badge {
          background: #de0216;
          color: white;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          letter-spacing: 0.08em;
          animation: mp-pulse-glow 2s infinite;
        }

        .mp-live-banner-marquee {
          flex: 1;
          overflow: hidden;
        }
        .mp-live-banner-track {
          display: flex;
          animation: mp-marquee 40s linear infinite;
        }
        .mp-live-headline {
          white-space: nowrap;
          font-size: 0.78rem;
          color: #d4d4d4;
        }
        .mp-live-readmore {
          padding: 0 1rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #de0216;
          white-space: nowrap;
          text-decoration: none;
        }

        /* ── PANELS (common) ── */
        .mp-panel {
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          padding: 1.25rem;
        }

        .mp-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .mp-section-title {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f5f5f5;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mp-title-arrow {
          color: #de0216;
          font-weight: 400;
        }

        /* ── NEWS SECTION ── */
        .mp-news-section {
          display: flex;
          gap: 1rem;
          width: 100%;
          margin: 1rem auto;
          padding: 0 1.5rem;
        }
        .mp-news-main { flex: 1.8; }
        .mp-news-main .mp-panel { margin-top: 0; }

        .mp-news-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 1.25rem;
        }

        .mp-news-featured {
          grid-row: span 1;
        }
        .mp-news-featured-link, .mp-news-featured-placeholder {
          display: block;
          text-decoration: none;
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          height: 420px;
        }
        .mp-news-featured-img {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .mp-news-featured-img img, .mp-news-placeholder-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mp-news-placeholder-img {
          background: linear-gradient(135deg, #1a1a1a, #262626);
        }
        .mp-news-featured-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.92) 100%);
          padding: 1.75rem;
        }
        .mp-news-featured-title {
          color: white;
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.3;
          margin: 0.5rem 0;
        }
        .mp-news-featured-sub {
          color: #a3a3a3;
          font-size: 0.78rem;
          line-height: 1.5;
          margin: 0 0 0.5rem;
        }
        .mp-news-featured-cta {
          color: #de0216;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .mp-badge {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          display: inline-block;
        }
        .mp-badge--pick {
          background: #22c55e;
          color: #000;
        }

        .mp-news-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .mp-news-item {
          display: block;
          text-decoration: none;
          padding: 0.85rem 0;
          border-bottom: 1px solid #1f1f1f;
          transition: background 0.2s;
        }
        .mp-news-item:hover { background: rgba(255,255,255,0.02); }
        .mp-news-item-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }
        .mp-news-item-time {
          font-size: 0.65rem;
          color: #de0216;
          font-weight: 600;
        }
        .mp-cat-badge {
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          background: #1a1a2e;
          color: #818cf8;
          border: 1px solid #262650;
        }
        .mp-news-item-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #e5e5e5;
          line-height: 1.4;
          margin: 0;
        }

        /* ── GAINERS & LOSERS ── */
        .mp-gainers-losers {
          width: 350px;
          min-width: 350px;
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          padding: 1.25rem;
        }

        .mp-gl-tabs {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }
        .mp-gl-tab {
          padding: 0.35rem 0.75rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mp-gl-tab:hover { color: #e5e5e5; border-color: #525252; }
        .mp-gl-tab--active {
          background: #de0216;
          color: white;
          border-color: #de0216;
        }

        .mp-gl-columns {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .mp-gl-col-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
        }
        .mp-gl-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.25rem;
          padding: 0.35rem 0;
          border-bottom: 1px solid #1a1a1a;
          font-size: 0.7rem;
        }
        .mp-gl-name { color: #d4d4d4; font-weight: 600; flex: 1; }
        .mp-gl-price { color: #a3a3a3; font-weight: 600; font-family: 'Inter', monospace; font-size: 0.65rem; }
        .mp-gl-change { font-weight: 700; font-size: 0.65rem; text-align: right; min-width: 50px; }

        /* ── THREE COLUMN SECTIONS ── */
        .mp-three-col-section {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          width: 100%;
          margin: 1rem auto;
          padding: 0 1.5rem;
        }

        /* ── SECTOR PERFORMANCE ── */
        .mp-sector-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        .mp-sector-card {
          background: #080808;
          border: 1px solid #262626;
          border-radius: 4px;
          padding: 0.6rem 0.5rem;
          text-align: center;
          transition: border-color 0.2s;
        }
        .mp-sector-card:hover { border-color: #404040; }
        .mp-sector-card--up { border-left: 2px solid #22c55e; }
        .mp-sector-card--down { border-left: 2px solid #ef4444; }
        .mp-sector-name {
          font-size: 0.58rem;
          font-weight: 700;
          color: #a3a3a3;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mp-sector-change {
          font-size: 0.72rem;
          font-weight: 800;
        }

        /* ── FII / DII ── */
        .mp-fii-tabs {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 0.5rem;
        }
        .mp-fii-tab {
          padding: 0.3rem 0.65rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mp-fii-tab:hover { color: #e5e5e5; }
        .mp-fii-tab--active { background: #de0216; color: white; border-color: #de0216; }

        .mp-fii-date { font-size: 0.62rem; color: #525252; margin-bottom: 0.75rem; }

        .mp-fii-summary {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .mp-fii-item { flex: 1; }
        .mp-fii-label { font-size: 0.62rem; color: #737373; display: block; margin-bottom: 0.15rem; }
        .mp-fii-value { font-size: 0.82rem; font-weight: 800; display: block; }
        .mp-fii-value small { font-size: 0.6rem; font-weight: 600; }

        .mp-fii-chart { margin-bottom: 0.75rem; }
        .mp-fii-chart-legend {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.6rem;
          color: #737373;
        }
        .mp-fii-legend-item { display: flex; align-items: center; gap: 0.3rem; }
        .mp-fii-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }
        .mp-fii-legend-dot--fii { background: #ef4444; }
        .mp-fii-legend-dot--dii { background: #22c55e; }

        .mp-fii-bars {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 80px;
          border-bottom: 1px solid #262626;
          padding-bottom: 0.25rem;
        }
        .mp-fii-bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mp-fii-bar-container {
          display: flex;
          gap: 3px;
          align-items: flex-end;
          height: 70px;
        }
        .mp-fii-bar {
          width: 14px;
          border-radius: 2px 2px 0 0;
          min-height: 4px;
        }
        .mp-fii-bar-label {
          font-size: 0.55rem;
          color: #525252;
          margin-top: 0.25rem;
          white-space: nowrap;
        }

        .mp-fii-detail-link {
          display: block;
          text-align: center;
          font-size: 0.68rem;
          font-weight: 700;
          color: #737373;
          text-decoration: none;
          padding: 0.5rem;
          border: 1px solid #262626;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .mp-fii-detail-link:hover { color: #de0216; border-color: #de0216; }

        /* ── 52 WEEK HIGH/LOW ── */
        .mp-week52-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .mp-week52-col { text-align: center; }
        .mp-week52-label {
          font-size: 0.65rem;
          color: #737373;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .mp-week52-value {
          font-weight: 900;
          font-family: 'Inter', monospace;
        }

        .mp-week52-bars { margin-bottom: 1.5rem; }
        .mp-week52-bar-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }
        .mp-week52-bar-track {
          flex: 1;
          height: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }
        .mp-week52-bar-fill { height: 100%; border-radius: 4px; }
        .mp-week52-bar-fill--green { background: linear-gradient(90deg, #166534, #22c55e); }
        .mp-week52-bar-fill--red { background: linear-gradient(90deg, #991b1b, #ef4444); }

        .mp-mini-breadth {
          padding-top: 1rem;
          border-top: 1px solid #262626;
        }

        /* ── TABLES ── */
        .mp-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #333333 #0d0d0d;
        }
        .mp-table-wrapper::-webkit-scrollbar {
          height: 4px;
        }
        .mp-table-wrapper::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 2px;
        }
        .mp-table {
          width: 100%;
          min-width: 320px;
          border-collapse: collapse;
          font-size: 0.7rem;
        }
        .mp-table--econ {
          min-width: 500px;
        }
        .mp-table th {
          text-align: left;
          padding: 0.5rem 0.4rem;
          font-size: 0.6rem;
          font-weight: 700;
          color: #525252;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #262626;
        }
        .mp-table td {
          padding: 0.5rem 0.4rem;
          border-bottom: 1px solid #1a1a1a;
          color: #d4d4d4;
          font-weight: 500;
        }
        .mp-table-company {
          font-weight: 700 !important;
          color: #f5f5f5 !important;
        }
        .mp-table--compact th, .mp-table--compact td {
          padding: 0.4rem 0.3rem;
          font-size: 0.65rem;
        }

        /* ── ECONOMIC CALENDAR ── */
        .mp-econ-dates {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 0.75rem;
          overflow-x: auto;
        }
        .mp-econ-date-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.35rem 0.5rem;
          min-width: 50px;
          font-size: 0.6rem;
          background: #080808;
          border: 1px solid #262626;
          border-radius: 4px;
          color: #737373;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mp-econ-date-btn:hover { border-color: #404040; color: #e5e5e5; }
        .mp-econ-date-btn--active {
          background: #de0216;
          border-color: #de0216;
          color: white;
        }
        .mp-econ-date-month { font-size: 0.55rem; font-weight: 600; }
        .mp-econ-date-num { font-size: 0.9rem; font-weight: 800; line-height: 1.2; }
        .mp-econ-date-day { font-size: 0.55rem; font-weight: 600; }

        .mp-table--econ th, .mp-table--econ td {
          font-size: 0.62rem;
          padding: 0.4rem 0.3rem;
        }

        .mp-country-badge {
          font-size: 0.6rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .mp-impact-badge {
          font-size: 0.58rem;
          font-weight: 800;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .mp-impact-badge--high { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .mp-impact-badge--medium { background: rgba(234, 179, 8, 0.15); color: #eab308; }
        .mp-impact-badge--low { background: rgba(34, 197, 94, 0.15); color: #22c55e; }

        /* ── GI TABS ── */
        .mp-gi-tabs {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 0.75rem;
        }
        .mp-gi-tab {
          padding: 0.3rem 0.65rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mp-gi-tab:hover { color: #e5e5e5; }
        .mp-gi-tab--active { background: #f5f5f5; color: #0a0a0a; border-color: #f5f5f5; }

        /* ── BOTTOM SECTION ── */
        .mp-bottom-section {
          display: flex;
          gap: 1rem;
          width: 100%;
          margin: 1rem auto;
          padding: 0 1.5rem;
        }
        .mp-bottom-left { flex: 1.3; display: flex; flex-direction: column; gap: 1rem; }
        .mp-bottom-right { flex: 1; display: flex; flex-direction: column; gap: 1rem; }

        /* ── GLOBAL OVERVIEW ── */
        .mp-go-tabs {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }
        .mp-go-tab {
          padding: 0.35rem 0.75rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #737373;
          background: transparent;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mp-go-tab:hover { color: #e5e5e5; }
        .mp-go-tab--active { background: #f5f5f5; color: #0a0a0a; border-color: #f5f5f5; }

        .mp-go-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 0.75rem;
        }
        .mp-go-card {
          background: #080808;
          border: 1px solid #262626;
          border-radius: 4px;
          padding: 0.75rem;
          transition: border-color 0.2s;
        }
        .mp-go-card:hover { border-color: #404040; }
        .mp-go-card-name {
          font-size: 0.65rem;
          color: #737373;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .mp-go-card-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #f5f5f5;
          font-family: 'Inter', monospace;
          margin-bottom: 0.15rem;
        }
        .mp-go-card-change {
          font-size: 0.65rem;
          font-weight: 700;
        }
        .mp-go-disclaimer {
          font-size: 0.58rem;
          color: #404040;
          margin-top: 0.75rem;
        }

        /* ── CURRENCY CONVERTER ── */
        .mp-currency-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mp-currency-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .mp-currency-label {
          font-size: 0.65rem;
          color: #737373;
          font-weight: 600;
        }
        .mp-currency-input-group {
          display: flex;
          gap: 0.5rem;
        }
        .mp-currency-select {
          flex: 1.5;
          padding: 0.5rem;
          background: #080808;
          border: 1px solid #333;
          border-radius: 4px;
          color: #e5e5e5;
          font-size: 0.72rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }
        .mp-currency-select option { background: #080808; color: #e5e5e5; }
        .mp-currency-input {
          flex: 1;
          padding: 0.5rem;
          background: #080808;
          border: 1px solid #333;
          border-radius: 4px;
          color: #f5f5f5;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Inter', monospace;
          text-align: right;
        }
        .mp-currency-input:focus { outline: none; border-color: #de0216; }
        .mp-currency-result { color: #22c55e; }
        .mp-currency-rate {
          font-size: 0.68rem;
          color: #525252;
          font-weight: 600;
          padding-top: 0.25rem;
        }

        /* ── HEATMAP ── */
        .mp-heatmap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3px;
        }
        .mp-heatmap-cell {
          border-radius: 3px;
          padding: 0.6rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          transition: opacity 0.2s;
        }
        .mp-heatmap-cell:hover { opacity: 0.85; }
        .mp-heatmap-name {
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: center;
          white-space: pre-line;
          line-height: 1.2;
          margin-bottom: 0.15rem;
        }
        .mp-heatmap-change {
          font-size: 0.62rem;
          font-weight: 700;
        }

        /* ── QUICK LINKS ── */
        .mp-quick-links {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.75rem;
          width: 100%;
          margin: 1.25rem auto;
          padding: 0 1.5rem;
        }
        .mp-quick-link-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
          padding: 0.85rem;
          text-decoration: none;
          transition: all 0.25s;
          cursor: pointer;
        }
        .mp-quick-link-card:hover {
          border-color: #de0216;
          transform: translateY(-1px);
        }
        .mp-quick-link-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(222, 2, 22, 0.08);
          border-radius: 8px;
        }
        .mp-quick-link-text {
          flex: 1;
          min-width: 0;
        }
        .mp-quick-link-title {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #f5f5f5;
          margin-bottom: 0.1rem;
        }
        .mp-quick-link-desc {
          display: block;
          font-size: 0.6rem;
          color: #525252;
          font-weight: 500;
        }
        .mp-quick-link-arrow {
          font-size: 0.85rem;
          color: #404040;
          transition: color 0.2s;
        }
        .mp-quick-link-card:hover .mp-quick-link-arrow { color: #de0216; }

        /* ── SPONSORED AD WRAPPER ── */
        .mp-ad-wrapper {
          width: 100%;
          margin: 1.25rem auto;
          padding: 0 1.5rem;
        }

        /* ── NEWSLETTER ── */
        .mp-newsletter-wrapper {
          width: 80%;
          margin: 2rem auto;
          padding: 0 1.5rem;
        }
        .mp-newsletter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          padding: 1.25rem 1.5rem;
          background: #0d0d0d;
          border: 1px solid #262626;
          border-radius: 6px;
        }
        .mp-newsletter-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .mp-newsletter-icon {
          font-size: 1.5rem;
          background: rgba(222, 2, 22, 0.1);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .mp-newsletter-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #f5f5f5;
          margin: 0 0 0.15rem;
        }
        .mp-newsletter-sub {
          font-size: 0.72rem;
          color: #737373;
          margin: 0;
        }
        .mp-newsletter-right {
          display: flex;
          gap: 0.5rem;
        }
        .mp-newsletter-input {
          padding: 0.5rem 0.75rem;
          background: #080808;
          border: 1px solid #333;
          border-radius: 4px;
          color: #e5e5e5;
          font-size: 0.78rem;
          font-family: 'Inter', sans-serif;
          width: 260px;
        }
        .mp-newsletter-input:focus { outline: none; border-color: #de0216; }
        .mp-newsletter-btn {
          padding: 0.5rem 1.25rem;
          background: #de0216;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .mp-newsletter-btn:hover { background: #b50212; }

        /* ── DISCLAIMER ── */
        .mp-disclaimer {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          font-size: 0.6rem;
          color: #404040;
        }

        /* ── ANIMATIONS ── */
        @keyframes mp-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes mp-pulse-glow {
          0%, 100% { box-shadow: 0 0 4px rgba(222, 2, 22, 0.4); }
          50% { box-shadow: 0 0 12px rgba(222, 2, 22, 0.7); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .mp-hero-section { flex-direction: column; }
          .mp-hero-main { border-radius: 8px; }
          .mp-pulse-sidebar {
            width: 100%;
            min-width: auto;
            border-radius: 8px;
            border: 1px solid #262626;
            margin-top: 0.75rem;
          }
          .mp-pulse-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem 1.25rem;
          }
          .mp-pulse-row:last-child {
            border-bottom: 1px solid #1a1a1a;
          }
          .mp-indices-section { flex-direction: column; }
          .mp-status-sidebar {
            width: 100%;
            min-width: auto;
            padding-left: 0;
            margin-top: 0.75rem;
          }
          .mp-three-col-section {
            grid-template-columns: 1fr;
          }
          .mp-news-section { flex-direction: column; }
          .mp-gainers-losers {
            width: 100%;
            min-width: auto;
          }
          .mp-gl-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
          }
          .mp-bottom-section { flex-direction: column; }
          .mp-quick-links {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .mp-hero-section,
          .mp-indices-section,
          .mp-news-section,
          .mp-three-col-section,
          .mp-bottom-section,
          .mp-quick-links,
          .mp-disclaimer {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .mp-newsletter-wrapper {
            width: 100%;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .mp-hero-title { font-size: clamp(2rem, 8vw, 3.5rem); }
          .mp-hero-main { padding: 1rem; min-height: 120px; }
          .mp-hero-subtitle { font-size: 0.85rem; }
          .mp-customize-btn { display: none; }
          .mp-index-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.6rem;
          }
          .mp-index-card {
            padding: 0.75rem 0.85rem;
          }
          .mp-index-card-value {
            font-size: 1.15rem;
          }
          .mp-news-grid { grid-template-columns: 1fr; gap: 1rem; }
          .mp-news-featured-link, .mp-news-featured-placeholder { height: 280px; }
          .mp-news-featured-overlay { padding: 1rem; }
          .mp-news-featured-title { font-size: 1.15rem; }
          .mp-news-featured-sub { font-size: 0.72rem; }
          .mp-sector-grid { grid-template-columns: repeat(3, 1fr); }
          .mp-quick-links {
            grid-template-columns: repeat(2, 1fr);
          }
          .mp-newsletter {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }
          .mp-newsletter-right {
            width: 100%;
            flex-direction: column;
          }
          .mp-newsletter-input { width: 100%; }
          .mp-newsletter-btn { width: 100%; min-height: 42px; }
          .mp-heatmap-grid { grid-template-columns: repeat(3, 1fr); }
          .mp-go-cards { grid-template-columns: repeat(2, 1fr); }
          .mp-fii-summary { flex-direction: row; gap: 0.5rem; }
          .mp-fii-value { font-size: 0.75rem; }
          .mp-currency-input-group { flex-direction: row; }
        }

        @media (max-width: 640px) {
          .mp-hero-section,
          .mp-indices-section,
          .mp-news-section,
          .mp-three-col-section,
          .mp-bottom-section,
          .mp-quick-links,
          .mp-disclaimer {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .mp-newsletter-wrapper {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            margin: 1.25rem auto;
          }
          .mp-pulse-list {
            grid-template-columns: 1fr;
          }
          .mp-gl-columns {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .mp-econ-dates {
            padding-bottom: 0.35rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .mp-econ-dates::-webkit-scrollbar { display: none; }
          .mp-econ-date-btn {
            min-width: 44px;
            padding: 0.3rem 0.4rem;
          }
          .mp-disclaimer {
            flex-direction: column;
            gap: 0.35rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .mp-index-cards-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
          .mp-index-card { padding: 0.65rem 0.75rem; }
          .mp-index-card-name { font-size: 0.62rem; }
          .mp-index-card-value { font-size: 1rem; }
          .mp-index-card-change { font-size: 0.65rem; }
          .mp-sector-grid { grid-template-columns: repeat(2, 1fr); }
          .mp-sector-name { font-size: 0.55rem; }
          .mp-quick-links { grid-template-columns: 1fr; }
          .mp-heatmap-grid { grid-template-columns: repeat(2, 1fr); }
          .mp-go-cards { grid-template-columns: 1fr; }
          .mp-currency-input-group { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
