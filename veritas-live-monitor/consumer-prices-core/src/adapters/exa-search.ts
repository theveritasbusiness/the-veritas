/**
 * ExaSearchAdapter — acquires prices via Exa AI neural search + summary extraction.
 * Ported from scripts/seed-grocery-basket.mjs (PR #1904).
 *
 * Instead of fetching category pages and parsing CSS selectors, this adapter:
 * 1. Discovers targets from the basket YAML config (one target per basket item)
 * 2. Calls Exa with contents.summary to get AI-extracted price text from retailer pages
 * 3. Uses regex to extract the price from the summary
 *
 * Basket → product match is written automatically (match_status: 'auto')
 * because the search is item-specific — no ambiguity in what was searched.
 */
import { loadAllBasketConfigs } from '../config/loader.js';
import type { AdapterContext, FetchResult, ParsedProduct, RetailerAdapter, Target } from './types.js';
import type { RetailerConfig } from '../config/types.js';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const CCY =
  'USD|GBP|EUR|JPY|CNY|INR|AUD|CAD|BRL|MXN|ZAR|TRY|NGN|KRW|SGD|PKR|AED|SAR|QAR|KWD|BHD|OMR|EGP|JOD|LBP|KES|ARS|IDR|PHP';

const SYMBOL_MAP: Record<string, string> = {
  '£': 'GBP',
  '€': 'EUR',
  '¥': 'JPY',
  '₩': 'KRW',
  '₹': 'INR',
  '₦': 'NGN',
  'R$': 'BRL',
};

const CURRENCY_MIN: Record<string, number> = {
  NGN: 50,
  IDR: 500,
  ARS: 50,
  KRW: 1000,
  ZAR: 2,
  PKR: 20,
  LBP: 1000,
};

const PRICE_PATTERNS = [
  new RegExp(`(\\d+(?:\\.\\d{1,3})?)\\s*(${CCY})`, 'i'),
  new RegExp(`(${CCY})\\s*(\\d+(?:\\.\\d{1,3})?)`, 'i'),
];

function matchPrice(text: string, expectedCurrency: string): number | null {
  for (const re of PRICE_PATTERNS) {
    const match = text.match(re);
    if (match) {
      const [price, currency] = /^\d/.test(match[1])
        ? [parseFloat(match[1]), match[2].toUpperCase()]
        : [parseFloat(match[2]), match[1].toUpperCase()];
      if (currency !== expectedCurrency) continue;
      const minPrice = CURRENCY_MIN[currency] ?? 0;
      if (price > minPrice && price < 100_000) return price;
    }
  }
  for (const [sym, iso] of Object.entries(SYMBOL_MAP)) {
    if (iso !== expectedCurrency) continue;
    const re = new RegExp(`${sym.replace('$', '\\$')}\\s*(\\d+(?:[.,]\\d{1,3})?)`, 'i');
    const m = text.match(re);
    if (m) {
      const price = parseFloat(m[1].replace(',', '.'));
      const minPrice = CURRENCY_MIN[iso] ?? 0;
      if (price > minPrice && price < 100_000) return price;
    }
  }
  return null;
}

interface ExaResult {
  url?: string;
  title?: string;
  summary?: string;
}

interface SearchPayload {
  exaResults: ExaResult[];
  basketSlug: string;
  itemCategory: string;
  canonicalName: string;
}

export class ExaSearchAdapter implements RetailerAdapter {
  readonly key = 'exa-search';

  constructor(private readonly apiKey: string) {}

  async discoverTargets(ctx: AdapterContext): Promise<Target[]> {
    const baskets = loadAllBasketConfigs().filter((b) => b.marketCode === ctx.config.marketCode);
    const domain = new URL(ctx.config.baseUrl).hostname;
    const targets: Target[] = [];

    for (const basket of baskets) {
      for (const item of basket.items) {
        targets.push({
          id: item.id,
          url: ctx.config.baseUrl,
          category: item.category,
          metadata: {
            canonicalName: item.canonicalName,
            domain,
            basketSlug: basket.slug,
            currency: ctx.config.currencyCode,
          },
        });
      }
    }

    return targets;
  }

  async fetchTarget(ctx: AdapterContext, target: Target): Promise<FetchResult> {
    if (!this.apiKey) throw new Error('EXA_API_KEY is required for exa-search adapter');

    const { canonicalName, domain, currency, basketSlug } = target.metadata as {
      canonicalName: string;
      domain: string;
      currency: string;
      basketSlug: string;
    };

    const body = {
      query: `${canonicalName} ${currency} retail price`,
      numResults: 5,
      type: 'auto',
      includeDomains: [domain],
      contents: {
        summary: {
          query: `What is the retail price of this product? State amount and ISO currency code (e.g. ${currency} 12.50).`,
        },
      },
    };

    const resp = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': CHROME_UA,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Exa search failed HTTP ${resp.status}: ${text.slice(0, 120)}`);
    }

    const data = (await resp.json()) as { results?: ExaResult[] };
    const payload: SearchPayload = {
      exaResults: data.results ?? [],
      basketSlug,
      itemCategory: target.category,
      canonicalName,
    };

    return {
      url: target.url,
      html: JSON.stringify(payload),
      statusCode: 200,
      fetchedAt: new Date(),
    };
  }

  async parseListing(ctx: AdapterContext, result: FetchResult): Promise<ParsedProduct[]> {
    const payload = JSON.parse(result.html) as SearchPayload;
    const currency = ctx.config.currencyCode;

    for (const r of payload.exaResults) {
      const price =
        matchPrice(r.summary ?? '', currency) ??
        matchPrice(r.title ?? '', currency);

      if (price !== null) {
        return [
          {
            sourceUrl: r.url ?? ctx.config.baseUrl,
            rawTitle: r.title ?? payload.canonicalName,
            rawBrand: null,
            rawSizeText: null,
            imageUrl: null,
            categoryText: payload.itemCategory,
            retailerSku: null,
            price,
            listPrice: null,
            promoPrice: null,
            promoText: null,
            inStock: true,
            rawPayload: {
              exaUrl: r.url,
              summary: r.summary,
              basketSlug: payload.basketSlug,
              itemCategory: payload.itemCategory,
              canonicalName: payload.canonicalName,
            },
          },
        ];
      }
    }

    return [];
  }

  async parseProduct(_ctx: AdapterContext, _result: FetchResult): Promise<ParsedProduct> {
    throw new Error('ExaSearchAdapter does not support single-product parsing');
  }

  async validateConfig(config: RetailerConfig): Promise<string[]> {
    const errors: string[] = [];
    if (!this.apiKey) errors.push('EXA_API_KEY env var is required for adapter: exa-search');
    if (!config.baseUrl) errors.push('baseUrl is required');
    return errors;
  }
}
