import React, { useState } from 'react';
import { GlassCard } from '../components/UI/GlassCard';
import { Badge } from '../components/UI/Badge';
import {
  Search,
  Plus,
  X,
  Loader2,
  Star,
  Package,
  Sparkles,
  AlertTriangle,
  Award,
  TrendingDown,
  Trophy,
  Heart,
  ShieldAlert,
  BrainCircuit,
  ExternalLink,
} from 'lucide-react';

const MAX_PRODUCTS = 5;

const isValidAmazonUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return /(?:^|\.)amazon\.(com|co\.uk|de|fr|es|it|ca|in|jp|com\.mx|com\.au|ae|sa|sg|nl|pl|se|com\.br|com\.tr)$/i.test(
      u.hostname.toLowerCase(),
    );
  } catch {
    return false;
  }
};

const formatPrice = (price, currency) => {
  if (price == null) return 'N/A';
  if (currency) return `${currency} ${Number(price).toFixed(2)}`;
  return `$${Number(price).toFixed(2)}`;
};

export default function Comparison() {
  const [urls, setUrls] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');
  const [result, setResult] = useState(null);

  const setUrlAt = (idx, value) => {
    setUrls((prev) => prev.map((u, i) => (i === idx ? value : u)));
  };

  const addSlot = () => {
    if (urls.length >= MAX_PRODUCTS) return;
    setUrls((prev) => [...prev, '']);
  };

  const removeSlot = (idx) => {
    if (urls.length <= 2) return;
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const compare = async () => {
    setError('');
    setResult(null);

    const cleaned = urls.map((u) => u.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      setError('Add at least 2 Amazon product URLs.');
      return;
    }
    if (cleaned.length > MAX_PRODUCTS) {
      setError(`Maximum ${MAX_PRODUCTS} products.`);
      return;
    }
    const bad = cleaned.findIndex((u) => !isValidAmazonUrl(u));
    if (bad !== -1) {
      setError(`URL #${bad + 1} is not a valid Amazon link.`);
      return;
    }

    setLoading(true);
    setStage('Scraping all products…');

    try {
      const response = await fetch('/api/compare/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: cleaned }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok || !body.success) {
        throw new Error(body.error || 'Comparison failed');
      }

      setStage('Asking Qwen for the verdict…');
      await new Promise((r) => setTimeout(r, 50));

      setResult(body);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setStage('');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Product Comparison
        </h1>
        <p className="text-muted">
          Add up to {MAX_PRODUCTS} Amazon URLs. Bright Data scrapes them in parallel; Qwen 2.5 produces a head-to-head.
        </p>
      </header>

      {/* Input */}
      <GlassCard className="p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Products to Compare</h2>

        <div className="space-y-3">
          {urls.map((u, i) => (
            <div key={i} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={u}
                  onChange={(e) => setUrlAt(i, e.target.value)}
                  placeholder={`Product ${i + 1} Amazon URL`}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-border text-white outline-none focus:border-primary-500"
                />
              </div>
              {urls.length > 2 && (
                <button
                  onClick={() => removeSlot(i)}
                  className="px-3 rounded-lg bg-surface border border-surface-border text-muted hover:text-white hover:border-danger-500/40 transition-colors"
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={addSlot}
            disabled={urls.length >= MAX_PRODUCTS}
            className="px-4 py-2 rounded-lg bg-surface border border-surface-border text-white hover:border-primary-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>

          <button
            onClick={compare}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {stage || 'Working…'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Compare Products
              </>
            )}
          </button>

          <span className="text-xs text-muted">
            {urls.length} / {MAX_PRODUCTS} slots
          </span>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-danger-400 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </GlassCard>

      {loading && (
        <GlassCard className="p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-white font-semibold">{stage}</p>
          <p className="text-muted text-sm mt-1">
            Bright Data → Ollama/Qwen 2.5 → Comparison
          </p>
        </GlassCard>
      )}

      {result && !loading && <ComparisonDashboard result={result} />}
    </div>
  );
}

function ComparisonDashboard({ result }) {
  const { products, comparison, aiStatus } = result;
  const aiOk = aiStatus?.ok;

  return (
    <div className="space-y-6">
      {aiStatus && aiStatus.attempted && !aiStatus.ok && (
        <GlassCard className="p-4 border-warning-500/30 bg-warning-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-warning-400 font-semibold">AI comparison unavailable.</p>
              <p className="text-muted text-sm mt-1">
                Showing scraped data side-by-side. ({aiStatus.code || 'AI error'}: {aiStatus.error})
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Product cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-${Math.min(products.length, 3)} gap-6`}>
        {products.map((p, idx) => (
          <ProductCard
            key={idx}
            product={p}
            index={idx}
            winnerIndexes={aiOk ? winnerIndexesFor(comparison, idx) : {}}
          />
        ))}
      </div>

      {/* Comparison table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-surface-border bg-surface/30">
          <h2 className="font-display font-semibold text-lg text-white">Side-by-Side</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-surface-border text-xs uppercase tracking-wider text-muted">
                <th className="p-4 font-semibold">Field</th>
                {products.map((_, i) => (
                  <th key={i} className="p-4 font-semibold">Product {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              <Row
                label="Price"
                cells={products.map((p) => formatPrice(p.price, p.currency))}
                winnerIdx={aiOk ? comparison?.comparisonTable?.priceWinnerIndex : lowestPriceIdx(products)}
              />
              <Row
                label="Rating"
                cells={products.map((p) => (p.rating != null ? `${p.rating.toFixed(1)} ★` : 'N/A'))}
                winnerIdx={aiOk ? comparison?.comparisonTable?.ratingWinnerIndex : highestRatingIdx(products)}
              />
              <Row
                label="Reviews"
                cells={products.map((p) => (p.reviewCount != null ? p.reviewCount.toLocaleString() : 'N/A'))}
                winnerIdx={aiOk ? comparison?.comparisonTable?.reviewWinnerIndex : highestReviewIdx(products)}
              />
              <Row
                label="Brand"
                cells={products.map((p) => p.brand || 'N/A')}
              />
              <Row
                label="Key Features"
                cells={products.map((p) => (p.features?.length ? `${p.features.length} listed` : 'N/A'))}
                winnerIdx={aiOk ? comparison?.comparisonTable?.featureWinnerIndex : mostFeaturesIdx(products)}
              />
              <Row
                label="Sentiment"
                cells={products.map((p) => p.sentiment?.overall || 'N/A')}
              />
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* AI verdict */}
      {aiOk && comparison && <AIVerdict comparison={comparison} count={products.length} />}

      {/* Biggest weakness (per product, AI) */}
      {aiOk && comparison?.biggestWeakness?.length > 0 && (
        <GlassCard className="p-6">
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-warning-400" />
            Biggest Weakness per Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparison.biggestWeakness.map((w, i) => {
              const product = products[w.index];
              return (
                <div key={i} className="p-4 rounded-lg bg-surface border border-surface-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                    {product?.name || `Product ${w.index + 1}`}
                  </p>
                  <p className="text-sm text-white">{w.weakness}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function ProductCard({ product, index, winnerIndexes }) {
  if (!product.scrapeOk) {
    return (
      <GlassCard className="p-6 border-danger-500/30">
        <div className="flex items-center gap-2 text-danger-400 font-semibold mb-2">
          <AlertTriangle className="w-4 h-4" />
          Product {index + 1} — scrape failed
        </div>
        <p className="text-muted text-sm break-all">{product.url}</p>
        <p className="text-muted text-xs mt-2">{product.scrapeError}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted">Product {index + 1}</p>
          <h3 className="text-lg font-bold text-white break-words">{product.name || 'Product'}</h3>
          {product.brand && (
            <Badge variant="primary" className="mt-1">
              {product.brand}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Mini
          label="Price"
          value={formatPrice(product.price, product.currency)}
          highlight={winnerIndexes.price}
        />
        <Mini
          label="Rating"
          value={
            product.rating != null ? (
              <span className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-warning-400 fill-warning-400" />
                {product.rating.toFixed(1)}
              </span>
            ) : (
              'N/A'
            )
          }
          highlight={winnerIndexes.rating}
        />
        <Mini
          label="Reviews"
          value={product.reviewCount != null ? product.reviewCount.toLocaleString() : 'N/A'}
          highlight={winnerIndexes.review}
        />
      </div>

      {product.url && (
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs mt-4"
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </GlassCard>
  );
}

function Mini({ label, value, highlight }) {
  return (
    <div
      className={`p-2 rounded-lg text-center ${
        highlight ? 'bg-primary-500/10 border border-primary-500/40' : 'bg-surface border border-surface-border'
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Row({ label, cells, winnerIdx }) {
  return (
    <tr className="hover:bg-surface-hover/40">
      <td className="p-4 font-medium text-muted">{label}</td>
      {cells.map((c, i) => (
        <td
          key={i}
          className={`p-4 text-white ${winnerIdx === i ? 'bg-primary-500/10 font-semibold' : ''}`}
        >
          {c}
          {winnerIdx === i && <Trophy className="inline-block w-3 h-3 ml-2 text-primary-400" />}
        </td>
      ))}
    </tr>
  );
}

function AIVerdict({ comparison, count }) {
  const pick = (entry) => {
    if (!entry || entry.index == null || entry.index < 0 || entry.index >= count) return null;
    return { idx: entry.index, reason: entry.reason };
  };
  const overall = pick(comparison.bestOverall);
  const value = pick(comparison.bestValue);
  const rated = pick(comparison.bestRated);
  const featured = pick(comparison.bestFeatures);

  return (
    <GlassCard className="p-6">
      <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-primary-400" />
        AI Verdict
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <VerdictBadge
          icon={Award}
          title="Best Overall"
          pick={overall}
        />
        <VerdictBadge icon={TrendingDown} title="Best Value" pick={value} />
        <VerdictBadge icon={Star} title="Best Rated" pick={rated} />
        <VerdictBadge icon={Sparkles} title="Best Features" pick={featured} />
      </div>

      {comparison.aiRecommendation && (
        <div className="p-4 rounded-xl bg-surface border border-primary-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary-400" />
            <p className="font-display font-bold text-white">Recommendation</p>
          </div>
          <p className="text-white font-semibold">{comparison.aiRecommendation.verdict}</p>
          <p className="text-muted text-sm mt-1 leading-relaxed">
            {comparison.aiRecommendation.reasoning}
          </p>

          {comparison.aiRecommendation.whoShouldBuyWhat?.length > 0 && (
            <ul className="mt-3 space-y-1">
              {comparison.aiRecommendation.whoShouldBuyWhat.map((b, i) => (
                <li key={i} className="text-sm text-white flex gap-2">
                  <span className="text-primary-400">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </GlassCard>
  );
}

function VerdictBadge({ icon: Icon, title, pick }) {
  if (!pick) {
    return (
      <div className="p-4 rounded-xl bg-surface border border-surface-border">
        <div className="flex items-center gap-2 text-muted text-sm">
          <Icon className="w-4 h-4" />
          {title}
        </div>
        <p className="text-muted text-sm mt-2">Not available</p>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-xl bg-surface border border-primary-500/30">
      <div className="flex items-center gap-2 text-primary-400 text-sm font-semibold mb-1">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <p className="text-white text-sm">
        Product {pick.idx + 1}
      </p>
      <p className="text-muted text-xs mt-1">{pick.reason}</p>
    </div>
  );
}

// ─── Fallback winners (when AI is down) ─────────────────────────────────────

function lowestPriceIdx(products) {
  let best = -1;
  let bestVal = Infinity;
  products.forEach((p, i) => {
    if (typeof p.price === 'number' && p.price < bestVal) {
      bestVal = p.price;
      best = i;
    }
  });
  return best === -1 ? null : best;
}
function highestRatingIdx(products) {
  let best = -1;
  let bestVal = -Infinity;
  products.forEach((p, i) => {
    if (typeof p.rating === 'number' && p.rating > bestVal) {
      bestVal = p.rating;
      best = i;
    }
  });
  return best === -1 ? null : best;
}
function highestReviewIdx(products) {
  let best = -1;
  let bestVal = -Infinity;
  products.forEach((p, i) => {
    if (typeof p.reviewCount === 'number' && p.reviewCount > bestVal) {
      bestVal = p.reviewCount;
      best = i;
    }
  });
  return best === -1 ? null : best;
}
function mostFeaturesIdx(products) {
  let best = -1;
  let bestVal = -Infinity;
  products.forEach((p, i) => {
    const n = Array.isArray(p.features) ? p.features.length : 0;
    if (n > bestVal) {
      bestVal = n;
      best = i;
    }
  });
  return best === -1 ? null : best;
}

function winnerIndexesFor(comparison, idx) {
  const ct = comparison?.comparisonTable || {};
  return {
    price: ct.priceWinnerIndex === idx,
    rating: ct.ratingWinnerIndex === idx,
    review: ct.reviewWinnerIndex === idx,
  };
}
