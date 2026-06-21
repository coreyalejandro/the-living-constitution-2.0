/**
 * tlc-sl/src/enforce.mjs
 * Runtime enforcement loader. Loads compiled TLC-SL models and evaluates actions.
 * This is what the Policy Engine uses to enforce constitutional invariants from
 * the same source the model checker verifies.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide } from './interp.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_MODELS_DIR = resolve(__dirname, '..', 'generated', 'models');

/** Load compiled model JSON files from a directory. */
export function loadModels(modelsDir = DEFAULT_MODELS_DIR) {
  if (!existsSync(modelsDir)) return [];
  return readdirSync(modelsDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(modelsDir, f), 'utf8')));
}

/** Wrap models as evaluator objects suitable for the Policy Engine. */
export function makeEvaluators(models) {
  return models.map((m) => ({
    id: m.id,
    level: m.level,
    title: m.title,
    evaluate: (action) => decide(m, action),
  }));
}

/** Convenience: load + wrap in one call. */
export function loadInvariants(modelsDir = DEFAULT_MODELS_DIR) {
  return makeEvaluators(loadModels(modelsDir));
}

/**
 * Evaluate an action against a set of evaluators.
 * Returns { decision:'ALLOW'|'WARN'|'BLOCK', halts:[id], warnings:[id], reasons:[str] }.
 */
export function evaluateAll(evaluators, action) {
  const halts = [];
  const warnings = [];
  const reasons = [];
  for (const ev of evaluators) {
    const r = ev.evaluate(action);
    if (r && r.applies && r.allowed === false) {
      reasons.push(r.reason);
      if (ev.level === 'BLOCK') halts.push(ev.id);
      else if (ev.level === 'WARN') warnings.push(ev.id);
    }
  }
  const decision = halts.length ? 'BLOCK' : warnings.length ? 'WARN' : 'ALLOW';
  return { decision, halts, warnings, reasons };
}
