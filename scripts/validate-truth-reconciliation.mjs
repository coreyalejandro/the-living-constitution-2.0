#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ledgerPath = path.join(ROOT, 'governance', 'claim-ledger.json');
if (!existsSync(ledgerPath)) {
  console.log('TRUTH-RECON PASS: claim ledger absent, skipping.');
  process.exit(0);
}

const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
const readmePath = path.join(ROOT, 'README.md');
const moduleStatusPath = path.join(ROOT, 'MODULE_STATUS.md');

function fail(message) {
  console.error(`TRUTH-RECON FAIL: ${message}`);
  process.exit(1);
}

const workingClaims = new Set((ledger.claims || []).filter((c) => c.status === 'working').map((c) => c.subject));

if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, 'utf8');
  if (/\bworking\b/i.test(readme) && workingClaims.size === 0) {
    fail('README references working state but claim ledger has no working claims.');
  }
}

if (existsSync(moduleStatusPath)) {
  const moduleStatus = readFileSync(moduleStatusPath, 'utf8');
  if (/\bVERIFIED\b/.test(moduleStatus) && !/Legacy mapping guidance/.test(readFileSync(path.join(ROOT, 'governance/status-ontology.md'), 'utf8'))) {
    fail('MODULE_STATUS.md uses legacy VERIFIED terminology without canonical mapping support.');
  }
}

console.log('TRUTH-RECON PASS: basic truth reconciliation checks passed.');
