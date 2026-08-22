/**
 * routes/competitors.js
 * GET /api/competitors
 * GET /api/competitors/:id
 * GET /api/competitors/:id/history
 */

const router = require('express').Router();
const {
  getAllCompetitors,
  getCompetitorById,
  getCompetitorHistory,
} = require('../services/competitorService');

// GET /api/competitors
router.get('/', async (req, res, next) => {
  try {
    const competitors = await getAllCompetitors();
    res.json({ competitors, dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data' });
  } catch (err) {
    next(err);
  }
});

// GET /api/competitors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const competitor = await getCompetitorById(req.params.id);
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json({ competitor });
  } catch (err) {
    next(err);
  }
});

// GET /api/competitors/:id/history
router.get('/:id/history', async (req, res, next) => {
  try {
    const history = await getCompetitorHistory(req.params.id);
    res.json({ history, dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
