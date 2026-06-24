let cache = {};

function generateFallbackData(symbol, range) {
  const isNifty = symbol.toLowerCase() === "nifty";
  const baseValue = isNifty ? 22418.7 : 73891.4;
  const change = isNifty ? 126.35 : 411.22;
  const changePercent = isNifty ? 0.57 : 0.56;
  
  let numPoints = 50;
  let intervalMs = 24 * 60 * 60 * 1000;
  
  if (range === "1d") {
    numPoints = 75;
    intervalMs = 5 * 60 * 1000;
  } else if (range === "5d") {
    numPoints = 75;
    intervalMs = 30 * 60 * 1000;
  } else if (range === "1m") {
    numPoints = 30;
    intervalMs = 24 * 60 * 60 * 1000;
  } else if (range === "6m") {
    numPoints = 60;
    intervalMs = 3 * 24 * 60 * 60 * 1000;
  } else if (range === "1y") {
    numPoints = 100;
    intervalMs = 3.65 * 24 * 60 * 60 * 1000;
  } else if (range === "5y") {
    numPoints = 120;
    intervalMs = 15 * 24 * 60 * 60 * 1000;
  } else {
    numPoints = 150;
    intervalMs = 30 * 24 * 60 * 60 * 1000;
  }
  
  const now = Date.now();
  const points = [];
  let currentValue = baseValue - change;
  const trend = change / numPoints;
  
  for (let i = 0; i < numPoints; i++) {
    const timestamp = now - (numPoints - 1 - i) * intervalMs;
    const noise = (Math.sin(i * 0.5) * 0.4 + Math.cos(i * 0.8) * 0.2) * (baseValue * 0.004);
    currentValue += trend + noise;
    points.push({
      timestamp,
      value: parseFloat(currentValue.toFixed(2))
    });
  }
  
  return {
    symbol,
    range,
    price: baseValue,
    change,
    changePercent,
    previousClose: baseValue - change,
    points,
    isFallback: true,
    asOf: new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Calcutta"
    }).format(new Date())
  };
}

export default async function handler(req, res) {
  const { symbol = "nifty", range = "1d" } = req.query;
  const lowerSymbol = symbol.toLowerCase();
  
  if (lowerSymbol !== "sensex" && lowerSymbol !== "nifty") {
    return res.status(400).json({ error: "Invalid symbol" });
  }

  const cacheKey = `${lowerSymbol}_${range}`;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].cachedAt < 60000) {
    return res.status(200).json(cache[cacheKey].payload);
  }

  const yahooSymbol = lowerSymbol === "sensex" ? "^BSESN" : "^NSEI";

  const rangeMap = {
    "1d": { range: "1d", interval: "5m" },
    "5d": { range: "5d", interval: "15m" },
    "1m": { range: "1mo", interval: "1d" },
    "6m": { range: "6mo", interval: "1d" },
    "1y": { range: "1y", interval: "1d" },
    "5y": { range: "5y", interval: "1wk" },
    "max": { range: "max", interval: "1mo" }
  };

  const config = rangeMap[range] || rangeMap["1d"];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${config.range}&interval=${config.interval}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo status ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      throw new Error("No data returned from Yahoo chart");
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const meta = result.meta || {};

    const points = [];
    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i] * 1000;
      const val = closes[i];
      if (val != null && !isNaN(val)) {
        points.push({
          timestamp: ts,
          value: parseFloat(val.toFixed(2))
        });
      }
    }

    if (points.length === 0) {
      throw new Error("Points list is empty");
    }

    const price = typeof meta.regularMarketPrice === "number" ? meta.regularMarketPrice : points[points.length - 1].value;
    const previousClose = typeof meta.previousClose === "number" ? meta.previousClose : (meta.chartPreviousClose || points[0].value);

    let change = 0;
    let changePercent = 0;

    if (range === "1d") {
      change = price - previousClose;
      changePercent = previousClose ? (change / previousClose) * 100 : 0;
    } else {
      const startValue = points[0].value;
      const endValue = points[points.length - 1].value;
      change = endValue - startValue;
      changePercent = startValue ? (change / startValue) * 100 : 0;
    }

    const formatAsOf = (date) => {
      try {
        return new Intl.DateTimeFormat("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Calcutta"
        }).format(date);
      } catch {
        return "";
      }
    };

    const payload = {
      symbol: lowerSymbol,
      range,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      points,
      isFallback: false,
      asOf: formatAsOf(new Date())
    };

    cache[cacheKey] = {
      payload,
      cachedAt: now
    };

    return res.status(200).json(payload);
  } catch (error) {
    console.error(`Error loading market chart for ${lowerSymbol}:`, error);
    const fallback = generateFallbackData(lowerSymbol, range);
    return res.status(200).json(fallback);
  }
}
