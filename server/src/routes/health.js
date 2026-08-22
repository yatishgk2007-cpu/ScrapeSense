/**
 * routes/health.js
 * GET /api/health
 */

const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ScrapeSense API',
    version: '3.0.0',
    mode: process.env.MOCK_MODE === 'true' ? 'mock' : 'live',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
