/**
 * routes/changes.js
 * GET /api/changes
 */

const router = require('express').Router();
const { getAllChanges } = require('../services/changeDetectionService');

router.get('/', async (req, res, next) => {
  try {
    const changes = await getAllChanges();
    res.json({ changes, dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
