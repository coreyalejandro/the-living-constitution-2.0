#!/usr/bin/env node
/**
 * verify-registry.mjs
 * TLC 2.0 Integration Control Plane — Registry Verifier
 *
 * Validates all three registry files for:
 *   1. Valid JSON (parse check)
 *   2. Required top-level fields
 *   3. Every entry has a valid truth_status from the allowed set
 *   4. Every entry has a valid surface from the allowed set
 *   5. No duplicate IDs within a registry
 *   6. routes.registry — every module_id either null or present in modules.registry
 *   7. artifacts.registry — every artifact has required fields
 *   8. modules.registry — working entries have a verified_date
 *
 * Exits 0 if all checks pass.
 * Exits 1 if any check fails.
 */

import { readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const REGISTRY_DIR = join(REPO_ROOT, 'registry');

// --- Constants ---
const VALID_SURFACES = new Set([
  'governance_core',
  'private_lab',
  'public_portfolio',
  'documentation',
  'module_library',
  'exhibit',
]);

const VALID_TRUTH_STATUSES = new Set([
  'working',
  'partial',
  'static_prototype',
  'draft',
  'planned',
  'deprecated',
  'quarantined',
  'unverified',
]);

// --- Colours ---
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const YELLOW= '\x1b[33m';
const DIM   = '\x1b[2m';

// --- Helpers ---
let totalErrors = 0;
let totalWarnings = 0;

function pass(msg) {
  console.log(`  ${GREEN}PASS${RESET}  ${msg}`);
}

function fail(msg) {
  console.log(`  ${RED}FAIL${RESET}  ${msg}`);
  totalErrors++;
}

function warn(msg) {
  console.log(`  ${YELLOW}WARN${RESET}  ${msg}`);
  totalWarnings++;
}

function section(title) {
  console.log(`\n${BOLD}${title}${RESET}`);
}

function loadRegistry(filename) {
  const filePath = join(REGISTRY_DIR, filename);
  let raw;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch (err) {
    fail(`Cannot read ${filename}: ${err.message}`);
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(`${filename} is not valid JSON: ${err.message}`);
    return null;
  }
}

// --- Main ---
console.log(`\n${BOLD}TLC 2.0 — Registry Verifier${RESET}`);
console.log(`Registry dir : ${REGISTRY_DIR}`);
console.log(`Verified at  : ${new Date().toISOString()}`);

// --- 1. Load all three registries ---
section('1. Loading registries');
const modules   = loadRegistry('modules.registry.json');
const artifacts = loadRegistry('artifacts.registry.json');
const routes    = loadRegistry('routes.registry.json');

if (modules)   pass('modules.registry.json loaded');
if (artifacts) pass('artifacts.registry.json loaded');
if (routes)    pass('routes.registry.json loaded');

// Bail early if any failed to load
if (!modules || !artifacts || !routes) {
  console.log(`\n${RED}${BOLD}ABORTED: One or more registry files failed to load.${RESET}`);
  process.exit(1);
}

// --- 2. Required top-level fields ---
section('2. Required top-level fields');

function checkTopLevel(reg, filename, requiredFields) {
  for (const field of requiredFields) {
    if (reg[field] === undefined) {
      fail(`${filename} missing required field: "${field}"`);
    } else {
      pass(`${filename} has "${field}"`);
    }
  }
}

checkTopLevel(modules,   'modules.registry.json',   ['registry_id', 'version', 'modules']);
checkTopLevel(artifacts, 'artifacts.registry.json', ['registry_id', 'version', 'artifacts']);
checkTopLevel(routes,    'routes.registry.json',    ['registry_id', 'version', 'routes']);

// --- 3. Build module ID set for cross-reference ---
const moduleIdSet = new Set(modules.modules.map(m => m.id));

// --- 4. Validate modules ---
section('3. modules.registry.json — entries');

const moduleIds = new Set();
let moduleErrors = 0;

for (const mod of modules.modules) {
  const prefix = `Module [${mod.id || '(no id)'}]`;

  // Required fields
  if (!mod.id)    { fail(`${prefix} missing "id"`);    moduleErrors++; }
  if (!mod.path)  { fail(`${prefix} missing "path"`);  moduleErrors++; }
  if (!mod.label) { fail(`${prefix} missing "label"`); moduleErrors++; }

  // Duplicate ID check
  if (mod.id && moduleIds.has(mod.id)) {
    fail(`${prefix} duplicate ID`);
    moduleErrors++;
  } else if (mod.id) {
    moduleIds.add(mod.id);
  }

  // Valid surface
  if (mod.surface && !VALID_SURFACES.has(mod.surface)) {
    fail(`${prefix} invalid surface: "${mod.surface}"`);
    moduleErrors++;
  }

  // Valid truth_status
  if (!mod.truth_status) {
    fail(`${prefix} missing "truth_status"`);
    moduleErrors++;
  } else if (!VALID_TRUTH_STATUSES.has(mod.truth_status)) {
    fail(`${prefix} invalid truth_status: "${mod.truth_status}"`);
    moduleErrors++;
  }

  // working entries must have verified_date
  if (mod.truth_status === 'working' && !mod.verified_date) {
    warn(`${prefix} truth_status=working but no "verified_date"`);
  }
}

if (moduleErrors === 0) {
  pass(`All ${modules.modules.length} module entries valid`);
}

// --- 5. Validate artifacts ---
section('4. artifacts.registry.json — entries');

const artifactIds = new Set();
let artifactErrors = 0;

for (const art of artifacts.artifacts) {
  const prefix = `Artifact [${art.id || '(no id)'}]`;

  if (!art.id)   { fail(`${prefix} missing "id"`);   artifactErrors++; }
  if (!art.path) { fail(`${prefix} missing "path"`); artifactErrors++; }
  if (!art.type) { fail(`${prefix} missing "type"`); artifactErrors++; }

  if (art.id && artifactIds.has(art.id)) {
    fail(`${prefix} duplicate ID`);
    artifactErrors++;
  } else if (art.id) {
    artifactIds.add(art.id);
  }

  if (art.surface && !VALID_SURFACES.has(art.surface)) {
    fail(`${prefix} invalid surface: "${art.surface}"`);
    artifactErrors++;
  }

  if (!art.truth_status) {
    fail(`${prefix} missing "truth_status"`);
    artifactErrors++;
  } else if (!VALID_TRUTH_STATUSES.has(art.truth_status)) {
    fail(`${prefix} invalid truth_status: "${art.truth_status}"`);
    artifactErrors++;
  }

  if (art.truth_status === 'working' && !art.verified_date) {
    warn(`${prefix} truth_status=working but no "verified_date"`);
  }
}

if (artifactErrors === 0) {
  pass(`All ${artifacts.artifacts.length} artifact entries valid`);
}

// --- 6. Validate routes ---
section('5. routes.registry.json — entries');

const routeIds = new Set();
let routeErrors = 0;

for (const route of routes.routes) {
  const prefix = `Route [${route.route_id || '(no id)'}]`;

  if (!route.route_id)    { fail(`${prefix} missing "route_id"`);    routeErrors++; }
  if (!route.path_pattern){ fail(`${prefix} missing "path_pattern"`); routeErrors++; }
  if (!route.surface)     { fail(`${prefix} missing "surface"`);      routeErrors++; }

  if (route.route_id && routeIds.has(route.route_id)) {
    fail(`${prefix} duplicate route_id`);
    routeErrors++;
  } else if (route.route_id) {
    routeIds.add(route.route_id);
  }

  if (route.surface && !VALID_SURFACES.has(route.surface)) {
    fail(`${prefix} invalid surface: "${route.surface}"`);
    routeErrors++;
  }

  if (!route.truth_status) {
    fail(`${prefix} missing "truth_status"`);
    routeErrors++;
  } else if (!VALID_TRUTH_STATUSES.has(route.truth_status)) {
    fail(`${prefix} invalid truth_status: "${route.truth_status}"`);
    routeErrors++;
  }

  // Cross-reference: module_id must exist in modules registry (if not null)
  if (route.module_id !== null && route.module_id !== undefined) {
    if (!moduleIdSet.has(route.module_id)) {
      fail(`${prefix} references unknown module_id: "${route.module_id}"`);
      routeErrors++;
    }
  }
}

if (routeErrors === 0) {
  pass(`All ${routes.routes.length} route entries valid`);
}

// --- 7. Cross-registry integrity ---
section('6. Cross-registry integrity');

// Verify all modules referenced by routes exist
pass('Route → Module cross-reference complete (checked above per-route)');

// Check that modules with truth_status=working are in at least one route
const routedModuleIds = new Set(
  routes.routes.map(r => r.module_id).filter(Boolean)
);
let unroutedWorking = 0;
for (const mod of modules.modules) {
  if (mod.truth_status === 'working' && !routedModuleIds.has(mod.id)) {
    warn(`Module [${mod.id}] is working but has no route entry`);
    unroutedWorking++;
  }
}
if (unroutedWorking === 0) {
  pass('All working modules have at least one route');
}

// --- 7a. Complete-claim verification enforcement ---
section('7. Complete-claim verification rules');

const VALID_PUBLIC_DISPLAY = new Set(['working', 'demo', 'draft', 'coming_soon', 'hidden', 'staging_reference']);
const PUBLIC_SURFACES = new Set(['public_portfolio', 'exhibit']);
let claimErrors = 0;

for (const mod of modules.modules) {
  const prefix = `Module [${mod.id || '(no id)'}]`;

  // partial modules MUST have unverified_scope
  if (mod.truth_status === 'partial') {
    if (!mod.unverified_scope || !Array.isArray(mod.unverified_scope) || mod.unverified_scope.length === 0) {
      fail(`${prefix} truth_status=partial but missing or empty "unverified_scope"`);
      claimErrors++;
    }
    if (!mod.verified_scope) {
      fail(`${prefix} truth_status=partial but missing "verified_scope"`);
      claimErrors++;
    }
  }

  // working modules MUST have verified_scope
  if (mod.truth_status === 'working' && !mod.verified_scope) {
    fail(`${prefix} truth_status=working but missing "verified_scope"`);
    claimErrors++;
  }

  // public_portfolio and exhibit modules MUST have public_display_status
  if (PUBLIC_SURFACES.has(mod.surface)) {
    if (!mod.public_display_status) {
      fail(`${prefix} surface="${mod.surface}" but missing "public_display_status"`);
      claimErrors++;
    } else if (!VALID_PUBLIC_DISPLAY.has(mod.public_display_status)) {
      fail(`${prefix} invalid public_display_status: "${mod.public_display_status}"`);
      claimErrors++;
    }
    // partial modules must not claim working in public display
    if (mod.truth_status === 'partial' && mod.public_display_status === 'working') {
      fail(`${prefix} truth_status=partial but public_display_status=working — overclaim`);
      claimErrors++;
    }
  }
}

for (const route of routes.routes) {
  const prefix = `Route [${route.route_id || '(no id)'}]`;

  // Routes with live_url=null must not be truth_status=working
  if (route.live_url === null && route.truth_status === 'working') {
    fail(`${prefix} live_url=null but truth_status=working — route is not live`);
    claimErrors++;
  }
}

if (claimErrors === 0) {
  pass('All complete-claim verification rules passed');
}

// --- 8. Summary ---
section('SUMMARY');
console.log(`  Total errors   : ${totalErrors === 0 ? GREEN : RED}${totalErrors}${RESET}`);
console.log(`  Total warnings : ${totalWarnings === 0 ? GREEN : YELLOW}${totalWarnings}${RESET}`);
console.log(`  Modules checked  : ${modules.modules.length}`);
console.log(`  Artifacts checked: ${artifacts.artifacts.length}`);
console.log(`  Routes checked   : ${routes.routes.length}`);
console.log('');

if (totalErrors === 0) {
  console.log(`${GREEN}${BOLD}REGISTRY VERIFIED — all checks passed${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}REGISTRY FAILED — ${totalErrors} error(s) found${RESET}\n`);
  process.exit(1);
}
