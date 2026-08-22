/**
 * routes/compare.js
 *
 * POST /api/compare/products
 *
 *   Body: { urls: string[] }
 *
 *   Flow:
 *     1. Validate each URL.
 *     2. Scrape every URL with Bright Data (in parallel, with a small
 *        concurrency limit so we don't hammer the upstream API).
 *     3. Normalize each result.
 *     4. Ask Qwen to produce a head-to-head comparison.
 *     5. Always return the per-product scraped data even if AI fails.
 */

const router = require('express').Router();
const brightData = require('../services/brightDataAdapter');
const { normalizeProduct } = require('../services/normalizeService');
const ollama = require('../services/ollamaService');
const { isValidAmazonUrl } = require('./analyze');

const MAX_PRODUCTS = 5;
const SCRAPE_CONCURRENCY = 2;

const COMPARISON_SCHEMA = `{
  "bestOverall": {
    "index": number,            // 0-based index into the products array
    "reason": string
  },
  "bestValue": {
    "index": number,
    "reason": string
  },
  "bestRated": {
    "index": number,
    "reason": string
  },
  "bestFeatures": {
    "index": number,
    "reason": string
  },
  "biggestWeakness": [
    { "index": number, "weakness": string }
  ],
  "comparisonTable": {
    "priceWinnerIndex": number | null,
    "ratingWinnerIndex": number | null,
    "reviewWinnerIndex": number | null,
    "featureWinnerIndex": number | null,
    "valueWinnerIndex": number | null
  },
  "aiRecommendation": {
    "verdict": string,           // one sentence
    "reasoning": string,         // 2-3 sentences explaining the pick across multiple factors
    "whoShouldBuyWhat": string[] // 2-4 short bullets
  }
}`;

router.post('/products', async (req, res, next) => {
  try {
    const { urls } = req.body || {};
    const list = Array.isArray(urls) ? urls.map((u) => (typeof u === 'string' ? u.trim() : '')) : [];

    if (list.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 Amazon product URLs are required.',
      });
    }
    if (list.length > MAX_PRODUCTS) {
      return res.status(400).json({
        success: false,
        error: `At most ${MAX_PRODUCTS} product URLs are allowed.`,
      });
    }

    const invalid = list
      .map((u, i) => ({ u, i }))
      .filter(({ u }) => !isValidAmazonUrl(u));
    if (invalid.length) {
      return res.status(400).json({
        success: false,
        error: `Invalid Amazon URL(s) at index ${invalid.map((x) => x.i).join(', ')}.`,
      });
    }

    // 1. Scrape all in parallel (capped concurrency)
    const scraped = await mapWithConcurrency(list, SCRAPE_CONCURRENCY, async (u) => {
      try {
        const r = await brightData.runCollector(u);
        return r.success
          ? { ok: true, url: u, data: r.data }
          : { ok: false, url: u, error: r.error || 'Bright Data error' };
      } catch (err) {
        return { ok: false, url: u, error: err.message || String(err) };
      }
    });

    // 2. Normalize successes
    const products = scraped.map((s, idx) => {
      if (s.ok) {
        const p = normalizeProduct(s.data);
        return {
          url: s.url,
          ...p,
          scrapeOk: true,
          scrapeError: null,
        };
      }
      return {
        url: s.url,
        name: null,
        brand: null,
        price: null,
        rating: null,
        reviewCount: null,
        scrapeOk: false,
        scrapeError: s.error,
        dataQuality: 'empty',
      };
    });

    const usable = products.filter((p) => p.scrapeOk && p.dataQuality !== 'empty');
    if (usable.length < 2) {
      return res.status(502).json({
        success: false,
        error: 'Bright Data failed for too many products to produce a comparison.',
        products,
        dataSource: 'bright-data',
      });
    }

    // 3. AI pass
    const aiResult = await runComparison(products);

    return res.json({
      success: true,
      products,
      comparison: aiResult.ok ? aiResult.data : null,
      aiStatus: {
        attempted: true,
        ok: aiResult.ok,
        error: aiResult.ok ? null : aiResult.error,
        code: aiResult.code || null,
        model: aiResult.model || ollama.DEFAULT_MODEL,
      },
      dataSource: 'bright-data',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Build a prompt that contains each product's normalized snapshot and asks
 * Qwen to produce the comparison JSON. We pass *only* the compact canonical
 * fields, not the full Bright Data raw payload.
 */
async function runComparison(products) {
  const userPrompt = `You are comparing ${products.length} Amazon products. Produce a head-to-head comparison as JSON.

PRODUCTS (array, each entry has name, brand, price, currency, rating, reviewCount, features[], sentiment, dataQuality):
${JSON.stringify(products, null, 2)}

Rules:
- "bestOverall" must consider price, rating, review count, features, AND sentiment — not rating alone.
- "bestValue" must consider price vs. rating+features+reviews.
- "bestRated" should be the product with the highest rating among those with a reasonable number of reviews.
- "bestFeatures" should be the product with the strongest feature set.
- If a product's rating is unavailable, prefer products with available data.
- If a field cannot be determined, use null or the string "Not available".
- Use only the data provided. Never invent specifications or claims.`;

  const result = await ollama.generateJSON({
    userPrompt,
    schema: COMPARISON_SCHEMA,
    temperature: 0.2,
    timeoutMs: 90_000,
  });

  if (!result.ok) return result;

  return { ...result, data: sanitizeComparison(result.data, products.length) };
}

function sanitizeComparison(raw, count) {
  const safeIndex = (v) =>
    Number.isInteger(v) && v >= 0 && v < count ? v : null;
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : 'Not available');

  const weakness = Array.isArray(raw && raw.biggestWeakness)
    ? raw.biggestWeakness
        .map((w) => ({
          index: safeIndex(w && w.index),
          weakness: str(w && w.weakness),
        }))
        .filter((w) => w.index !== null)
    : [];

  const ct = (raw && raw.comparisonTable) || {};

  return {
    bestOverall: {
      index: safeIndex((raw.bestOverall || {}).index),
      reason: str((raw.bestOverall || {}).reason),
    },
    bestValue: {
      index: safeIndex((raw.bestValue || {}).index),
      reason: str((raw.bestValue || {}).reason),
    },
    bestRated: {
      index: safeIndex((raw.bestRated || {}).index),
      reason: str((raw.bestRated || {}).reason),
    },
    bestFeatures: {
      index: safeIndex((raw.bestFeatures || {}).index),
      reason: str((raw.bestFeatures || {}).reason),
    },
    biggestWeakness: weakness,
    comparisonTable: {
      priceWinnerIndex: safeIndex(ct.priceWinnerIndex),
      ratingWinnerIndex: safeIndex(ct.ratingWinnerIndex),
      reviewWinnerIndex: safeIndex(ct.reviewWinnerIndex),
      featureWinnerIndex: safeIndex(ct.featureWinnerIndex),
      valueWinnerIndex: safeIndex(ct.valueWinnerIndex),
    },
    aiRecommendation: {
      verdict: str((raw.aiRecommendation || {}).verdict),
      reasoning: str((raw.aiRecommendation || {}).reasoning),
      whoShouldBuyWhat: Array.isArray((raw.aiRecommendation || {}).whoShouldBuyWhat)
        ? (raw.aiRecommendation.whoShouldBuyWhat
            .filter((x) => typeof x === 'string' && x.trim())
            .slice(0, 6))
        : [],
    },
  };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runOne() {
    const idx = cursor++;
    if (idx >= items.length) return;
    results[idx] = await worker(items[idx], idx);
    return runOne();
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, runOne);
  await Promise.all(runners);
  return results;
}

module.exports = router;
