#!/usr/bin/env node
/**
 * scripts/tlc.mjs — TLC 2.0 launcher
 * Delegates to the full Ink TUI at src/tui/app.tsx
 * Run via: npm start  OR  npm run tlc  OR  node scripts/tlc.mjs
 */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');

const result = spawnSync(
  'node',
  ['--import', 'tsx/esm', join(ROOT, 'src', 'tui', 'app.tsx')],
  {
    stdio: 'inherit',
    cwd:   ROOT,
    env:   { ...process.env, FORCE_COLOR: '3' },
  }
);

process.exit(result.status ?? 0);
