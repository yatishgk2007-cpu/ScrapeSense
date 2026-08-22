/**
 * competitorService.js
 * Handles all competitor data access.
 * In MOCK_MODE returns realistic demo data.
 * In real mode reads from SQLite.
 */

const { dbAll, dbGet } = require('../db');
const { MOCK_COMPETITORS, MOCK_CHANGES } = require('./mockData');

const isMock = () => process.env.MOCK_MODE === 'true';

/**
 * Return all competitors.
 */
async function getAllCompetitors() {
  if (isMock()) {
    return MOCK_COMPETITORS.map((c) => ({
      id: c.id,
      name: c.name,
      url: c.url,
      status: c.status,
      health: c.health,
      lastScrape: c.lastScrape,
      planCount: c.plans.length,
      dataSource: 'mock',
    }));
  }

  const rows = await dbAll('SELECT * FROM competitors ORDER BY name ASC');
  return rows.map((r) => ({ ...r, dataSource: 'bright-data' }));
}

/**
 * Return a single competitor with full plan details.
 */
async function getCompetitorById(id) {
  if (isMock()) {
    const comp = MOCK_COMPETITORS.find((c) => c.id === Number(id));
    if (!comp) return null;
    return { ...comp, dataSource: 'mock' };
  }

  const comp = await dbGet('SELECT * FROM competitors WHERE id = ?', [id]);
  if (!comp) return null;

  const pricing = await dbAll('SELECT * FROM pricing WHERE competitor_id = ?', [id]);
  return { ...comp, plans: pricing, dataSource: 'bright-data' };
}

/**
 * Return change history for a specific competitor.
 */
async function getCompetitorHistory(id) {
  if (isMock()) {
    const changes = MOCK_CHANGES.filter((c) => c.competitor_id === Number(id));
    return changes.map((c) => ({ ...c, dataSource: 'mock' }));
  }

  const rows = await dbAll(
    'SELECT * FROM detected_changes WHERE competitor_id = ? ORDER BY detected_at DESC',
    [id]
  );
  return rows.map((r) => ({ ...r, dataSource: 'bright-data' }));
}

module.exports = { getAllCompetitors, getCompetitorById, getCompetitorHistory };
