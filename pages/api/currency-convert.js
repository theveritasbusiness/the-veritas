let cache = {};

export default async function handler(req, res) {
  const { from = "USD", to = "INR", amount = "1" } = req.query;
  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();
  const numAmount = parseFloat(amount) || 1;

  const cacheKey = `${upperFrom}_${upperTo}`;
  const now = Date.now();

  // Cache for 10 minutes
  if (cache[cacheKey] && now - cache[cacheKey].cachedAt < 600000) {
    const rate = cache[cacheKey].rate;
    return res.status(200).json({
      from: upperFrom,
      to: upperTo,
      amount: numAmount,
      rate,
      result: parseFloat((numAmount * rate).toFixed(2)),
      cached: true
    });
  }

  try {
    // Using free open exchange rate API (no key required)
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${upperFrom}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.rates || !data.rates[upperTo]) {
      throw new Error(`Rate not found for ${upperTo}`);
    }

    const rate = data.rates[upperTo];

    cache[cacheKey] = { rate, cachedAt: now };

    return res.status(200).json({
      from: upperFrom,
      to: upperTo,
      amount: numAmount,
      rate,
      result: parseFloat((numAmount * rate).toFixed(2)),
      cached: false
    });
  } catch (error) {
    console.error("Currency conversion error:", error);

    // Fallback rates
    const fallbackRates = {
      USD_INR: 83.21,
      INR_USD: 0.012,
      EUR_INR: 90.15,
      GBP_INR: 105.30,
      JPY_INR: 0.53,
      USD_EUR: 0.92,
      USD_GBP: 0.79,
      USD_JPY: 157.25
    };

    const fallbackRate =
      fallbackRates[cacheKey] ||
      (upperFrom === upperTo ? 1 : 83.21);

    return res.status(200).json({
      from: upperFrom,
      to: upperTo,
      amount: numAmount,
      rate: fallbackRate,
      result: parseFloat((numAmount * fallbackRate).toFixed(2)),
      fallback: true
    });
  }
}
