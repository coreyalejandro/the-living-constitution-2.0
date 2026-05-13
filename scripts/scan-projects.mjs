#!/usr/bin/env node
/**
 * scan-projects.mjs
 * TLC 2.0 Integration Control Plane — Project Scanner
 *
 * Walks /Users/coreyalejandro/Projects, lists all real project directories,
 * then cross-references against modules.registry.json and reports:
 *   - registered modules (with their truth_status)
 *   - unregistered directories (not yet classified)
 *
 * Usage: node scripts/scan-projects.mjs [--projects-dir /path/to/projects]
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// --- Config ---
const DEFAULT_PROJECTS_DIR = '/Users/coreyalejandro/Projects';

// Dirs to skip in the projects folder (not real projects)
const SKIP_PATTERNS = [
  /\.zip$/,
  /\.tar\.gz$/,
  /\.tar$/,
  /\.patch$/,
  /\.pdf$/,
  /\.sh$/,
  /\.tsx$/,
  /\.md$/,
  /\.gguf$/,
  /^node_modules$/,
  /^\.git$/,
  /^ChatGPT$/,
  /^ChatGPT_Project_Sync$/,
  /^CLAUDE\.md$/,
  /^Welcome to the AI Hackathon\.pdf$/,
  /^mad-mall\.code-workspace$/,
  /^QuantumScene\.tsx$/,
  /^create_col_reasons_asf_2026\.sh$/,
  /^extract_gateway\.sh$/,
];

// Suffixes that mark backup/old copies — informational only
const BACKUP_PATTERNS = [
  /-BACKUP-\d{8}-\d{6}\.tar\.gz$/,
  /-old-\d{8}-\d{6}$/,
  /-repaired-tier1$/,
  / copy$/,
  / \(\d+\)$/,
  / \(old\)$/,
];

// --- Parse args ---
const args = process.argv.slice(2);
const projectsDirArg = args.indexOf('--projects-dir');
const PROJECTS_DIR = projectsDirArg !== -1
  ? args[projectsDirArg + 1]
  : DEFAULT_PROJECTS_DIR;

// --- Load registry ---
const modulesPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
let registry;
try {
  registry = JSON.parse(readFileSync(modulesPath, 'utf-8'));
} catch (err) {
  console.error(`ERROR: Cannot load modules.registry.json — ${err.message}`);
  process.exit(1);
}

// Build a lookup: normalised path stem -> module entry
const registeredPaths = new Map();
for (const mod of registry.modules) {
  // Strip trailing slash, lowercase for comparison
  const key = mod.path.replace(/\/$/, '').toLowerCase();
  registeredPaths.set(key, mod);
}

// --- Scan projects directory ---
let entries;
try {
  entries = readdirSync(PROJECTS_DIR);
} catch (err) {
  console.error(`ERROR: Cannot read projects directory '${PROJECTS_DIR}' — ${err.message}`);
  process.exit(1);
}

const projectDirs = [];
const skippedEntries = [];
const backupEntries = [];

for (const entry of entries.sort()) {
  const fullPath = join(PROJECTS_DIR, entry);

  // Check skip patterns (files, zips, etc.)
  if (SKIP_PATTERNS.some(p => p.test(entry))) {
    skippedEntries.push(entry);
    continue;
  }

  // Must be a directory
  let stat;
  try {
    stat = statSync(fullPath);
  } catch {
    skippedEntries.push(entry);
    continue;
  }
  if (!stat.isDirectory()) {
    skippedEntries.push(entry);
    continue;
  }

  // Mark backups separately
  if (BACKUP_PATTERNS.some(p => p.test(entry))) {
    backupEntries.push(entry);
    continue;
  }

  projectDirs.push(entry);
}

// --- Cross-reference ---
const registered = [];
const unregistered = [];

for (const dir of projectDirs) {
  const key = dir.toLowerCase();
  // Try exact match first, then match with trailing slash stripped
  const mod = registeredPaths.get(key) || registeredPaths.get(key + '/');
  if (mod) {
    registered.push({ dir, module: mod });
  } else {
    unregistered.push(dir);
  }
}

// --- Report ---
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW= '\x1b[33m';
const RED   = '\x1b[31m';
const CYAN  = '\x1b[36m';
const DIM   = '\x1b[2m';

function statusColor(s) {
  switch (s) {
    case 'working':          return GREEN;
    case 'partial':          return CYAN;
    case 'static_prototype': return CYAN;
    case 'draft':            return YELLOW;
    case 'planned':          return YELLOW;
    case 'unverified':       return YELLOW;
    case 'deprecated':       return DIM;
    case 'quarantined':      return RED;
    default:                 return RESET;
  }
}

console.log(`\n${BOLD}TLC 2.0 — Project Scanner${RESET}`);
console.log(`Projects dir : ${PROJECTS_DIR}`);
console.log(`Registry     : ${modulesPath}`);
console.log(`Scanned      : ${new Date().toISOString()}\n`);

console.log(`${BOLD}REGISTERED MODULES (${registered.length})${RESET}`);
if (registered.length === 0) {
  console.log('  none');
} else {
  const padDir = Math.max(...registered.map(r => r.dir.length), 30);
  const padId  = Math.max(...registered.map(r => r.module.id.length), 20);
  for (const { dir, module: mod } of registered) {
    const sc = statusColor(mod.truth_status);
    console.log(
      `  ${dir.padEnd(padDir)}  ${mod.id.padEnd(padId)}  ${sc}${mod.truth_status}${RESET}`
    );
  }
}

console.log(`\n${BOLD}UNREGISTERED DIRECTORIES (${unregistered.length})${RESET}`);
if (unregistered.length === 0) {
  console.log(`  ${GREEN}All project directories are registered.${RESET}`);
} else {
  for (const dir of unregistered) {
    console.log(`  ${YELLOW}UNREGISTERED${RESET}  ${dir}`);
  }
}

console.log(`\n${BOLD}BACKUP / ARCHIVE COPIES (${backupEntries.length}) — informational${RESET}`);
for (const b of backupEntries) {
  console.log(`  ${DIM}${b}${RESET}`);
}

console.log(`\n${DIM}Skipped non-project entries: ${skippedEntries.length}${RESET}`);

// --- Summary ---
const unregisteredCount = unregistered.length;
const totalModules = registry.modules.length;
console.log(`\n${BOLD}SUMMARY${RESET}`);
console.log(`  Registry modules   : ${totalModules}`);
console.log(`  Matched on disk    : ${registered.length}`);
console.log(`  Unregistered dirs  : ${unregisteredCount}`);

if (unregisteredCount > 0) {
  console.log(`\n${YELLOW}ACTION NEEDED: ${unregisteredCount} project director${unregisteredCount === 1 ? 'y' : 'ies'} not in registry.${RESET}`);
  console.log(`  Add entries to registry/modules.registry.json with truth_status: "unverified".`);
}

console.log('');
