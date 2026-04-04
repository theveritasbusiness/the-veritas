const TICKERS = [
  { label: "NIFTY 50", symbol: "^NSEI" },
  { label: "NIFTY BANK", symbol: "^NSEBANK" },
  { label: "BSE SENSEX", symbol: "^BSESN" },
  { label: "INDIA VIX", symbol: "^INDIAVIX" },
  { label: "NIFTY NEXT 50", symbol: "^NSMIDCP" },
  { label: "NIFTY MIDCAP 100", symbol: "NIFTY_MIDCAP_100.NS" },
  { label: "NIFTY SMALLCAP 100", symbol: "^CNXSC" },
  { label: "GOLD", symbol: "GC=F" },
  { label: "SILVER", symbol: "SI=F" },
  { label: "CRUDE OIL", symbol: "CL=F" },
  { label: "DOLLAR INDEX", symbol: "DX-Y.NYB" },
  { label: "GIFT NIFTY", symbol: "GIFNIFTY=F" },
  { label: "DOW JONES", symbol: "^DJI" },
  { label: "S&P 500", symbol: "^GSPC" },
  { label: "NASDAQ", symbol: "^IXIC" },
  { label: "NIFTY TOTAL MARKET", symbol: "NIFTY_TOTAL_MKT.NS" }
];

const FALLBACK_QUOTES = {
  "NIFTY 50": { value: 22418.7, change: 126.35, changePercent: 0.57 },
  "NIFTY BANK": { value: 48792.1, change: -142.8, changePercent: -0.29 },
  "BSE SENSEX": { value: 73891.4, change: 411.22, changePercent: 0.56 },
  "INDIA VIX": { value: 13.42, change: -0.28, changePercent: -2.04 },
  "NIFTY NEXT 50": { value: 64873.55, change: 202.17, changePercent: 0.31 },
  "NIFTY MIDCAP 100": { value: 51722.4, change: 188.91, changePercent: 0.37 },
  "NIFTY SMALLCAP 100": { value: 16894.7, change: -34.12, changePercent: -0.2 },
  GOLD: { value: 2328.6, change: 8.4, changePercent: 0.36 },
  SILVER: { value: 27.11, change: -0.09, changePercent: -0.33 },
  "CRUDE OIL": { value: 81.44, change: 0.52, changePercent: 0.64 },
  "DOLLAR INDEX": { value: 104.12, change: -0.21, changePercent: -0.2 },
  "GIFT NIFTY": { value: 22486.25, change: 74.15, changePercent: 0.33 },
  "DOW JONES": { value: 39211.8, change: 188.12, changePercent: 0.48 },
  "S&P 500": { value: 5217.3, change: 21.07, changePercent: 0.41 },
  NASDAQ: { value: 16378.55, change: 96.42, changePercent: 0.59 },
  "NIFTY TOTAL MARKET": { value: 12471.38, change: 43.26, changePercent: 0.35 }
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
    const query = encodeURIComponent(TICKERS.map((item) => item.symbol).join(","));
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${query}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        }
      }
    );

    const data = await response.json();
    const quotes = Array.isArray(data?.quoteResponse?.result)
      ? data.quoteResponse.result
      : [];

    const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));

    const items = TICKERS.map((item) => {
      const quote = bySymbol.get(item.symbol);
      const fallback = FALLBACK_QUOTES[item.label];
      return {
        label: item.label,
        symbol: item.symbol,
        value:
          typeof quote?.regularMarketPrice === "number"
            ? quote.regularMarketPrice
            : fallback?.value ?? null,
        change:
          typeof quote?.regularMarketChange === "number"
            ? quote.regularMarketChange
            : fallback?.change ?? null,
        changePercent:
          typeof quote?.regularMarketChangePercent === "number"
            ? quote.regularMarketChangePercent
            : fallback?.changePercent ?? null
      };
    });

    const payload = {
      items,
      asOf: formatAsOf(new Date().toISOString())
    };

    cachedPayload = payload;
    cachedAt = now;

    return res.status(200).json(payload);
  } catch (error) {
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
