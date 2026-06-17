#!/usr/bin/env node
/**
 * tlc-sync-skills.mjs
 * TLC 2.0 Workspace — Hermes Skill Synchronizer
 *
 * Reads registry/modules.registry.json and generates a Hermes skill file
 * for each registered module at:
 *   ~/.hermes/skills/tlc/crsp-<module-id-lower>/SKILL.md
 *
 * Each skill encodes:
 *   - The live contract scope and ACs
 *   - Current truth_status and unverified items
 *   - I1-I6 invariants as AI refusal requirements
 *   - Operator preferences from .ai-context/user-profile.md
 *
 * Usage:
 *   tlc-sync-skills                    # sync all modules
 *   tlc-sync-skills --module MODULE-ID # sync one module
 *   tlc-sync-skills --dry-run          # show what would be written
 *   tlc-sync-skills --list             # list currently synced skills
 *
 * Run after: tlc-done (status change), tlc-register (new module), tlc-new (new project)
 *
 * Article XIII, Section 13.3 of SOCIOTECHNICAL_CONSTITUTION.md governs this script.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = join(__dirname, '..');
const HOME = homedir();
const SKILLS_DIR = join(HOME, '.hermes', 'skills', 'tlc');
const REGISTRY_PATH = join(TLC_ROOT, 'registry', 'modules.registry.json');
const USER_PROFILE_PATH = join(TLC_ROOT, '.ai-context', 'user-profile.md');

// CLI args
const args = process.argv.slice(2);
const targetModule = args.includes('--module') ? args[args.indexOf('--module') + 1] : null;
const dryRun = args.includes('--dry-run');
const listMode = args.includes('--list');

// ANSI
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(msg) { console.log(msg); }
function ok(msg) { log(`${GREEN}✓${RESET} ${msg}`); }
function skip(msg) { log(`${DIM}─${RESET} ${msg}`); }
function info(msg) { log(`${CYAN}→${RESET} ${msg}`); }
function warn(msg) { log(`${YELLOW}⚠${RESET} ${msg}`); }

// ── Registry ──────────────────────────────────────────────────────────────────

function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) {
    warn('Registry not found. Run tlc-new or tlc-register to create modules first.');
    process.exit(1);
  }
  try {
    const raw = readFileSync(REGISTRY_PATH, 'utf8');
    const data = JSON.parse(raw);
    // Support both {modules:[]} and flat {MODULE_ID: {...}} shapes
    if (Array.isArray(data.modules)) return data.modules;
    if (Array.isArray(data)) return data;
    // Flat object: values are modules
    return Object.values(data).filter(v => typeof v === 'object' && v.id);
  } catch (e) {
    warn(`Registry parse error: ${e.message}`);
    process.exit(1);
  }
}

// ── Contract loader ───────────────────────────────────────────────────────────

function loadContract(module) {
  const contractPaths = [
    module.path ? join(module.path, 'C_RSP_BUILD_CONTRACT.md') : null,
    module.path ? join(module.path, 'contracts', 'BUILD_CONTRACT.md') : null,
    join(TLC_ROOT, 'contracts', 'active', 'BUILD_CONTRACT.md'),
  ].filter(Boolean);

  for (const p of contractPaths) {
    if (existsSync(p)) {
      return readFileSync(p, 'utf8');
    }
  }
  return null;
}

// ── User profile ──────────────────────────────────────────────────────────────

function loadUserProfile() {
  if (existsSync(USER_PROFILE_PATH)) {
    return readFileSync(USER_PROFILE_PATH, 'utf8');
  }
  return null;
}

// ── Skill renderer ────────────────────────────────────────────────────────────

function renderSkill(module, contractContent, userProfile) {
  const id = module.id || module.module_id || 'UNKNOWN';
  const idClean = id.toLowerCase().replace(/_/g, '-').replace(/^crsp-/, '');
  const skillName = `crsp-${idClean}`;
  const status = module.truth_status || module.status || 'unverified';
  const surface = module.surface || 'private_lab';
  const contractId = module.contract_id || `CRSP-${id}`;
  const path = module.path || 'not set';
  const description = module.description || module.name || id;
  const unverifiedScope = module.unverified_scope || [];
  const notes = module.notes || '';

  // Extract ACs from contract if available
  let acSection = '';
  if (contractContent) {
    const acMatch = contractContent.match(/## Acceptance Criteria[\s\S]*?(?=\n## |\n---|\z)/);
    if (acMatch) {
      acSection = acMatch[0].trim();
    }
  }

  // Extract scope from contract
  let scopeSection = '';
  if (contractContent) {
    const scopeMatch = contractContent.match(/## (?:Scope|Objective)[\s\S]*?(?=\n## |\n---|\z)/);
    if (scopeMatch) {
      scopeSection = scopeMatch[0].trim();
    }
  }

  // Extract not-claimed from contract
  let notClaimedSection = '';
  if (contractContent) {
    const ncMatch = contractContent.match(/## Not Claimed[\s\S]*?(?=\n## |\n---|\z)/);
    if (ncMatch) {
      notClaimedSection = ncMatch[0].trim();
    }
  }

  const unverifiedList = Array.isArray(unverifiedScope) && unverifiedScope.length > 0
    ? unverifiedScope.map(item => `- ${item}`).join('\n')
    : '- No unverified scope items recorded';

  const userProfileSection = userProfile
    ? `\n## Operator Preferences\n\nThe following operator profile governs how you communicate and structure work:\n\n${userProfile.substring(0, 1200)}${userProfile.length > 1200 ? '\n\n[Profile truncated — see .ai-context/user-profile.md for full text]' : ''}`
    : '';

  const now = new Date().toISOString().split('T')[0];

  return {
    skillName,
    content: `---
name: ${skillName}
description: Use when working on TLC module ${id}. Contract: ${contractId}. Status: ${status}. Loads scope, ACs, invariants, and operator preferences for this module.
version: 1.0.0
author: tlc-sync-skills
license: MIT
metadata:
  hermes:
    tags: [tlc, governance, crsp, ${id.toLowerCase()}, ${status}]
    related_skills: [crsp-build-contracts, tlc-technical-documentation]
  tlc:
    module_id: ${id}
    contract_id: ${contractId}
    truth_status: ${status}
    surface: ${surface}
    synced: ${now}
---

# TLC Module: ${id}

You are operating inside a governed TLC 2.0 session for module **${id}**.
This skill encodes the active contract, current truth status, and behavioral constraints
for this session. Read this before responding to any request.

## Module Identity

- **Module ID:** ${id}
- **Description:** ${description}
- **Contract:** ${contractId}
- **Truth Status:** ${status}
- **Surface:** ${surface}
- **Path on disk:** ${path}
${notes ? `- **Notes:** ${notes}` : ''}

## Current Truth Status Meaning

| Status | Meaning |
|--------|---------|
| \`unverified\` | Created; not yet tested |
| \`draft\` | In active development |
| \`partial\` | Some ACs met with evidence |
| \`working\` | All ACs met; reviewer approved |
| \`quarantined\` | Frozen; governance violation pending |

**This module is currently: \`${status}\`**

${status === 'quarantined' ? '⚠️  THIS MODULE IS QUARANTINED. Read the notes field in the registry before proceeding.' : ''}

## Unverified Scope Items

These items are declared in the module registry as not yet verified.
They represent your active working queue for this session:

${unverifiedList}

${scopeSection ? `## Contract Scope\n\n${scopeSection}` : ''}

${acSection ? `## Acceptance Criteria\n\n${acSection}` : ''}

${notClaimedSection ? `## What This Module Does Not Claim\n\n${notClaimedSection}` : ''}

## Invariants You Must Enforce (I1-I6)

These are constitutional constraints. You must refuse actions that violate them
and name the specific invariant being violated when you decline.

**I1 — Contract Required**
No work proceeds without a valid contract. This skill IS the contract context.
If contract scope is unclear, stop and ask the operator to clarify before generating code.

**I2 — Evidence Required for Claims**
You may not self-report AC completion. You may propose that an AC is met and describe
what evidence would confirm it. The operator captures the evidence.

**I3 — Scope Boundary Enforcement**
Work outside declared contract scope is unauthorized. If asked to work outside scope,
say: "That is outside the contract scope for ${id}. Amend the contract or confine work to declared scope."

**I4 — Invariants Are Not Bypassable**
Do not generate code that circumvents I1-I6. If asked to do so, decline and explain why.

**I5 — No Unauthorized PII**
Do not generate code that stores PII without an explicit contract authorization.
Do not include real names, emails, or identifying information in evidence drafts.

**I6 — Quarantined Modules Are Read-Only**
If this module is quarantined, you may read and analyze but not generate commits or
claim work is complete until the operator resolves the quarantine.

## AI Refusal Requirements (Article XIII)

You must refuse to:
1. Generate deploy commands without a rollback plan on record (check evidence/ first)
2. Upgrade truth_status without operator confirmation
3. Claim an AC is complete without evidence
4. Generate code outside declared contract scope without flagging the violation
5. Invoke or suggest TLC_BYPASS_HOOKS=1 without a written justification

## Session Start Protocol

When a new session begins on this module:

1. Confirm: "I have loaded the contract for ${id}. Current status: ${status}."
2. State the first unverified scope item or open AC.
3. Ask: "What would you like to work on first?"
4. Work within scope. Flag violations. Propose evidence.

## Evidence Capture Protocol

When work is complete on an AC:
1. Do NOT self-report completion.
2. State: "AC-XXX appears to be met. To capture evidence, run: [specific command or save: evidence/session-YYYY-MM-DD.md]"
3. Describe what the evidence should contain.
4. Wait for operator confirmation before treating it as complete.
${userProfileSection}

---

*This skill was auto-generated by tlc-sync-skills on ${now}.*
*Source of truth: registry/modules.registry.json and contracts/.*
*Re-run \`tlc-sync-skills --module ${id}\` after any status change.*
`
  };
}

// ── List mode ─────────────────────────────────────────────────────────────────

function listSyncedSkills() {
  if (!existsSync(SKILLS_DIR)) {
    log('No TLC skills synced yet. Run tlc-sync-skills to create them.');
    return;
  }
  const entries = readdirSync(SKILLS_DIR);
  if (entries.length === 0) {
    log('No TLC skills found in ~/.hermes/skills/tlc/');
    return;
  }
  log(`\n${BOLD}Synced TLC Skills${RESET} (${SKILLS_DIR})\n`);
  for (const entry of entries) {
    const skillFile = join(SKILLS_DIR, entry, 'SKILL.md');
    if (existsSync(skillFile)) {
      const content = readFileSync(skillFile, 'utf8');
      const statusMatch = content.match(/truth_status: (\w+)/);
      const status = statusMatch ? statusMatch[1] : 'unknown';
      const color = status === 'working' ? GREEN : status === 'quarantined' ? YELLOW : DIM;
      log(`  ${color}${entry}${RESET}  ${DIM}[${status}]${RESET}`);
    }
  }
  log('');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (listMode) {
    listSyncedSkills();
    return;
  }

  log(`\n${BOLD}TLC → Hermes Skill Sync${RESET}\n`);

  const modules = loadRegistry();
  const userProfile = loadUserProfile();

  if (modules.length === 0) {
    warn('No modules found in registry. Nothing to sync.');
    process.exit(0);
  }

  const targets = targetModule
    ? modules.filter(m => (m.id || m.module_id) === targetModule)
    : modules;

  if (targetModule && targets.length === 0) {
    warn(`Module ${targetModule} not found in registry.`);
    process.exit(1);
  }

  if (!dryRun) {
    mkdirSync(SKILLS_DIR, { recursive: true });
  }

  let synced = 0;
  let skipped = 0;

  for (const module of targets) {
    const id = module.id || module.module_id;
    if (!id) { skip('Skipping module with no ID'); skipped++; continue; }

    const contractContent = loadContract(module);
    if (!contractContent) {
      skip(`${id}  ${DIM}(no contract found — skill will omit scope/ACs)${RESET}`);
    }

    const { skillName, content } = renderSkill(module, contractContent, userProfile);
    const skillDir = join(SKILLS_DIR, skillName);
    const skillPath = join(skillDir, 'SKILL.md');

    if (dryRun) {
      info(`Would write: ${skillPath}`);
      log(`  ${DIM}${content.substring(0, 120).replace(/\n/g, ' ')}...${RESET}\n`);
      synced++;
      continue;
    }

    mkdirSync(skillDir, { recursive: true });
    writeFileSync(skillPath, content, 'utf8');
    ok(`${id}  ${DIM}→ ${skillPath}${RESET}`);
    synced++;
  }

  log('');
  log(`${BOLD}Done.${RESET} ${GREEN}${synced} synced${RESET}${skipped > 0 ? `, ${DIM}${skipped} skipped${RESET}` : ''}.`);

  if (!dryRun && synced > 0) {
    log('');
    log(`${DIM}To use a skill: hermes -s crsp-<module-id-lowercase>${RESET}`);
    log(`${DIM}Example: hermes -s crsp-digital-twin-health-coach${RESET}`);
    log(`${DIM}Or launch governed session: tlc-hermes --module <MODULE-ID>${RESET}`);
  }
  log('');
}

main().catch(e => {
  console.error(`\n${YELLOW}Error:${RESET}`, e.message);
  process.exit(1);
});
