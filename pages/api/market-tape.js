const TICKERS = [
  { label: "NIFTY 50", symbol: "^NSEI" },
  { label: "NIFTY BANK", symbol: "^NSEBANK" },
  { label: "BSE SENSEX", symbol: "^BSESN" },
  { label: "INDIA VIX", symbol: "^INDIAVIX" },
  { label: "NIFTY NEXT 50", symbol: "^NSMIDCP" },
  { label: "NIFTY MIDCAP 100", symbol: "NIFTY_MIDCAP_100.NS" },
  { label: "NIFTY SMALLCAP 100", symbol: "^CNXSC" },
  { label: "GOLD (USD/OZ)", symbol: "GC=F" },
  { label: "SILVER (USD/OZ)", symbol: "SI=F" },
  { label: "CRUDE OIL (USD/BBL)", symbol: "CL=F" },
  { label: "DOLLAR INDEX", symbol: "DX-Y.NYB" },
  { label: "NIKKEI 225", symbol: "^N225" },
  { label: "DOW JONES", symbol: "^DJI" },
  { label: "S&P 500", symbol: "^GSPC" },
  { label: "NASDAQ", symbol: "^IXIC" },
  { label: "NIFTY TOTAL MARKET", symbol: "NIFTY_TOTAL_MKT.NS" }
];

const FALLBACK_QUOTES = {
  "NIFTY 50": { value: 24175.7, change: 169.85, changePercent: 0.71 },
  "NIFTY BANK": { value: 58031.65, change: -1.40, changePercent: -0.00 },
  "BSE SENSEX": { value: 77502.12, change: 579.48, changePercent: 0.75 },
  "INDIA VIX": { value: 12.29, change: -0.96, changePercent: -7.21 },
  "NIFTY NEXT 50": { value: 72418.55, change: 317.90, changePercent: 0.44 },
  "NIFTY MIDCAP 100": { value: 62307.9, change: 299.10, changePercent: 0.48 },
  "NIFTY SMALLCAP 100": { value: 19167.8, change: 236.75, changePercent: 1.25 },
  "GOLD (USD/OZ)": { value: 4139.2, change: 56.80, changePercent: 1.39 },
  "SILVER (USD/OZ)": { value: 61.96, change: 1.44, changePercent: 2.39 },
  "CRUDE OIL (USD/BBL)": { value: 67.33, change: -1.25, changePercent: -1.82 },
  "DOLLAR INDEX": { value: 100.72, change: -0.67, changePercent: -0.66 },
  "NIKKEI 225": { value: 68733.15, change: -1741.81, changePercent: -2.47 },
  "DOW JONES": { value: 52305.24, change: -13.96, changePercent: -0.03 },
  "S&P 500": { value: 7483.23, change: -16.13, changePercent: -0.22 },
  NASDAQ: { value: 26040.03, change: -173.69, changePercent: -0.66 },
  "NIFTY TOTAL MARKET": { value: 13129.65, change: 87.55, changePercent: 0.67 }
};

let cachedPayload = null;
let cachedAt = 0;

function formatAsOf(dateString) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Calcutta"
    }).format(new Date(dateString));
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  const now = Date.now();
  if (cachedPayload && now - cachedAt < 60000) {
    return res.status(200).json(cachedPayload);
  }

  try {
    // Fetch quotes in parallel from the /v8/finance/chart API
    const promises = TICKERS.map(async (ticker) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.symbol}?range=1d`;
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
          }
        });
        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) {
          throw new Error("Missing meta object");
        }
        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose ?? meta.chartPreviousClose;
        if (typeof price !== "number" || typeof prevClose !== "number") {
          throw new Error("Missing price or prevClose");
        }
        const change = price - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;
        return {
          label: ticker.label,
          symbol: ticker.symbol,
          value: price,
          change: change,
          changePercent: changePercent
        };
      } catch (err) {
        console.error(`Error fetching ticker ${ticker.label} (${ticker.symbol}):`, err.message);
        // Return fallback for this specific ticker
        const fallback = FALLBACK_QUOTES[ticker.label];
        return {
          label: ticker.label,
          symbol: ticker.symbol,
          value: fallback?.value ?? null,
          change: fallback?.change ?? null,
          changePercent: fallback?.changePercent ?? null
        };
      }
    });

    const items = await Promise.all(promises);

    const payload = {
      items,
      asOf: formatAsOf(new Date().toISOString())
    };

    cachedPayload = payload;
    cachedAt = now;

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Critical error in market-tape handler:", error);
    // If the entire Promise.all or another critical error occurred, return fallbacks
    const items = TICKERS.map((item) => ({
      label: item.label,
      symbol: item.symbol,
      ...(FALLBACK_QUOTES[item.label] || {
        value: null,
        change: null,
        changePercent: null
      })
    }));

    return res.status(500).json({
      error: "Failed to load market data",
      items: cachedPayload?.items?.length ? cachedPayload.items : items,
      asOf: cachedPayload?.asOf || formatAsOf(new Date().toISOString())
    });
  }
}
