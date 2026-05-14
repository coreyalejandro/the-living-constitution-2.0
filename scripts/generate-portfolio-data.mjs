#!/usr/bin/env node
/**
 * generate-portfolio-data.mjs
 * TLC 2.0 Integration Control Plane — Portfolio Data Generator
 *
 * Reads registry files and outputs PORTFOLIO_DATA.json at repo root.
 * Includes ONLY public-safe fields. Excludes private notes, raw local paths
 * for private modules, and anything not intended for public display.
 *
 * Portfolio consumption rule:
 *   The Portfolio site must read PORTFOLIO_DATA.json as its only data source.
 *   No hardcoded module descriptions. No hardcoded status claims.
 *
 * Usage: node scripts/generate-portfolio-data.mjs
 *        npm run generate:portfolio-data
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

// --- Exclude unverified modules from Portfolio unless they are public_portfolio/exhibit with a label ---
// Rule: unverified modules with no public_display_status are excluded entirely.
// Modules with public_display_status=coming_soon are included as placeholders only.

const PRIVATE_SURFACES = new Set(['private_lab', 'governance_core']);
const VISIBLE_STATUSES = new Set(['working', 'partial', 'draft', 'static_prototype']);

// Route index by module
const routesByModule = {};
for (const r of rts) {
  if (r.module_id) {
    if (!routesByModule[r.module_id]) routesByModule[r.module_id] = [];
    routesByModule[r.module_id].push(r);
  }
}

// Artifact index by module
const artsByModule = {};
for (const a of arts) {
  if (a.related_module_id) {
    if (!artsByModule[a.related_module_id]) artsByModule[a.related_module_id] = [];
    artsByModule[a.related_module_id].push(a);
  }
}

// --- Sanitize a scope value to a public-safe string ---
function scopeStr(scope) {
  if (!scope) return null;
  if (typeof scope === 'string') return scope;
  if (typeof scope === 'object') {
    if (scope.component && scope.verification) {
      return `${scope.component}: ${scope.verification}`;
    }
    if (scope.component) return scope.component;
    return JSON.stringify(scope);
  }
  return null;
}

// --- Strip local absolute paths from notes for public output ---
function sanitizeNotes(notes) {
  if (!notes) return null;
  // Remove anything that looks like /Users/...
  return notes.replace(/\/Users\/[^\s,'"]+/g, '[local-path]').slice(0, 280);
}

// --- Determine if a module should appear in portfolio ---
function isPortfolioVisible(m) {
  // Always include public_portfolio and exhibit surfaces
  if (m.surface === 'public_portfolio' || m.surface === 'exhibit') return true;
  // Include governance_core and private_lab partial/working modules as "governance/lab" entries
  if (VISIBLE_STATUSES.has(m.truth_status)) return true;
  // Exclude everything else (unverified with no display status)
  return false;
}

// --- Determine display group ---
function displayGroup(m) {
  if (m.surface === 'governance_core')  return 'governance_core';
  if (m.surface === 'private_lab')      return 'private_lab';
  if (m.surface === 'public_portfolio') return 'public_portfolio';
  if (m.surface === 'exhibit')          return 'exhibit';
  if (m.surface === 'documentation')    return 'documentation';
  if (m.surface === 'module_library')   return 'module_library';
  return 'other';
}

// --- Determine public display status ---
function resolvePublicDisplayStatus(m) {
  if (m.public_display_status) return m.public_display_status;
  if (m.truth_status === 'working')           return 'working';
  if (m.truth_status === 'partial')           return 'draft';
  if (m.truth_status === 'draft')             return 'draft';
  if (m.truth_status === 'static_prototype')  return 'demo';
  return 'hidden';
}

// --- Build safe route list ---
function safeRoutes(moduleId) {
  const mr = routesByModule[moduleId] || [];
  return mr
    .filter(r => r.live_url || r.truth_status !== 'planned')
    .map(r => ({
      route_id:     r.route_id,
      path_pattern: r.path_pattern,
      truth_status: r.truth_status,
      live_url:     r.live_url || null,
    }));
}

// --- Build safe artifact list ---
function safeArtifacts(moduleId) {
  const ma = artsByModule[moduleId] || [];
  return ma.map(a => ({
    id:           a.id,
    label:        a.label,
    type:         a.type,
    format:       a.format,
    truth_status: a.truth_status,
  }));
}

// --- Build portfolio entries ---
const portfolioModules = mods
  .filter(isPortfolioVisible)
  .map(m => {
    const displayStatus = resolvePublicDisplayStatus(m);
    // Skip hidden modules entirely
    if (displayStatus === 'hidden') return null;

    return {
      id:                       m.id,
      label:                    m.label,
      surface:                  m.surface,
      display_group:            displayGroup(m),
      truth_status:             m.truth_status,
      implementation_status:    m.implementation_status || m.truth_status,
      public_display_status:    displayStatus,
      verified_scope_summary:   scopeStr(m.verified_scope),
      unverified_scope_summary: (m.unverified_scope && m.unverified_scope.length)
        ? m.unverified_scope.slice(0, 5).join('; ') + (m.unverified_scope.length > 5 ? ` (+${m.unverified_scope.length - 5} more)` : '')
        : null,
      short_description:        sanitizeNotes(m.notes),
      verified_date:            m.verified_date || null,
      research_lane:            m.research_lane || null,
      product_lane:             m.product_lane || null,
      artifacts:                safeArtifacts(m.id),
      routes:                   safeRoutes(m.id),
    };
  })
  .filter(Boolean);

// --- Group modules by display_group ---
const groups = {};
for (const m of portfolioModules) {
  if (!groups[m.display_group]) groups[m.display_group] = [];
  groups[m.display_group].push(m);
}

// --- Stats ---
const stats = {
  total_modules_classified: mods.length,
  total_in_portfolio:       portfolioModules.length,
  by_truth_status: {},
  by_surface: {},
};
for (const m of mods) {
  stats.by_truth_status[m.truth_status] = (stats.by_truth_status[m.truth_status] || 0) + 1;
  stats.by_surface[m.surface]           = (stats.by_surface[m.surface]           || 0) + 1;
}

// --- Output ---
const output = {
  _meta: {
    generated_at:     new Date().toISOString(),
    generator:        'scripts/generate-portfolio-data.mjs',
    registry_version: modules.version,
    note:             'Public-safe fields only. Do not hand-edit. Re-run after registry changes.',
    complete_claim_rule: 'truth_status=partial means component works, not the full project. truth_status=working means the complete declared scope is verified by a passing test suite.',
  },
  stats,
  modules:      portfolioModules,
  groups,
};

const outPath = join(REPO_ROOT, 'PORTFOLIO_DATA.json');
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`PORTFOLIO_DATA.json written — ${portfolioModules.length} portfolio modules across ${Object.keys(groups).length} groups`);
console.log(`Path: ${outPath}`);
