/**
 * routes/healing.js
 * GET /api/healing/events
 */

const router = require('express').Router();
const { getHealingEvents } = require('../services/healingService');

router.get('/events', async (req, res, next) => {
  try {
    const events = await getHealingEvents();
    res.json({ events, dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
