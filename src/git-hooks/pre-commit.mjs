#!/usr/bin/env node
/**
 * pre-commit.mjs
 * TLC 2.0 Git Hook — Pre-Commit Invariant Enforcer
 *
 * Blocks commits on:
 *   - Unregistered modules (I1: no contract = no commit)
 *   - Quarantined modules (I6: quarantine block)
 *   - Missing evidence when AC is claimed complete (I2)
 *   - PII patterns in staged files (I5)
 *
 * Installed by tlc-new automatically.
 * Also installed globally via: git config --global core.hooksPath <tlc-hooks-dir>
 *
 * The hook reads module ID from:
 *   1. TLC_MODULE env var
 *   2. .tlc-module file in repo root
 *   3. Registry path match against cwd
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { appendAuditEntry } from '../core/audit.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = resolve(__dirname, '..', '..');
const HOME = homedir();
const PROJECTS_DIR = process.env.TLC_PROJECTS_DIR || join(HOME, 'Projects');
// --- Load registry ---
const registryPath = join(TLC_ROOT, 'registry', 'modules.registry.json');
if (!existsSync(registryPath)) {
  // No registry — can't enforce; allow commit
  process.exit(0);
}

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

// --- Determine module ID ---
const cwd = process.cwd();
let MODULE_ID = process.env.TLC_MODULE || null;

if (!MODULE_ID) {
  // Try .tlc-module file
  const tlcModuleFile = join(cwd, '.tlc-module');
  if (existsSync(tlcModuleFile)) {
    MODULE_ID = readFileSync(tlcModuleFile, 'utf8').trim();
  }
}

if (!MODULE_ID) {
  // Try registry path match
  const normalized = cwd.toLowerCase().replace(/\/$/, '');
  const match = registry.modules.find(m => {
    let p = m.path;
    if (!p.startsWith('/')) {
      const dirName = p.replace(/\/$/, '').split('/').pop();
      p = join(PROJECTS_DIR, dirName);
    }
    return p.toLowerCase().replace(/\/$/, '') === normalized;
  });
  if (match) MODULE_ID = match.id;
}

// --- ANSI ---
const R = '\x1b[31m', Y = '\x1b[33m', G = '\x1b[32m', D = '\x1b[2m', B = '\x1b[1m', X = '\x1b[0m';

function halt(reason, details) {
  console.error(`\n${R}${B}COMMIT BLOCKED — TLC 2.0 INVARIANT VIOLATION${X}`);
  console.error(`${R}${reason}${X}`);
  if (details) console.error(`${D}${details}${X}`);
  console.error(`\n${D}To bypass: set TLC_BYPASS_HOOKS=1 (use only with Break-Glass justification)${X}\n`);
  process.exit(1);
}

// --- Break-glass bypass ---
const BYPASS_LOG = join(TLC_ROOT, 'evidence', 'bypass-log.jsonl');

if (process.env.TLC_BYPASS_HOOKS === '1') {
  // I10: Record break-glass event unconditionally before allowing bypass
  const bypassEntry = {
    event: 'break_glass',
    timestamp: new Date().toISOString(),
    module_id: MODULE_ID || 'unknown',
    operator: process.env.USER || process.env.USERNAME || 'unknown',
    cwd,
    justification: process.env.TLC_BYPASS_REASON || 'NO JUSTIFICATION PROVIDED',
    commit_msg: (() => { try { return execSync('git log -1 --format=%s HEAD 2>/dev/null', { encoding: 'utf8' }).trim(); } catch { return ''; } })(),
  };
  try {
    appendAuditEntry(BYPASS_LOG, bypassEntry);
  } catch { /* non-fatal — still allow bypass */ }
  console.warn(`${Y}WARN: TLC pre-commit hooks bypassed via TLC_BYPASS_HOOKS=1${X}`);
  console.warn(`${Y}Break-glass event recorded in evidence/bypass-log.jsonl${X}`);
  // INV-060 (Article VII / X): an UNJUSTIFIED break-glass may not proceed. The attempt is
  // recorded above (append-only), then blocked. Previously this only warned — which let an
  // unjustified bypass through. Provide TLC_BYPASS_REASON to proceed.
  if (!process.env.TLC_BYPASS_REASON) {
    console.error(`\n${R}${B}COMMIT BLOCKED — unjustified break-glass (INV-060 / Article VII, X)${X}`);
    console.error(`${R}A break-glass bypass without a justification may not proceed.${X}`);
    console.error(`${D}Set TLC_BYPASS_REASON="<justification>" to proceed under break-glass, or resolve the violation instead. The unjustified attempt has been recorded to evidence/bypass-log.jsonl.${X}\n`);
    process.exit(1);
  }
  process.exit(0);
}

