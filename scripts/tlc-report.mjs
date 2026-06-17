#!/usr/bin/env node
/**
 * tlc-report.mjs
 * TLC 2.0 Workspace — Portfolio Status Report Generator
 *
 * Generates a shareable markdown report of all TLC-governed modules:
 * - Truth status breakdown
 * - Per-module summary with evidence counts and open ACs
 * - Unverified scope inventory
 * - Session history summary
 * - V&T statement
 *
 * Usage:
 *   node scripts/tlc-report.mjs                          # print to stdout
 *   node scripts/tlc-report.mjs --out reports/2026-06-17.md  # write to file
 *   node scripts/tlc-report.mjs --surface public_portfolio   # filter by surface
 *   node scripts/tlc-report.mjs --format brief            # condensed output
 *
 * Shell alias: tlc-report [options]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// --- Args ---
const args = process.argv.slice(2);
function arg(flag, def = null) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : def;
}
const outFile = arg('--out');
const surfaceFilter = arg('--surface');
const format = arg('--format', 'full');
const DATE = new Date().toISOString().slice(0, 10);
const TIMESTAMP = new Date().toISOString().slice(0, 19).replace('T', ' ');

// --- Load registry ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) {
  console.error('Registry not found.');
  process.exit(1);
}
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
let modules = registry.modules;
if (surfaceFilter) modules = modules.filter(m => m.surface === surfaceFilter);

// --- Load sessions ---
function loadSessions() {
  const indexPath = join(REPO_ROOT, '.sessions', 'index.jsonl');
  if (!existsSync(indexPath)) return [];
  return readFileSync(indexPath, 'utf8').trim().split('\n')
    .filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

const sessions = loadSessions();

// --- Count evidence files for a module ---
function countEvidence(mod) {
  let projectPath = mod.path;
  if (!projectPath) return 0;
  if (!projectPath.startsWith('/')) {
    projectPath = join('/Users/coreyalejandro/Projects', projectPath.split('/').pop());
  }
  const evidenceDir = join(projectPath, 'evidence');
  if (!existsSync(evidenceDir)) return 0;
  try {
    return readdirSync(evidenceDir).filter(f => !f.startsWith('.')).length;
  } catch { return 0; }
}

// --- Status emoji ---
function statusEmoji(s) {
  const map = {
    working: '✅', partial: '🔶', draft: '🔷', unverified: '⬜',
    planned: '📋', deprecated: '🗑', quarantined: '🚫', static_prototype: '🟡'
  };
  return map[s] || '·';
}

// --- Build report ---
const lines = [];
const push = (...l) => lines.push(...l);

// Header
push(`# TLC 2.0 — Module Status Report`);
push(`**Generated:** ${TIMESTAMP}  `);
push(`**Registry Version:** ${registry.version || '1.0.0'}  `);
if (surfaceFilter) push(`**Surface Filter:** ${surfaceFilter}  `);
push('');
push('---');
push('');

// Summary
const statusGroups = {};
for (const mod of modules) {
  if (!statusGroups[mod.truth_status]) statusGroups[mod.truth_status] = [];
  statusGroups[mod.truth_status].push(mod);
}

push('## Summary');
push('');
push(`| Status | Count |`);
push(`|--------|-------|`);
const statusOrder = ['working', 'partial', 'draft', 'unverified', 'planned', 'quarantined', 'deprecated'];
for (const s of statusOrder) {
  const mods = statusGroups[s] || [];
  if (mods.length > 0) push(`| ${statusEmoji(s)} ${s} | ${mods.length} |`);
}
push(`| **TOTAL** | **${modules.length}** |`);
push('');

// Session activity
const sessionStarts = sessions.filter(s => s.event === 'session_start');
const sessionEnds = sessions.filter(s => s.event === 'session_end');
const activeSessions = sessionStarts.filter(s =>
  !sessionEnds.find(e => e.module_id === s.module_id && e.ended_at > (s.started_at || ''))
);
if (sessionStarts.length > 0) {
  push('## Session Activity');
  push('');
  push(`- Total sessions started: ${sessionStarts.length}`);
  push(`- Completed sessions: ${sessionEnds.length}`);
  if (activeSessions.length > 0) {
    push(`- Currently active: ${activeSessions.map(s => s.module_id).join(', ')}`);
  }
  push('');
}

// Per-module details
push('## Module Details');
push('');

if (format === 'brief') {
  // Condensed table
  push('| Module | Status | Surface | Unverified | Evidence |');
  push('|--------|--------|---------|------------|----------|');
  for (const mod of modules) {
    const unver = mod.unverified_scope ? mod.unverified_scope.length : 0;
    const evid = countEvidence(mod);
    push(`| ${mod.id} | ${statusEmoji(mod.truth_status)} ${mod.truth_status} | ${mod.surface} | ${unver} items | ${evid} files |`);
  }
  push('');
} else {
  // Full per-module sections
  for (const mod of modules) {
    push(`### ${statusEmoji(mod.truth_status)} ${mod.id}`);
    push('');
    push(`| Field | Value |`);
    push(`|-------|-------|`);
    push(`| Truth Status | \`${mod.truth_status}\` |`);
    push(`| Surface | ${mod.surface} |`);
    push(`| Contract | ${mod.contract_id || 'none'} |`);
    if (mod.registered_at) push(`| Registered | ${mod.registered_at.slice(0, 10)} |`);

    const evid = countEvidence(mod);
    push(`| Evidence Files | ${evid} |`);

    const modSessions = sessionStarts.filter(s => s.module_id === mod.id);
    if (modSessions.length > 0) push(`| Sessions | ${modSessions.length} |`);

    push('');

    if (mod.unverified_scope && mod.unverified_scope.length > 0) {
      push(`**Unverified scope (${mod.unverified_scope.length}):**`);
      push('');
      for (const item of mod.unverified_scope.slice(0, 5)) {
        push(`- ${item}`);
      }
      if (mod.unverified_scope.length > 5) {
        push(`- _(+${mod.unverified_scope.length - 5} more)_`);
      }
      push('');
    }

    if (mod.notes) {
      // Show first 200 chars of notes
      const noteSnip = mod.notes.length > 200 ? mod.notes.slice(0, 200) + '…' : mod.notes;
      push(`> ${noteSnip}`);
      push('');
    }
  }
}

// Quarantine section
const quarantined = modules.filter(m => m.truth_status === 'quarantined');
if (quarantined.length > 0) {
  push('---');
  push('');
  push('## 🚫 Quarantined Modules');
  push('');
  push('These modules are read-only. Resolve violations before continuing work.');
  push('');
  for (const mod of quarantined) {
    push(`- **${mod.id}** — ${mod.notes || 'No resolution notes'}`);
  }
  push('');
}

// V&T Statement
push('---');
push('');
push('## V&T Statement');
push('');
push(`EXISTS — Report generated from registry/modules.registry.json and .sessions/  `);
push(`VERIFIED AGAINST — File read at ${TIMESTAMP}  `);
push(`NOT CLAIMED — Any module's working functionality beyond what evidence files confirm  `);
push(`FUNCTIONAL STATUS — Status report only. Source of truth is the registry and evidence directories.`);
push('');

// Output
const report = lines.join('\n');

if (outFile) {
  const outPath = resolve(outFile);
  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, report);
  console.log(`Report written to: ${outPath}`);
} else {
  console.log(report);
}
