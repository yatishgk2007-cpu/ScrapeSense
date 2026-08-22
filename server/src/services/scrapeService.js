/**
 * scrapeService.js
 * Orchestrates the scrape lifecycle: run → failure → heal → approve.
 *
 * MOCK_MODE=true  → uses the in-memory state machine with simulated delays
 * MOCK_MODE=false → delegates to brightDataAdapter (Phase 4)
 */

const { randomUUID } = require('crypto');
const uuidv4 = () => randomUUID();
const { STATES, getState, transition, reset } = require('./scraperStateMachine');
const brightData = require('./brightDataAdapter');
const { dbRun } = require('../db');

const isMock = () => process.env.MOCK_MODE === 'true';

/**
 * Helper: non-blocking sleep (used for mock simulations only).
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── MOCK implementations ──────────────────────────────────────────────────────

async function mockRun() {
  const state = getState();

  // Allow re-running from IDLE or after RECOVERED
  if (![STATES.IDLE, STATES.RECOVERED, STATES.SUCCESS].includes(state.state)) {
    await reset();
  }

  const jobId = `mock-job-${uuidv4().slice(0, 8)}`;

  await transition(STATES.RUNNING, {
    jobId,
    action: '[MOCK] Simulated scraper run started',
  });

  // Persist the job to scrape_jobs
  try {
    await dbRun(
      `INSERT OR IGNORE INTO scrape_jobs (id, status, created_at, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [jobId, 'RUNNING']
    );
  } catch (_) {}

  // Simulate async work: after 1.5s → FAILURE_DETECTED (to demo healing flow)
  setTimeout(async () => {
    await transition(STATES.FAILURE_DETECTED, {
      errorMessage: 'CSS selector .pricing-table-v2 not found — DOM structure changed',
      action: '[MOCK] Scraper failure detected',
    });

    try {
      await dbRun(
        `UPDATE scrape_jobs SET status = 'FAILURE_DETECTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [jobId]
      );
    } catch (_) {}
  }, 1500);

  return { jobId, dataSource: 'mock' };
}

async function mockHeal() {
  const state = getState();

  if (state.state !== STATES.FAILURE_DETECTED) {
    return { error: `Cannot heal from state: ${state.state}` };
  }

  await transition(STATES.CHANGE_DETECTED, {
    action: '[MOCK] DOM changes analysed',
  });

  await sleep(600);

  await transition(STATES.HEALING, {
    action: '[MOCK] Bright Data Studio proposing new selectors',
  });

  await sleep(800);

  await transition(STATES.FIX_PENDING, {
    action: '[MOCK] Fix ready — awaiting approval',
  });

  return { dataSource: 'mock' };
}

async function mockApprove() {
  const state = getState();

  if (state.state !== STATES.FIX_PENDING) {
    return { error: `Cannot approve from state: ${state.state}` };
  }

  await transition(STATES.APPROVED, {
    action: '[MOCK] Fix approved by operator',
  });

  await sleep(600);

  await transition(STATES.RECOVERED, {
    action: '[MOCK] Scraper recovered — re-running with repaired selectors',
  });

  return { dataSource: 'mock' };
}

// ── Real implementations (Phase 4) ────────────────────────────────────────────

async function realRun() {
  const jobId = `bd-job-${uuidv4().slice(0, 8)}`;

  await transition(STATES.RUNNING, { jobId, action: 'Bright Data collector started' });

  const result = await brightData.runCollector();

  if (result.success) {
    await transition(STATES.SUCCESS, { action: 'Bright Data collector completed' });

    // Persist raw results
    try {
      await dbRun(
        `INSERT INTO scrape_results (job_id, data, created_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [jobId, JSON.stringify(result.data)]
      );
    } catch (_) {}

    return { jobId, dataSource: 'bright-data', data: result.data };
  } else {
    await transition(STATES.FAILURE_DETECTED, {
      errorMessage: result.error,
      action: 'Bright Data collector failed',
    });
    return { jobId, error: result.error, dataSource: 'bright-data' };
  }
}

async function realHeal() {
  const state = getState();
  const description = state.errorMessage || 'Scraper encountered an unexpected failure';

  await transition(STATES.CHANGE_DETECTED, { action: 'Analysing DOM changes' });

  const result = await brightData.healCollector(description);

  if (result.success) {
    await transition(STATES.HEALING, { action: 'Heal command submitted to Bright Data' });
    await transition(STATES.FIX_PENDING, { action: 'Waiting for fix approval' });
    return { dataSource: 'bright-data' };
  } else {
    return { error: result.error, dataSource: 'bright-data' };
  }
}

async function realApprove() {
  const result = await brightData.approveHealing();

  if (result.success) {
    await transition(STATES.APPROVED, { action: 'Healing fix approved' });

    // Re-run the same Collector ID after approval
    setTimeout(async () => {
      const reRunResult = await brightData.runCollector();
      if (reRunResult.success) {
        await transition(STATES.RECOVERED, { action: 'Collector re-run successful after healing' });
      }
    }, 2000);

    return { dataSource: 'bright-data', collectorId: brightData.COLLECTOR_ID };
  } else {
    return { error: result.error, dataSource: 'bright-data' };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

async function runScrape() {
  return isMock() ? mockRun() : realRun();
}

async function triggerHeal() {
  return isMock() ? mockHeal() : realHeal();
}

async function approveHeal() {
  return isMock() ? mockApprove() : realApprove();
}

module.exports = { runScrape, triggerHeal, approveHeal };
