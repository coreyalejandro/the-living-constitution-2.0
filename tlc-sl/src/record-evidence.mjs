#!/usr/bin/env node
/**
 * tlc-sl/src/record-evidence.mjs
 * Records TLC-SL verification results to the evidence hash-chain.
 *
 * Uses the repo's existing append-only, SHA-256-chained audit writer
 * (src/core/audit.mjs), so the verification of the constitution's invariants is
 * itself governed evidence (Invariant I2: claims need evidence). Re-runnable;
 * each run appends new entries and never modifies prior ones (Article V.4).
 *
 * Output: evidence/TLC-SL/verification.jsonl
 */

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendAuditEntry } from '../../src/core/audit.mjs';
import { compilePath, TLC_SL_ROOT } from './compile.mjs';
import { check, necessity } from './checker.mjs';

const REPO_ROOT = resolve(TLC_SL_ROOT, '..');
const EVIDENCE = join(REPO_ROOT, 'evidence', 'TLC-SL', 'verification.jsonl');

function main() {
  const compiled = compilePath(join(TLC_SL_ROOT, 'spec'));
  const ts = new Date().toISOString();
  let verified = 0;

  for (const { model } of compiled) {
    const safety = check(model);
    const guards = necessity(model).filter((g) => g.guarded);
    if (safety.ok) verified++;
    appendAuditEntry(EVIDENCE, {
      event_type: 'TLCSL_VERIFICATION',
      timestamp: ts,
      contract_id: 'CRSP-TLC-SL-001',
      component: 'tlc-sl/src/checker.mjs',
      invariant: model.id,
      article: model.article,
      enforcement: model.level,
      safety_ok: safety.ok,
      states_explored: safety.statesExplored ?? null,
      guards_total: guards.length,
      guards_necessary: guards.filter((g) => g.necessary).length,
      method: 'in-process exhaustive BFS over finite reachable state space',
      tla_checked_by_tlc: false,
      producer: 'agent-produced; requires human acceptance gate before truth_status upgrade',
    });
  }

  appendAuditEntry(EVIDENCE, {
    event_type: 'TLCSL_VERIFICATION_SUMMARY',
    timestamp: ts,
    contract_id: 'CRSP-TLC-SL-001',
    verified,
    total: compiled.length,
    decision: verified === compiled.length ? 'ALL_VERIFIED' : 'INCOMPLETE',
  });

  console.log(`Recorded ${compiled.length} verification entries + summary to ${EVIDENCE.replace(REPO_ROOT + '/', '')}`);
  console.log(`Verified ${verified}/${compiled.length}.`);
}

main();
