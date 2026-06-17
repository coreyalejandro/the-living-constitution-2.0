#!/usr/bin/env node
/**
 * tlc-new.mjs
 * TLC 2.0 Workspace — Create a New Governed Project
 *
 * Creates a project from a template, generates C-RSP contract, registers
 * the module in the registry, initializes git with TLC pre-commit hook.
 *
 * Usage:
 *   node scripts/tlc-new.mjs --name <project-name> --template <template-name> --surface <surface>
 *
 * Available surfaces: governance_core | private_lab | public_portfolio |
 *                     documentation | module_library | exhibit
 *
 * Shell alias: tlc-new --name <name> --template <template> --surface <surface>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const PROJECTS_DIR = '/Users/coreyalejandro/Projects';

// --- Arg parsing ---
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

const projectName = getArg('--name');
const templateName = getArg('--template') || 'tlc-research-template';
const surface = getArg('--surface') || 'private_lab';

const VALID_SURFACES = ['governance_core', 'private_lab', 'public_portfolio', 'documentation', 'module_library', 'exhibit'];

if (!projectName) {
  console.error('Usage: tlc-new.mjs --name <project-name> [--template <template>] [--surface <surface>]');
  console.error('\nAvailable templates:');
  const tplDir = join(REPO_ROOT, 'templates');
  if (existsSync(tplDir)) {
    readdirSync(tplDir).forEach(t => console.error(`  - ${t}`));
  }
  console.error('\nAvailable surfaces: ' + VALID_SURFACES.join(', '));
  process.exit(1);
}

if (!VALID_SURFACES.includes(surface)) {
  console.error(`ERROR: Invalid surface "${surface}". Valid: ${VALID_SURFACES.join(', ')}`);
  process.exit(1);
}

// --- Derive IDs ---
const now = new Date().toISOString();
const dateStr = now.slice(0, 10);
const MODULE_ID = projectName.toUpperCase().replace(/[^A-Z0-9]/g, '-');
const CONTRACT_ID = `CRSP-${MODULE_ID}`;
const projectPath = join(PROJECTS_DIR, projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'));

// --- Check for conflicts ---
if (existsSync(projectPath)) {
  console.error(`ERROR: Directory already exists: ${projectPath}`);
  console.error('Choose a different name or delete the existing directory.');
  process.exit(1);
}

// --- Check registry for existing module ID ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
if (registry.modules.find(m => m.id === MODULE_ID)) {
  console.error(`ERROR: Module "${MODULE_ID}" already exists in registry.`);
  process.exit(1);
}

// --- Copy template ---
const templatePath = join(REPO_ROOT, 'templates', templateName);
if (!existsSync(templatePath)) {
  console.error(`ERROR: Template not found: ${templatePath}`);
  console.error('Available templates:');
  const tplDir = join(REPO_ROOT, 'templates');
  if (existsSync(tplDir)) {
    readdirSync(tplDir).forEach(t => console.error(`  - ${t}`));
  }
  process.exit(1);
}

console.log(`\n[tlc-new] Creating project: ${projectName}`);
console.log(`[tlc-new] Template: ${templateName}`);
console.log(`[tlc-new] Surface: ${surface}`);
console.log(`[tlc-new] Module ID: ${MODULE_ID}`);
console.log(`[tlc-new] Contract ID: ${CONTRACT_ID}`);
console.log(`[tlc-new] Path: ${projectPath}`);
console.log();

// Recursive copy with placeholder substitution
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcEntry = join(src, entry);
    const destEntry = join(dest, entry);
    const stat = statSync(srcEntry);
    if (stat.isDirectory()) {
      copyDir(srcEntry, destEntry);
    } else {
      let content = readFileSync(srcEntry, 'utf8');
      content = content
        .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
        .replace(/\{\{MODULE_ID\}\}/g, MODULE_ID)
        .replace(/\{\{CONTRACT_ID\}\}/g, CONTRACT_ID)
        .replace(/\{\{SURFACE\}\}/g, surface)
        .replace(/\{\{DATE\}\}/g, dateStr);
      writeFileSync(destEntry, content, 'utf8');
    }
  }
}

copyDir(templatePath, projectPath);
console.log(`[tlc-new] Template copied to ${projectPath}`);

// --- Initialize git ---
execSync(`git init "${projectPath}"`, { stdio: 'pipe' });
console.log(`[tlc-new] git init complete`);

// --- Install pre-commit hook ---
const hookSrc = join(REPO_ROOT, 'src', 'git-hooks', 'pre-commit.mjs');
const hooksDir = join(projectPath, '.git', 'hooks');
const hookDest = join(hooksDir, 'pre-commit');
mkdirSync(hooksDir, { recursive: true });

if (existsSync(hookSrc)) {
  const hookContent = readFileSync(hookSrc, 'utf8')
    .replace(/\{\{MODULE_ID\}\}/g, MODULE_ID)
    .replace(/\{\{CONTRACT_ID\}\}/g, CONTRACT_ID);
  writeFileSync(hookDest, hookContent, { mode: 0o755 });
  console.log(`[tlc-new] Pre-commit hook installed`);
} else {
  // Write a minimal hook pointing back to TLC
  writeFileSync(hookDest, `#!/usr/bin/env node
// TLC 2.0 pre-commit hook — generated by tlc-new
// Module: ${MODULE_ID}
// Install full hook: node ${REPO_ROOT}/scripts/tlc-new.mjs
import { execSync } from 'child_process';
try {
  execSync('node ${hookSrc} --module ${MODULE_ID}', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
`, { mode: 0o755 });
  console.log(`[tlc-new] Minimal pre-commit hook installed (full hook src not yet present)`);
}

// --- Register module in registry ---
const newModule = {
  id: MODULE_ID,
  label: projectName,
  path: projectPath.replace(PROJECTS_DIR + '/', '') + '/',
  surface: surface,
  truth_status: 'unverified',
  components: [],
  contract_id: CONTRACT_ID,
  created_date: dateStr,
  notes: `Created via tlc-new from template ${templateName}.`,
  unverified_scope: [
    'Initial scaffold — not yet exercised',
    'Acceptance criteria not yet run',
    'Evidence index empty',
  ],
};
registry.modules.push(newModule);
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
console.log(`[tlc-new] Module registered: ${MODULE_ID} (unverified)`);

// --- Initial commit ---
try {
  execSync(`git -C "${projectPath}" add -A`, { stdio: 'pipe' });
  execSync(`git -C "${projectPath}" commit -m "Init scaffold: ${MODULE_ID} — from ${templateName} template"`, {
    stdio: 'pipe',
    env: { ...process.env, GIT_AUTHOR_NAME: 'TLC 2.0', GIT_AUTHOR_EMAIL: 'tlc@local', GIT_COMMITTER_NAME: 'TLC 2.0', GIT_COMMITTER_EMAIL: 'tlc@local' },
  });
  console.log(`[tlc-new] Initial commit done`);
} catch (e) {
  console.warn(`[tlc-new] WARN: Initial commit failed: ${e.message}`);
}

// --- Summary ---
console.log(`\n${'═'.repeat(60)}`);
console.log(`PROJECT CREATED: ${projectName}`);
console.log(`${'─'.repeat(60)}`);
console.log(`Path:       ${projectPath}`);
console.log(`Module ID:  ${MODULE_ID}`);
console.log(`Contract:   ${CONTRACT_ID}`);
console.log(`Status:     unverified`);
console.log(`\nNext steps:`);
console.log(`  cd ${projectPath}`);
console.log(`  tlc-work --module ${MODULE_ID}`);
console.log(`  # ... do your work ...`);
console.log(`  tlc-done --module ${MODULE_ID} --evidence ./evidence/session-${dateStr}.md`);
console.log(`${'═'.repeat(60)}\n`);
