#!/usr/bin/env node
/**
 * validate-module-here.mjs
 * TLC 2.0 Workspace — Quick Module Validator (auto-runs on cd)
 *
 * Detects whether the current directory is a TLC-registered module.
 * Shows status, unverified items, active contract. Quiet if not a module.
 *
 * Usage:
 *   node scripts/validate-module-here.mjs [--path /path/to/project]
 *
 * Called automatically by shell cd hook in shell-integration.zsh
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname, homedir } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const HOME = homedir();
const PROJECTS_DIR = process.env.TLC_PROJECTS_DIR || join(HOME, 'Projects');

// --- Determine project path ---
const args = process.argv.slice(2);
const pathIndex = args.indexOf('--path');
const targetPath = pathIndex !== -1 ? args[pathIndex + 1] : process.cwd();

// --- Load registry ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) process.exit(0); // silent exit — registry not found

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

// Normalize paths for comparison
function normalizePath(p) {
  return p.replace(/\/$/, '').toLowerCase();
}

const targetNorm = normalizePath(targetPath);

const mod = registry.modules.find(m => {
  let modPath = m.path;
  if (!modPath.startsWith('/')) {
    const dirName = modPath.replace(/\/$/, '').split('/').pop();
    modPath = join(PROJECTS_DIR, dirName);
  }
  return normalizePath(modPath) === targetNorm;
});

// Not a registered module — stay silent
if (!mod) process.exit(0);

// --- ANSI helpers ---
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function statusColor(s) {
  if (s === 'working') return C.green + s + C.reset;
  if (s === 'partial') return C.cyan + s + C.reset;
  if (s === 'quarantined') return C.red + s + C.reset;
  if (s === 'unverified' || s === 'draft') return C.dim + s + C.reset;
  return C.yellow + s + C.reset;
}

// --- Quarantine warning ---
if (mod.truth_status === 'quarantined') {
  console.log(`\n${C.red}${C.bold}⛔ QUARANTINED MODULE: ${mod.id}${C.reset}`);
  console.log(`${C.red}This module is quarantined. No commits or work allowed.${C.reset}`);
  console.log(`${C.red}Resolve the quarantine before proceeding.${C.reset}\n`);
  process.exit(0);
}

// --- Module banner ---
console.log(`\n${C.bold}TLC${C.reset} ${C.dim}·${C.reset} ${C.bold}${mod.id}${C.reset}  ${statusColor(mod.truth_status)}  ${C.dim}[${mod.surface}]${C.reset}`);

if (mod.contract_id) {
  console.log(`${C.dim}  contract: ${mod.contract_id}${C.reset}`);
}

if (mod.truth_status !== 'working' && mod.unverified_scope && mod.unverified_scope.length > 0) {
  console.log(`${C.yellow}  unverified: ${mod.unverified_scope.slice(0, 2).join(' · ')}${C.reset}`);
  if (mod.unverified_scope.length > 2) {
    console.log(`${C.dim}  ... +${mod.unverified_scope.length - 2} more → tlc-work --module ${mod.id}${C.reset}`);
  }
}

// Check for active session
const sessionsIndexPath = join(REPO_ROOT, '.sessions', 'index.jsonl');
if (existsSync(sessionsIndexPath)) {
  const lines = readFileSync(sessionsIndexPath, 'utf8').trim().split('\n').filter(Boolean);
  const sessions = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const lastStart = sessions.filter(s => s.event === 'session_start' && s.module_id === mod.id).pop();
  const lastEnd = sessions.filter(s => s.event === 'session_end' && s.module_id === mod.id).pop();
  const isActive = lastStart && (!lastEnd || lastStart.started_at > (lastEnd.ended_at || ''));
  if (isActive) {
    const elapsed = Math.floor((Date.now() - new Date(lastStart.started_at).getTime()) / 60000);
    console.log(`${C.cyan}  ▶ session active (${elapsed}m) — tlc-done --module ${mod.id} when done${C.reset}`);
  }
}

console.log();
