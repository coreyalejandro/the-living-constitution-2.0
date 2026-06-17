#!/usr/bin/env node
/**
 * inject-ai-context.mjs
 * TLC 2.0 Workspace — AI Context Injector
 *
 * Generates .ai-context/active-session.md for the current session.
 * Pastes active contract, module status, invariants, unverified scope,
 * and neurodivergent-first preferences into a single file for AI assistants.
 *
 * Usage:
 *   node scripts/inject-ai-context.mjs --module <MODULE_ID>
 *   node scripts/inject-ai-context.mjs --module <MODULE_ID> --project-path /path/to/project
 *
 * Shell alias: tlc-context --module <MODULE_ID>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// --- Arg parsing ---
const args = process.argv.slice(2);
const moduleIndex = args.indexOf('--module');
const projectIndex = args.indexOf('--project-path');

if (moduleIndex === -1 || !args[moduleIndex + 1]) {
  console.error('Usage: inject-ai-context.mjs --module <MODULE_ID> [--project-path /path/to/project]');
  process.exit(1);
}

const MODULE_ID = args[moduleIndex + 1];
const PROJECT_PATH = projectIndex !== -1 ? args[projectIndex + 1] : null;

// --- Load registry ---
const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) {
  console.error(`ERROR: modules.registry.json not found at ${registryPath}`);
  process.exit(1);
}

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const module = registry.modules.find(m => m.id === MODULE_ID);

if (!module) {
  console.error(`ERROR: Module "${MODULE_ID}" not found in registry.`);
  console.error('Registered modules:');
  registry.modules.forEach(m => console.error(`  - ${m.id} (${m.truth_status})`));
  process.exit(1);
}

// --- Load user profile ---
const profilePath = join(REPO_ROOT, '.ai-context', 'user-profile.md');
const userProfile = existsSync(profilePath)
  ? readFileSync(profilePath, 'utf8')
  : '(user-profile.md not found — create .ai-context/user-profile.md)';

// --- Load active contract if present in project ---
let contractContent = '(No C_RSP_BUILD_CONTRACT.md found in project root)';
if (PROJECT_PATH) {
  const contractCandidates = [
    join(PROJECT_PATH, 'C_RSP_BUILD_CONTRACT.md'),
    join(PROJECT_PATH, 'contracts', 'active', 'BUILD_CONTRACT.md'),
    join(PROJECT_PATH, 'BUILD_CONTRACT.md'),
  ];
  for (const cp of contractCandidates) {
    if (existsSync(cp)) {
      const raw = readFileSync(cp, 'utf8');
      // Truncate to first 3000 chars to stay manageable
      contractContent = raw.slice(0, 3000) + (raw.length > 3000 ? '\n\n[... truncated — read full file at ' + cp + ']' : '');
      break;
    }
  }
}

// --- Build STATUS.md summary ---
let statusContent = '(No STATUS.md found)';
if (PROJECT_PATH) {
  const statusPath = join(PROJECT_PATH, 'STATUS.md');
  if (existsSync(statusPath)) {
    statusContent = readFileSync(statusPath, 'utf8').slice(0, 1000);
  }
}

// --- Invariants (I1-I6) ---
const invariants = `
I1 — CONTRACT_REQUIRED: Every active build session must have a bound C-RSP contract.
     No work proceeds without a contract_id in scope.

I2 — EVIDENCE_REQUIRED: Every claim of completion requires a corresponding evidence file.
     "Done" without evidence is unverified. Unverified is the default state.

I3 — SCOPE_BOUNDARY: Work must stay within the declared contract scope.
     Scope expansion requires explicit contract amendment — not just a comment.

I4 — INVARIANT_CHAIN: Invariants I1-I6 cannot be bypassed, overridden, or worked around
     without a formal Break-Glass override (logged, dated, reason stated).

I5 — PII_GATE: No PII may be processed or stored without explicit authorization in the contract.

I6 — QUARANTINE_BLOCK: Modules with truth_status=quarantined are read-only.
     No commits, no deployment, no AI generation against quarantined modules.
`.trim();

// --- Unverified scope items ---
const unverifiedScope = module.unverified_scope
  ? Array.isArray(module.unverified_scope)
    ? module.unverified_scope.map((item, i) => `  ${i + 1}. ${item}`).join('\n')
    : String(module.unverified_scope)
  : '  (none listed — check STATUS.md)';

// --- Session timestamp ---
const now = new Date().toISOString();

// --- Generate output ---
const output = `# TLC 2.0 — Active Session Context
**Generated:** ${now}
**Module:** ${MODULE_ID}
**Status:** ${module.truth_status}
**Surface:** ${module.surface}
${module.contract_id ? `**Contract:** ${module.contract_id}` : '**Contract:** (none bound)'}

---

## OPERATING RULES FOR THIS SESSION

You are operating inside a TLC 2.0 governed session.
The following invariants are NON-NEGOTIABLE. You must not generate code, suggestions, or plans
that bypass, route around, or ignore any of these:

${invariants}

---

## MODULE: ${MODULE_ID}

**Label:** ${module.label}
**Path:** ${module.path}
**Truth Status:** ${module.truth_status}
${module.verified_date ? `**Last Verified:** ${module.verified_date}` : '**Last Verified:** (never)'}

### Verified Scope
${module.verified_scope ? JSON.stringify(module.verified_scope, null, 2) : '(not yet verified)'}

### Unverified Scope — Your Todo List This Session
${unverifiedScope}

### Notes
${module.notes || '(none)'}

---

## ACTIVE CONTRACT EXCERPT

${contractContent}

---

## CURRENT STATUS

${statusContent}

---

## USER PROFILE

${userProfile}

---

## WHAT TO DO WITH THIS CONTEXT

1. Read the unverified scope — those are your work items for this session.
2. Every claim you make must be backed by something you can point to (file, test output, run result).
3. If you are asked to do something that violates I1-I6, say so explicitly. Do not silently comply.
4. Do not expand scope beyond the contract without flagging it.
5. End every substantive response with a V&T statement:
   EXISTS | VERIFIED AGAINST | NOT CLAIMED | FUNCTIONAL STATUS
`;

// --- Write output ---
const outputDir = join(REPO_ROOT, '.ai-context');
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, 'active-session.md');
writeFileSync(outputPath, output, 'utf8');

console.log(`[inject-ai-context] Written: ${outputPath}`);
console.log(`[inject-ai-context] Module: ${MODULE_ID} (${module.truth_status})`);
if (module.unverified_scope && module.unverified_scope.length) {
  console.log(`[inject-ai-context] Unverified scope items: ${module.unverified_scope.length}`);
}
console.log('\nPaste this at the start of any AI session:');
console.log(`  "Read .ai-context/active-session.md. Operating under module ${MODULE_ID}."`);
