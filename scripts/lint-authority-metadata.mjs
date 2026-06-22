#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const targets = [
  'governance/status-ontology.md',
  'governance/authority-tiers.md',
  'SOCIOTECHNICAL_CONSTITUTION.md',
  'PROGRAM_ARCHITECTURE.md',
  'MODULE_STATUS.md'
].filter((p) => existsSync(path.join(ROOT, p)));

function fail(message) {
  console.error(`AUTHORITY-LINT FAIL: ${message}`);
  process.exit(1);
}

for (const rel of targets) {
  const text = readFileSync(path.join(ROOT, rel), 'utf8');
  for (const field of ['Authority:', 'Truth surface:', 'Machine enforced:']) {
    if (!text.includes(field)) {
      fail(`${rel} is missing metadata field ${field}`);
    }
  }
}

console.log(`AUTHORITY-LINT PASS: ${targets.length} file(s) declare authority metadata.`);
