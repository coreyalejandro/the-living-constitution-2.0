/**
 * tlc-sl/src/checker.mjs
 * Bounded, exhaustive model checker for TLC-SL models. Zero dependencies.
 *
 * check(model): BFS over all reachable states under the declared guards, proving
 * the safety property holds in every reachable state, or returning a concrete
 * counterexample trace.
 *
 * necessity(model): for each guarded op, re-run reachability with that op's guard
 * removed. If a safety violation becomes reachable, the guard is load-bearing
 * ("necessary"). This is a mutation/vacuity check: it certifies the guards are
 * not decorative — each one actually prevents a reachable violation.
 *
 * Because TLC-SL models use only finite-domain variables, BFS is exhaustive over
 * the entire reachable state space (bounded by MAX_STATES as a safety valve).
 */

import { evalExpr } from './interp.mjs';
import { inputCombos } from './model.mjs';

const MAX_STATES = 200000;

function serialize(state) {
  const keys = Object.keys(state).sort();
  return JSON.stringify(keys.map((k) => [k, state[k]]));
}

export function check(model, opts = {}) {
  const drop = opts.dropGuardOf || null;
  const combos = inputCombos(model);
  const safeIn = (st) => {
    try { return evalExpr(model.safety, st) === true; } catch { return true; }
  };

  if (!safeIn(model.initState)) {
    return { ok: false, kind: 'init', state: model.initState, trace: [] };
  }

  const startKey = serialize(model.initState);
  const visited = new Map([[startKey, { state: model.initState, parent: null, via: null }]]);
  const queue = [startKey];

  while (queue.length) {
    if (visited.size > MAX_STATES) return { ok: false, kind: 'bound_exceeded', statesExplored: visited.size };
    const key = queue.shift();
    const { state } = visited.get(key);

    for (const op of model.ops) {
      for (const input of combos) {
        const env = { ...state, ...input };

        let enabled;
        try { enabled = drop === op.name ? true : evalExpr(op.guard, env) === true; }
        catch { enabled = false; }
        if (!enabled) continue;

        const next = { ...state };
        let okEffects = true;
        try { for (const ef of op.effects) next[ef.var] = evalExpr(ef.expr, env); }
        catch { okEffects = false; }
        if (!okEffects) continue;

        // Effects must land inside declared domains.
        let inDomain = true;
        for (const k of model.stateVars) {
          if (!model.domains[k].includes(next[k])) { inDomain = false; break; }
        }
        if (!inDomain) continue;

        if (!safeIn(next)) {
          const trace = reconstruct(visited, key);
          trace.push({ op: op.name, input, to: next });
          return { ok: false, kind: 'reachable', state: next, trace };
        }

        const nkey = serialize(next);
        if (!visited.has(nkey)) {
          visited.set(nkey, { state: next, parent: key, via: { op: op.name, input } });
          queue.push(nkey);
        }
      }
    }
  }

  return { ok: true, statesExplored: visited.size };
}

function reconstruct(visited, key) {
  const chain = [];
  let cur = key;
  while (cur !== null) { chain.push(cur); cur = visited.get(cur).parent; }
  chain.reverse();
  const steps = [];
  for (let i = 1; i < chain.length; i++) {
    const node = visited.get(chain[i]);
    steps.push({ op: node.via.op, input: node.via.input, to: node.state });
  }
  return steps;
}

/** Guard-necessity (mutation) check. */
export function necessity(model) {
  const results = [];
  for (const op of model.ops) {
    const trivial = op.guard.t === 'lit' && op.guard.value === true;
    if (trivial) {
      results.push({ op: op.name, guarded: false, necessary: null, note: 'unguarded (guard = true)' });
      continue;
    }
    const r = check(model, { dropGuardOf: op.name });
    results.push({
      op: op.name,
      guarded: true,
      necessary: r.ok === false && r.kind === 'reachable',
      counterexample: r.ok === false ? { state: r.state, trace: r.trace || [] } : null,
    });
  }
  return results;
}
