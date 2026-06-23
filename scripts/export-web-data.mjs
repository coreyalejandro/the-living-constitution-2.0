#!/usr/bin/env node
/**
 * scripts/export-web-data.mjs
 * Generates src/ui/public/data/*.json from governance artifacts.
 * Run before `vite dev` or add as a pre-dev hook.
 *
 * Outputs:
 *   src/ui/public/data/registry.json  — all 30 modules from modules.registry.json
 *   src/ui/public/data/session.json   — active session (null if none open)
 *
 * Usage:
 *   node scripts/export-web-data.mjs
 *   npm run tlc:export-data
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const OUT_DIR   = resolve(ROOT, 'src/ui/public/data');

// ── Ensure output dir ──────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });

// ── 1. Registry ────────────────────────────────────────────────────────────
const registryPath = resolve(ROOT, 'registry/modules.registry.json');
let registry = { modules: [] };

if (existsSync(registryPath)) {
  try {
    const raw = JSON.parse(readFileSync(registryPath, 'utf8'));
    // Handle both {modules:[...]} and [...] shapes
    registry.modules = Array.isArray(raw) ? raw : (raw.modules || Object.values(raw) || []);
  } catch (e) {
    console.error('Warning: could not parse registry:', e.message);
  }
} else {
  console.warn('Warning: registry not found at', registryPath);
}

writeFileSync(resolve(OUT_DIR, 'registry.json'), JSON.stringify(registry.modules, null, 2));
console.log(`✓ registry.json — ${registry.modules.length} modules`);

// ── 2. Active session ──────────────────────────────────────────────────────
const sessionPaths = [
  resolve(ROOT, '.ai-context/active-session.md'),
  resolve(ROOT, '.ai-context/session.json'),
];

let session = null;

for (const p of sessionPaths) {
  if (!existsSync(p)) continue;
  const content = readFileSync(p, 'utf8');
  if (p.endsWith('.json')) {
    try { session = JSON.parse(content); break; } catch { /* ignore */ }
  } else {
    // Parse .md session file: key: value lines
    session = {};
    for (const line of content.split('\n')) {
      const m = line.match(/^([a-z_]+):\s*(.+)$/i);
      if (m) session[m[1]] = m[2].trim();
    }
    if (!Object.keys(session).length) session = null;
    if (session) break;
  }
}

writeFileSync(resolve(OUT_DIR, 'session.json'), JSON.stringify(session, null, 2));
if (session) {
  console.log(`✓ session.json — active session: ${session.module_id || JSON.stringify(session).slice(0, 60)}`);
} else {
  console.log('✓ session.json — no active session');
}

console.log(`\nData exported to: ${OUT_DIR}`);
console.log('Run: cd src/ui && npx vite  (or: npm run tlc:web)');
