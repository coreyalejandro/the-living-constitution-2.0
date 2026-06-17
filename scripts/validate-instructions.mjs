#!/usr/bin/env node
/**
 * validate-instructions.mjs
 * TLC 2.0 — Article XVI Default Directions Validator
 *
 * Checks a Markdown instruction file against the sixteen rules (R1–R16)
 * defined in SOCIOTECHNICAL_CONSTITUTION.md Article XVI.
 *
 * Exit codes:
 *   0 — all applicable rules pass
 *   1 — one or more rules fail (violations printed to stdout)
 *   2 — usage error (no file given, file not found)
 *
 * Usage:
 *   node scripts/validate-instructions.mjs <path-to-file.md>
 *   node scripts/validate-instructions.mjs <path> --json
 *   node scripts/validate-instructions.mjs <path> --quiet   (exit code only)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── ANSI ──────────────────────────────────────────────────────────────────────
const R  = '\x1b[31m';
const Y  = '\x1b[33m';
const G  = '\x1b[32m';
const B  = '\x1b[1m';
const D  = '\x1b[2m';
const X  = '\x1b[0m';

// ── Args ──────────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const filePath = args.find(a => !a.startsWith('--'));
const jsonOut  = args.includes('--json');
const quiet    = args.includes('--quiet');

if (!filePath) {
  console.error('Usage: validate-instructions.mjs <file.md> [--json] [--quiet]');
  process.exit(2);
}

const absPath = resolve(filePath);
if (!existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(2);
}

const raw   = readFileSync(absPath, 'utf8');
const lines = raw.split('\n');

// ── Tag check — only validate <default-directions> files ──────────────────────
// The tag must appear as a raw string (not inside backticks or a fenced block)
// to count as a governed instruction document.
function hasRawTag(text) {
  // Remove all fenced code blocks
  const noFence = text.replace(/```[\s\S]*?```/g, '');
  // Remove all inline code spans
  const noCode = noFence.replace(/`[^`\n]+`/g, '');
  return noCode.includes('<default-directions>');
}
const hasTag = hasRawTag(raw);
if (!hasTag) {
  if (!quiet) console.log(`${D}[validate-instructions] No <default-directions> tag — skipping ${filePath}${X}`);
  process.exit(0);
}

// ── Violation collector ───────────────────────────────────────────────────────
const violations = [];
function fail(rule, lineNum, message, suggestion) {
  violations.push({ rule, line: lineNum, message, suggestion: suggestion || null });
}
function warn(rule, lineNum, message) {
  violations.push({ rule, line: lineNum, message, severity: 'warn' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns lines that appear to be the action body of a numbered step.
// We identify step lines as: a line that starts with a digit, optionally
// followed by more digits, then a period or a closing paren, then text.
// e.g.  "1. Open Terminal"  or  "12\nOpen Terminal" (bare-number heading style)
function getStepLines() {
  // Collect all lines that are the "action" line of a numbered step.
  // Strategy: find lines matching /^\d+[.)]\s+\S/ as inline steps,
  // and also heading-style steps (line is just digits, next non-empty line is the action).
  const steps = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    // Inline step: "1. Do the thing"
    if (/^\d+[.)]\s+\S/.test(l)) {
      steps.push({ lineNum: i + 1, text: l.replace(/^\d+[.)]\s+/, ''), raw: l, index: i });
    }
    // Bare-integer heading style (like the example: line is just "1", next non-blank is action)
    if (/^\d+$/.test(l) && i + 1 < lines.length) {
      const next = lines[i + 1]?.trim();
      if (next && !/^\d/.test(next) && !next.startsWith('#')) {
        steps.push({ lineNum: i + 2, text: next, raw: next, index: i + 1 });
      }
    }
  }
  return steps;
}

// Returns all integers found as step numbers in the document, in document order.
function getStepNumbers() {
  const nums = [];
  for (const l of lines) {
    const t = l.trim();
    const m = t.match(/^(\d+)[.)]\s+\S/);
    if (m) nums.push(parseInt(m[1], 10));
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n > 0) nums.push(n);
    }
  }
  return nums;
}

// Words that signal a branch in action text (R3)
const BRANCH_WORDS = [
  /\bor\b/i,
  /\bunless\b/i,
  /\bdepending on\b/i,
  /\beither\b/i,
  /\bselect one of\b/i,
];
// "if" is allowed inside "If it looks different" blocks and "If you see" stop-safe blocks,
// so we only flag "if" when it appears BEFORE a conditional mid-action.
// Simpler heuristic: flag "if" in a step action line that doesn't start with "If it looks"
// or "If you see".
function hasBranchInAction(text) {
  const lower = text.toLowerCase();
  // Allow "If it looks different" and "If you see" — these are the sanctioned patterns
  if (lower.startsWith('if it looks') || lower.startsWith('if you see')) return false;
  // Check other branch words
  for (const re of BRANCH_WORDS) {
    if (re.test(text)) return true;
  }
  // Flag "if" mid-action (not at start of a sanctioned block)
  if (/\bif\b/i.test(text) && !lower.startsWith('if it looks') && !lower.startsWith('if you see')) {
    return true;
  }
  return false;
}

// Spatial words (R6) — word-boundary match to avoid "understand", "stop", "governed", etc.
const SPATIAL_REGEX = /\b(above|below|left|right|top|bottom|corner|beside|next to|under|over|across from|toward|away from|upper|lower|middle|center)\b/i;

// Confidence language (Section 16.4.4)
const CONFIDENCE_WORDS = ['simply', 'just ', 'easy', 'quickly', 'obviously', 'of course'];

// ── R8 — NUMBERED ─────────────────────────────────────────────────────────────
// Steps must use consecutive integers from 1. Sub-steps (1a, 1b) are forbidden.
(function checkR8() {
  // Sub-step patterns
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^\d+[a-z][.)]/i.test(l)) {
      fail('R8', i + 1,
        `Sub-step numbering detected: "${l.slice(0, 40)}". Steps must use integers only (1, 2, 3…).`,
        'Split into separate numbered steps.');
    }
  }
  // Gap check
  const nums = getStepNumbers();
  if (nums.length === 0) return;
  const seen = [...new Set(nums)].sort((a, b) => a - b);
  if (seen[0] !== 1) {
    fail('R8', 1,
      `Step numbering does not start at 1. First step number found: ${seen[0]}.`,
      'Renumber steps starting from 1.');
  }
  for (let i = 1; i < seen.length; i++) {
    if (seen[i] !== seen[i - 1] + 1) {
      fail('R8', 0,
        `Gap in step numbering: steps jump from ${seen[i - 1]} to ${seen[i]}.`,
        'Ensure every integer from 1 to the last step number is present.');
    }
  }
})();

// ── R3 — NO-BRANCH ────────────────────────────────────────────────────────────
(function checkR3() {
  for (const step of getStepLines()) {
    if (hasBranchInAction(step.text)) {
      fail('R3', step.lineNum,
        `Branch language in step action: "${step.text.slice(0, 60)}…"`,
        'Move conditional text into an isolated "If it looks different" block. Remove branch words from the action line.');
    }
  }
})();

// ── R6 — NO-SPATIAL ───────────────────────────────────────────────────────────
(function checkR6() {
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // Skip "If it looks different" blocks — may describe spatial layouts of a known-different screen
    if (/if it looks different|if you see/i.test(l)) continue;
    // Skip HTML comments
    if (l.trim().startsWith('<!--')) continue;
    const match = SPATIAL_REGEX.exec(l);
    if (match) {
      // Additional context filter: "stop" → not spatial; "understand" → not spatial
      // The regex with \b already handles sub-word cases, but double-check
      // by confirming the matched word stands alone in a location/UI context.
      // Heuristic: skip if the matched word is followed immediately by a verb that
      // makes it clearly non-spatial (e.g. "stop at any time", "understand is normal").
      const after = l.slice(match.index + match[0].length, match.index + match[0].length + 20).toLowerCase();
      if (match[1].toLowerCase() === 'top' && /\s*(at|is|was|s\s|s$|\s+and)/.test(after)) continue; // "stop at"
      if (match[1].toLowerCase() === 'under' && /\s*(stand|stood|lying|go|goes|went|s\s)/.test(after)) continue; // "understand"
      if (match[1].toLowerCase() === 'over' && /\s*(n|ned|ning|s\s|s$|all|come|age|lap)/.test(after)) continue; // "governed", "overall"
      fail('R6', i + 1,
        `Spatial language "${match[1]}" found: "${l.trim().slice(0, 70)}"`,
        'Replace with the exact label or name of the element. Do not use position to identify it.');
    }
  }
})();

// ── R4 — COPY-PASTE ───────────────────────────────────────────────────────────
// Detect command-like strings outside of fenced code blocks or inline backticks.
(function checkR4() {
  let inFence = false;
  const INLINE_COMMAND = /\b(cd |npm |node |git |open |chmod |cat |python3? |brew |curl |tar )\S/;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    // Skip HTML comments
    if (l.trim().startsWith('<!--')) continue;
    // Skip lines that already use inline code
    if (l.includes('`')) continue;
    // Skip lines that are 4-space-indented code
    if (/^ {4,}/.test(l)) continue;
    if (INLINE_COMMAND.test(l)) {
      fail('R4', i + 1,
        `Command appears as prose text: "${l.trim().slice(0, 60)}"`,
        'Place the command inside a fenced code block (```…```) or a Copy element.');
    }
  }
})();

// ── R6 already runs. Now R7 — EXACT-LABEL ────────────────────────────────────
(function checkR7() {
  const FORBIDDEN_DESCRIPTORS = [
    /the big button/i,
    /the green button/i,
    /the blue button/i,
    /the red button/i,
    /the large button/i,
    /the small button/i,
    /the main button/i,
    /the main menu/i,
    /the default button/i,
    /the download button/i,
    /the install button/i,
    /the primary button/i,
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const re of FORBIDDEN_DESCRIPTORS) {
      if (re.test(lines[i])) {
        fail('R7', i + 1,
          `Descriptive button reference: "${lines[i].trim().slice(0, 60)}"`,
          'Use the exact label as it appears on screen, e.g. "the button labeled Install".');
        break;
      }
    }
  }
})();

// ── R11 — PREAMBLE ────────────────────────────────────────────────────────────
(function checkR11() {
  // Preamble must appear before any numbered step
  const firstStepLine = lines.findIndex(l => /^\d+[.)]\s+\S/.test(l.trim()) || /^\d+$/.test(l.trim()));

  const preambleText = firstStepLine === -1
    ? raw
    : lines.slice(0, firstStepLine).join('\n').toLowerCase();

  const checks = [
    {
      key: 'safety',
      patterns: [
        /cannot break/i, /cannot cause harm/i, /safe to follow/i,
        /it is safe/i, /cannot harm/i, /will not break/i,
      ],
      message: 'Preamble is missing a safety statement (e.g. "You cannot break your computer by following these steps.").',
    },
    {
      key: 'normalization',
      patterns: [
        /text.*normal/i, /seeing text.*not a problem/i, /you do not understand.*normal/i,
        /do not understand.*normal/i, /unfamiliar text.*normal/i, /text you.*normal/i,
      ],
      message: 'Preamble is missing a normalization statement (e.g. "Seeing text you do not understand is normal.").',
    },
    {
      key: 'stop-safe',
      patterns: [
        /stop at any time/i, /stopping.*no harm/i, /you can stop/i,
        /stopping does not cause/i, /stop.*does not/i,
      ],
      message: 'Preamble is missing a stop-is-safe statement (e.g. "You can stop at any time. Stopping does not cause any harm.").',
    },
    {
      key: 'break-allowed',
      patterns: [
        /take a break/i, /take breaks/i, /breaks.*allowed/i,
        /the steps will wait/i, /guide will wait/i,
      ],
      message: 'Preamble is missing a break-is-allowed statement (e.g. "You can take breaks. The steps will wait for you.").',
    },
  ];

  for (const check of checks) {
    const found = check.patterns.some(p => p.test(preambleText));
    if (!found) {
      fail('R11', 1, check.message,
        'Add the missing sentence to the preamble block before Step 1.');
    }
  }
})();

// ── R12 — WORD-LIST ───────────────────────────────────────────────────────────
(function checkR12() {
  const hasWordList = /word list|glossary|what each word means|definitions/i.test(raw);
  if (!hasWordList) {
    fail('R12', lines.length,
      'No word list found. Every <default-directions> document must end with a word list.',
      'Add a "Word list" section at the end defining every technical term used in the document.');
  }
})();

// ── R13 — PART-MAP ────────────────────────────────────────────────────────────
(function checkR13() {
  const stepNums = getStepNumbers();
  if (stepNums.length <= 5) return; // only required for >5 steps
  const hasPartMap = /what this guide does|guide overview|parts of this guide/i.test(raw);
  if (!hasPartMap) {
    fail('R13', 1,
      `Document has ${stepNums.length} steps but no "What this guide does" section.`,
      'Add a "What this guide does" section after the preamble listing every part and its step range.');
  }
})();

// ── R16 — ISOLATION-TAG (already confirmed above) ────────────────────────────
// If we reached this point, R16 passes (the tag was found).

// ── R9 — WAIT-STATE (heuristic) ──────────────────────────────────────────────
(function checkR9() {
  const LONG_PROCESS_PATTERNS = [
    /npm install/i, /npm test/i, /npm run/i, /yarn install/i, /pip install/i,
    /brew install/i, /git clone/i, /downloading/i, /installing/i,
  ];
  const HAS_WAIT_SIGNAL = /you will see|what you will see|you will know.*done|blinking cursor|cursor.*back/i;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (LONG_PROCESS_PATTERNS.some(p => p.test(l))) {
      // Check if the surrounding context (±3 lines) has a wait signal
      const ctx = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      if (!HAS_WAIT_SIGNAL.test(ctx)) {
        fail('R9', i + 1,
          `Long-running command without a wait signal: "${l.trim().slice(0, 60)}"`,
          'Add a "What you will see:" block stating the maximum wait time and the exact text that signals completion.');
      }
    }
  }
})();

// ── R14 — NO-PROSE-ACTION (heuristic) ────────────────────────────────────────
(function checkR14() {
  const ACTION_VERBS_IN_PROSE = [
    /^open\s+[a-z]/i, /^click\s+/i, /^press\s+/i, /^type\s+/i,
    /^go to\s+/i, /^navigate to\s+/i, /^run\s+/i, /^paste\s+/i,
  ];
  let inFence = false;
  // Build a set of line indices that are step body lines (bare-integer heading style)
  const stepBodyLines = new Set();
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    // Bare-integer heading: line is just a number, next non-blank line is the step body
    if (/^\d+$/.test(t) && i + 1 < lines.length) {
      stepBodyLines.add(i + 1); // the action line right after
    }
    // Also skip lines immediately after "---" separators following a step
    if (t === '---' && i + 1 < lines.length) {
      // not a step body; do nothing
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    // Skip numbered step lines (inline style)
    if (/^\d+[.)]\s+/i.test(l.trim())) continue;
    // Skip bare-integer heading lines
    if (/^\d+$/.test(l.trim())) continue;
    // Skip lines that are step bodies in bare-integer heading style
    if (stepBodyLines.has(i)) continue;
    // Skip sanctioned blocks
    if (/if it looks different|what you will see|you will know|if you see/i.test(l)) continue;
    // Skip headings
    if (/^#{1,6}\s/.test(l.trim())) continue;
    const stripped = l.trim().replace(/^[-*]\s+/, '');
    for (const re of ACTION_VERBS_IN_PROSE) {
      if (re.test(stripped) && stripped.length > 10) {
        fail('R14', i + 1,
          `Action verb found in non-step text: "${stripped.slice(0, 60)}"`,
          'Move this action into its own numbered step. Do not embed actions inside paragraphs or list items.');
        break;
      }
    }
  }
})();

// ── R15 — SINGLE-PATH (gap/fork check, already in R8 gap check) ──────────────
// R8 covers numbering gaps. R15 additionally checks for multiple "path forks"
// that introduce new step numbers inside "If it looks different" blocks.
(function checkR15() {
  let inAlt = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim().toLowerCase();
    if (l.includes('if it looks different') || l.includes('if you see')) {
      inAlt = true; continue;
    }
    // Alt block ends at blank line followed by next step number
    if (inAlt && l === '') {
      const next = lines[i + 1]?.trim();
      if (next && /^\d+[.)]\s+/i.test(next)) inAlt = false;
    }
    if (inAlt && /^\d+[.)]\s+\S/.test(l)) {
      fail('R15', i + 1,
        `New step number inside an "If it looks different" block: "${lines[i].trim().slice(0, 60)}"`,
        'Alternative paths must not introduce new step numbers. Describe the alternative action in prose, then continue at the next main step number.');
    }
  }
})();

// ── Section 16.4.4 — No confidence language ──────────────────────────────────
(function checkConfidenceLanguage() {
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    for (const word of CONFIDENCE_WORDS) {
      if (l.includes(word)) {
        fail('R-16.4.4', i + 1,
          `Confidence language "${word.trim()}" found: "${lines[i].trim().slice(0, 60)}"`,
          'Remove this word. It increases anxiety when the step does not feel simple or easy.');
        break;
      }
    }
  }
})();

// ── R1 — ONE-ACTION (heuristic) ───────────────────────────────────────────────
(function checkR1() {
  // Flag step action lines that contain "and" joining two verbs or two imperatives.
  const TWO_VERB_AND = /\b(open|click|press|type|paste|run|go|navigate|select|enter)\b.{1,40}\band\b.{1,40}\b(open|click|press|type|paste|run|go|navigate|select|enter)\b/i;
  for (const step of getStepLines()) {
    if (TWO_VERB_AND.test(step.text)) {
      fail('R1', step.lineNum,
        `Two actions in one step: "${step.text.slice(0, 70)}"`,
        'Split into two separate numbered steps. Each step must contain exactly one action.');
    }
  }
})();

// ── R2 — SELF-CONTAINED (heuristic) ──────────────────────────────────────────
(function checkR2() {
  const BACK_REFS = [
    /use the (folder|file|value|name|path|command|output|result) from step \d+/i,
    /you entered in step \d+/i,
    /the value from step \d+/i,
    /as (shown|described|listed) (above|in step \d+)/i,
    /the previous step/i,
    /same as step \d+/i,
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const re of BACK_REFS) {
      if (re.test(lines[i])) {
        fail('R2', i + 1,
          `Back-reference to a prior step: "${lines[i].trim().slice(0, 70)}"`,
          'Restate the value or information directly in this step. Do not reference a prior step.');
        break;
      }
    }
  }
})();

// ── R5 — SUCCESS-FIRST (heuristic) ───────────────────────────────────────────
// Steps that have a long-running or UI-triggering action should have a "What you will see" block.
(function checkR5() {
  const ACTION_TRIGGERS = /\b(press|click|run|execute|paste|type|open|install)\b/i;
  const HAS_PREVIEW = /what you will see|you will see|you will know/i;
  for (const step of getStepLines()) {
    if (!ACTION_TRIGGERS.test(step.text)) continue;
    // Check 6 lines of context after the step
    const ctx = lines.slice(step.index, Math.min(lines.length, step.index + 7)).join('\n');
    if (!HAS_PREVIEW.test(ctx)) {
      warn('R5', step.lineNum,
        `Step has an action but no "What you will see" block nearby: "${step.text.slice(0, 60)}"`);
    }
  }
})();

// ── R10 — STOP-SAFE (heuristic) ──────────────────────────────────────────────
// Steps that have error conditions should have a stop condition.
// Heuristic: if a step mentions an error condition, look for a stop signal nearby.
(function checkR10() {
  const HAS_STOP = /stop here|do not continue|send me|ask for help|stop and tell/i;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/if it looks different/i.test(l)) {
      const ctx = lines.slice(i, Math.min(lines.length, i + 6)).join('\n');
      if (!HAS_STOP.test(ctx)) {
        warn('R10', i + 1,
          `"If it looks different" block without a clear stop condition nearby.`);
      }
    }
  }
})();

// ── Output ────────────────────────────────────────────────────────────────────
const errors   = violations.filter(v => !v.severity);
const warnings = violations.filter(v => v.severity === 'warn');

if (jsonOut) {
  console.log(JSON.stringify({
    file: absPath,
    compliant: errors.length === 0,
    error_count: errors.length,
    warning_count: warnings.length,
    violations,
  }, null, 2));
  process.exit(errors.length > 0 ? 1 : 0);
}

if (quiet) {
  process.exit(errors.length > 0 ? 1 : 0);
}

const tag = `\n${B}Article XVI Validator${X} — ${D}${absPath}${X}\n`;
console.log(tag);

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${G}${B}PASS${X}  All R1–R16 rules satisfied.\n`);
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`${R}${B}FAIL${X}  ${errors.length} violation(s):\n`);
  for (const v of errors) {
    const loc = v.line ? `line ${v.line}` : 'document';
    console.log(`  ${R}[${v.rule}]${X} ${loc}: ${v.message}`);
    if (v.suggestion) console.log(`  ${D}   Fix: ${v.suggestion}${X}`);
    console.log('');
  }
}

if (warnings.length > 0) {
  console.log(`${Y}WARN${X}  ${warnings.length} advisory violation(s):\n`);
  for (const v of warnings) {
    const loc = v.line ? `line ${v.line}` : 'document';
    console.log(`  ${Y}[${v.rule}]${X} ${loc}: ${v.message}`);
    console.log('');
  }
}

process.exit(errors.length > 0 ? 1 : 0);
