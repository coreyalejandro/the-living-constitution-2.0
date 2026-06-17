#!/usr/bin/env node
/**
 * tlc-register.mjs
 * TLC 2.0 Workspace — Register Existing Project
 *
 * Adds an already-existing project to the TLC module registry
 * WITHOUT creating a new project from template. Use this for
 * projects that already exist on disk but are not yet governed.
 *
 * Usage:
 *   node scripts/tlc-register.mjs --path /path/to/project [options]
 *
 * Options:
 *   --path <path>        Path to the project (required)
 *   --id <MODULE_ID>     Module ID (default: derived from folder name)
 *   --surface <surface>  Surface classification (default: private_lab)
 *   --status <status>    Initial truth_status (default: unverified)
 *   --dry-run            Show what would happen, do not write
 *
 * What it does:
 *   1. Validates the path exists
 *   2. Derives or accepts a module ID
 *   3. Creates .tlc-module file in the project
 *   4. Creates stub contract + STATUS.md if missing
 *   5. Adds entry to registry/modules.registry.json
 *   6. Installs pre-commit hook symlink
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// --- Args ---
const args = process.argv.slice(2);
function arg(flag, def = null) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : def;
}
const DRY_RUN = args.includes('--dry-run');
const rawPath = arg('--path');
const requestedId = arg('--id');
const surface = arg('--surface', 'private_lab');
const initialStatus = arg('--status', 'unverified');

// --- ANSI ---
const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', C = '\x1b[36m', D = '\x1b[2m', B = '\x1b[1m', X = '\x1b[0m';

function die(msg) { console.error(`${R}ERROR: ${msg}${X}`); process.exit(1); }
function ok(msg) { console.log(`${G}✓${X} ${msg}`); }
function info(msg) { console.log(`${D}  ${msg}${X}`); }
function warn(msg) { console.log(`${Y}⚠ ${msg}${X}`); }

if (!rawPath) die('--path is required. Usage: tlc-register --path /path/to/project');

const projectPath = resolve(rawPath);
if (!existsSync(projectPath)) die(`Path not found: ${projectPath}`);

// --- Derive module ID ---
function toModuleId(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
const folderName = basename(projectPath);
const MODULE_ID = requestedId ? requestedId.toUpperCase() : toModuleId(folderName);

console.log(`\n${B}TLC 2.0 — Register Existing Project${X}`);
console.log(`  Path:      ${projectPath}`);
console.log(`  Module ID: ${MODULE_ID}`);
console.log(`  Surface:   ${surface}`);
console.log(`  Status:    ${initialStatus}`);
if (DRY_RUN) console.log(`  ${Y}DRY RUN — no files will be written${X}`);
console.log();

// --- Load registry ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) die(`Registry not found: ${registryPath}`);
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

// Check for existing entry
const existing = registry.modules.find(m => m.id === MODULE_ID);
if (existing) {
  warn(`Module ${MODULE_ID} already in registry (truth_status: ${existing.truth_status})`);
  warn('Use tlc-work to start a session, or edit the registry directly.');
  process.exit(0);
}

// --- Derive contract ID ---
const CONTRACT_ID = `CRSP-${MODULE_ID}`;
const DATE = new Date().toISOString().slice(0, 10);

// --- Step 1: .tlc-module file ---
const tlcModuleFile = join(projectPath, '.tlc-module');
if (!existsSync(tlcModuleFile)) {
  if (!DRY_RUN) writeFileSync(tlcModuleFile, MODULE_ID + '\n');
  ok(`.tlc-module created: ${MODULE_ID}`);
} else {
  info(`.tlc-module already exists`);
}

// --- Step 2: stub contract ---
const contractPath = join(projectPath, 'C_RSP_BUILD_CONTRACT.md');
if (!existsSync(contractPath)) {
  const contractContent = `# C-RSP Build Contract — ${folderName}

**Contract ID:** ${CONTRACT_ID}
**Module:** ${MODULE_ID}
**Surface:** ${surface}
**Created:** ${DATE}
**Status:** Draft

## 1. Objective

Govern and verify ${folderName} under TLC 2.0.

## Not Claimed

- Production readiness without explicit safety review
- Generalizability beyond verified local scope

## Acceptance Criteria

- [ ] AC-001: Project scaffold passes validate_repo.py
- [ ] AC-002: STATUS.md created with truth_status declaration
- [ ] AC-003: Evidence index initialized
- [ ] AC-004: First governed session completed (tlc-work + tlc-done)

## Halt Conditions

- HLT-001: Invariant violation detected
- HLT-002: Evidence missing when AC claimed complete

## Truth Surface

- Evidence Required: Yes
- Reviewer Required: Yes
- Public Claim Allowed: No

## V&T Statement

EXISTS — C_RSP_BUILD_CONTRACT.md created by tlc-register
VERIFIED AGAINST — File creation
NOT CLAIMED — Any acceptance criteria completion
FUNCTIONAL STATUS — Draft. truth_status=${initialStatus}.
`;
  if (!DRY_RUN) writeFileSync(contractPath, contractContent);
  ok(`C_RSP_BUILD_CONTRACT.md created`);
} else {
  info(`C_RSP_BUILD_CONTRACT.md already exists`);
}

// --- Step 3: STATUS.md ---
const statusPath = join(projectPath, 'STATUS.md');
if (!existsSync(statusPath)) {
  const statusContent = `# STATUS — ${folderName}

**Module ID:** ${MODULE_ID}
**Contract:** ${CONTRACT_ID}

## STATUS

- **Truth Status:** ${initialStatus}
- **Surface:** ${surface}
- **Created:** ${DATE}
- **Last Updated:** ${DATE}

## RETROSPECTIVE

(No sessions yet. Run \`tlc-work --module ${MODULE_ID}\` to start the first session.)

## PROSPECTIVE

### Next Required Action

Run \`python ${REPO_ROOT}/scripts/validate_repo.py --path .\` to check scaffold.
Then run \`tlc-work --module ${MODULE_ID}\` to begin the first governed session.

## V&T Statement

EXISTS — STATUS.md created by tlc-register
VERIFIED AGAINST — File creation
NOT CLAIMED — Any working functionality
FUNCTIONAL STATUS — Scaffold only. truth_status=${initialStatus}.
`;
  if (!DRY_RUN) writeFileSync(statusPath, statusContent);
  ok(`STATUS.md created`);
} else {
  info(`STATUS.md already exists`);
}

// --- Step 4: evidence dir ---
const evidenceDir = join(projectPath, 'evidence');
if (!existsSync(evidenceDir)) {
  if (!DRY_RUN) {
    mkdirSync(evidenceDir, { recursive: true });
    writeFileSync(join(evidenceDir, 'index.md'),
      `# Evidence Index — ${folderName}\n\n| Date | Session | File | ACs |\n|------|---------|------|-----|\n`);
  }
  ok(`evidence/ directory created`);
} else {
  info(`evidence/ already exists`);
}

// --- Step 5: pre-commit hook ---
const gitDir = join(projectPath, '.git');
const hooksDir = join(gitDir, 'hooks');
const hookTarget = join(REPO_ROOT, 'src', 'git-hooks', 'pre-commit.mjs');
const hookPath = join(hooksDir, 'pre-commit');

if (existsSync(gitDir) && existsSync(hookTarget)) {
  if (!existsSync(hooksDir) && !DRY_RUN) mkdirSync(hooksDir, { recursive: true });
  const hookScript = `#!/bin/sh\nnode ${hookTarget} "$@"\n`;
  if (!DRY_RUN) {
    writeFileSync(hookPath, hookScript);
    try { execSync(`chmod +x ${hookPath}`); } catch {}
  }
  ok(`Pre-commit hook installed at ${hookPath}`);
} else if (!existsSync(gitDir)) {
  warn(`No .git directory found — pre-commit hook not installed. Run 'git init' first.`);
}

// --- Step 6: register in registry ---
const newModule = {
  id: MODULE_ID,
  truth_status: initialStatus,
  surface: surface,
  path: projectPath,
  contract_id: CONTRACT_ID,
  registered_at: new Date().toISOString(),
  unverified_scope: [`Initial registration — no sessions yet`],
  notes: `Registered by tlc-register on ${DATE}`
};

if (!DRY_RUN) {
  registry.modules.push(newModule);
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  ok(`Module ${MODULE_ID} added to registry`);
} else {
  info(`[DRY RUN] Would add to registry: ${JSON.stringify(newModule, null, 2)}`);
}

console.log();
console.log(`${G}${B}Registration complete.${X}`);
console.log(`  Start your first session: ${C}tlc-work --module ${MODULE_ID}${X}`);
console.log(`  Validate scaffold:        ${C}tlc-validate --path ${projectPath}${X}`);
console.log();
