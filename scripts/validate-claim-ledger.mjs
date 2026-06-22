#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ledgerPath = path.join(ROOT, 'governance', 'claim-ledger.json');
const schemaPath = path.join(ROOT, 'schemas', 'claim-ledger.schema.json');

function fail(message) {
  console.error(`CLAIM-LEDGER FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(ledgerPath)) fail('Missing governance/claim-ledger.json');
if (!existsSync(schemaPath)) fail('Missing schemas/claim-ledger.schema.json');

const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(ledger)) {
  fail(`Schema validation failed: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
}

for (const claim of ledger.claims) {
  if (!existsSync(path.join(ROOT, claim.subject))) {
    fail(`Subject does not exist for claim ${claim.claim_id}: ${claim.subject}`);
  }
  for (const evidencePath of claim.evidence) {
    if (!existsSync(path.join(ROOT, evidencePath))) {
      fail(`Evidence does not exist for claim ${claim.claim_id}: ${evidencePath}`);
    }
  }
}

console.log(`CLAIM-LEDGER PASS: ${ledger.claims.length} claim(s) validated.`);
