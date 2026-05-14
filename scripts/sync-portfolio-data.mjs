#!/usr/bin/env node
/**
 * sync-portfolio-data.mjs
 * TLC 2.0 Integration Control Plane — Registry → Portfolio Sync
 *
 * Copies PORTFOLIO_DATA.json from sociotechnical-constitution-runtime
 * into coreys-agentic-portfolio/data/portfolio-data.json.
 *
 * Writes a sync receipt at sync/portfolio-data-sync-receipt.json
 * capturing: source path, target path, source SHA, timestamp, checksums.
 *
 * Usage:
 *   npm run sync:portfolio
 *
 * Prerequisites:
 *   npm run generate:portfolio-data   (must run first to produce PORTFOLIO_DATA.json)
 */

import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RUNTIME_ROOT = path.resolve(__dirname, '..')

// ── Paths ─────────────────────────────────────────────────────────────────────

const SOURCE_PATH = path.join(RUNTIME_ROOT, 'PORTFOLIO_DATA.json')
const TARGET_PORTFOLIO_ROOT = path.join(RUNTIME_ROOT, '..', 'coreyalejandro-portfolio-v2')
const TARGET_PATH = path.join(TARGET_PORTFOLIO_ROOT, 'data', 'portfolio-data.json')
const RECEIPT_DIR = path.join(RUNTIME_ROOT, 'sync')
const RECEIPT_PATH = path.join(RECEIPT_DIR, 'portfolio-data-sync-receipt.json')

// ── Helpers ───────────────────────────────────────────────────────────────────

function sha256(filePath) {
  const content = fs.readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

function gitSHA(dir) {
  try {
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

function pass(msg) { console.log(`  PASS  ${msg}`) }
function fail(msg) { console.error(`  FAIL  ${msg}`); process.exit(1) }
function info(msg) { console.log(`  INFO  ${msg}`) }

// ── Preflight checks ──────────────────────────────────────────────────────────

console.log('\nSync: PORTFOLIO_DATA.json → coreyalejandro-portfolio-v2/data/portfolio-data.json\n')

if (!fs.existsSync(SOURCE_PATH)) {
  fail(`Source not found: ${SOURCE_PATH}\n  Run: npm run generate:portfolio-data first`)
}
pass(`Source found: ${path.relative(RUNTIME_ROOT, SOURCE_PATH)}`)

if (!fs.existsSync(TARGET_PORTFOLIO_ROOT)) {
  fail(`Portfolio repo not found: ${TARGET_PORTFOLIO_ROOT}`)
}
pass(`Target repo found: ${TARGET_PORTFOLIO_ROOT}`)

// Validate source JSON
let sourceData
try {
  sourceData = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'))
  pass(`Source JSON valid — ${sourceData.modules?.length ?? '?'} modules, ${Object.keys(sourceData.groups ?? {}).length} groups`)
} catch (e) {
  fail(`Source JSON invalid: ${e.message}`)
}

// ── Copy ──────────────────────────────────────────────────────────────────────

const targetDir = path.dirname(TARGET_PATH)
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
  info(`Created directory: ${path.relative(RUNTIME_ROOT, targetDir)}`)
}

// Capture checksums before and after
const sourceChecksum = sha256(SOURCE_PATH)
const priorChecksum = fs.existsSync(TARGET_PATH) ? sha256(TARGET_PATH) : null

fs.copyFileSync(SOURCE_PATH, TARGET_PATH)
const targetChecksum = sha256(TARGET_PATH)

if (sourceChecksum !== targetChecksum) {
  fail(`Checksum mismatch after copy — sync failed`)
}
pass(`Copied and verified: ${path.relative(TARGET_PORTFOLIO_ROOT, TARGET_PATH)}`)

const unchanged = priorChecksum && priorChecksum === targetChecksum
if (unchanged) {
  info(`File unchanged from prior version (same checksum)`)
} else if (priorChecksum) {
  info(`File updated (prior checksum: ${priorChecksum.slice(0, 12)}… → ${targetChecksum.slice(0, 12)}…)`)
} else {
  info(`New file created (no prior version)`)
}

// ── Write receipt ─────────────────────────────────────────────────────────────

if (!fs.existsSync(RECEIPT_DIR)) {
  fs.mkdirSync(RECEIPT_DIR, { recursive: true })
}

const runtimeSHA = gitSHA(RUNTIME_ROOT)
const portfolioSHA = gitSHA(TARGET_PORTFOLIO_ROOT)

const receipt = {
  schema: 'portfolio-sync-receipt.v1',
  synced_at: new Date().toISOString(),
  source: {
    path: SOURCE_PATH,
    repo: 'sociotechnical-constitution-runtime',
    git_sha: runtimeSHA,
    checksum_sha256: sourceChecksum,
    modules: sourceData.modules?.length ?? null,
    groups: Object.keys(sourceData.groups ?? {}).length,
    registry_version: sourceData._meta?.registry_version ?? null,
    generated_at: sourceData._meta?.generated_at ?? null,
  },
  target: {
    path: TARGET_PATH,
    repo: 'coreyalejandro-portfolio-v2',
    git_sha: portfolioSHA,
    checksum_sha256: targetChecksum,
  },
  result: {
    status: 'success',
    unchanged,
    prior_checksum: priorChecksum,
    new_checksum: targetChecksum,
  },
}

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2))
pass(`Receipt written: ${path.relative(RUNTIME_ROOT, RECEIPT_PATH)}`)

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\nSYNC COMPLETE')
console.log(`  Source SHA  : ${runtimeSHA.slice(0, 12)}`)
console.log(`  Target SHA  : ${portfolioSHA.slice(0, 12)}`)
console.log(`  Checksum    : ${targetChecksum.slice(0, 16)}…`)
console.log(`  Modules     : ${sourceData.modules?.length ?? '?'}`)
console.log(`  Groups      : ${Object.keys(sourceData.groups ?? {}).length}`)
console.log(`  Unchanged   : ${unchanged}`)
console.log(`  Receipt     : ${path.relative(RUNTIME_ROOT, RECEIPT_PATH)}\n`)
