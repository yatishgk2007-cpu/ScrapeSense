/**
 * routes/overview.js
 * GET /api/overview
 */

const router = require('express').Router();
const { getAllCompetitors } = require('../services/competitorService');
const { getAllChanges } = require('../services/changeDetectionService');
const { getState } = require('../services/scraperStateMachine');
const { getHealingEvents } = require('../services/healingService');

router.get('/', async (req, res, next) => {
  try {
    const [competitors, changes, healingEvents] = await Promise.all([
      getAllCompetitors(),
      getAllChanges(),
      getHealingEvents(),
    ]);

    const scraperState = getState();

    // Determine overall health label
    const healthyCount = competitors.filter((c) => c.health >= 90).length;
    const healthPct = competitors.length > 0
      ? Math.round((healthyCount / competitors.length) * 100)
      : 0;

    const lastScrapeTime = competitors
      .map((c) => c.lastScrape)
      .filter(Boolean)
      .sort()
      .pop();

    res.json({
      competitorsTracked: competitors.length,
      changesDetected: changes.length,
      latestScrape: lastScrapeTime || null,
      scraperState: scraperState.state,
      scraperHealth: healthPct,
      healingEventsCount: healingEvents.length,
      activeHealingEvents: healingEvents.filter(
        (e) => e.status === 'HEALING' || e.status === 'FIX_PENDING'
      ).length,
      dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data',
      recentChanges: changes.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
