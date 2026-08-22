import React, { useState } from 'react';
import { GlassCard } from '../components/UI/GlassCard';
import { Badge } from '../components/UI/Badge';
import {
  Search,
  Star,
  Package,
  Loader2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Tag,
  MessageSquareWarning,
  ThumbsUp,
  Award,
  BrainCircuit,
  AlertTriangle,
} from 'lucide-react';

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

  return `₹${Number(price).toFixed(2)}`;
};

const sentimentVariant = (overall) => {
  if (!overall) return 'neutral';
  const v = overall.toLowerCase();
  if (v.includes('mostly positive') || v === 'positive') return 'success';
  if (v.includes('mostly negative') || v === 'negative') return 'danger';
  return 'warning';
};

export default function Overview() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');
  const [result, setResult] = useState(null);

  const analyze = async () => {
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter an Amazon product URL.');
      return;
    }
    if (!isValidAmazonUrl(url)) {
      setError('That does not look like a valid Amazon product URL.');
      return;
    }

    setLoading(true);
    setStage('Scraping product data…');

    try {
      const response = await fetch('/api/analyze/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok || !body.success) {
        throw new Error(body.error || 'Analysis failed');
      }

      setStage('Analyzing with Qwen 2.5…');
      // Give the spinner a beat so the user actually sees the stage change
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
          Product Intelligence
        </h1>
        <p className="text-muted">
          Paste an Amazon URL. Bright Data scrapes it; Qwen 2.5 turns it into structured insights.
        </p>
      </header>

      {/* Input */}
      <GlassCard className="p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Analyze a Product</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') analyze();
              }}
              placeholder="https://www.amazon.com/dp/…"
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-border text-white outline-none focus:border-primary-500"
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {stage || 'Working…'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-danger-400 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </GlassCard>

      {/* Loading skeleton */}
      {loading && <OverviewSkeleton />}

      {/* Results */}
      {result && !loading && <ResultDashboard result={result} />}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <GlassCard className="p-8 text-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto mb-4" />
      <p className="text-white font-semibold">Working on it…</p>
      <p className="text-muted text-sm mt-1">
        Bright Data → Ollama/Qwen 2.5 → Product Intelligence
      </p>
    </GlassCard>
  );
}

