/**
 * routes/compare.js
 *
 * POST /api/compare/products
 *
 * Body:
 * {
 *   urls: string[]
 * }
 *
 * Flow:
 *   1. Validate Amazon URLs.
 *   2. Scrape products using Bright Data.
 *   3. Normalize product data.
 *   4. Analyze the comparison using Groq.
 *   5. Return scraped products even if AI fails.
 */

const router = require("express").Router();

const brightData = require("../services/brightDataAdapter");
const { normalizeProduct } = require("../services/normalizeService");
const ollama = require("../services/ollamaService");

const MAX_PRODUCTS = 5;
const SCRAPE_CONCURRENCY = 2;

router.post("/products", async (req, res, next) => {
  try {
    const { urls } = req.body || {};

    const list = Array.isArray(urls)
      ? urls.map((u) =>
          typeof u === "string" ? u.trim() : ""
        )
      : [];

    // Validate number of products
    if (list.length < 2) {
      return res.status(400).json({
        success: false,
        error: "At least 2 Amazon product URLs are required.",
      });
    }

    if (list.length > MAX_PRODUCTS) {
      return res.status(400).json({
        success: false,
        error: `At most ${MAX_PRODUCTS} product URLs are allowed.`,
      });
    }

    // Validate URLs
    const invalid = list
      .map((url, index) => ({ url, index }))
      .filter(({ url }) => !isValidAmazonUrl(url));

    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid Amazon URL(s) at index ${invalid
          .map((x) => x.index)
          .join(", ")}.`,
      });
    }

    // ---------------------------------------------------------
    // 1. Scrape products using Bright Data
    // ---------------------------------------------------------

    const scraped = await mapWithConcurrency(
      list,
      SCRAPE_CONCURRENCY,
      async (url) => {
        try {
          const result =
            await brightData.runCollector(url);

          if (result.success) {
            return {
              ok: true,
              url,
              data: result.data,
            };
          }

          return {
            ok: false,
            url,
            error:
              result.error ||
              "Bright Data request failed.",
          };
        } catch (error) {
          return {
            ok: false,
            url,
            error:
              error?.message ||
              "Bright Data request failed.",
          };
        }
      }
    );

    // ---------------------------------------------------------
    // 2. Normalize products
    // ---------------------------------------------------------

    const products = scraped.map((item) => {
      if (item.ok) {
        const product =
          normalizeProduct(item.data);

        return {
          url: item.url,
          ...product,
          scrapeOk: true,
          scrapeError: null,
        };
      }

      return {
        url: item.url,
        name: null,
        brand: null,
        price: null,
        currency: null,
        rating: null,
        reviewCount: null,
        features: [],
        sentiment: null,
        scrapeOk: false,
        scrapeError: item.error,
        dataQuality: "empty",
      };
    });

    // Need at least two usable products
    const usableProducts = products.filter(
      (product) =>
        product.scrapeOk &&
        product.dataQuality !== "empty"
    );

    if (usableProducts.length < 2) {
      return res.status(502).json({
        success: false,
        error:
          "Bright Data failed for too many products to produce a comparison.",
        products,
        dataSource: "bright-data",
      });
    }

    // ---------------------------------------------------------
    // 3. AI comparison
    // ---------------------------------------------------------

    const aiResult =
      await runComparison(usableProducts);

    return res.json({
      success: true,
      products,

      comparison: aiResult.ok
        ? aiResult.data
        : null,

      aiStatus: {
        attempted: true,
        ok: aiResult.ok,
        error: aiResult.ok
          ? null
          : aiResult.error,
        code: aiResult.code || null,
        model:
          aiResult.model ||
          "openai/gpt-oss-20b",
      },

      dataSource: "bright-data",
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// Amazon URL validation
// -------------------------------------------------------------

function isValidAmazonUrl(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return false;
  }

  try {
    const url = new URL(value.trim());

    const host =
      url.hostname.toLowerCase();

    return (
      /(^|\.)amazon\.(com|co\.uk|de|fr|es|it|ca|in|jp|com\.mx|com\.au|ae|sa|sg|nl|pl|se|com\.br|com\.tr)$/.test(
        host
      ) &&
      url.pathname.length > 1
    );
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// AI comparison
// -------------------------------------------------------------

async function runComparison(products) {
  const userPrompt = `
You are a product intelligence analyst comparing Amazon products.

Compare the following products using ONLY the supplied data.

PRODUCTS:

${JSON.stringify(products, null, 2)}

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not invent specifications, prices, ratings, reviews, or claims.

Rules:

- bestOverall should consider price, rating, reviews, features, and sentiment.
- bestValue should consider price relative to rating, reviews, and features.
- bestRated should use the highest available rating.
- bestFeatures should use the strongest available feature set.
- Use the product array index for all index fields.
- If something cannot be determined, use null or "Not available".

Return exactly this structure:

{
  "bestOverall": {
    "index": 0,
    "reason": "Reason for the choice"
  },
  "bestValue": {
    "index": 0,
    "reason": "Reason for the choice"
  },
  "bestRated": {
    "index": 0,
    "reason": "Reason for the choice"
  },
  "bestFeatures": {
    "index": 0,
    "reason": "Reason for the choice"
  },
  "biggestWeakness": [
    {
      "index": 0,
      "weakness": "Weakness"
    }
  ],
  "comparisonTable": {
    "priceWinnerIndex": 0,
    "ratingWinnerIndex": 0,
    "reviewWinnerIndex": 0,
    "featureWinnerIndex": 0,
    "valueWinnerIndex": 0
  },
  "aiRecommendation": {
    "verdict": "One sentence verdict",
    "reasoning": "2-3 sentence explanation",
    "whoShouldBuyWhat": [
      "Product 1 is best for...",
      "Product 2 is best for..."
    ]
  }
}
`;

  try {
    const data =
      await ollama.generateJSON(
        userPrompt,
        {
          temperature: 0.2,
        }
      );

    const safe =
      sanitizeComparison(
        data,
        products.length
      );

    return {
      ok: true,
      data: safe,
      model: "openai/gpt-oss-20b",
    };
  } catch (error) {
    console.error(
      "🔥 COMPARISON AI ERROR:",
      error
    );

    console.error(
      "🔥 MESSAGE:",
      error?.message
    );

    return {
      ok: false,
      error:
        error?.message ||
        "AI comparison failed",
      code: "AI_ERROR",
      model: "openai/gpt-oss-20b",
    };
  }
}

// -------------------------------------------------------------
// Sanitize AI comparison
// -------------------------------------------------------------

function sanitizeComparison(
  raw,
  count
) {
  const safeIndex = (value) =>
    Number.isInteger(value) &&
    value >= 0 &&
    value < count
      ? value
      : null;

  const str = (value) =>
    typeof value === "string" &&
    value.trim()
      ? value.trim()
      : "Not available";

  const biggestWeakness =
    Array.isArray(
      raw?.biggestWeakness
    )
      ? raw.biggestWeakness
          .map((item) => ({
            index: safeIndex(
              item?.index
            ),
            weakness: str(
              item?.weakness
            ),
          }))
          .filter(
            (item) =>
              item.index !== null
          )
          .slice(0, 6)
      : [];

  const table =
    raw?.comparisonTable || {};

  const recommendation =
    raw?.aiRecommendation || {};

  return {
    bestOverall: {
      index: safeIndex(
        raw?.bestOverall?.index
      ),
      reason: str(
        raw?.bestOverall?.reason
      ),
    },

    bestValue: {
      index: safeIndex(
        raw?.bestValue?.index
      ),
      reason: str(
        raw?.bestValue?.reason
      ),
    },

    bestRated: {
      index: safeIndex(
        raw?.bestRated?.index
      ),
      reason: str(
        raw?.bestRated?.reason
      ),
    },

    bestFeatures: {
      index: safeIndex(
        raw?.bestFeatures?.index
      ),
      reason: str(
        raw?.bestFeatures?.reason
      ),
    },

    biggestWeakness,

    comparisonTable: {
      priceWinnerIndex:
        safeIndex(
          table.priceWinnerIndex
        ),

      ratingWinnerIndex:
        safeIndex(
          table.ratingWinnerIndex
        ),

      reviewWinnerIndex:
        safeIndex(
          table.reviewWinnerIndex
        ),

      featureWinnerIndex:
        safeIndex(
          table.featureWinnerIndex
        ),

      valueWinnerIndex:
        safeIndex(
          table.valueWinnerIndex
        ),
    },

    aiRecommendation: {
      verdict: str(
        recommendation.verdict
      ),

      reasoning: str(
        recommendation.reasoning
      ),

      whoShouldBuyWhat:
        Array.isArray(
          recommendation.whoShouldBuyWhat
        )
          ? recommendation.whoShouldBuyWhat
              .filter(
                (item) =>
                  typeof item ===
                    "string" &&
                  item.trim()
              )
              .slice(0, 6)
          : [],
    },
  };
}

// -------------------------------------------------------------
// Concurrency helper
// -------------------------------------------------------------

async function mapWithConcurrency(
  items,
  limit,
  worker
) {
  const results =
    new Array(items.length);

  let cursor = 0;

  async function runOne() {
    const index = cursor++;

    if (index >= items.length) {
      return;
    }

    results[index] =
      await worker(
        items[index],
        index
      );

    return runOne();
  }

  const runners = Array.from(
    {
      length: Math.min(
        limit,
        items.length
      ),
    },
    runOne
  );

  await Promise.all(runners);

  return results;
}

module.exports = router;