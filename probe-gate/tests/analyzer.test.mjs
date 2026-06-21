import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { evalArith, DivByZero, analyzeGate, analyzeObservations } from '../src/analyzer.mjs';

const gatesDir = fileURLToPath(new URL('../gates/', import.meta.url));
const loadGate = (name) => JSON.parse(readFileSync(gatesDir + name, 'utf8'));

test('arithmetic evaluator: precedence, parens, vars, unary minus', () => {
  assert.equal(evalArith('1 + 2 * 3'), 7);
  assert.equal(evalArith('(1 + 2) * 3'), 9);
  assert.equal(evalArith('correct / total', { correct: 4, total: 5 }), 0.8);
  assert.equal(evalArith('-x + 2', { x: 3 }), -1);
});

test('arithmetic evaluator: division by zero throws DivByZero', () => {
  assert.throws(() => evalArith('1 / 0'), DivByZero);
});

test('confessed Gate 2 (identical numerator/denominator) is REJECTED', () => {
  const r = analyzeGate(loadGate('gate2-tautological.json'));
  assert.equal(r.verdict, 'REJECT');
  assert.equal(r.sensitive, false);
  assert.ok(r.reasons.some((x) => x.includes('structurally identical')));
});

test('confessed Gates 3/4 failsafe (always-perfect) is REJECTED — cannot fail', () => {
  const r = analyzeGate(loadGate('gate34-failsafe-perfect.json'));
  assert.equal(r.verdict, 'REJECT');
  assert.equal(r.canFail, false);
  assert.ok(r.reasons.some((x) => x.includes('cannot FAIL')));
});

test('a genuine accuracy gate is ACCEPTED', () => {
  const r = analyzeGate(loadGate('genuine-accuracy-gate.json'));
  assert.equal(r.verdict, 'ACCEPT');
  assert.equal(r.canPass, true);
  assert.equal(r.canFail, true);
  assert.equal(r.sensitive, true);
});

test('analyzeObservations flags a constant score stream', () => {
  const decide = { compare: '>=', threshold: 0.8 };
  assert.equal(analyzeObservations([1, 1, 1, 1], decide).verdict, 'REJECT');
  assert.equal(analyzeObservations([0.5, 0.9, 0.95], decide).verdict, 'ACCEPT');
});

test('every shipped fixture matches its expected_verdict', () => {
  for (const name of ['gate2-tautological.json', 'gate34-failsafe-perfect.json', 'genuine-accuracy-gate.json']) {
    const g = loadGate(name);
    assert.equal(analyzeGate(g).verdict, g.expected_verdict, name);
  }
});