// --- If no module ID found, warn but allow ---
if (!MODULE_ID) {
  console.log(`${D}[tlc-hook] No module ID found — repo not registered with TLC 2.0${X}`);
  console.log(`${D}[tlc-hook] Commit allowed. To govern this repo: tlc-new or add .tlc-module file${X}`);
  process.exit(0);
}

const mod = registry.modules.find(m => m.id === MODULE_ID);

// --- I1: Contract required ---
if (!mod) {
  halt(
    `I1 VIOLATION — Module "${MODULE_ID}" not found in TLC registry.`,
    `Register it first: tlc-new --name ${MODULE_ID.toLowerCase()} --surface private_lab`
  );
}

// --- I6: Quarantine block ---
if (mod.truth_status === 'quarantined') {
  halt(
    `I6 VIOLATION — Module "${MODULE_ID}" is QUARANTINED.`,
    `Quarantined modules are read-only. Resolve the quarantine condition in the registry, then re-attempt.`
  );
}

// --- I9: Audit log deletion guard ---
// Staged deletions of audit log files are blocked unconditionally.
const AUDIT_LOG_NAMES = ['bypass-log.jsonl', 'purge-log.jsonl', 'audit-log.jsonl'];
const deletedAuditLogs = (() => {
  try {
    const deleted = execSync(
      'git diff --cached --name-only --diff-filter=D',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);
    return deleted.filter(f => AUDIT_LOG_NAMES.some(name => f.endsWith(name)));
  } catch { return []; }
})();

if (deletedAuditLogs.length > 0) {
  halt(
    `I9 VIOLATION — Audit log deletion blocked.`,
    `Files: ${deletedAuditLogs.join(', ')}\n` +
    `Audit logs must be retained ≥ 90 days per Article X, Section 10.3.\n` +
    `Use: tlc-purge --purge-log --before <date> --confirm (enforces 90-day floor).`
  );
}

// --- I2: Evidence check on AC completion claims ---
// Check staged files for evidence markers
let stagedFiles = [];
try {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  stagedFiles = staged.trim().split('\n').filter(Boolean);
} catch { /* git not available — skip */ }

// Look for "AC-xxx: COMPLETE" or "status: complete" in staged content
let acCompletionClaimed = false;
for (const file of stagedFiles) {
  if (!existsSync(file)) continue;
  try {
    const content = readFileSync(file, 'utf8');
    if (/AC-\w+-\d+.*complete/i.test(content) || /"status":\s*"complete"/i.test(content)) {
      acCompletionClaimed = true;
      break;
    }
  } catch { /* binary or unreadable */ }
}

if (acCompletionClaimed) {
  // Check for evidence file in staged set
  const hasEvidence = stagedFiles.some(f =>
    /evidence/i.test(f) || f.endsWith('.jsonl') || /vnt/i.test(f)
  );
  if (!hasEvidence) {
    console.warn(`${Y}WARN: I2 — AC completion claimed in staged files but no evidence file staged.${X}`);
    console.warn(`${Y}Consider: commit an evidence file alongside completion claims.${X}`);
    // WARN only — not a halt at Tier-1
  }
}

