#!/usr/bin/env node
/**
 * create-research-project-from-template.mjs
 * TLC 2.0 — Research Project Instantiation Script
 *
 * Usage:
 *   node scripts/create-research-project-from-template.mjs <project-slug>
 *
 * What it does:
 *   1. Copies templates/tlc-research-to-paper-to-product-template/ to
 *      /Users/coreyalejandro/Projects/<project-slug>
 *   2. Replaces placeholders: {{PROJECT_NAME}}, {{PROJECT_SLUG}},
 *      {{RESEARCH_QUESTION}}, {{PRODUCT_TARGET}}, {{PUBLIC_DISPLAY_STATUS}},
 *      {{CONTRACT_DATE}}, {{STATUS_DATE}}, {{CONTRACT_ID}}
 *   3. Initializes git in the new repo
 *   4. Runs python3 scripts/validate_repo.py in the new repo
 *   5. Stops if validation fails
 *   6. Prints exact next steps
 */

import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const TEMPLATE_DIR = join(REPO_ROOT, 'templates', 'tlc-research-to-paper-to-product-template');
const PROJECTS_ROOT = '/Users/coreyalejandro/Projects';

// ── CLI argument ────────────────────────────────────────────────────────────
const projectSlug = process.argv[2];

if (!projectSlug) {
  console.error('\nUsage: node scripts/create-research-project-from-template.mjs <project-slug>');
  console.error('\nExample:');
  console.error('  node scripts/create-research-project-from-template.mjs my-new-study\n');
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]+$/.test(projectSlug)) {
  console.error('\nERROR: project-slug must be lowercase letters, numbers, and hyphens only.');
  console.error(`  Got: "${projectSlug}"\n`);
  process.exit(1);
}

const PROJECT_DIR = join(PROJECTS_ROOT, projectSlug);
const TODAY = new Date().toISOString().slice(0, 10);

// ── Derived values ──────────────────────────────────────────────────────────
const PROJECT_NAME = projectSlug
  .split('-')
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

const CONTRACT_ID = `CRSP-${projectSlug.toUpperCase().replace(/-/g, '-')}-001`;

const PLACEHOLDERS = {
  '{{PROJECT_NAME}}': PROJECT_NAME,
  '{{PROJECT_SLUG}}': projectSlug,
  '{{RESEARCH_QUESTION}}': 'TODO: state your research question',
  '{{PRODUCT_TARGET}}': 'TODO: describe the product target',
  '{{PUBLIC_DISPLAY_STATUS}}': 'coming_soon',
  '{{CONTRACT_DATE}}': TODAY,
  '{{STATUS_DATE}}': TODAY,
  '{{CONTRACT_ID}}': CONTRACT_ID,
};

// ── Guards ──────────────────────────────────────────────────────────────────
if (!existsSync(TEMPLATE_DIR)) {
  console.error(`\nERROR: Template directory not found: ${TEMPLATE_DIR}\n`);
  process.exit(1);
}

if (existsSync(PROJECT_DIR)) {
  console.error(`\nERROR: Target directory already exists: ${PROJECT_DIR}`);
  console.error('  Rename or remove it before creating a new project from template.\n');
  process.exit(1);
}

// ── Copy helper (recursive) ─────────────────────────────────────────────────
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// ── Placeholder substitution ────────────────────────────────────────────────
const TEXT_EXTENSIONS = new Set([
  '.md', '.txt', '.json', '.yaml', '.yml', '.csv', '.py',
  '.mjs', '.js', '.ts', '.bib', '.mmd', '.gitignore',
]);

function substituteFile(filePath) {
  const ext = filePath.includes('.') ? '.' + filePath.split('.').pop() : '';
  if (!TEXT_EXTENSIONS.has(ext) && !filePath.endsWith('.gitignore')) return;

  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return; // binary or unreadable — skip
  }

  let modified = content;
  for (const [placeholder, value] of Object.entries(PLACEHOLDERS)) {
    modified = modified.replaceAll(placeholder, value);
  }

  if (modified !== content) {
    writeFileSync(filePath, modified, 'utf-8');
  }
}

function substituteDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      substituteDir(fullPath);
    } else {
      substituteFile(fullPath);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
console.log('\nTLC Research Project Instantiation');
console.log('===================================');
console.log(`Template:    ${relative(REPO_ROOT, TEMPLATE_DIR)}`);
console.log(`Destination: ${PROJECT_DIR}`);
console.log(`Slug:        ${projectSlug}`);
console.log(`Name:        ${PROJECT_NAME}`);
console.log(`Contract ID: ${CONTRACT_ID}`);
console.log(`Date:        ${TODAY}`);
console.log('');

// Step 1 — Copy template
console.log('Step 1/5  Copying template...');
copyDir(TEMPLATE_DIR, PROJECT_DIR);
console.log('          Done.');

// Step 2 — Substitute placeholders
console.log('Step 2/5  Substituting placeholders...');
substituteDir(PROJECT_DIR);
console.log('          Done.');

// Step 3 — Initialize git
console.log('Step 3/5  Initializing git...');
try {
  execSync('git init', { cwd: PROJECT_DIR, stdio: 'pipe' });
  execSync('git add .', { cwd: PROJECT_DIR, stdio: 'pipe' });
  execSync(`git commit -m "Initial scaffold from TLC research-to-paper-to-product template"`, {
    cwd: PROJECT_DIR,
    stdio: 'pipe',
    env: { ...process.env, GIT_AUTHOR_NAME: 'Corey Alejandro', GIT_AUTHOR_EMAIL: 'corey@coreyalejandro.com',
           GIT_COMMITTER_NAME: 'Corey Alejandro', GIT_COMMITTER_EMAIL: 'corey@coreyalejandro.com' },
  });
  console.log('          git init + initial commit done.');
} catch (err) {
  console.error(`\n  WARNING: git initialization failed: ${err.message}`);
  console.error('  The project was still created. Initialize git manually.\n');
}

// Step 4 — Run validate_repo.py
console.log('Step 4/5  Running validate_repo.py...');
let validationPassed = false;
try {
  execSync('python3 scripts/validate_repo.py', { cwd: PROJECT_DIR, stdio: 'inherit' });
  validationPassed = true;
  console.log('\n          PASS — all checks passed.');
} catch {
  console.error('\n  FAIL — validate_repo.py failed. Fix errors before proceeding.');
  console.error(`  Project created at: ${PROJECT_DIR}`);
  console.error('  Do not begin data collection until validation passes.\n');
  process.exit(1);
}

// Step 5 — Print next steps
console.log('\nStep 5/5  Next steps');
console.log('════════════════════════════════════════════════════════════');
console.log(`\n  Project created at:\n    ${PROJECT_DIR}\n`);
console.log('  Immediate required actions:');
console.log('');
console.log('  1. Fill in C_RSP_BUILD_CONTRACT.md');
console.log('     Replace all {{PLACEHOLDER}} values with project-specific content.');
console.log(`     Especially: {{RESEARCH_QUESTION}}, {{PRODUCT_TARGET}}, {{SCOPE_ITEM_*}}`);
console.log('');
console.log('  2. Fill in docs/STUDY_PROTOCOL.md');
console.log('     Define your research questions and measurement protocol.');
console.log('');
console.log('  3. Fill in docs/DATA_DICTIONARY.md');
console.log('     Define every construct and event type before data collection.');
console.log('');
console.log('  4. Build the visual understanding layer');
console.log('     Replace placeholder content in visuals/ with real diagrams.');
console.log('     validate_repo.py will FAIL until all 6 visual files have content.');
console.log('');
console.log('  5. Register the project in the runtime registry');
console.log('     Add an entry to:');
console.log('       the-living-constitution-2.0/registry/modules.registry.json');
console.log('     Then run from the runtime root:');
console.log('       npm run ingest:verify');
console.log('');
console.log('  6. Confirm validation still passes after filling in content:');
console.log(`     cd ${PROJECT_DIR}`);
console.log('     python3 scripts/validate_repo.py');
console.log('');
console.log('  7. Begin prospective data collection only after:');
console.log('     - C_RSP contract is complete');
console.log('     - Visual layer is not placeholder-only');
console.log('     - validate_repo.py passes');
console.log('');
console.log('  Reference instance: /Users/coreyalejandro/Projects/hidrs-instructional-dependency-study');
console.log('════════════════════════════════════════════════════════════\n');
