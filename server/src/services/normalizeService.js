/**
 * normalizeService.js
 * Convert the wide, inconsistent Bright Data Amazon Product response
 * into a compact, predictable shape the rest of the system (AI prompts,
 * frontend cards, comparison engine) can rely on.
 *
 * Rules:
 *   • Never invent fields. Missing data becomes null / empty array.
 *   • Trim huge descriptions/features to bounded lengths so we don't
 *     drown the LLM in tokens.
 *   • Extract sentiment signals from customers_say_topics without
 *     fabricating anything that isn't there.
 */

const MAX_FEATURES = 8;
const MAX_DESCRIPTION_CHARS = 800;
const MAX_REVIEW_QUOTES = 6;
const MAX_QUOTE_CHARS = 240;
const MAX_REVIEW_TOPICS = 6;

/**
 * Normalize a single product.
 *
 * @param {object} raw - either a single Bright Data record, an array of
 *                       them (we take the first), or a wrapped envelope.
 * @returns {object} canonical Product shape
 */
function normalizeProduct(raw) {
  const record = unwrap(raw);

  if (!record || typeof record !== 'object') {
    return {
      name: null,
      brand: null,
      category: null,
      price: null,
      currency: null,
      initialPrice: null,
      discountPct: null,
      rating: null,
      reviewCount: null,
      availability: null,
      isAvailable: null,
      images: [],
      description: null,
      features: [],
      productDetails: [],
      manufacturer: null,
      modelNumber: null,
      asin: null,
      url: null,
      sentiment: {
        overall: null,
        positive: [],
        mixed: [],
        negative: [],
        reviewInsights: [],
      },
      dataQuality: 'empty',
      rawKeys: [],
    };
  }

  const name = pickString(record, ['title', 'title_clean', 'name', 'product_name']);
  const brand = pickString(record, ['brand', 'manufacturer']);
  const category = pickString(record, ['category', 'product_category']);

  const price =
    pickNumber(record, [
      'final_price',
      'buybox_prices.final_price',
      'current_price',
      'price',
    ]) ??
    pickNumber(record, ['initial_price']);

  const initialPrice = pickNumber(record, ['initial_price', 'was_price']);
  const discountPct =
    price != null && initialPrice != null && initialPrice > price
      ? Math.round(((initialPrice - price) / initialPrice) * 100)
      : null;

  const currency = pickString(record, ['currency']);
  const rating = pickNumber(record, ['rating']);
  const reviewCount = pickNumber(record, ['reviews_count', 'review_count']);
  const availability = pickString(record, ['availability']);
  const isAvailable = pickBool(record, ['is_available']);

  const images = pickStringArray(record, ['images', 'image', 'image_url']);
  const description = truncate(
    pickString(record, ['description', 'about_this_item']),
    MAX_DESCRIPTION_CHARS,
  );
  const features = truncateFeatures(pickStringArray(record, ['features']), MAX_FEATURES);
  const productDetails = pickProductDetails(record);

  const manufacturer = pickString(record, ['manufacturer']);
  const modelNumber = pickString(record, ['model_number']);
  const asin = pickString(record, ['asin', 'parent_asin']);
  const url = pickString(record, ['url']);

  const sentiment = extractSentiment(record);

  const dataQuality = computeQuality({
    name,
    price,
    rating,
    reviewCount,
    features,
  });

  return {
    name,
    brand,
    category,
    price,
    currency,
    initialPrice,
    discountPct,
    rating,
    reviewCount,
    availability,
    isAvailable,
    images,
    description,
    features,
    productDetails,
    manufacturer,
    modelNumber,
    asin,
    url,
    sentiment,
    dataQuality,
    rawKeys: Object.keys(record),
  };
}

/**
 * Normalize an array of raw products (one per Amazon URL).
 * Bad entries are still returned with dataQuality:'empty' so the UI
 * can show a per-product failure reason.
 */
