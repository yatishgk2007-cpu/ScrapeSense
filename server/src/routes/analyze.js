/**
 * routes/analyze.js
 *
 * POST /api/analyze/product
 *
 * Body: { url: string, options?: { skipAI?: boolean } }
 */

const router = require("express").Router();

const brightData = require("../services/brightDataAdapter");
const { normalizeProduct } = require("../services/normalizeService");
const ollama = require("../services/ollamaService");

function isValidAmazonUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const u = new URL(value.trim());
    const host = u.hostname.toLowerCase();

    return (
      /(^|\.)amazon\.(com|co\.uk|de|fr|es|it|ca|in|jp|com\.mx|com\.au|ae|sa|sg|nl|pl|se|com\.br|com\.tr)$/.test(
        host
      ) && u.pathname.length > 1
    );
  } catch {
    return false;
  }
}

router.post("/product", async (req, res, next) => {
  try {
    const { url, options } = req.body || {};
    const skipAI = !!(options && options.skipAI);

    if (!url || !isValidAmazonUrl(url)) {
      return res.status(400).json({
        success: false,
        error: "A valid Amazon product URL is required.",
      });
    }

    // 1. Scrape using Bright Data
    const scrapeResult = await brightData.runCollector(url.trim());

    if (!scrapeResult.success) {
      return res.status(502).json({
        success: false,
        error: "Unable to retrieve product data.",
        details:
          scrapeResult.error || "Bright Data request failed.",
        dataSource: "bright-data",
      });
    }

    // 2. Normalize product data
    const product = normalizeProduct(scrapeResult.data);

    if (!product.name && product.dataQuality === "empty") {
      return res.status(502).json({
        success: false,
        error: "Bright Data returned an empty product payload.",
        product,
        dataSource: "bright-data",
      });
    }

    // 3. Skip AI if requested
    if (skipAI) {
      return res.json({
        success: true,
        product,
        ai: null,
        aiStatus: {
          attempted: false,
          reason: "skipAI=true",
        },
        dataSource: "bright-data",
      });
    }

    // 4. AI analysis
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
        model:
          aiResult.model ||
          ollama.DEFAULT_MODEL ||
          "openai/gpt-oss-20b",
      },
      dataSource: "bright-data",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Run AI product intelligence.
 */
async function runProductIntelligence(product) {
  const userPrompt = `
Analyze the following Amazon product and produce product-intelligence JSON.

PRODUCT DATA:

${JSON.stringify(product, null, 2)}

Rules:

- Use ONLY information present in the product data above.
- Do not invent specifications, prices, or review content.
- If information is unavailable, use "Not available".
- Base pros and cons on the available rating, review count, sentiment, and features.
- Base the value assessment on price, rating, reviews, and features.
- Return ONLY valid JSON.
- No markdown.
- No code fences.

Return this structure:

{
  "summary": "2-3 sentence product overview",
  "category": "Product category",
  "keyFeatures": [],
  "pros": [],
  "cons": [],
  "valueAssessment": "Short value assessment",
  "sentiment": {
    "overall": "Positive",
    "positiveThemes": [],
    "negativeThemes": [],
    "commonComplaint": "Not available"
  },
  "reviewInsights": {
    "mostPraised": [],
    "mostCriticized": []
  },
  "recommendation": {
    "verdict": "One sentence verdict",
    "reasoning": "2-3 sentence explanation",
    "bestFor": "Target user"
  }
}
`;

  try {
    const data = await ollama.generateJSON(userPrompt, {
      temperature: 0.2,
    });

    const safe = sanitizeIntelligence(data);

    return {
      ok: true,
      data: safe,
      model:
        ollama.DEFAULT_MODEL ||
        "openai/gpt-oss-20b",
    };
  } catch (error) {
    console.error("🔥 AI ANALYSIS ERROR:", error);
    console.error("🔥 MESSAGE:", error?.message);

    return {
      ok: false,
      error:
        error?.message ||
        "AI analysis failed",
      code: "AI_ERROR",
      model:
        ollama.DEFAULT_MODEL ||
        "openai/gpt-oss-20b",
    };
  }
}

function sanitizeIntelligence(raw) {
  const arr = (value, limit) =>
    Array.isArray(value)
      ? value
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim()
          )
          .slice(0, limit)
      : [];

  const str = (value) =>
    typeof value === "string" && value.trim()
      ? value.trim()
      : "Not available";

  return {
    summary: str(raw?.summary),

    category: str(raw?.category),

    keyFeatures: arr(raw?.keyFeatures, 6),

    pros: arr(raw?.pros, 6),

    cons: arr(raw?.cons, 6),

    valueAssessment: str(
      raw?.valueAssessment
    ),

    sentiment: {
      overall: str(
        raw?.sentiment?.overall
      ),

      positiveThemes: arr(
        raw?.sentiment?.positiveThemes,
        5
      ),

      negativeThemes: arr(
        raw?.sentiment?.negativeThemes,
        5
      ),

      commonComplaint: str(
        raw?.sentiment?.commonComplaint
      ),
    },

    reviewInsights: {
      mostPraised: arr(
        raw?.reviewInsights?.mostPraised,
        5
      ),

      mostCriticized: arr(
        raw?.reviewInsights?.mostCriticized,
        5
      ),
    },

    recommendation: {
      verdict: str(
        raw?.recommendation?.verdict
      ),

      reasoning: str(
        raw?.recommendation?.reasoning
      ),

      bestFor: str(
        raw?.recommendation?.bestFor
      ),
    },
  };
}

module.exports = router;
module.exports.isValidAmazonUrl =
  isValidAmazonUrl;