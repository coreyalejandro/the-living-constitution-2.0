#!/usr/bin/env node
/**
 * generate-module-status.mjs
 * TLC 2.0 Integration Control Plane — Module Status Generator
 *
 * Reads all three registry files and outputs MODULE_STATUS.md
 * at the repo root. Does not modify any registry file.
 *
 * Usage: node scripts/generate-module-status.mjs
 *        npm run generate:module-status
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const REGISTRY_DIR = join(REPO_ROOT, 'registry');

function load(filename) {
  return JSON.parse(readFileSync(join(REGISTRY_DIR, filename), 'utf-8'));
}

const modules   = load('modules.registry.json');
const artifacts = load('artifacts.registry.json');
const routes    = load('routes.registry.json');

const mods = modules.modules;
const arts = artifacts.artifacts;
const rts  = routes.routes;

const now = new Date().toISOString().slice(0, 10);

// --- Aggregate stats ---
const byStatus = {};
const bySurface = {};
for (const m of mods) {
  byStatus[m.truth_status]  = (byStatus[m.truth_status]  || 0) + 1;
  bySurface[m.surface]      = (bySurface[m.surface]      || 0) + 1;
}

const totalModules    = mods.length;
const totalArtifacts  = arts.length;
const totalRoutes     = rts.length;

// Route index by module
const routesByModule = {};
for (const r of rts) {
  if (r.module_id) {
    if (!routesByModule[r.module_id]) routesByModule[r.module_id] = [];
    routesByModule[r.module_id].push(r);
  }
}

// Artifact index by module (via related_module_id)
const artsByModule = {};
for (const a of arts) {
  if (a.related_module_id) {
    if (!artsByModule[a.related_module_id]) artsByModule[a.related_module_id] = [];
    artsByModule[a.related_module_id].push(a);
  }
}

// --- Helpers ---
function badge(status) {
  const map = {
    working:          '[WORKING]',
    partial:          '[PARTIAL]',
    draft:            '[DRAFT]',
    static_prototype: '[PROTOTYPE]',
    unverified:       '[UNVERIFIED]',
    planned:          '[PLANNED]',
    deprecated:       '[DEPRECATED]',
    quarantined:      '[QUARANTINED]',
  };
  return map[status] || `[${status.toUpperCase()}]`;
}

function surfaceLabel(s) {
  const map = {
    governance_core:  'Governance Core',
    private_lab:      'Private Lab',
    public_portfolio: 'Public Portfolio',
    documentation:    'Documentation',
    module_library:   'Module Library',
    exhibit:          'Exhibit',
  };
  return map[s] || s;
}

function scopeSummary(scope) {
  if (!scope) return 'none';
  if (typeof scope === 'string') return scope;
  const parts = [];
  if (scope.component)   parts.push(scope.component);
  if (scope.verification) parts.push(scope.verification);
  return parts.join(' — ') || JSON.stringify(scope);
}

// --- Build markdown ---
const lines = [];

lines.push(`# MODULE_STATUS.md`);
lines.push(`**Generated:** ${now}`);
lines.push(`**Registry version:** ${modules.version}`);
lines.push('');
lines.push('---');
lines.push('');

// Summary table
lines.push('## Summary');
lines.push('');
lines.push(`| Metric | Count |`);
lines.push(`|---|---|`);
lines.push(`| Total modules classified | ${totalModules} |`);
lines.push(`| Total artifacts indexed  | ${totalArtifacts} |`);
lines.push(`| Total routes registered  | ${totalRoutes} |`);
lines.push('');

lines.push('### By Truth Status');
lines.push('');
lines.push('| Status | Count |');
lines.push('|---|---|');
const statusOrder = ['working','partial','draft','static_prototype','unverified','planned','deprecated','quarantined'];
for (const s of statusOrder) {
  if (byStatus[s]) lines.push(`| ${badge(s)} | ${byStatus[s]} |`);
}
lines.push('');

lines.push('### By Surface');
lines.push('');
lines.push('| Surface | Count |');
lines.push('|---|---|');
for (const [s, c] of Object.entries(bySurface).sort()) {
  lines.push(`| ${surfaceLabel(s)} | ${c} |`);
}
lines.push('');
lines.push('---');
lines.push('');

// Working modules
const workingMods = mods.filter(m => m.truth_status === 'working');
lines.push('## Working Modules');
lines.push('');
if (workingMods.length === 0) {
  lines.push('None classified as working yet.');
} else {
  for (const m of workingMods) {
    lines.push(`### ${m.label}`);
    lines.push(`- **ID:** ${m.id}`);
    lines.push(`- **Surface:** ${surfaceLabel(m.surface)}`);
    lines.push(`- **Verified scope:** ${scopeSummary(m.verified_scope)}`);
    const mr = routesByModule[m.id] || [];
    if (mr.length) lines.push(`- **Routes:** ${mr.map(r => r.path_pattern).join(', ')}`);
    lines.push('');
  }
}
lines.push('---');
lines.push('');

// Partial modules
const partialMods = mods.filter(m => m.truth_status === 'partial');
lines.push('## Partial Modules');
lines.push('');
lines.push('*Implementation exists. At least one component is verified. Complete scope is broader than what is verified.*');
lines.push('');
if (partialMods.length === 0) {
  lines.push('None.');
} else {
  for (const m of partialMods) {
    lines.push(`### ${m.label}`);
    lines.push(`- **ID:** ${m.id}`);
    lines.push(`- **Surface:** ${surfaceLabel(m.surface)}`);
    lines.push(`- **Verified scope:** ${scopeSummary(m.verified_scope)}`);
    if (m.unverified_scope && m.unverified_scope.length) {
      lines.push(`- **Unverified scope (${m.unverified_scope.length} items):**`);
      for (const item of m.unverified_scope) {
        lines.push(`  - ${item}`);
      }
    }
    const mr = routesByModule[m.id] || [];
    if (mr.length) lines.push(`- **Routes:** ${mr.map(r => `${r.path_pattern} (${r.truth_status})`).join(', ')}`);
    lines.push('');
  }
}
lines.push('---');
lines.push('');

// Draft modules
const draftMods = mods.filter(m => m.truth_status === 'draft');
lines.push('## Draft Modules');
lines.push('');
lines.push('*Structured content exists — documentation, evidence archives, proposals. No runnable code.*');
lines.push('');
if (draftMods.length === 0) {
  lines.push('None.');
} else {
  for (const m of draftMods) {
    lines.push(`- **${m.label}** (${m.id}) — ${surfaceLabel(m.surface)}`);
    if (m.notes) lines.push(`  ${m.notes.slice(0, 120)}`);
  }
}
lines.push('');
lines.push('---');
lines.push('');

// Static prototype modules
const protoMods = mods.filter(m => m.truth_status === 'static_prototype');
lines.push('## Static Prototypes');
lines.push('');
lines.push('*Built once, not maintained. Functional as a snapshot, not a living codebase.*');
lines.push('');
if (protoMods.length === 0) {
  lines.push('None classified yet.');
} else {
  for (const m of protoMods) {
    lines.push(`- **${m.label}** (${m.id}) — ${surfaceLabel(m.surface)}`);
  }
}
lines.push('');
lines.push('---');
lines.push('');

// Unverified / planned
const otherMods = mods.filter(m => !['working','partial','draft','static_prototype'].includes(m.truth_status));
lines.push('## Unverified / Planned Modules');
lines.push('');
for (const m of otherMods) {
  lines.push(`- **${m.label}** (${m.id}) — ${badge(m.truth_status)} — ${surfaceLabel(m.surface)}`);
}
lines.push('');
lines.push('---');
lines.push('');

// Next required actions
lines.push('## Next Required Actions by Module');
lines.push('');
lines.push('| Module | Status | Next Action |');
lines.push('|---|---|---|');

function nextAction(m) {
  if (m.truth_status === 'working')           return 'Maintain — run tests on each change';
  if (m.truth_status === 'partial')           return 'Resolve unverified_scope items or classify separately';
  if (m.truth_status === 'draft')             return 'Inspect and classify when implementation begins';
  if (m.truth_status === 'static_prototype')  return 'Decide: promote to exhibit or archive';
  if (m.truth_status === 'unverified')        return 'Run ingest SOP — inspect and classify';
  if (m.truth_status === 'planned')           return 'Build or remove from registry';
  if (m.truth_status === 'deprecated')        return 'Archive or remove';
  if (m.truth_status === 'quarantined')       return 'Fix or remove';
  return 'Unknown';
}

for (const m of mods) {
  lines.push(`| ${m.label} | ${badge(m.truth_status)} | ${nextAction(m)} |`);
}
lines.push('');
lines.push('---');
lines.push('');
lines.push(`*Generated by scripts/generate-module-status.mjs — do not hand-edit. Re-run after any registry change.*`);

// --- Write output ---
const output = lines.join('\n');
const outPath = join(REPO_ROOT, 'MODULE_STATUS.md');
writeFileSync(outPath, output, 'utf-8');
console.log(`MODULE_STATUS.md written — ${mods.length} modules, ${arts.length} artifacts, ${rts.length} routes`);
console.log(`Path: ${outPath}`);
