#!/usr/bin/env node
/**
 * scripts/export-web-data.mjs
 * Generates src/ui/public/data/*.json from governance artifacts.
 * Run before `vite dev` or add as a pre-dev hook.
 *
 * Outputs:
 *   src/ui/public/data/registry.json  — all modules from modules.registry.json
 *   src/ui/public/data/session.json   — active session (null if none open)
 *   src/ui/public/data/events.json    — last 10 evidence events (merged from audit logs)
 *
 * Usage:
 *   node scripts/export-web-data.mjs
 *   npm run tlc:export-data
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
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

// ── 3. Evidence events (last 10, newest first) ─────────────────────────────
const evidenceDir = resolve(ROOT, 'evidence');
const events = [];

function readJsonl(filePath) {
  if (!existsSync(filePath)) return;
  try {
    const lines = readFileSync(filePath, 'utf8').trim().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        // Normalise: accept both audit-log shape and lifecycle shape
        events.push({
          timestamp:  obj.timestamp || null,
          event_type: obj.event_type || obj.event || 'unknown',
          module_id:  obj.contract_id || null,
          decision:   obj.decision || null,
          message:    obj.message || JSON.stringify(obj).slice(0, 80),
          source:     filePath.replace(ROOT + '/', ''),
        });
      } catch { /* malformed line — skip */ }
    }
  } catch { /* unreadable file — skip */ }
}

// Collect from audit-log + all module lifecycle logs
readJsonl(resolve(evidenceDir, 'audit-log.jsonl'));

if (existsSync(evidenceDir)) {
  try {
    const entries = readdirSync(evidenceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = resolve(evidenceDir, entry.name);
      readJsonl(resolve(dir, 'lifecycle.jsonl'));
      readJsonl(resolve(dir, 'halt-log.jsonl'));
      readJsonl(resolve(dir, 'vnt-audit.jsonl'));
    }
  } catch { /* ignore */ }
}

// Sort by timestamp descending, take last 10
events.sort((a, b) => {
  if (!a.timestamp) return 1;
  if (!b.timestamp) return -1;
  return a.timestamp < b.timestamp ? 1 : -1;
});
const recentEvents = events.slice(0, 10);

writeFileSync(resolve(OUT_DIR, 'events.json'), JSON.stringify(recentEvents, null, 2));
console.log(`✓ events.json — ${recentEvents.length} recent events`);

console.log(`\nData exported to: ${OUT_DIR}`);
console.log('Run: cd src/ui && npx vite  (or: npm run tlc:web)');
