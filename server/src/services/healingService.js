/**
 * healingService.js
 * Manages healing events in SQLite.
 */

const { dbAll, dbRun } = require('../db');
const { MOCK_HEALING_EVENTS } = require('./mockData');

const isMock = () => process.env.MOCK_MODE === 'true';

/**
 * Fetch all healing events, most recent first.
 */
async function getHealingEvents() {
  if (isMock()) {
    return MOCK_HEALING_EVENTS.map((e) => ({ ...e, dataSource: 'mock' }));
  }

  const rows = await dbAll(
    'SELECT * FROM healing_events ORDER BY created_at DESC LIMIT 50'
  );
  return rows.map((r) => ({ ...r, dataSource: 'bright-data' }));
}

/**
 * Persist a new healing event record.
 */
async function recordHealingEvent({ jobId, collectorId, status, errorMessage, action }) {
  return dbRun(
    `INSERT INTO healing_events (job_id, collector_id, status, error_message, action, created_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [jobId || null, collectorId || null, status, errorMessage || null, action || null]
  );
}

/**
 * Mark a healing event as completed.
 */
async function completeHealingEvent(id) {
  return dbRun(
    `UPDATE healing_events SET completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id]
  );
}

module.exports = { getHealingEvents, recordHealingEvent, completeHealingEvent };
