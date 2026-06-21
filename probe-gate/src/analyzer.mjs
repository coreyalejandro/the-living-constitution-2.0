/**
 * probe-gate/src/analyzer.mjs
 * Probe-Gate analyzer — rejects governance gates that cannot discriminate.
 *
 * Motivation: evidence/GOVERNANCE-HARNESS/VERIFICATION_AND_TRUTH.md confesses that
 * the governance-harness gates do not actually test the model:
 *   - "Gate 2 cannot fail by construction" (numerator and denominator move
 *     identically -> a fixed output).
 *   - "Gates 3 and 4 award perfect scores via a failsafe, not genuine signal"
 *     (a hardcoded value when a denominator hits zero).
 *   - "A gate that cannot fail is not a test."
 *
 * This analyzer operationalizes that statement as an enforceable invariant:
 * INV-PROBE-001 — a gate that cannot FAIL, cannot PASS, or is INSENSITIVE to its
 * inputs is REJECTED. It evaluates the gate over its entire declared (finite)
 * input domain and reports, with evidence, whether the gate can actually
 * discriminate model behavior.
 *
 * Zero dependencies. Includes a tiny arithmetic evaluator so gate score formulas
 * are data, not code.
 */

/* ----------------------- arithmetic evaluator ----------------------- */
// Grammar: expr = term (('+'|'-') term)* ; term = factor (('*'|'/') factor)*
//          factor = number | ident | '(' expr ')' | '-' factor
// Division by zero throws DivByZero so the caller can apply a declared failsafe.

export class DivByZero extends Error {}
export class ArithError extends Error {}

function tokenizeArith(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
    if ('+-*/()'.includes(c)) { toks.push({ t: c }); i++; continue; }
    if (/[0-9.]/.test(c)) {
      let n = ''; while (i < src.length && /[0-9.]/.test(src[i])) { n += src[i++]; }
      toks.push({ t: 'num', v: parseFloat(n) }); continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let id = ''; while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) { id += src[i++]; }
      toks.push({ t: 'id', v: id }); continue;
    }
    throw new ArithError(`unexpected char '${c}'`);
  }
  toks.push({ t: 'eof' });
  return toks;
}

