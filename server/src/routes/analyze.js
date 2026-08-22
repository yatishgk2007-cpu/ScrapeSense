/**
 * routes/analyze.js
 *
 * POST /api/analyze/product
 *
 *   Body: { url: string, options?: { skipAI?: boolean } }
 *
 *   Flow:
 *     1. Validate Amazon URL.
 *     2. Scrape via brightDataAdapter.runCollector.
 *     3. Normalize via normalizeService.
 *     4. If scrape succeeded and AI not skipped → call Ollama/Qwen.
 *     5. Return combined result, never throwing if AI layer is down.
 */

const router = require('express').Router();
const brightData = require('../services/brightDataAdapter');
const { normalizeProduct } = require('../services/normalizeService');
const ollama = require('../services/ollamaService');

const PRODUCT_SCHEMA = `{
  "summary": string,                      // 2-3 sentence plain-English overview
  "category": string,                     // inferred product category or "Not available"
  "keyFeatures": string[],                // 3-6 important features (use only what the data shows)
  "pros": string[],                       // evidence-based advantages (cite price/rating/features)
  "cons": string[],                       // evidence-based disadvantages (cite price/rating/sentiment)
  "valueAssessment": string,              // short paragraph on whether the price is justified by rating/features/reviews
  "sentiment": {
    "overall": string,                    // one of: "Mostly Positive", "Positive", "Mixed", "Mostly Negative", "Negative", "Not available"
    "positiveThemes": string[],           // up to 5 themes
    "negativeThemes": string[],           // up to 5 themes
    "commonComplaint": string             // single most-mentioned complaint or "Not available"
  },
  "reviewInsights": {
    "mostPraised": string[],               // features reviewers love, with brief justification
    "mostCriticized": string[]            // features reviewers dislike, with brief justification
  },
  "recommendation": {
    "verdict": string,                     // one sentence verdict
    "reasoning": string,                   // 2-3 sentences explaining WHY, considering price + rating + reviews + features
    "bestFor": string                      // short phrase, e.g. "Power users who value performance" or "Not available"
  }
}`;

function isValidAmazonUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const u = new URL(value.trim());
    const host = u.hostname.toLowerCase();
    if (!/(^|\.)amazon\.(com|co\.uk|de|fr|es|it|ca|in|jp|com\.mx|com\.au|ae|sa|sg|nl|pl|se|sg|com\.br|com\.tr)$/.test(host)) {
      return false;
    }
    return u.pathname.length > 1;
  } catch {
    return false;
  }
}

router.post('/product', async (req, res, next) => {
  try {
    const { url, options } = req.body || {};
    const skipAI = !!(options && options.skipAI);

    if (!url || !isValidAmazonUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'A valid Amazon product URL is required.',
      });
    }

    // 1. Scrape via Bright Data (same adapter as the rest of the app)
    const scrapeResult = await brightData.runCollector(url.trim());

    if (!scrapeResult.success) {
      return res.status(502).json({
        success: false,
        error: 'Unable to retrieve product data.',
        details: scrapeResult.error || 'Bright Data request failed.',
        dataSource: 'bright-data',
      });
    }

    // 2. Normalize
    const product = normalizeProduct(scrapeResult.data);

    if (!product.name && product.dataQuality === 'empty') {
      return res.status(502).json({
        success: false,
        error: 'Bright Data returned an empty product payload.',
        product,
        dataSource: 'bright-data',
      });
    }

    // 3. Optional AI pass
    if (skipAI) {
      return res.json({
        success: true,
        product,
        ai: null,
        aiStatus: { attempted: false, reason: 'skipAI=true' },
        dataSource: 'bright-data',
      });
    }

    const aiResult = await runProductIntelligence(product);

    return res.json({
      success: true,
      product,
      ai: aiResult.ok ? aiResult.data : null,
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
 * Build the user prompt and call Ollama. Returns a result envelope
 * (never throws). The caller decides how to surface failures.
 */
async function runProductIntelligence(product) {
  const userPrompt = `Analyze the following Amazon product and produce product-intelligence JSON.

PRODUCT DATA (JSON):
${JSON.stringify(product, null, 2)}

Rules:
- Use ONLY information present in the product data above.
- If a field cannot be answered, set it to the literal string "Not available".
- Do not invent specifications, prices, or review content.
- Base pros/cons on the rating, review count, sentiment, and features.
- Base value assessment on price vs. rating + review count + feature set.
- Return strict JSON matching the schema. No prose.`;

  const result = await ollama.generateJSON({
    userPrompt,
    schema: PRODUCT_SCHEMA,
    temperature: 0.2,
  });

  if (!result.ok) return result;

  // Light sanity check + normalization
  const safe = sanitizeIntelligence(result.data);
  return { ...result, data: safe };
}

function sanitizeIntelligence(raw) {
  const arr = (v, n) =>
    Array.isArray(v)
      ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, n)
      : [];
  const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : 'Not available');

  return {
    summary: str(raw.summary),
    category: str(raw.category),
    keyFeatures: arr(raw.keyFeatures, 6),
    pros: arr(raw.pros, 6),
    cons: arr(raw.cons, 6),
    valueAssessment: str(raw.valueAssessment),
    sentiment: {
      overall: str((raw.sentiment || {}).overall),
      positiveThemes: arr((raw.sentiment || {}).positiveThemes, 5),
      negativeThemes: arr((raw.sentiment || {}).negativeThemes, 5),
      commonComplaint: str((raw.sentiment || {}).commonComplaint),
    },
    reviewInsights: {
      mostPraised: arr((raw.reviewInsights || {}).mostPraised, 5),
      mostCriticized: arr((raw.reviewInsights || {}).mostCriticized, 5),
    },
    recommendation: {
      verdict: str((raw.recommendation || {}).verdict),
      reasoning: str((raw.recommendation || {}).reasoning),
      bestFor: str((raw.recommendation || {}).bestFor),
    },
  };
}

module.exports = router;
module.exports.isValidAmazonUrl = isValidAmazonUrl;
