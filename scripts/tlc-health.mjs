#!/usr/bin/env node
/**
 * tlc-health.mjs
 * TLC 2.0 Workspace — Health Check for CLI Modules
 *
 * Implements Constitutional Invariant I14 (Article XI, Section 11.3):
 *   "Every runtime module must expose a mechanism to verify it is operating correctly."
 *
 * For TLC 2.0 as a CLI runtime, "healthy" means:
 *   - Registry is parseable and non-empty
 *   - All required scripts are present and executable
 *   - No module is stuck in an inconsistent state (has .sessions/ open record but no ended_at)
 *   - Evidence directory is writable
 *   - Shell integration is sourced (tlc aliases exist)
 *   - No hardcoded paths from another operator's machine (Article XIV.3)
 *
 * Exit codes:
 *   0 = healthy
 *   1 = degraded (warnings, still operational)
 *   2 = critical (governance cannot function)
 *
 * Usage:
 *   tlc-health                  # full check, ANSI output
 *   tlc-health --quiet          # exit code only
 *   tlc-health --module MOD-ID  # check one module specifically
 *   tlc-health --json           # machine-readable output
 *
 * Article XI, Section 11.3 of SOCIOTECHNICAL_CONSTITUTION.md.
 */

import {
  readFileSync, existsSync, accessSync, constants,
  readdirSync, statSync,
} from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TLC_ROOT = join(__dirname, '..');
const HOME = homedir();
const PROJECTS_DIR = process.env.TLC_PROJECTS_DIR || join(HOME, 'Projects');

// ANSI
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const quiet   = args.includes('--quiet');
const jsonOut = args.includes('--json');
const moduleId = args.includes('--module') ? args[args.indexOf('--module') + 1] : null;

// ── Result accumulator ────────────────────────────────────────────────────────

const results = [];
let criticalCount = 0;
let warnCount = 0;

function check(label, fn) {
  try {
    const result = fn();
    const status = result === true ? 'ok'
      : result === 'warn' ? 'warn'
      : result === 'critical' ? 'critical'
      : typeof result === 'object' ? result.status
      : 'ok';
    const detail = typeof result === 'object' ? result.detail : '';

    if (status === 'critical') criticalCount++;
    if (status === 'warn') warnCount++;

    results.push({ label, status, detail });

    if (!quiet && !jsonOut) {
      const icon = status === 'ok' ? `${GREEN}✓${RESET}`
        : status === 'warn' ? `${YELLOW}⚠${RESET}`
        : `${RED}✗${RESET}`;
      log(`  ${icon} ${label}${detail ? `  ${DIM}${detail}${RESET}` : ''}`);
    }
  } catch (e) {
    criticalCount++;
    results.push({ label, status: 'critical', detail: e.message });
    if (!quiet && !jsonOut) {
      log(`  ${RED}✗${RESET} ${label}  ${DIM}${e.message}${RESET}`);
    }
  }
}

function log(msg) { if (!quiet) console.log(msg); }

// ── Checks ────────────────────────────────────────────────────────────────────

function checkRegistry() {
  check('Registry file exists', () => {
    const p = join(TLC_ROOT, 'registry', 'modules.registry.json');
    if (!existsSync(p)) return { status: 'critical', detail: 'Missing registry/modules.registry.json' };
    return true;
  });

  check('Registry is parseable', () => {
    const p = join(TLC_ROOT, 'registry', 'modules.registry.json');
    if (!existsSync(p)) return 'warn';
    try {
      const data = JSON.parse(readFileSync(p, 'utf8'));
      const modules = Array.isArray(data.modules) ? data.modules
        : Array.isArray(data) ? data
        : Object.values(data).filter(v => typeof v === 'object' && v.id);
      if (modules.length === 0) return { status: 'warn', detail: 'Registry has no modules' };
      return { status: 'ok', detail: `${modules.length} module(s)` };
    } catch (e) {
      return { status: 'critical', detail: `Parse error: ${e.message}` };
    }
  });
}

function checkScripts() {
  const required = [
    'scripts/tlc-work.mjs',
    'scripts/tlc-done.mjs',
    'scripts/tlc-new.mjs',
    'scripts/tlc-dashboard.mjs',
    'scripts/tlc-register.mjs',
    'scripts/tlc-sync-skills.mjs',
    'scripts/tlc-hermes.mjs',
    'scripts/tlc-purge.mjs',
    'scripts/tlc-health.mjs',
    'scripts/inject-ai-context.mjs',
    'scripts/validate-module-here.mjs',
    'src/git-hooks/pre-commit.mjs',
  ];

  for (const rel of required) {
    check(`Script present: ${rel}`, () => {
      const p = join(TLC_ROOT, rel);
      if (!existsSync(p)) return { status: 'critical', detail: 'Missing' };
      try {
        accessSync(p, constants.X_OK);
        return true;
      } catch {
        return { status: 'warn', detail: 'Not executable — run chmod +x' };
      }
    });
  }
}

