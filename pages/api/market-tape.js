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
      return {
        label: item.label,
        symbol: item.symbol,
        value: typeof quote?.regularMarketPrice === "number" ? quote.regularMarketPrice : null,
        change: typeof quote?.regularMarketChange === "number" ? quote.regularMarketChange : null,
        changePercent:
          typeof quote?.regularMarketChangePercent === "number"
            ? quote.regularMarketChangePercent
            : null
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
    return res.status(500).json({
      error: "Failed to load market data",
      items: cachedPayload?.items || [],
      asOf: cachedPayload?.asOf || ""
    });
  }
}
