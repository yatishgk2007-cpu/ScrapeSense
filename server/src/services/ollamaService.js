/**
 * ollamaService.js
 * Thin wrapper around a local Ollama daemon (qwen2.5:latest by default).
 *
 * All AI calls flow through here so the rest of the backend never
 * imports Ollama specifics. The service:
 *   • Reads OLLAMA_URL + OLLAMA_MODEL from env (with sane defaults).
 *   • Forces JSON output via Ollama's `format: "json"`.
 *   • Uses AbortController for a strict timeout (default 60s).
 *   • Returns either the parsed object or { ok:false, error }
 *     so callers can implement graceful fallback.
 */

const DEFAULT_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:latest';
const DEFAULT_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60_000);

/**
 * Build a strict system prompt that keeps the model honest
 * about not inventing product data.
 */
const SYSTEM_PROMPT = `You are a product-intelligence analyst. You are given structured product data scraped from a real e-commerce page. Your job is to summarize, classify, and synthesize ONLY information that is present in the input. If a section cannot be answered from the data, return the literal string "Not available" for that field. Never invent specifications, prices, features, or review content that the input does not contain. Always respond with strict JSON that matches the requested schema. Do not include prose, code fences, or commentary outside the JSON object.`;

/**
 * Send a single prompt to the local Ollama model and parse the JSON response.
 *
 * @param {object} opts
 * @param {string} opts.userPrompt  - the data + task to perform
 * @param {string} [opts.schema]   - optional schema hint appended to the prompt
 * @param {number} [opts.timeoutMs] - request timeout
 * @param {number} [opts.temperature] - sampling temperature (default 0.2 for stability)
 * @returns {Promise<{ok: true, data: any, raw: string, model: string} | {ok: false, error: string, code?: string}>}
 */
async function generateJSON({
  userPrompt,
  schema,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  temperature = 0.2,
} = {}) {
  if (!userPrompt || typeof userPrompt !== 'string') {
    return { ok: false, error: 'userPrompt is required', code: 'BAD_INPUT' };
  }

  const prompt = schema
    ? `${userPrompt}\n\nReturn JSON that matches this schema:\n${schema}`
    : userPrompt;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${DEFAULT_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        system: SYSTEM_PROMPT,
        format: 'json',
        stream: false,
        options: {
          temperature,
          num_ctx: 4096,
        },
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return {
        ok: false,
        error: `Ollama HTTP ${response.status}: ${text.slice(0, 200)}`,
        code: 'OLLAMA_HTTP_ERROR',
      };
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      return { ok: false, error: 'Ollama returned non-JSON envelope', code: 'BAD_ENVELOPE' };
    }

    const raw = (payload && payload.response) || '';
    if (!raw) {
      return { ok: false, error: 'Ollama returned empty response', code: 'EMPTY_RESPONSE' };
    }

    const data = safeParseJSON(raw);
    if (data === null) {
      return {
        ok: false,
        error: 'Ollama response was not valid JSON',
        code: 'BAD_JSON',
        raw,
      };
    }

    return { ok: true, data, raw, model: DEFAULT_MODEL };
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') {
      return {
        ok: false,
        error: `Ollama request timed out after ${timeoutMs}ms`,
        code: 'TIMEOUT',
      };
    }
    return {
      ok: false,
      error: `Ollama unreachable: ${err.message || String(err)}`,
      code: 'NETWORK',
    };
  }
}

/**
 * Try to parse a string as JSON. Handles the common case where a model
 * wraps JSON in ```json ... ``` fences or adds stray prose.
 *
 * Returns the parsed value, or null if parsing fails.
 */
function safeParseJSON(text) {
  if (typeof text !== 'string' || !text.trim()) return null;

  // Direct parse first
  try {
    return JSON.parse(text);
  } catch {
    /* fall through to fence-stripping */
  }

  // Strip ```json ... ``` fences (with or without language tag)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      /* fall through */
    }
  }

  // Last-ditch: locate the first { ... last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {
      /* fall through */
    }
  }

  return null;
}

/**
 * Lightweight availability check. Useful for /api/health and the frontend
 * to show "AI analysis unavailable" without performing a full inference.
 */
async function ping({ timeoutMs = 3_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${DEFAULT_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `Ollama HTTP ${res.status}` };
    const body = await res.json().catch(() => ({}));
    const models = Array.isArray(body.models) ? body.models.map((m) => m.name) : [];
    return { ok: true, models, url: DEFAULT_URL };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: err.message || String(err), url: DEFAULT_URL };
  }
}

module.exports = {
  generateJSON,
  safeParseJSON,
  ping,
  DEFAULT_URL,
  DEFAULT_MODEL,
};