function checkEvidence() {
  check('Evidence directory writable', () => {
    const p = join(TLC_ROOT, 'evidence');
    if (!existsSync(p)) return { status: 'warn', detail: 'evidence/ directory missing — will be created on first use' };
    try {
      accessSync(p, constants.W_OK);
      return true;
    } catch {
      return { status: 'critical', detail: 'evidence/ is not writable' };
    }
  });

  check('Evidence index exists', () => {
    const p = join(TLC_ROOT, 'evidence', 'index.md');
    if (!existsSync(p)) return { status: 'warn', detail: 'Run tlc-done once to initialize' };
    return true;
  });
}

function checkHardcodedPaths() {
  check('No hardcoded operator paths in shared scripts', () => {
    const toScan = [
      'scripts/validate-module-here.mjs',
      'src/git-hooks/pre-commit.mjs',
      'shell-integration.zsh',
      'install.sh',
    ];
    const hardcodedPattern = /\/Users\/[a-zA-Z0-9_-]+\/Projects/;
    const found = [];
    for (const rel of toScan) {
      const p = join(TLC_ROOT, rel);
      if (!existsSync(p)) continue;
      const content = readFileSync(p, 'utf8');
      if (hardcodedPattern.test(content)) {
        found.push(rel);
      }
    }
    if (found.length > 0) {
      return { status: 'critical', detail: `Hardcoded paths in: ${found.join(', ')} — violates Article XIV.3` };
    }
    return true;
  });
}

function checkOpenSessions() {
  check('No stale open sessions', () => {
    const sessionsDir = join(TLC_ROOT, '.sessions');
    if (!existsSync(sessionsDir)) return true;
    const files = readdirSync(sessionsDir).filter(f => f.endsWith('.json'));
    const stale = [];
    for (const file of files) {
      try {
        const record = JSON.parse(readFileSync(join(sessionsDir, file), 'utf8'));
        if (!record.ended_at) {
          const started = new Date(record.started_at);
          const ageHours = (Date.now() - started.getTime()) / (1000 * 60 * 60);
          if (ageHours > 24) {
            stale.push(`${record.module_id} (${Math.round(ageHours)}h ago)`);
          }
        }
      } catch { /* skip */ }
    }
    if (stale.length > 0) {
      return { status: 'warn', detail: `Stale sessions: ${stale.join(', ')} — run tlc-done to close` };
    }
    return true;
  });
}

function checkHermesSkills() {
  check('Hermes skills synced', () => {
    const skillsDir = join(HOME, '.hermes', 'skills', 'tlc');
    if (!existsSync(skillsDir)) {
      return { status: 'warn', detail: 'No TLC skills in ~/.hermes/skills/tlc — run tlc-sync-skills' };
    }
    const skills = readdirSync(skillsDir).filter(d =>
      existsSync(join(skillsDir, d, 'SKILL.md'))
    );
    if (skills.length === 0) {
      return { status: 'warn', detail: 'Skills directory empty — run tlc-sync-skills' };
    }

    // Check if registry has more modules than skills
    try {
      const registryPath = join(TLC_ROOT, 'registry', 'modules.registry.json');
      const data = JSON.parse(readFileSync(registryPath, 'utf8'));
      const modules = Array.isArray(data.modules) ? data.modules
        : Array.isArray(data) ? data
        : Object.values(data).filter(v => typeof v === 'object' && v.id);
      if (modules.length > skills.length) {
        return { status: 'warn', detail: `${skills.length} skills, ${modules.length} modules — run tlc-sync-skills` };
      }
    } catch { /* ignore */ }

    return { status: 'ok', detail: `${skills.length} skill(s) synced` };
  });
}

function checkAuditRetention() {
  check('I9: Audit retention enforcement script present', () => {
    const p = join(TLC_ROOT, 'scripts', 'tlc-audit-retention.mjs');
    if (!existsSync(p)) return { status: 'critical', detail: 'Missing tlc-audit-retention.mjs' };
    return true;
  });

  check('I9: Audit retention state checkpoint', () => {
    const stateFile = join(TLC_ROOT, 'evidence', 'audit-retention-state.json');
    if (!existsSync(stateFile)) {
      return { status: 'warn', detail: 'No checkpoint yet — run tlc-audit-retention once' };
    }
    try {
      const state = JSON.parse(readFileSync(stateFile, 'utf8'));
      const age = Date.now() - new Date(state.checked_at).getTime();
      const ageHours = Math.round(age / (1000 * 60 * 60));
      if (age > 25 * 60 * 60 * 1000) {
        return { status: 'warn', detail: `Last checked ${ageHours}h ago — cron may not be running` };
      }
      return { status: 'ok', detail: `Last checked ${ageHours}h ago` };
    } catch {
      return { status: 'warn', detail: 'Checkpoint file unreadable' };
    }
  });

  check('I9: No audit log truncation detected', () => {
    const stateFile = join(TLC_ROOT, 'evidence', 'audit-retention-state.json');
    if (!existsSync(stateFile)) return { status: 'warn', detail: 'No checkpoint — run tlc-audit-retention' };
    try {
      const state = JSON.parse(readFileSync(stateFile, 'utf8'));
      const AUDIT_LOG_NAMES = ['bypass-log.jsonl', 'purge-log.jsonl', 'audit-log.jsonl'];
      for (const name of AUDIT_LOG_NAMES) {
        const p = join(TLC_ROOT, 'evidence', name);
        if (!existsSync(p)) continue;
        const prev = state.logs?.[name]?.count ?? 0;
        const current = readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).length;
        if (current < prev) {
          return {
            status: 'critical',
            detail: `${name} truncated: was ${prev} entries, now ${current} — I9 violation`
          };
        }
      }
      return true;
    } catch {
      return { status: 'warn', detail: 'Could not read checkpoint' };
    }
  });
}