function ResultDashboard({ result }) {
  const { product, ai, aiStatus } = result;

  return (
    <div className="space-y-6">
      {/* Data-quality / fallback banner */}
      {aiStatus && aiStatus.attempted && !aiStatus.ok && (
        <FallbackBanner aiStatus={aiStatus} />
      )}

      {/* Product Overview + Price/Rating/Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Package className="w-7 h-7 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white break-words">
                  {product.name || 'Product'}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {product.brand && (
                    <Badge variant="primary">
                      <Tag className="w-3 h-3" /> {product.brand}
                    </Badge>
                  )}
                  {product.manufacturer && product.manufacturer !== product.brand && (
                    <Badge>By {product.manufacturer}</Badge>
                  )}
                  {product.modelNumber && <Badge>Model {product.modelNumber}</Badge>}
                  {product.asin && <Badge>ASIN {product.asin}</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Stat
                label="Price"
                value={formatPrice(product.price, product.currency)}
                hint={
                  product.discountPct != null
                    ? `was ${formatPrice(product.initialPrice, product.currency)} (-${product.discountPct}%)`
                    : product.availability || null
                }
              />
              <Stat
                label="Rating"
                value={
                  product.rating != null ? (
                    <span className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-warning-400 fill-warning-400" />
                      {product.rating.toFixed(1)}
                    </span>
                  ) : (
                    'N/A'
                  )
                }
                hint={
                  product.reviewCount != null
                    ? `${product.reviewCount.toLocaleString()} reviews`
                    : null
                }
              />
              <Stat
                label="Availability"
                value={product.isAvailable === false ? 'Out of stock' : product.availability || 'Available'}
                hint={
                  product.isAvailable === false
                    ? 'Currently unavailable'
                    : null
                }
              />
            </div>

            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-primary-400 hover:text-primary-300"
              >
                View on Amazon <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Data Sources</h2>
          <Source label="Bright Data" status="ok" hint="Amazon Product dataset" />
          <div className="mt-3">
            <Source
              label={`Qwen 2.5 (${aiStatus?.model || 'local'})`}
              status={aiStatus?.ok ? 'ok' : 'fallback'}
              hint={
                aiStatus?.ok
                  ? 'AI analysis complete'
                  : aiStatus?.code === 'TIMEOUT'
                    ? 'AI timeout — scraped data only'
                    : aiStatus?.code === 'NETWORK'
                      ? 'Ollama unreachable — scraped data only'
                      : 'AI unavailable — scraped data only'
              }
            />
          </div>
        </GlassCard>
      </div>

      {/* AI Summary */}
      <Section
        title="AI Summary"
        icon={BrainCircuit}
        empty={!ai}
      >
        {ai && (
          <>
            <p className="text-white leading-relaxed">{ai.summary}</p>
            {ai.category && ai.category !== 'Not available' && (
              <div className="mt-3">
                <Badge variant="primary">Category: {ai.category}</Badge>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Key Features */}
      <Section title="Key Features" icon={Sparkles} empty={!ai || ai.keyFeatures.length === 0}>
        {ai && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ai.keyFeatures.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-surface-border"
              >
                <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-white text-sm">{f}</span>
              </li>
            ))}
          </ul>
        )}
        {!ai && product.features.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.features.slice(0, 6).map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-surface-border"
              >
                <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-white text-sm">{f}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Pros / Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Pros" icon={ThumbsUp} empty={!ai || ai.pros.length === 0}>
          {ai && (
            <ul className="space-y-2">
              {ai.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white">
                  <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Cons" icon={XCircle} empty={!ai || ai.cons.length === 0}>
          {ai && (
            <ul className="space-y-2">
              {ai.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white">
                  <XCircle className="w-4 h-4 text-danger-400 mt-0.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Customer Sentiment */}
      <Section
        title="Customer Sentiment"
        icon={TrendingUp}
        empty={!ai && !(product.sentiment?.overall || product.sentiment?.positive?.length)}
      >
        {ai ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted text-sm">Overall:</span>
              <Badge variant={sentimentVariant(ai.sentiment.overall)}>
                {ai.sentiment.overall}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-success-400 mb-2">
                  Positive themes
                </p>
                {ai.sentiment.positiveThemes.length ? (
                  <div className="flex flex-wrap gap-2">
                    {ai.sentiment.positiveThemes.map((t, i) => (
                      <Badge key={i} variant="success">{t}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">Not available</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-danger-400 mb-2">
                  Negative themes
                </p>
                {ai.sentiment.negativeThemes.length ? (
                  <div className="flex flex-wrap gap-2">
                    {ai.sentiment.negativeThemes.map((t, i) => (
                      <Badge key={i} variant="danger">{t}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">Not available</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {product.sentiment?.overall && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-muted text-sm">Overall:</span>
                <Badge variant={sentimentVariant(product.sentiment.overall)}>
                  {product.sentiment.overall}
                </Badge>
              </div>
            )}
            {product.sentiment?.positive?.length ? (
              <div className="flex flex-wrap gap-2">
                {product.sentiment.positive.map((t, i) => (
                  <Badge key={i} variant="success">{t}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No sentiment signal available.</p>
            )}
          </div>
        )}
      </Section>

      {/* Review Intelligence */}
      <Section
        title="Review Intelligence"
        icon={MessageSquareWarning}
        empty={!ai && product.sentiment?.reviewInsights?.length === 0}
      >
        {(ai && (ai.reviewInsights.mostPraised.length || ai.reviewInsights.mostCriticized.length)) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-success-400 mb-3">
                Most praised
              </p>
              <ul className="space-y-2">
                {ai.reviewInsights.mostPraised.map((p, i) => (
                  <li key={i} className="text-sm text-white flex gap-2">
                    <ThumbsUp className="w-4 h-4 text-success-400 mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-danger-400 mb-3">
                Most criticized
              </p>
              <ul className="space-y-2">
                {ai.reviewInsights.mostCriticized.map((p, i) => (
                  <li key={i} className="text-sm text-white flex gap-2">
                    <XCircle className="w-4 h-4 text-danger-400 mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : product.sentiment?.reviewInsights?.length ? (
          <div className="space-y-3">
            {product.sentiment.reviewInsights.slice(0, 4).map((t, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface border border-surface-border">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white text-sm">{t.topic}</p>
                  <div className="flex gap-2 text-xs text-muted">
                    {t.mentions != null && <span>{t.mentions.toLocaleString()} mentions</span>}
                  </div>
                </div>
                {t.description && <p className="text-muted text-sm mt-1">{t.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">Not available</p>
        )}
      </Section>

      {/* Final Recommendation */}
      <Section title="AI Recommendation" icon={Award} empty={!ai}>
        {ai && (
          <div className="space-y-3">
            <p className="text-lg text-white font-semibold">{ai.recommendation.verdict}</p>
            <p className="text-muted text-sm leading-relaxed">{ai.recommendation.reasoning}</p>
            {ai.recommendation.bestFor && ai.recommendation.bestFor !== 'Not available' && (
              <Badge variant="primary">Best for: {ai.recommendation.bestFor}</Badge>
            )}
            {ai.valueAssessment && ai.valueAssessment !== 'Not available' && (
              <div className="mt-3 p-3 rounded-lg bg-surface border border-surface-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Value assessment
                </p>
                <p className="text-sm text-white">{ai.valueAssessment}</p>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, empty, children }) {
  return (
    <GlassCard className="p-6">
      <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary-400" />}
        {title}
      </h2>
      {empty ? <p className="text-muted text-sm">Not available</p> : children}
    </GlassCard>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="p-5 rounded-xl bg-surface border border-surface-border">
      <p className="text-sm text-muted mb-2">{label}</p>
      <div className="text-2xl font-bold text-white">{value}</div>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

function Source({ label, status, hint }) {
  const variant = status === 'ok' ? 'success' : 'warning';
  return (
    <div
      className={`p-4 rounded-xl border ${
        status === 'ok'
          ? 'bg-success-500/10 border-success-500/20'
          : 'bg-warning-500/10 border-warning-500/20'
      }`}
    >
      <p
        className={`font-semibold mb-1 ${status === 'ok' ? 'text-success-400' : 'text-warning-400'}`}
      >
        {status === 'ok' ? '✓' : '⚠'} {label}
      </p>
      <p className="text-sm text-muted">{hint}</p>
    </div>
  );
}

function FallbackBanner({ aiStatus }) {
  return (
    <GlassCard className="p-4 border-warning-500/30 bg-warning-500/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-warning-400 font-semibold">AI analysis is currently unavailable.</p>
          <p className="text-muted text-sm mt-1">
            Product data was successfully retrieved. Showing the structured Bright Data snapshot
            without AI insights. ({aiStatus.code || 'AI error'}: {aiStatus.error})
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
