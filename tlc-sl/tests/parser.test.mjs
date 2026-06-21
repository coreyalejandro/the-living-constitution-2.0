import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse, ParseError } from '../src/parser.mjs';

const specDir = fileURLToPath(new URL('../spec/', import.meta.url));

test('parses INV-001 into a resolved AST', () => {
  const src = readFileSync(specDir + 'INV-001-contract-before-promotion.tlcsl', 'utf8');
  const { invariants } = parse(src);
  assert.equal(invariants.length, 1);
  const inv = invariants[0];
  assert.equal(inv.id, 'INV-001');
  assert.equal(inv.level, 'BLOCK');
  assert.deepEqual(inv.init, { contract: 'none', status: 'unverified' });
  assert.ok(inv.ops.find((o) => o.name === 'PROMOTE_WORKING'));
  assert.equal(inv.safety.t, 'implies');
});

test('resolves identifiers into var vs literal correctly', () => {
  const { invariants } = parse(`invariant "X" {
    level BLOCK
    var s domain { a, b }
    init { s = a }
    op SET { guard true effect { s = b } }
    safety s = a or s = b
  }`);
  const inv = invariants[0];
  // safety: (s = a) or (s = b) — left side of each eq is var, right is literal
  const left = inv.safety.l; // (s = a)
  assert.equal(left.l.t, 'var');
  assert.equal(left.l.name, 's');
  assert.equal(left.r.t, 'lit');
  assert.equal(left.r.value, 'a');
});

test('rejects a state var with no init value', () => {
  assert.throws(() => parse(`invariant "Y" {
    level BLOCK
    var s domain { a, b }
    op N { guard true }
    safety s = a
  }`), ParseError);
});

test('rejects an effect that assigns an input variable', () => {
  assert.throws(() => parse(`invariant "Z" {
    level BLOCK
    var s domain { a, b }
    input i domain { x, y }
    init { s = a }
    op N { guard true effect { i = x } }
    safety s = a
  }`), ParseError);
});

test('rejects safety that references an input variable', () => {
  assert.throws(() => parse(`invariant "W" {
    level BLOCK
    var s domain { a, b }
    input i domain { x, y }
    init { s = a }
    op N { guard true }
    safety i = x
  }`), ParseError);
});

test('emits a warning for a literal outside a variable domain', () => {
  const { warnings } = parse(`invariant "V" {
    level BLOCK
    var s domain { a, b }
    init { s = a }
    op N { guard s = c effect { s = b } }
    safety s = a or s = b
  }`);
  assert.ok(warnings.some((w) => w.includes("literal 'c'")));
});