function checkConstitution() {
  check('SOCIOTECHNICAL_CONSTITUTION.md present', () => {
    const p = join(TLC_ROOT, 'SOCIOTECHNICAL_CONSTITUTION.md');
    if (!existsSync(p)) return { status: 'critical', detail: 'Missing — governance foundation absent' };
    const content = readFileSync(p, 'utf8');
    if (!content.includes('ARTICLE X') || !content.includes('ARTICLE XV')) {
      return { status: 'warn', detail: 'Constitution missing Articles X-XV — run constitution expansion' };
    }
    return { status: 'ok', detail: `${content.split('\n').length} lines` };
  });
}

function checkModule(id) {
  const registryPath = join(TLC_ROOT, 'registry', 'modules.registry.json');
  if (!existsSync(registryPath)) return;

  const data = JSON.parse(readFileSync(registryPath, 'utf8'));
  const modules = Array.isArray(data.modules) ? data.modules
    : Array.isArray(data) ? data
    : Object.values(data).filter(v => typeof v === 'object' && v.id);

  const mod = modules.find(m => (m.id || m.module_id) === id);
  if (!mod) {
    check(`Module ${id} in registry`, () => ({ status: 'critical', detail: 'Not found' }));
    return;
  }

  check(`Module ${id} not quarantined`, () =>
    mod.truth_status === 'quarantined'
      ? { status: 'critical', detail: `Quarantined: ${mod.notes || 'see registry'}` }
      : { status: 'ok', detail: mod.truth_status }
  );

  if (mod.path) {
    check(`Module ${id} path exists`, () =>
      existsSync(mod.path)
        ? true
        : { status: 'warn', detail: `Path not found: ${mod.path}` }
    );

    check(`Module ${id} has contract`, () => {
      const contractPaths = [
        join(mod.path, 'C_RSP_BUILD_CONTRACT.md'),
        join(mod.path, 'contracts', 'BUILD_CONTRACT.md'),
      ];
      return contractPaths.some(existsSync)
        ? true
        : { status: 'warn', detail: 'No contract file found — run tlc-register' };
    });

    check(`Module ${id} has evidence directory`, () =>
      existsSync(join(mod.path, 'evidence'))
        ? true
        : { status: 'warn', detail: 'No evidence/ directory' }
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  if (!quiet && !jsonOut) {
    log(`\n${BOLD}TLC 2.0 Health Check${RESET}  ${DIM}${new Date().toISOString()}${RESET}\n`);
  }

  if (moduleId) {
    if (!quiet && !jsonOut) log(`${BOLD}Module: ${moduleId}${RESET}`);
    checkModule(moduleId);
  } else {
    if (!quiet && !jsonOut) log(`${BOLD}Registry${RESET}`);
    checkRegistry();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Scripts${RESET}`);
    checkScripts();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Evidence${RESET}`);
    checkEvidence();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Portability${RESET}`);
    checkHardcodedPaths();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Sessions${RESET}`);
    checkOpenSessions();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Hermes Integration${RESET}`);
    checkHermesSkills();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Audit Retention (I9)${RESET}`);
    checkAuditRetention();
    log('');
    if (!quiet && !jsonOut) log(`${BOLD}Constitution${RESET}`);
    checkConstitution();
  }

  // ── Output ──────────────────────────────────────────────────────────────────

  const overallStatus = criticalCount > 0 ? 'critical'
    : warnCount > 0 ? 'degraded'
    : 'healthy';
  const exitCode = criticalCount > 0 ? 2 : warnCount > 0 ? 1 : 0;

  if (jsonOut) {
    console.log(JSON.stringify({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      critical: criticalCount,
      warnings: warnCount,
      checks: results,
    }, null, 2));
  } else if (!quiet) {
    log('');
    const statusColor = exitCode === 0 ? GREEN : exitCode === 1 ? YELLOW : RED;
    const icon = exitCode === 0 ? '✓' : exitCode === 1 ? '⚠' : '✗';
    log(`${statusColor}${BOLD}${icon} ${overallStatus.toUpperCase()}${RESET}  ${DIM}${criticalCount} critical, ${warnCount} warning(s)${RESET}`);
    if (exitCode === 1) {
      log(`${DIM}Governance is operational but degraded. Address warnings.${RESET}`);
    } else if (exitCode === 2) {
      log(`${RED}Governance is impaired. Resolve critical issues before proceeding.${RED}`);
    }
    log('');
  }

  process.exit(exitCode);
}

main();