export function evalArith(src, env = {}) {
  const toks = tokenizeArith(src);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];

  function parseExpr() {
    let v = parseTerm();
    while (peek().t === '+' || peek().t === '-') {
      const op = next().t;
      const r = parseTerm();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  function parseTerm() {
    let v = parseFactor();
    while (peek().t === '*' || peek().t === '/') {
      const op = next().t;
      const r = parseFactor();
      if (op === '*') v = v * r;
      else { if (r === 0) throw new DivByZero('division by zero'); v = v / r; }
    }
    return v;
  }
  function parseFactor() {
    const tk = peek();
    if (tk.t === '-') { next(); return -parseFactor(); }
    if (tk.t === 'num') { next(); return tk.v; }
    if (tk.t === 'id') {
      next();
      if (!(tk.v in env)) throw new ArithError(`unbound variable '${tk.v}'`);
      return env[tk.v];
    }
    if (tk.t === '(') { next(); const v = parseExpr(); if (peek().t !== ')') throw new ArithError('missing )'); next(); return v; }
    throw new ArithError(`unexpected token '${tk.t}'`);
  }

  const result = parseExpr();
  if (peek().t !== 'eof') throw new ArithError('trailing tokens');
  return result;
}

/* ----------------------- score model ----------------------- */

// A gate's score is either a direct expression, or a ratio with a failsafe used
// when the denominator is zero (this is exactly the failsafe pattern the
// VERIFICATION_AND_TRUTH statement flags).
export function scoreOf(gate, env) {
  if (gate.score !== undefined) return evalArith(gate.score, env);
  if (gate.metric) {
    const { numerator, denominator, failsafe } = gate.metric;
    let denom;
    try { denom = evalArith(denominator, env); }
    catch (e) { if (e instanceof DivByZero) return failsafe; throw e; }
    if (denom === 0) {
      if (failsafe === undefined) throw new DivByZero('denominator zero, no failsafe declared');
      return failsafe;
    }
    return evalArith(numerator, env) / denom;
  }
  throw new ArithError('gate has neither "score" nor "metric"');
}

function passes(score, decide) {
  const { compare, threshold } = decide;
  switch (compare) {
    case '>=': return score >= threshold;
    case '>': return score > threshold;
    case '<=': return score <= threshold;
    case '<': return score < threshold;
    case '==': return score === threshold;
    default: throw new ArithError(`unknown compare '${compare}'`);
  }
}

function cartesian(inputs) {
  let combos = [{}];
  for (const inp of inputs || []) {
    const next = [];
    for (const c of combos) for (const v of inp.values) next.push({ ...c, [inp.name]: v });
    combos = next;
  }
  return combos;
}

/* ----------------------- the analysis ----------------------- */

/**
 * analyzeGate(gate) -> {
 *   id, verdict:'ACCEPT'|'REJECT', reasons:[...],
 *   canPass, canFail, sensitive, distinctScores, evaluated, sampleCounterexamples
 * }
 */
export function analyzeGate(gate) {
  const env0 = { ...(gate.params || {}) };
  const combos = cartesian(gate.inputs);
  const scores = [];
  let canPass = false, canFail = false;
  const examples = { pass: null, fail: null };

  for (const c of combos) {
    const env = { ...env0, ...c };
    let score;
    try { score = scoreOf(gate, env); }
    catch (e) { if (e instanceof DivByZero) continue; throw e; }
    scores.push(score);
    if (passes(score, gate.decide)) { canPass = true; examples.pass ||= { inputs: c, score }; }
    else { canFail = true; examples.fail ||= { inputs: c, score }; }
  }

  const distinct = [...new Set(scores)];
  const sensitive = distinct.length > 1;
  const reasons = [];

  // Structural lint mirroring the confessed Gate 2 bug.
  if (gate.metric && normalize(gate.metric.numerator) === normalize(gate.metric.denominator)) {
    reasons.push('metric numerator and denominator are structurally identical -> ratio is constant (tautological gate)');
  }
  if (!canFail) reasons.push('gate cannot FAIL over its declared input domain (always passes) -> not a test');
  if (!canPass) reasons.push('gate cannot PASS over its declared input domain (always fails) -> not a usable signal');
  if (!sensitive) reasons.push(`gate score is constant (${distinct[0]}) regardless of input -> insensitive to model behavior`);
  if (scores.length === 0) reasons.push('gate produced no scores (every input hit the failsafe / div-by-zero path)');

  const verdict = (canPass && canFail && sensitive && scores.length > 0 && reasons.length === 0) ? 'ACCEPT' : 'REJECT';
  return {
    id: gate.id,
    verdict,
    reasons,
    canPass, canFail, sensitive,
    distinctScores: distinct,
    evaluated: scores.length,
    sampleCounterexamples: examples,
  };
}

function normalize(expr) {
  return String(expr).replace(/\s+/g, '');
}

/**
 * analyzeObservations(scores, decide) — same verdict from recorded outputs
 * (when you have a gate's historical scores instead of a formula).
 */
export function analyzeObservations(scores, decide) {
  const distinct = [...new Set(scores)];
  const canPass = scores.some((s) => passes(s, decide));
  const canFail = scores.some((s) => !passes(s, decide));
  const sensitive = distinct.length > 1;
  const reasons = [];
  if (!canFail) reasons.push('observed scores never FAIL -> gate cannot fail');
  if (!canPass) reasons.push('observed scores never PASS');
  if (!sensitive) reasons.push(`observed score constant (${distinct[0]})`);
  return { verdict: reasons.length ? 'REJECT' : 'ACCEPT', reasons, canPass, canFail, sensitive, distinctScores: distinct };
}
