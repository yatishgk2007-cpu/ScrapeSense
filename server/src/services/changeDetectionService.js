/**
 * changeDetectionService.js
 * Compares current vs previous pricing snapshots and detects changes.
 * Stores results in the detected_changes SQLite table.
 */

const { dbRun, dbAll } = require('../db');
const { MOCK_COMPETITORS, MOCK_PREVIOUS_SNAPSHOTS, MOCK_CHANGES } = require('./mockData');

const isMock = () => process.env.MOCK_MODE === 'true';

/**
 * Detect changes between two pricing plan arrays.
 * @param {Array} previousPlans
 * @param {Array} currentPlans
 * @param {number} competitorId
 * @returns {Array} detected change objects
 */
function detectPricingChanges(previousPlans, currentPlans, competitorId) {
  const changes = [];

  const prevMap = Object.fromEntries(previousPlans.map((p) => [p.name, p]));
  const currMap = Object.fromEntries(currentPlans.map((p) => [p.name, p]));

  // PLAN_REMOVED — in prev but not in curr
  for (const name of Object.keys(prevMap)) {
    if (!currMap[name]) {
      changes.push({
        competitor_id: competitorId,
        change_type: 'PLAN_REMOVED',
        field_name: name,
        old_value: prevMap[name].price != null ? `$${prevMap[name].price}/month` : 'Custom',
        new_value: null,
      });
    }
  }

  // PLAN_ADDED — in curr but not in prev
  for (const name of Object.keys(currMap)) {
    if (!prevMap[name]) {
      changes.push({
        competitor_id: competitorId,
        change_type: 'PLAN_ADDED',
        field_name: name,
        old_value: null,
        new_value: currMap[name].price != null ? `$${currMap[name].price}/month` : 'Custom pricing',
      });
    }
  }

  // PRICE_CHANGED / LIMIT_CHANGED for plans present in both
  for (const name of Object.keys(currMap)) {
    if (!prevMap[name]) continue;

    const prev = prevMap[name];
    const curr = currMap[name];

    if (prev.price !== curr.price && prev.price != null && curr.price != null) {
      changes.push({
        competitor_id: competitorId,
        change_type: 'PRICE_CHANGED',
        field_name: `${name} plan monthly price`,
        old_value: `$${prev.price}/month`,
        new_value: `$${curr.price}/month`,
      });
    }

    // FEATURE_ADDED / FEATURE_REMOVED
    if (prev.features && curr.features) {
      const prevFeats = new Set(prev.features);
      const currFeats = new Set(curr.features);

      for (const feat of currFeats) {
        if (!prevFeats.has(feat)) {
          changes.push({
            competitor_id: competitorId,
            change_type: 'FEATURE_ADDED',
            field_name: `${name} plan`,
            old_value: null,
            new_value: feat,
          });
        }
      }

      for (const feat of prevFeats) {
        if (!currFeats.has(feat)) {
          changes.push({
            competitor_id: competitorId,
            change_type: 'FEATURE_REMOVED',
            field_name: `${name} plan`,
            old_value: feat,
            new_value: null,
          });
        }
      }
    }

    // LIMIT_CHANGED
    if (prev.limits && curr.limits) {
      for (const limitKey of Object.keys(curr.limits)) {
        if (prev.limits[limitKey] !== curr.limits[limitKey]) {
          changes.push({
            competitor_id: competitorId,
            change_type: 'LIMIT_CHANGED',
            field_name: `${name} ${limitKey} limit`,
            old_value: String(prev.limits[limitKey] ?? 'N/A'),
            new_value: String(curr.limits[limitKey] ?? 'N/A'),
          });
        }
      }
    }
  }

  return changes;
}

/**
 * Run change detection for all competitors and persist results.
 * In MOCK_MODE, seeds the pre-defined mock changes.
 */
async function runChangeDetection() {
  if (isMock()) {
    // Seed mock changes into the DB (skip if already seeded)
    const existing = await dbAll('SELECT id FROM detected_changes LIMIT 1');
    if (existing.length > 0) {
      console.log('[ChangeDetection] Mock changes already seeded.');
      return;
    }

    for (const change of MOCK_CHANGES) {
      await dbRun(
        `INSERT INTO detected_changes (competitor_id, change_type, field_name, old_value, new_value, detected_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          change.competitor_id,
          change.change_type,
          change.field_name,
          change.old_value,
          change.new_value,
          change.detected_at,
        ]
      );
    }
    console.log(`[ChangeDetection] Seeded ${MOCK_CHANGES.length} mock changes.`);
    return;
  }

  // Real mode: diff current vs previous snapshots
  for (const competitor of MOCK_COMPETITORS) {
    const previous = MOCK_PREVIOUS_SNAPSHOTS[competitor.id];
    if (!previous) continue;

    const changes = detectPricingChanges(
      previous.plans,
      competitor.plans,
      competitor.id
    );

    for (const change of changes) {
      await dbRun(
        `INSERT INTO detected_changes (competitor_id, change_type, field_name, old_value, new_value)
         VALUES (?, ?, ?, ?, ?)`,
        [change.competitor_id, change.change_type, change.field_name, change.old_value, change.new_value]
      );
    }

    if (changes.length > 0) {
      console.log(`[ChangeDetection] ${changes.length} changes detected for competitor ${competitor.id}`);
    }
  }
}

/**
 * Fetch all stored changes, enriched with competitor name.
 */
async function getAllChanges() {
  if (isMock()) {
    return MOCK_CHANGES.map((c) => ({ ...c, dataSource: 'mock' }));
  }

  const rows = await dbAll(
    `SELECT dc.*, c.name AS competitorName
     FROM detected_changes dc
     LEFT JOIN competitors c ON dc.competitor_id = c.id
     ORDER BY dc.detected_at DESC`
  );
  return rows.map((r) => ({ ...r, dataSource: 'bright-data' }));
}

module.exports = { runChangeDetection, getAllChanges, detectPricingChanges };
