/**
 * scraperStateMachine.js
 * In-memory scraper state machine.
 * The backend is the single source of truth for the current scraper state.
 * State transitions are recorded in the healing_events SQLite table.
 */

const { dbRun } = require('../db');

// Valid states in order
const STATES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILURE_DETECTED: 'FAILURE_DETECTED',
  CHANGE_DETECTED: 'CHANGE_DETECTED',
  HEALING: 'HEALING',
  FIX_PENDING: 'FIX_PENDING',
  APPROVED: 'APPROVED',
  RECOVERED: 'RECOVERED',
};

// Initial machine state
let currentState = {
  state: STATES.IDLE,
  collectorId: process.env.BRIGHT_DATA_COLLECTOR_ID || 'mock-collector',
  lastRun: null,
  lastSuccessfulRun: null,
  failures: 0,
  errorMessage: null,
  currentJobId: null,
  history: [],
  dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data',
};

/**
 * Transition to a new state and record it.
 * @param {string} newState - One of the STATES values
 * @param {object} meta - Optional metadata (errorMessage, action, etc.)
 */
async function transition(newState, meta = {}) {
  const previous = currentState.state;
  currentState.state = newState;

  if (meta.errorMessage !== undefined) currentState.errorMessage = meta.errorMessage;
  if (meta.jobId) currentState.currentJobId = meta.jobId;

  // Track run timestamps
  if (newState === STATES.RUNNING) {
    currentState.lastRun = new Date().toISOString();
  }
  if (newState === STATES.SUCCESS || newState === STATES.RECOVERED) {
    currentState.lastSuccessfulRun = new Date().toISOString();
    currentState.failures = 0;
    currentState.errorMessage = null;
  }
  if (newState === STATES.FAILURE_DETECTED) {
    currentState.failures += 1;
  }

  // Append to in-memory history
  const entry = {
    from: previous,
    to: newState,
    at: new Date().toISOString(),
    ...meta,
  };
  currentState.history.push(entry);

  // Persist to SQLite
  try {
    await dbRun(
      `INSERT INTO healing_events (job_id, collector_id, status, error_message, action, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        currentState.currentJobId || null,
        currentState.collectorId,
        newState,
        meta.errorMessage || null,
        meta.action || `State transition: ${previous} → ${newState}`,
      ]
    );
  } catch (err) {
    // Non-fatal — log only
    console.error('[StateMachine] Failed to persist event:', err.message);
  }

  console.log(`[StateMachine] ${previous} → ${newState}`);
  return currentState;
}

/**
 * Return a snapshot of the current state (safe to send to client).
 */
function getState() {
  return {
    ...currentState,
    dataSource: process.env.MOCK_MODE === 'true' ? 'mock' : 'bright-data',
  };
}

/**
 * Reset the machine back to IDLE (useful between demo runs).
 */
async function reset() {
  currentState = {
    ...currentState,
    state: STATES.IDLE,
    failures: 0,
    errorMessage: null,
    currentJobId: null,
  };
  console.log('[StateMachine] Reset to IDLE');
}

module.exports = { STATES, getState, transition, reset };