function normalizeProducts(rawArray) {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(normalizeProduct);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function unwrap(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.find((r) => r && typeof r === 'object') || null;
  if (typeof raw !== 'object') return null;
  // Common Bright Data envelopes: { data: [...] }, { result: [...] }
  if (Array.isArray(raw.data)) return raw.data.find((r) => r && typeof r === 'object') || null;
  if (Array.isArray(raw.result)) return raw.result.find((r) => r && typeof r === 'object') || null;
  if (Array.isArray(raw.products)) return raw.products.find((r) => r && typeof r === 'object') || null;
  // Already a record
  return raw;
}

function pickString(obj, keys) {
  for (const k of keys) {
    const v = getPath(obj, k);
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function pickNumber(obj, keys) {
  for (const k of keys) {
    const v = getPath(obj, k);
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return null;
}

function pickBool(obj, keys) {
  for (const k of keys) {
    const v = getPath(obj, k);
    if (typeof v === 'boolean') return v;
  }
  return null;
}

function pickStringArray(obj, keys) {
  for (const k of keys) {
    const v = getPath(obj, k);
    if (Array.isArray(v)) {
      const arr = v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim());
      if (arr.length) return arr;
    } else if (typeof v === 'string' && v.trim()) {
      return [v.trim()];
    }
  }
  return [];
}

function pickProductDetails(record) {
  const details = record.product_details;
  if (!Array.isArray(details)) return [];
  return details
    .filter((d) => d && (d.type || d.name) && d.value != null)
    .map((d) => ({ name: d.type || d.name, value: String(d.value) }))
    .slice(0, 12);
}

function truncate(s, max) {
  if (!s) return null;
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

function truncateFeatures(arr, max) {
  return arr.slice(0, max).map((f) => truncate(f, 200)).filter(Boolean);
}

function extractSentiment(record) {
  const empty = {
    overall: null,
    positive: [],
    mixed: [],
    negative: [],
    reviewInsights: [],
  };

  const topics = Array.isArray(record.customers_say_topics) ? record.customers_say_topics : [];
  const keywords = (record.customers_say && record.customers_say.keywords) || {};

  const positive = unique([...(Array.isArray(keywords.positive) ? keywords.positive : [])]);
  const mixed = unique([...(Array.isArray(keywords.mixed) ? keywords.mixed : [])]);
  const negative = inferNegative(topics, positive, mixed);

  const reviewInsights = topics.slice(0, MAX_REVIEW_TOPICS).map((t) => ({
    topic: t.topic || null,
    description: truncate(t.topic_description, 200) || null,
    mentions: typeof t.mentions_count === 'number' ? t.mentions_count : null,
    positiveMentions:
      typeof t.positive_mentions_count === 'number' ? t.positive_mentions_count : null,
    negativeMentions:
      typeof t.negative_mentions_count === 'number' ? t.negative_mentions_count : null,
    sampleQuotes: Array.isArray(t.example_quotes)
      ? t.example_quotes
          .filter((q) => typeof q === 'string' && q.trim())
          .slice(0, MAX_REVIEW_QUOTES)
          .map((q) => truncate(q, MAX_QUOTE_CHARS))
      : [],
  }));

  return {
    overall: deriveOverallSentiment(topics, positive, mixed),
    positive,
    mixed,
    negative,
    reviewInsights,
  };
}

function inferNegative(topics, positive, mixed) {
  const positives = new Set([...positive, ...mixed]);
  const neg = [];
  for (const t of topics) {
    if (!t || typeof t !== 'object') continue;
    const negMentions =
      typeof t.negative_mentions_count === 'number' ? t.negative_mentions_count : 0;
    if (negMentions > 0 && !positives.has(t.topic)) {
      neg.push(t.topic);
    }
  }
  return unique(neg).slice(0, 6);
}

function deriveOverallSentiment(topics, positive, mixed) {
  const posTopics = positive.length;
  const mixedTopics = mixed.length;
  const negTopics = topics.filter(
    (t) => typeof t.negative_mentions_count === 'number' && t.negative_mentions_count > 0,
  ).length;

  if (posTopics > 0 && negTopics === 0 && mixedTopics === 0) return 'Mostly Positive';
  if (negTopics > posTopics) return 'Mostly Negative';
  if (posTopics > 0 && negTopics > 0) return 'Mixed';
  if (posTopics > 0) return 'Positive';
  return null;
}

function unique(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    if (typeof v !== 'string') continue;
    const s = v.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function getPath(obj, path) {
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function computeQuality({ name, price, rating, reviewCount, features }) {
  const filled = [name, price != null, rating != null, reviewCount != null, features.length > 0]
    .filter(Boolean).length;
  if (filled >= 4) return 'high';
  if (filled >= 2) return 'partial';
  return 'empty';
}

module.exports = { normalizeProduct, normalizeProducts };
