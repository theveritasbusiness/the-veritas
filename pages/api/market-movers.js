const TICKERS = {
  nse: [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LT.NS", "TATAMOTORS.NS",
    "HINDUNILVR.NS", "SUNPHARMA.NS"
  ],
  bse: [
    "RELIANCE.BO", "TCS.BO", "HDFCBANK.BO", "INFY.BO", "ICICIBANK.BO",
    "SBIN.BO", "BHARTIARTL.BO", "ITC.BO", "LT.BO", "TATAMOTORS.BO",
    "HINDUNILVR.BO", "SUNPHARMA.BO"
  ]
};

const FALLBACK_MOVERS = {
  nse: [
    { symbol: "TATASTEEL", price: 182.40, change: 5.20, changePercent: 2.94 },
    { symbol: "INFY", price: 1534.20, change: 32.40, changePercent: 2.16 },
    { symbol: "RELIANCE", price: 2940.10, change: 48.50, changePercent: 1.68 },
    { symbol: "TCS", price: 3850.00, change: 50.25, changePercent: 1.32 },
    { symbol: "SBIN", price: 840.15, change: 9.80, changePercent: 1.18 },
    { symbol: "LT", price: 3540.00, change: 35.20, changePercent: 1.01 },
    { symbol: "HDFCBANK", price: 1490.50, change: -38.20, changePercent: -2.50 },
    { symbol: "ICICIBANK", price: 1120.30, change: -22.40, changePercent: -1.96 },
    { symbol: "AXISBANK", price: 1145.00, change: -18.50, changePercent: -1.59 },
    { symbol: "BHARTIARTL", price: 1380.00, change: -14.20, changePercent: -1.02 },
    { symbol: "ITC", price: 425.10, change: -3.40, changePercent: -0.79 },
    { symbol: "TATAMOTORS", price: 975.20, change: -6.80, changePercent: -0.69 }
  ],
  bse: [
    { symbol: "TATASTEEL", price: 182.50, change: 5.15, changePercent: 2.90 },
    { symbol: "INFY", price: 1533.90, change: 31.85, changePercent: 2.12 },
    { symbol: "RELIANCE", price: 2939.80, change: 47.90, changePercent: 1.66 },
    { symbol: "TCS", price: 3848.50, change: 49.30, changePercent: 1.30 },
    { symbol: "SBIN", price: 839.95, change: 9.50, changePercent: 1.14 },
    { symbol: "LT", price: 3538.50, change: 33.70, changePercent: 0.96 },
    { symbol: "HDFCBANK", price: 1491.00, change: -37.75, changePercent: -2.47 },
    { symbol: "ICICIBANK", price: 1120.00, change: -22.10, changePercent: -1.93 },
    { symbol: "AXISBANK", price: 1144.50, change: -18.25, changePercent: -1.57 },
    { symbol: "BHARTIARTL", price: 1379.50, change: -13.80, changePercent: -0.99 },
    { symbol: "ITC", price: 425.00, change: -3.30, changePercent: -0.77 },
    { symbol: "TATAMOTORS", price: 975.00, change: -6.50, changePercent: -0.66 }
  ]
};

let cache = {
  nse: { data: null, fetchedAt: 0 },
  bse: { data: null, fetchedAt: 0 }
};

export default async function handler(req, res) {
  const exchange = req.query.exchange === "bse" ? "bse" : "nse";
  const type = req.query.type === "losers" ? "losers" : "gainers";

  const now = Date.now();
  let items = [];

  if (cache[exchange].data && now - cache[exchange].fetchedAt < 60000) {
    items = cache[exchange].data;
  } else {
    try {
      const symbols = TICKERS[exchange];
      const promises = symbols.map(async (symbol) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d`;
        const fetchRes = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
          }
        });
        if (!fetchRes.ok) {
          throw new Error(`Yahoo Finance error for ${symbol}: Status ${fetchRes.status}`);
        }
        const json = await fetchRes.json();
        const meta = json.chart?.result?.[0]?.meta;
        if (!meta) {
          throw new Error(`Yahoo Finance returned empty result for ${symbol}`);
        }

        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose || meta.chartPreviousClose || price;
        const change = price - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;

        return {
          symbol: symbol.split('.')[0], // Clean symbol to display e.g. "RELIANCE"
          price: parseFloat(price.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2))
        };
      });

      const fetchedItems = await Promise.all(promises);
      items = fetchedItems.filter(Boolean);

      if (items.length > 0) {
        cache[exchange].data = items;
        cache[exchange].fetchedAt = now;
      } else {
        throw new Error("Empty items fetched from Yahoo Finance");
      }
    } catch (error) {
      console.error(`Error loading market movers for ${exchange}:`, error);
      items = FALLBACK_MOVERS[exchange];
    }
  }

  // Sort and select top 6
  const sorted = [...items];
  if (type === "gainers") {
    sorted.sort((a, b) => b.changePercent - a.changePercent);
  } else {
    sorted.sort((a, b) => a.changePercent - b.changePercent);
  }

  const result = sorted.slice(0, 6);
  return res.status(200).json(result);
}
