/**
 * ScrapeSense API Server — index.js
 *
 * Mounts all Phase 3 routes and preserves the existing /api/analyze route
 * from Phase 1 for future Bright Data integration use.
 */

require('dotenv').config({
     path: require('path').join(__dirname, '../../.env') 
  });

const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');

// ── Services ─────────────────────────────────────────────────────────────────
const { runChangeDetection } = require('./services/changeDetectionService');

// ── Routes ───────────────────────────────────────────────────────────────────
const healthRoutes = require('./routes/health');
const overviewRoutes = require('./routes/overview');
const competitorsRoutes = require('./routes/competitors');
const changesRoutes = require('./routes/changes');
const scraperRoutes = require('./routes/scraper');
const healingRoutes = require('./routes/healing');
const analyzeRoutes = require('./routes/analyze');
const compareRoutes = require('./routes/compare');

const app = express();
const PORT = process.env.PORT || 3001;
const isMock = process.env.MOCK_MODE === 'true';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ── Phase 3 Routes ────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/changes', changesRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/healing', healingRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/compare', compareRoutes);

// ── Phase 1 — Amazon Analyzer Route (preserved, NOT removed) ─────────────────
// This route is kept intact for Phase 4 and future integration work.
// It is NOT part of the main ScrapeSense competitive intelligence dashboard.
app.post('/api/analyze', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'Product URL is required' });
  }

  const cleanUrl = url.split('?')[0];
  console.log('[Analyzer] Analyzing product:', cleanUrl);

 execFile(
  'C:\\Users\\csp\\AppData\\Roaming\\npm\\bdata.cmd',
  ['pipelines', 'amazon_product', cleanUrl, '--json'],
  {
    timeout: 10 * 60 * 1000,
    env: process.env,
    shell: true
  },
    (error, stdout, stderr) => {
      if (error) {
        console.error('[Analyzer] Bright Data error:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Bright Data request failed',
          details: error.message,
        });
      }

      try {
        const data = JSON.parse(stdout);
        return res.json({ success: true, source: 'Bright Data', data });
      } catch (parseError) {
        return res.status(500).json({
          success: false,
          error: 'Could not parse Bright Data response',
          raw: stdout,
        });
      }
    }
  );
});

// ── Global Error Handler ───────────────────────────────────────────────────────
// Catches errors passed via next(err) from route handlers.
// Never exposes stack traces to the client.
app.use((err, req, res, _next) => {
  console.error('[API Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── 404 Catch-All ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Startup ───────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 ScrapeSense API running on port ${PORT}`);
  console.log(`   Mode:       ${isMock ? '🎭 MOCK (demo data)' : '⚡ LIVE (Bright Data)'}`);
  console.log(`   Target URL: ${process.env.TARGET_URL || 'not set'}`);
  console.log(`   Collector:  ${process.env.BRIGHT_DATA_COLLECTOR_ID || 'not set'}`);
 console.log(
  `🤖 AI Layer: Groq (${process.env.GROQ_MODEL || 'openai/gpt-oss-20b'})`
);

  // Seed initial mock changes on startup
  try {
    await runChangeDetection();
  } catch (err) {
    console.error('[Startup] Change detection seed error:', err.message);
  }
});