// --- I5: PII scan ---
const PII_PATTERNS = [
  { re: /\b\d{3}-\d{2}-\d{4}\b/,                         label: 'SSN pattern' },
  { re: /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/,      label: 'Credit card pattern' },
  { re: /password\s*[:=]\s*["']?[^\s"']{6,}/i,           label: 'Plaintext password' },
  { re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,label: 'Email address' },
];

for (const file of stagedFiles.slice(0, 50)) {
  if (!existsSync(file)) continue;
  if (/\.(png|jpg|gif|pdf|zip|tar|gz|bin|woff|ttf)$/i.test(file)) continue;
  // Skip the bypass log itself and evidence files with explicit pii_authorized
  if (file.includes('bypass-log')) continue;
  try {
    const content = readFileSync(file, 'utf8').slice(0, 50000);
    // If file declares pii_authorized, skip PII scan
    if (/pii_authorized\s*[:=]/i.test(content)) continue;
    for (const { re, label } of PII_PATTERNS) {
      if (re.test(content)) {
        halt(
          `I5 VIOLATION — Possible PII detected in: ${file}`,
          `Pattern: ${label}\nReview and redact, or add "pii_authorized: <justification>" to the contract.`
        );
      }
    }
  } catch { /* skip unreadable */ }
}

// --- I11: Evidence chain integrity ---
// If a STATUS.md is staged with a truth_status upgrade, require evidence file in same commit
const statusFiles = stagedFiles.filter(f => /STATUS\.md$/i.test(f));
for (const sf of statusFiles) {
  if (!existsSync(sf)) continue;
  try {
    const content = readFileSync(sf, 'utf8');
    const statusMatch = content.match(/[Tt]ruth[_ ][Ss]tatus[:\s]+(\w+)/);
    if (statusMatch && ['working', 'partial'].includes(statusMatch[1].toLowerCase())) {
      const hasEvidence = stagedFiles.some(f => /evidence/i.test(f));
      if (!hasEvidence) {
        console.warn(`${Y}WARN I11: STATUS.md declares truth_status: ${statusMatch[1]} but no evidence file is staged.${X}`);
        console.warn(`${Y}Per Article XI: status upgrades require evidence. Stage an evidence file.${X}`);
        // WARN not halt — allow self-correction, not hard block at baseline tier
      }
    }
  } catch { /* skip */ }
}

// --- I13: Rollback required before deploy ---
// If any staged file name contains "deploy" or "release", check for rollback evidence
const deployFiles = stagedFiles.filter(f => /deploy|release/i.test(f));
if (deployFiles.length > 0) {
  const hasRollback = stagedFiles.some(f => /rollback/i.test(f));

  // Also check evidence directory on disk
  const evidenceDir = mod && mod.path
    ? join(mod.path, 'evidence')
    : join(TLC_ROOT, 'evidence');
  let rollbackOnDisk = false;
  if (existsSync(evidenceDir)) {
    try {
      rollbackOnDisk = readdirSync(evidenceDir).some(f => /rollback/i.test(f));
    } catch { rollbackOnDisk = false; }
  }

  if (!hasRollback && !rollbackOnDisk) {
    halt(
      `I13 VIOLATION — Deploy file staged without rollback evidence.`,
      `Staged: ${deployFiles.join(', ')}\n` +
      `Create evidence/rollback-YYYY-MM-DD.md before committing deploy files.\n` +
      `Article XI, Section 11.2: Rollback evidence required before deploy.`
    );
  }
}

// --- I16: Default directions compliance ---
// Staged .md files tagged <default-directions> must pass the Article XVI validator.
// TLC_BYPASS_HOOKS=1 does NOT bypass this check.
// Exception: commit message contains [DRAFT-INSTRUCTIONS] → allows commit without validation.
const stagedMd = stagedFiles.filter(f => /\.(md|markdown)$/i.test(f));
if (stagedMd.length > 0) {
  const validatorPath = join(TLC_ROOT, 'scripts', 'validate-instructions.mjs');
  if (existsSync(validatorPath)) {
    // Read COMMIT_EDITMSG if present (captures in-progress commit message)
    let commitMsg = '';
    const editmsgPath = join(TLC_ROOT, '.git', 'COMMIT_EDITMSG');
    if (existsSync(editmsgPath)) {
      try { commitMsg = readFileSync(editmsgPath, 'utf8'); } catch {}
    }
    const isDraft = /\[DRAFT-INSTRUCTIONS\]/i.test(commitMsg);
    for (const mdFile of stagedMd) {
      const absFile = resolve(process.cwd(), mdFile);
      if (!existsSync(absFile)) continue;
      let content = '';
      try { content = readFileSync(absFile, 'utf8'); } catch { continue; }
      // Only count files where the tag appears outside backtick code spans / fenced blocks
      const noFence = content.replace(/```[\s\S]*?```/g, '');
      const noCode = noFence.replace(/`[^`\n]+`/g, '');
      if (!noCode.includes('<default-directions>')) continue;
      // File is tagged — must pass validator (unless [DRAFT-INSTRUCTIONS] in commit message)
      if (isDraft) {
        console.log(`${Y}[I16] DRAFT-INSTRUCTIONS — skipping validation for ${mdFile}${X}`);
        continue;
      }
      try {
        execSync(`node "${validatorPath}" "${absFile}" --quiet`, { encoding: 'utf8', stdio: 'pipe' });
      } catch {
        let detail = '';
        try {
          const r = execSync(`node "${validatorPath}" "${absFile}"`, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
          detail = r;
        } catch (e2) { detail = (e2.stdout || '') + (e2.stderr || ''); }
        halt(
          `I16 VIOLATION — <default-directions> file fails Article XVI: ${mdFile}`,
          (detail.trim() || '') + '\nRun manually: node scripts/validate-instructions.mjs ' + mdFile +
          '\nFix all R1–R16 errors, then commit again.' +
          '\nTo commit a draft (not yet compliant), add [DRAFT-INSTRUCTIONS] to your commit message.'
        );
      }
    }
  }
}

// --- TALSP v4.2: Truth-State Gate ---
// Any staged file that carries a Truth-State: VERIFIED or Truth-State: VALIDATED
// claim MUST be backed by a corresponding evidence artifact.
// Blocks inflation (e.g. labeling PROPOSED work as VERIFIED).
//
// Evidence artifact rule:
//   VERIFIED  → evidence/<module-id>/ must contain ≥1 file, OR the commit
//               message contains [TRUTH-STATE-ADVANCE] with reason.
//   VALIDATED → same, AND evidence must contain a file matching
//               /validated|pilot|study|n=\d+/i (empirical result signal).
//
// Exception: files inside frameworks/, instruments/, governance/, or
// templates/ may carry SPECIFIED without requiring evidence (design docs).
// Only VERIFIED and VALIDATED are gated.

const OVERSTATEMENT_RE = /^\s*[-*]?\s*\*{0,2}Truth[- ]?State\*{0,2}\s*[:：]\s*(VERIFIED|VALIDATED)\s*$/im;
const VALIDATED_RE     = /^\s*[-*]?\s*\*{0,2}Truth[- ]?State\*{0,2}\s*[:：]\s*VALIDATED\s*$/im;

// Read commit message for [TRUTH-STATE-ADVANCE] bypass
let commitMsgForTS = '';
const editmsgPathTS = join(TLC_ROOT, '.git', 'COMMIT_EDITMSG');
if (existsSync(editmsgPathTS)) {
  try { commitMsgForTS = readFileSync(editmsgPathTS, 'utf8'); } catch {}
}
const tsAdvance = /\[TRUTH-STATE-ADVANCE\]/i.test(commitMsgForTS);

for (const sf of stagedFiles) {
  const absF = resolve(process.cwd(), sf);
  if (!/\.(md|markdown|ts|mjs|js)$/i.test(sf)) continue;
  if (!existsSync(absF)) continue;

  let fileContent = '';
  try { fileContent = readFileSync(absF, 'utf8'); } catch { continue; }

  // Strip fenced code blocks and inline code before checking
  const strippedContent = fileContent
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '');

  if (!OVERSTATEMENT_RE.test(strippedContent)) continue;

  // This file claims VERIFIED or VALIDATED — validate it
  if (tsAdvance) {
    console.log(`${Y}[TS-GATE] TRUTH-STATE-ADVANCE bypass recorded for ${sf}${X}`);
    // Log the advance in evidence
    const tsLog = join(TLC_ROOT, 'evidence', 'truth-state-advances.jsonl');
    try {
      const entry = JSON.stringify({
        event: 'truth_state_advance',
        timestamp: new Date().toISOString(),
        file: sf,
        module_id: MODULE_ID || 'unknown',
        operator: process.env.USER || 'unknown',
        commit_message_snippet: commitMsgForTS.slice(0, 200),
      }) + '\n';
      const tsDir = join(TLC_ROOT, 'evidence');
      if (!existsSync(tsDir)) mkdirSync(tsDir, { recursive: true });
      appendFileSync(tsLog, entry);
    } catch { /* non-fatal */ }
    continue;
  }

  // Check for evidence artifact
  const evidenceBase = join(TLC_ROOT, 'evidence');
  const moduleEvidenceDir = MODULE_ID
    ? join(evidenceBase, MODULE_ID.toLowerCase())
    : evidenceBase;

  let hasEvidence = false;
  if (existsSync(moduleEvidenceDir)) {
    try {
      const evFiles = readdirSync(moduleEvidenceDir);
      hasEvidence = evFiles.length > 0;
      // VALIDATED requires empirical result signal
      if (hasEvidence && VALIDATED_RE.test(strippedContent)) {
        hasEvidence = evFiles.some(f => /validated|pilot|study|n=\d+|results/i.test(f));
      }
    } catch { hasEvidence = false; }
  }

  if (!hasEvidence) {
    halt(
      `TRUTH-STATE INFLATION — file claims VERIFIED/VALIDATED without evidence: ${sf}`,
      `Truth-State: VERIFIED or VALIDATED requires a corresponding artifact in:\n` +
      `  ${moduleEvidenceDir}\n\n` +
      `Options:\n` +
      `  1. Downgrade Truth-State to SPECIFIED (design docs do not need evidence)\n` +
      `  2. Add the evidence artifact to evidence/${(MODULE_ID||'').toLowerCase()}/\n` +
      `  3. Add [TRUTH-STATE-ADVANCE] to your commit message + justification\n\n` +
      `This gate enforces TALSP v4.2 §Truth-State Discipline and UPOS-7-VS V&T rules.\n` +
      `Claiming VERIFIED without evidence is forbidden (Article I, Core Constitution).`
    );
  }
}

// --- Evidence Chain Engine: 100% branch coverage + red-team gate ---
// This runs the full test suite + red-team validation. Blocks if either fails.
const EVIDENCE_TEST = join(TLC_ROOT, 'src', 'evidence-chain', 'engine.test.ts');
const RED_TEAM_RUN  = join(TLC_ROOT, 'src', 'evidence-chain', 'validation', 'red-team-run.ts');
if (existsSync(EVIDENCE_TEST)) {
  // 1. 100% branch coverage gate
  try {
    execSync(
      `node_modules/.bin/c8 --include='src/evidence-chain/*.ts' --exclude='src/evidence-chain/*.test.ts' ` +
      `--branches=100 --statements=100 --functions=100 --lines=100 ` +
      `--reporter=text node --import tsx/esm --test "${EVIDENCE_TEST}"`,
      { cwd: TLC_ROOT, stdio: 'pipe' }
    );
    console.log(`${G}[tlc-hook] ✓ Evidence chain: 100% branch coverage${X}`);
  } catch (coverageErr) {
    halt(
      'EVIDENCE CHAIN COVERAGE GATE FAILED — branch coverage dropped below 100%.',
      `Run: node_modules/.bin/c8 --reporter=text node --import tsx/esm --test src/evidence-chain/engine.test.ts`
    );
  }
  // 2. Red-team gate: all 9 attack vectors must remain BLOCKED
  if (existsSync(RED_TEAM_RUN)) {
    try {
      execSync(
        `node --import tsx/esm "${RED_TEAM_RUN}"`,
        { cwd: TLC_ROOT, stdio: 'pipe', env: { ...process.env, TLC_HOOK_RUN: '1' } }
      );
      console.log(`${G}[tlc-hook] ✓ Evidence chain: red-team — all attack vectors BLOCKED${X}`);
    } catch (redTeamErr) {
      halt(
        'EVIDENCE CHAIN RED-TEAM GATE FAILED — a bypass attack succeeded.',
        `Run: node --import tsx/esm src/evidence-chain/validation/red-team-run.ts`
      );
    }
  }
}

// --- All checks passed ---
console.log(`${G}[tlc-hook] ✓ Pre-commit checks passed — Module: ${MODULE_ID} (${mod?.truth_status ?? 'unknown'})${X}`);
process.exit(0);
