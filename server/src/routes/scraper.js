/**
 * routes/scraper.js
 * GET  /api/scraper/health
 * POST /api/scraper/run
 * POST /api/scraper/heal
 * POST /api/scraper/approve
 */

const router = require('express').Router();
const { getState } = require('../services/scraperStateMachine');
const { runScrape, triggerHeal, approveHeal } = require('../services/scrapeService');
const { getHealingEvents } = require('../services/healingService');

// GET /api/scraper/health
router.get('/health', async (req, res, next) => {
  try {
    const state = getState();
    const healingEvents = await getHealingEvents();

    res.json({
      collectorId: state.collectorId,
      collectorStatus: state.state === 'IDLE' || state.state === 'SUCCESS' || state.state === 'RECOVERED'
        ? 'healthy'
        : state.state === 'RUNNING'
        ? 'running'
        : ['FAILURE_DETECTED', 'CHANGE_DETECTED'].includes(state.state)
        ? 'degraded'
        : ['HEALING', 'FIX_PENDING'].includes(state.state)
        ? 'healing'
        : 'unknown',
      currentState: state.state,
      lastRun: state.lastRun,
      lastSuccessfulRun: state.lastSuccessfulRun,
      failures: state.failures,
      errorMessage: state.errorMessage,
      healingEvents: healingEvents.slice(0, 10),
      healingEventsCount: healingEvents.length,
      dataSource: state.dataSource,
      targetUrl: process.env.TARGET_URL || 'https://www.notion.com/pricing',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/scraper/run
router.post('/run', async (req, res, next) => {
  try {
    const result = await runScrape();
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json({
      message: 'Scrape initiated',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/scraper/heal
router.post('/heal', async (req, res, next) => {
  try {
    const result = await triggerHeal();
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json({
      message: 'Healing initiated',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/scraper/approve
router.post('/approve', async (req, res, next) => {
  try {
    const result = await approveHeal();
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json({
      message: 'Fix approved',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
