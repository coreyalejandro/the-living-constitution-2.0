#!/usr/bin/env node
/**
 * tlc-dashboard.mjs
 * TLC 2.0 Workspace — Real-Time Terminal Dashboard
 *
 * Shows all modules, truth statuses, active sessions, unverified items.
 *
 * Usage:
 *   node scripts/tlc-dashboard.mjs           # one-shot
 *   node scripts/tlc-dashboard.mjs --watch   # refresh every 10s
 *
 * Shell alias: tlc-dashboard [--watch]
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const WATCH_MODE = process.argv.includes('--watch');
const REFRESH_INTERVAL = 10000;

// --- ANSI color helpers ---
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function statusColor(status) {
  const map = {
    working: C.green,
    partial: C.cyan,
    static_prototype: C.yellow,
    draft: C.yellow,
    planned: C.blue,
    deprecated: C.dim,
    quarantined: C.red,
    unverified: C.dim,
  };
  return (map[status] || C.white) + status + C.reset;
}

function surfaceIcon(surface) {
  const map = {
    governance_core: '⚙',
    private_lab: '🔬',
    public_portfolio: '🌐',
    documentation: '📄',
    module_library: '📦',
    exhibit: '🎯',
  };
  return map[surface] || '·';
}

function loadRegistry() {
  const registryPath = join(REPO_ROOT, 'registry', 'modules.registry.json');
  if (!existsSync(registryPath)) return { modules: [] };
  return JSON.parse(readFileSync(registryPath, 'utf8'));
}

function loadActiveSessions() {
  const sessionsDir = join(REPO_ROOT, '.sessions');
  if (!existsSync(sessionsDir)) return [];
  try {
    return readdirSync(sessionsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try { return JSON.parse(readFileSync(join(sessionsDir, f), 'utf8')); } catch { return null; }
      })
      .filter(s => s && s.status === 'active');
  } catch { return []; }
}

function renderDashboard() {
  const registry = loadRegistry();
  const activeSessions = loadActiveSessions();
  const now = new Date().toISOString();

  // Group by status
  const byStatus = {};
  for (const mod of registry.modules) {
    if (!byStatus[mod.truth_status]) byStatus[mod.truth_status] = [];
    byStatus[mod.truth_status].push(mod);
  }

  // Clear screen in watch mode
  if (WATCH_MODE) process.stdout.write('\x1b[2J\x1b[H');

  // Header
  console.log(`${C.bold}${'═'.repeat(72)}${C.reset}`);
  console.log(`${C.bold}  TLC 2.0 — Module Dashboard${C.reset}  ${C.dim}${now.slice(0, 19).replace('T', ' ')}${C.reset}`);
  console.log(`${C.bold}${'═'.repeat(72)}${C.reset}`);
  console.log();

  // Stats bar
  const total = registry.modules.length;
  const working = (byStatus.working || []).length;
  const partial = (byStatus.partial || []).length;
  const quarantined = (byStatus.quarantined || []).length;
  const unverified = (byStatus.unverified || []).length;
  console.log(`  Total: ${C.bold}${total}${C.reset}  ` +
    `${C.green}working:${working}${C.reset}  ` +
    `${C.cyan}partial:${partial}${C.reset}  ` +
    `${C.dim}unverified:${unverified}${C.reset}  ` +
    (quarantined > 0 ? `${C.red}quarantined:${quarantined}${C.reset}` : ''));
  console.log();

  // Active sessions
  if (activeSessions.length > 0) {
    console.log(`${C.bold}  ACTIVE SESSIONS (${activeSessions.length})${C.reset}`);
    console.log(`  ${'─'.repeat(68)}`);
    for (const s of activeSessions) {
      const elapsed = Math.floor((Date.now() - new Date(s.started_at).getTime()) / 60000);
      console.log(`  ${C.cyan}▶${C.reset} ${C.bold}${s.module_id}${C.reset}  ${C.dim}(${elapsed}m ago)${C.reset}  contract:${s.contract_id || 'none'}`);
    }
    console.log();
  }

  // Module list
  const statusOrder = ['working', 'partial', 'static_prototype', 'draft', 'planned', 'unverified', 'deprecated', 'quarantined'];
  for (const status of statusOrder) {
    const mods = byStatus[status] || [];
    if (mods.length === 0) continue;

    console.log(`  ${C.bold}${status.toUpperCase()} (${mods.length})${C.reset}`);
    console.log(`  ${'─'.repeat(68)}`);
    for (const mod of mods) {
      const icon = surfaceIcon(mod.surface);
      const activeMarker = activeSessions.find(s => s.module_id === mod.id) ? ` ${C.cyan}▶ ACTIVE${C.reset}` : '';
      const unverCount = mod.unverified_scope ? mod.unverified_scope.length : 0;
      const unverNote = unverCount > 0 ? ` ${C.dim}[${unverCount} unverified]${C.reset}` : '';
      console.log(`  ${icon} ${statusColor(mod.truth_status).padEnd(12 + (status.length <= 8 ? 0 : status.length - 8))} ${C.bold}${mod.id}${C.reset}${activeMarker}${unverNote}`);

      // Show unverified scope items for non-working modules
      if (mod.truth_status !== 'working' && mod.unverified_scope && mod.unverified_scope.length > 0) {
        for (const item of mod.unverified_scope.slice(0, 3)) {
          console.log(`       ${C.dim}· ${item}${C.reset}`);
        }
        if (mod.unverified_scope.length > 3) {
          console.log(`       ${C.dim}  ... +${mod.unverified_scope.length - 3} more${C.reset}`);
        }
      }
    }
    console.log();
  }

  // Quick actions
  console.log(`  ${'─'.repeat(68)}`);
  console.log(`  ${C.dim}Quick actions:${C.reset}`);
  console.log(`  ${C.dim}  tlc-work --module <ID>        Start a session${C.reset}`);
  console.log(`  ${C.dim}  tlc-new --name <name>          Create project${C.reset}`);
  console.log(`  ${C.dim}  tlc-context --module <ID>      Inject AI context${C.reset}`);
  console.log(`  ${C.dim}  npm run verify:registry        Validate registry${C.reset}`);
  if (WATCH_MODE) console.log(`  ${C.dim}  Ctrl+C to exit watch mode${C.reset}`);
  console.log();
}

// --- Run ---
renderDashboard();

if (WATCH_MODE) {
  const interval = setInterval(renderDashboard, REFRESH_INTERVAL);
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n[tlc-dashboard] Watch stopped.\n');
    process.exit(0);
  });
}
