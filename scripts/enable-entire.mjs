#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

export function parseCliArgs(argv) {
  const args = [...argv];

  if (args.includes('--help') || args.includes('-h')) {
    return { action: 'help', passthrough: [] };
  }

  if (args[0] === 'status') {
    return { action: 'status', passthrough: args.slice(1) };
  }

  if (args[0] === 'enable') {
    return { action: 'enable', passthrough: args.slice(1) };
  }

  return { action: 'enable', passthrough: args };
}

export function buildEntireArgs({ action, passthrough }) {
  if (action === 'status') return ['status', ...passthrough];
  if (action === 'enable') return ['enable', ...passthrough];
  return [];
}

export function formatHelp() {
  return [
    'Usage:',
    '  npm run entire:enable',
    '  npm run entire:enable -- --agent codex',
    '  npm run entire:status',
    '',
    'Notes:',
    '  - Entire CLI must be installed separately.',
    '  - If you omit --agent, Entire will prompt for agent hooks on first enable.',
  ].join('\n');
}

export function formatMissingBinaryMessage() {
  return [
    'Entire CLI is not installed.',
    'Install Entire separately, then rerun this helper in this repo.',
    '',
    'Examples:',
    '  brew install --cask entire',
    '  curl -fsSL https://entire.io/install.sh | bash',
    '',
    'More info: https://github.com/entireio/cli',
  ].join('\n');
}

function hasEntireInstalled() {
  const result = spawnSync('entire', ['--version'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.error && result.error.code === 'ENOENT') {
    return false;
  }

  return result.status === 0;
}

function runEntire(args) {
  const result = spawnSync('entire', args, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function main() {
  const parsed = parseCliArgs(process.argv.slice(2));

  if (parsed.action === 'help') {
    console.log(formatHelp());
    return;
  }

  if (!hasEntireInstalled()) {
    console.error(formatMissingBinaryMessage());
    process.exit(1);
  }

  const exitCode = runEntire(buildEntireArgs(parsed));

  if (exitCode !== 0) {
    process.exit(exitCode);
  }

  if (parsed.action === 'enable') {
    console.log('\nEntire is ready in this repo.');
    console.log('Next: npm run entire:status');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main();
}
