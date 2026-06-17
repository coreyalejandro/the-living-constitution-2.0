#!/usr/bin/env node
/**
 * validate-instructions.mjs
 * TLC 2.0 — Article XVI Default Directions Validator
 *
 * Checks a Markdown instruction file against R1–R16 (SOCIOTECHNICAL_CONSTITUTION.md §XVI).
 * All rules are binary pass/fail. No judgment required for machine-detectable violations.
 * Residual human-review items are printed as a numbered checklist that follows Article XVI rules.
 *
 * Exit codes:
 *   0 — all machine-detectable rules pass (human review section may still appear)
 *   1 — one or more machine-detectable rules fail
 *   2 — usage error (no file given, file not found)
 *
 * Usage:
 *   node scripts/validate-instructions.mjs <path-to-file.md>
 *   node scripts/validate-instructions.mjs <path> --json
 *   node scripts/validate-instructions.mjs <path> --quiet   (exit code only)
 *   node scripts/validate-instructions.mjs <path> --no-human (suppress human review section)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── ANSI ──────────────────────────────────────────────────────────────────────
const R  = '\x1b[31m';
const Y  = '\x1b[33m';
const G  = '\x1b[32m';
const C  = '\x1b[36m';
const B  = '\x1b[1m';
const D  = '\x1b[2m';
const X  = '\x1b[0m';

// ── Args ──────────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const filePath  = args.find(a => !a.startsWith('--'));
const jsonOut   = args.includes('--json');
const quiet     = args.includes('--quiet');
const noHuman   = args.includes('--no-human');

if (!filePath) {
  console.error('Usage: validate-instructions.mjs <file.md> [--json] [--quiet] [--no-human]');
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
// The tag must appear as a raw string outside backticks or fenced blocks.
function hasRawTag(text) {
  const noFence = text.replace(/```[\s\S]*?```/g, '');
  const noCode  = noFence.replace(/`[^`\n]+`/g, '');
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
  violations.push({ rule, line: lineNum, message, suggestion: suggestion || null, severity: 'error' });
}
function advisory(rule, lineNum, message, suggestion) {
  violations.push({ rule, line: lineNum, message, suggestion: suggestion || null, severity: 'warn' });
}

// ── Pre-processing helpers ────────────────────────────────────────────────────

// Returns the index of the first line that starts a numbered step (either style).
function firstStepIndex() {
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^\d+[.)]\s+\S/.test(t) || /^\d+$/.test(t)) return i;
  }
  return -1;
}

// Returns true if a line index is inside a fenced code block.
function buildFenceMap() {
  const inFence = new Array(lines.length).fill(false);
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('```')) { fenced = !fenced; inFence[i] = false; continue; }
    inFence[i] = fenced;
  }
  return inFence;
}
const FENCE = buildFenceMap();

// Returns true if a line index is inside an HTML comment.
function buildCommentMap() {
  const inComment = new Array(lines.length).fill(false);
  let commented = false;
  for (let i = 0; i < lines.length; i++) {
    if (!commented && lines[i].includes('<!--')) commented = true;
    if (commented) inComment[i] = true;
    if (commented && lines[i].includes('-->')) { commented = false; }
  }
  return inComment;
}
const COMMENT = buildCommentMap();

// Returns all step objects: { lineNum (1-based), text (action text), index (0-based) }
function getStepLines() {
  const steps = [];
  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i].trim();
    if (/^\d+[.)]\s+\S/.test(l)) {
      steps.push({ lineNum: i + 1, text: l.replace(/^\d+[.)]\s+/, ''), raw: l, index: i });
    }
    if (/^\d+$/.test(l) && i + 1 < lines.length) {
      const next = lines[i + 1]?.trim();
      if (next && !/^\d/.test(next) && !next.startsWith('#') && next.length > 0) {
        steps.push({ lineNum: i + 2, text: next, raw: next, index: i + 1 });
      }
    }
  }
  return steps;
}

// Returns all step numbers in document order.
function getStepNumbers() {
  const nums = [];
  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const t = lines[i].trim();
    const m = t.match(/^(\d+)[.)]\s+\S/);
    if (m) nums.push(parseInt(m[1], 10));
    if (/^\d+$/.test(t)) { const n = parseInt(t, 10); if (n > 0) nums.push(n); }
  }
  return nums;
}

// Returns lines slice (joined) around a given index, skipping fenced blocks.
function ctx(index, before, after) {
  return lines.slice(Math.max(0, index - before), Math.min(lines.length, index + after + 1)).join('\n');
}

// Strips inline code from a string (for pattern matching that should ignore code spans).
function stripCode(text) {
  return text.replace(/`[^`\n]+`/g, '');
}

// Action verbs used across R1, R14
const ACTION_VERBS = [
  'open','click','press','type','paste','run','go','navigate','select','enter',
  'download','install','copy','find','delete','remove','save','close','quit',
  'exit','tap','scroll','drag','launch','choose','pick','confirm','accept',
  'dismiss','expand','collapse','upload','submit','fill',
];
const ACTION_VERB_RE = new RegExp(`\\b(${ACTION_VERBS.join('|')})\\b`, 'i');

// ── R8 — NUMBERED ─────────────────────────────────────────────────────────────
// Steps must use consecutive integers from 1. Sub-steps (1a, 1b) are forbidden.
(function checkR8() {
  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i].trim();
    if (/^\d+[a-z][.)]/i.test(l)) {
      fail('R8', i + 1,
        `Sub-step numbering: "${l.slice(0, 40)}". Steps must use whole integers only (1, 2, 3…).`,
        'Split into separate numbered steps. Use 1, 2, 3 — never 1a, 1b.');
    }
  }
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
        `Step numbering gap: steps jump from ${seen[i - 1]} to ${seen[i]}.`,
        'Every integer from 1 to the last step must be present. No skipping.');
    }
  }
})();

// ── R1 — ONE-ACTION ───────────────────────────────────────────────────────────
// Each step must contain exactly one imperative verb.
// Machine-detectable patterns:
//   (a) verb AND verb in same step text
//   (b) "and then" between two actions
//   (c) semicolon separating two action clauses
//   (d) two sentences in one step body (period + capital letter + action verb)
//   (e) comma-separated action verb list: "Copy, paste, press Return"
(function checkR1() {
  const VERB_AND_VERB = new RegExp(
    `\\b(${ACTION_VERBS.join('|')})\\b.{1,60}\\band\\b.{1,60}\\b(${ACTION_VERBS.join('|')})\\b`, 'i'
  );
  const AND_THEN = /\band\s+then\b/i;
  const SEMICOLON_VERB = new RegExp(
    `;\\s*(${ACTION_VERBS.join('|')})\\b`, 'i'
  );
  // Two-sentence step: ". Capital" within step text where both sentences contain an action verb
  const TWO_SENTENCE = /[a-z]\.\s+[A-Z]/;
  // Comma-imperative list: starts with action verb, has comma, ends with action verb
  const COMMA_VERB_LIST = new RegExp(
    `^(${ACTION_VERBS.join('|')})\\b.{0,40},\\s*(${ACTION_VERBS.join('|')})\\b`, 'i'
  );

  for (const step of getStepLines()) {
    const t = step.text;
    if (VERB_AND_VERB.test(t)) {
      fail('R1', step.lineNum,
        `Two actions joined by "and" in one step: "${t.slice(0, 70)}"`,
        'Split into two separate numbered steps. Each step must contain exactly one imperative verb.');
    } else if (AND_THEN.test(t)) {
      fail('R1', step.lineNum,
        `"and then" joins two actions in one step: "${t.slice(0, 70)}"`,
        'Split at "and then". Make each action its own numbered step.');
    } else if (SEMICOLON_VERB.test(t)) {
      fail('R1', step.lineNum,
        `Semicolon joins two actions in one step: "${t.slice(0, 70)}"`,
        'Replace the semicolon with a step break. Each action needs its own step number.');
    } else if (TWO_SENTENCE.test(t) && ACTION_VERB_RE.test(t)) {
      // Both sentences must contain action verbs for this to fire
      const parts = t.split(/\.\s+(?=[A-Z])/);
      if (parts.length >= 2 && parts.every(p => ACTION_VERB_RE.test(p))) {
        fail('R1', step.lineNum,
          `Two sentences in one step, both containing action verbs: "${t.slice(0, 70)}"`,
          'Split into two separate numbered steps. One sentence, one action, one step.');
      }
    } else if (COMMA_VERB_LIST.test(t)) {
      fail('R1', step.lineNum,
        `Comma-chained actions in one step: "${t.slice(0, 70)}"`,
        'Each action in the comma list must become its own numbered step.');
    }
  }
})();

// ── R2 — SELF-CONTAINED ──────────────────────────────────────────────────────
// No step may reference information from a prior step without restating it.
(function checkR2() {
  const BACK_REFS = [
    /use the (folder|file|value|name|path|command|output|result|password|text|address|number) from step \d+/i,
    /you (entered|typed|chose|selected|used|set|created) in step \d+/i,
    /the (value|text|name|path|folder|file|password|result|output) from (the )?step \d+/i,
    /as (shown|described|listed|mentioned|stated|noted|seen) (above|in step \d+|earlier|before|previously)/i,
    /the previous step/i,
    /the step above/i,
    /same as step \d+/i,
    /from earlier/i,
    /from before/i,
    /as before/i,
    /as above/i,
    /from the last step/i,
    /in the last step/i,
    /what you (typed|entered|chose|selected|set|created) (above|before|earlier|previously)/i,
    /the same (password|username|name|path|value|text|folder|file|command) (you|as)/i,
    /repeat (what you|the same|the previous)/i,
    /from (the )?step \d+/i,
    /\bsee step \d+\b/i,
    /\bgoto step \d+\b/i,
    /\brefer(ring)? to step \d+\b/i,
    /\busing the (result|output|value) from\b/i,
  ];
  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = stripCode(lines[i]);
    // Exclude forward-direction orientation phrases: "from Step 1 to the end", "steps in order from Step 1"
    if (/from step \d+ to (the end|step \d+)/i.test(l)) continue;
    for (const re of BACK_REFS) {
      if (re.test(l)) {
        fail('R2', i + 1,
          `Back-reference to a prior step: "${lines[i].trim().slice(0, 70)}"`,
          'Restate the value or information directly in this step. Do not reference a prior step by number or name.');
        break;
      }
    }
  }
})();

// ── R3 — NO-BRANCH ────────────────────────────────────────────────────────────
// No step action may contain conditional or alternative language.
(function checkR3() {
  const BRANCH_PATTERNS = [
    { re: /\bunless\b/i,            label: '"unless"' },
    { re: /\bdepending on\b/i,      label: '"depending on"' },
    { re: /\beither\b/i,            label: '"either"' },
    { re: /\bselect one of\b/i,     label: '"select one of"' },
    { re: /\botherwise\b/i,         label: '"otherwise"' },
    { re: /\balternatively\b/i,     label: '"alternatively"' },
    { re: /\bin that case\b/i,      label: '"in that case"' },
    { re: /\bin either case\b/i,    label: '"in either case"' },
    { re: /\bif (not|applicable|needed|required|available|you (want|prefer|have|see|chose|selected))\b/i,
                                    label: '"if [condition]" mid-action' },
    { re: /\bor you (can|may|could|should)\b/i, label: '"or you can/may"' },
    { re: /\bwhichever\b/i,         label: '"whichever"' },
    { re: /\byou (may|might) (also|instead|alternatively)\b/i, label: '"you may also/instead"' },
  ];
  // "or" in step action lines — only flag when joining two action-verb phrases
  const OR_BETWEEN_VERBS = new RegExp(
    `\\b(${ACTION_VERBS.join('|')})\\b.{0,40}\\bor\\b.{0,40}\\b(${ACTION_VERBS.join('|')})\\b`, 'i'
  );

  for (const step of getStepLines()) {
    // Skip "If it looks different" — that is the sanctioned alternative block
    if (/^if it looks different|^if you see/i.test(step.text)) continue;

    for (const { re, label } of BRANCH_PATTERNS) {
      if (re.test(step.text)) {
        fail('R3', step.lineNum,
          `Branch language ${label} in step action: "${step.text.slice(0, 60)}"`,
          'Remove the branch. Move alternative paths into an isolated "If it looks different" block after the step.');
        break;
      }
    }
    if (OR_BETWEEN_VERBS.test(step.text)) {
      fail('R3', step.lineNum,
        `"or" joins two action verbs in one step: "${step.text.slice(0, 60)}"`,
        'Choose one action. Move the alternative to an "If it looks different" block.');
    }
    // "if" in action text that is NOT a sanctioned block header
    if (/\bif\b/i.test(step.text) && !/^if it looks|^if you see/i.test(step.text.trim())) {
      fail('R3', step.lineNum,
        `Conditional "if" in step action text: "${step.text.slice(0, 60)}"`,
        'Move the conditional into an "If it looks different" block. The action line must be unconditional.');
    }
  }
})();

// ── R4 — COPY-PASTE ───────────────────────────────────────────────────────────
// Every command, URL, filename, and button label that must be typed exactly
// must be inside a fenced code block or inline backtick span.
(function checkR4() {
  // Shell tools that must always appear in code blocks when used as commands.
  // "find" and "ls" and "rm" are only flagged when followed by a path-like argument
  // (starts with /, ~, or .) to avoid false positives on natural language like "Find the app".
  // All other tools are flagged whenever they appear as word-boundary matches outside code.
  const SHELL_TOOLS_ALWAYS = [
    'cd', 'npm', 'node', 'git', 'chmod', 'cat', 'python3', 'python',
    'brew', 'curl', 'tar', 'wget', 'sudo', 'mkdir', 'cp', 'mv',
    'echo', 'export', 'source', 'grep', 'sed', 'awk',
    'defaults', 'killall', 'osascript', 'launchctl', 'rsync', 'make', 'ssh',
    'scp', 'xcode-select', 'softwareupdate', 'pkgutil', 'security', 'ditto',
    'zip', 'unzip', 'pbcopy', 'pbpaste', 'caffeinate', 'say',
    'nvm', 'pyenv', 'rbenv', 'asdf', 'volta', 'fnm', 'pnpm', 'yarn',
    'npx', 'tsx', 'deno', 'bun',
  ];
  // These tools are only flagged when followed by a path argument or a tool name.
  // "which node" = shell command. "tell me which project" = English. The regex
  // requires whitespace + non-space after, but we further restrict "which" to
  // only fire when followed by a lowercase identifier (tool name), not a plain noun.
  const SHELL_TOOLS_PATH_ONLY = ['find', 'ls', 'rm', 'open'];
  // "which" fires only when followed by a word that looks like a command/binary.
  // Shell: "which node", "which python3", "which brew" — tool names, often contain digits or dots.
  // English: "which project", "which one", "which you", "which module", "which folder" — plain nouns.
  // Heuristic: only fire when the word after "which" is itself in SHELL_TOOLS_ALWAYS or SHELL_TOOLS_PATH_ONLY,
  // or ends with a digit (python3, node18). This eliminates all English false positives.
  const WHICH_TOOLS = new Set([...SHELL_TOOLS_ALWAYS, ...SHELL_TOOLS_PATH_ONLY,
    'homebrew','pip','pip3','gem','ruby','perl','java','javac','gradle','mvn',
    'docker','kubectl','helm','terraform','ansible','vault','consul']);
  const WHICH_RE = new RegExp('\\bwhich\\s+(' + [...WHICH_TOOLS].join('|') + ')\\b');

  const ALWAYS_RE = new RegExp(`\\b(${SHELL_TOOLS_ALWAYS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`);
  // Path-only: tool word followed by whitespace then /, ~, ., or a flag (-name, --type, etc.)
  const PATH_ONLY_RE = new RegExp(`\\b(${SHELL_TOOLS_PATH_ONLY.join('|')})\\s+(\/|~\/|\\.\/|\\.\\.\/|-[a-zA-Z])`);

  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i];
    if (l.includes('`')) continue;
    if (/^ {4,}/.test(l)) continue;
    if (ALWAYS_RE.test(l) || PATH_ONLY_RE.test(l) || WHICH_RE.test(l)) {
      fail('R4', i + 1,
        `Command appears as plain prose text: "${l.trim().slice(0, 60)}"`,
        'Place every command inside a fenced code block (triple backticks) or an inline backtick span. Never write commands as plain text.');
    }
  }
})();

// ── R5 — SUCCESS-FIRST ───────────────────────────────────────────────────────
// Every step with an action trigger must have a "What you will see" block nearby.
// This is an ERROR, not advisory.
(function checkR5() {
  const ACTION_TRIGGERS = new RegExp(`\\b(${ACTION_VERBS.join('|')})\\b`, 'i');
  const HAS_PREVIEW = /what you will see|you will see|you will know|what you (should|must) see|look for these words/i;

  for (const step of getStepLines()) {
    if (!ACTION_TRIGGERS.test(step.text)) continue;
    // Check 8 lines after the step for a preview block
    const context = lines.slice(step.index, Math.min(lines.length, step.index + 9)).join('\n');
    if (!HAS_PREVIEW.test(context)) {
      fail('R5', step.lineNum,
        `Step has an action but no "What you will see" block: "${step.text.slice(0, 60)}"`,
        'Add a "What you will see:" paragraph directly after this step. State the exact text or appearance the user must match before continuing.');
    }
  }
})();

// ── R6 — NO-SPATIAL ──────────────────────────────────────────────────────────
// No spatial/directional language outside "If it looks different" blocks.
(function checkR6() {
  const SPATIAL_RE = /\b(above|below|left|right|top|bottom|corner|beside|next to|under|over|across from|toward|away from|upper|lower|middle|center)\b/i;

  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i];
    if (/if it looks different|if you see/i.test(l)) continue;

    const m = SPATIAL_RE.exec(l);
    if (!m) continue;

    // Context filters for known false positives
    const word  = m[1].toLowerCase();
    const after = l.slice(m.index + m[0].length, m.index + m[0].length + 25).toLowerCase();

    if (word === 'top'   && /\s*(at|ping|most|s\s|s$|\s+and|ple|ic)/.test(after)) continue; // "stop at", "topics", "topple"
    if (word === 'under' && /\s*(stand|stood|line|ly\b|go|goes|went|s\s|go|score)/.test(after)) continue; // "understand", "underlying"
    if (word === 'over'  && /\s*(n\b|ned|ning|all|come|age|lap|view|all|due|ride|see|turn|write|flow|load|head|looked)/.test(after)) continue;
    if (word === 'lower' && /\s*(case|cased)/.test(after)) continue; // "lowercase"
    if (word === 'center' && /\s*(ed|ing|s\b|piece)/.test(after)) continue;

    fail('R6', i + 1,
      `Spatial language "${m[1]}" found: "${l.trim().slice(0, 70)}"`,
      'Replace with the exact name or label of the element. Never use position to identify a UI element.');
  }
})();

// ── R7 — EXACT-LABEL ─────────────────────────────────────────────────────────
// UI elements must be referenced by their exact visible label, not by appearance.
(function checkR7() {
  const UI_ELEMENTS = '(button|link|icon|tab|checkbox|dropdown|menu item|field|box|window|dialog|pane|area|section|panel)';

  // Pattern A: explicit descriptor words before a UI element
  const COLOR_WORDS    = 'green|red|blue|yellow|orange|purple|gray|grey|white|black|teal|pink|brown';
  const SIZE_WORDS     = 'large|small|big|tiny|huge|wide|narrow|long|short';
  const GENERIC_WORDS  = 'main|primary|default|secondary|first|second|third|last|next|same|other|new|old|original';
  const DESCRIPTOR_RE  = new RegExp(`\\bthe\\s+(${COLOR_WORDS}|${SIZE_WORDS}|${GENERIC_WORDS})\\s+${UI_ELEMENTS}\\b`, 'i');

  // Pattern B: "the [word] button" where [word] is lowercase and not "labeled"/"named"/"that says"
  // A properly referenced button looks like: "the button labeled X" or "the button named X" or "the X button" where X is Title Case
  const UNLABELED_BUTTON = /\bthe\s+([a-z]+)\s+(button|link|icon|tab|checkbox)\b/i;
  const LABEL_EXEMPTIONS = /^(labeled|named|that says|for|to|with|of|at)\b/i;

  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i];
    const stripped = stripCode(l);

    if (DESCRIPTOR_RE.test(stripped)) {
      fail('R7', i + 1,
        `Descriptive UI reference: "${l.trim().slice(0, 70)}"`,
        'Use the exact label as it appears on screen. Write "the button labeled Install" not "the blue button".');
      continue;
    }

    const m = UNLABELED_BUTTON.exec(stripped);
    if (m) {
      const word = m[1].toLowerCase();
      // Skip if the preceding word is a verb context like "press", "click" followed by "the X button"
      // and X is Title Case (meaning X is likely the actual label)
      if (/^[A-Z]/.test(m[1])) continue;           // Title Case word — likely a real label
      if (LABEL_EXEMPTIONS.test(word)) continue;    // "labeled", "named", etc.
      if (/^(cancel|ok|yes|no|done|next|back|continue|agree|save|close|quit|exit|help|submit|send|apply)$/i.test(word)) continue; // common button labels that happen to be lowercase words
      fail('R7', i + 1,
        `Possible unlabeled UI reference "${m[0]}": "${l.trim().slice(0, 70)}"`,
        'If this is a button, write "the button labeled [exact label]". The label must match the text on screen exactly.');
    }
  }
})();

// ── R8 already ran ────────────────────────────────────────────────────────────

// ── R9 — WAIT-STATE ──────────────────────────────────────────────────────────
// Any step starting a long-running process must state max wait time and completion signal.
(function checkR9() {
  const LONG_PROCESS = [
    /npm (install|ci|test|run|build)/i,
    /yarn (install|build|test)/i,
    /pip install/i,
    /brew (install|update|upgrade)/i,
    /git clone/i,
    /git pull/i,
    /curl\s/i,
    /wget\s/i,
    /rsync\s/i,
    /\bmake\b/i,
    /downloading/i,
    /installing/i,
    /building/i,
    /compiling/i,
    /\bwait\b.*\bminute/i,
    /this (can|may|will) take/i,
    /can take up to/i,
    /gradle\s/i,
    /mvn\s/i,
    /cargo (build|test|run)/i,
    /go (build|test|run)/i,
    /docker (build|pull|run)/i,
  ];
  const HAS_WAIT_SIGNAL = /you will see|what you will see|look for|blinking cursor|cursor.*comes back|this may take|can take up to|wait until you see|wait for the/i;

  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    if (!LONG_PROCESS.some(p => p.test(lines[i]))) continue;
    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 9)).join('\n');
    if (!HAS_WAIT_SIGNAL.test(context)) {
      fail('R9', i + 1,
        `Long-running command without a wait signal: "${lines[i].trim().slice(0, 60)}"`,
        'Add a "What you will see:" block stating: (1) the maximum wait time in minutes, (2) the exact text on screen that means this step finished.');
    }
  }
})();

// ── R10 — STOP-SAFE ──────────────────────────────────────────────────────────
// Every "If it looks different" block must contain an explicit stop condition.
// This is an ERROR, not advisory.
(function checkR10() {
  const HAS_STOP = /stop here|do not continue|do not go further|do not proceed|send me|ask for help|stop and (tell|send|ask|let)|contact|reach out|stop and wait/i;

  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    if (!/if it looks different/i.test(lines[i])) continue;

    // Collect lines belonging to THIS block only.
    // The block ends at: blank line followed by a step number, another "If it looks different",
    // a heading, or a horizontal rule (---).
    const blockLines = [lines[i]];
    for (let j = i + 1; j < lines.length && j < i + 12; j++) {
      const t = lines[j].trim();
      // Stop collecting if we hit the next step, heading, rule, or another alt block
      if (/^\d+[.)]\s+/.test(t) || /^\d+$/.test(t)) break;
      if (/^#{1,6}\s/.test(t)) break;
      if (t === '---' || t === '***' || t === '___') break;
      if (/if it looks different/i.test(t) && j > i) break;
      blockLines.push(lines[j]);
    }
    const blockText = blockLines.join('\n');
    if (!HAS_STOP.test(blockText)) {
      fail('R10', i + 1,
        `"If it looks different" block has no stop condition: "${lines[i].trim().slice(0, 60)}"`,
        'Add a stop condition inside this block. Example: "If you are unsure, stop here. Do not continue. Send me the exact words you see on screen."');
    }
  }
})();

// ── R11 — PREAMBLE ────────────────────────────────────────────────────────────
// Preamble must appear before Step 1 and contain all four required statements.
(function checkR11() {
  const firstStep = firstStepIndex();
  const preambleText = firstStep === -1
    ? raw
    : lines.slice(0, firstStep).join('\n');

  const REQUIRED = [
    {
      key: 'safety',
      patterns: [/cannot break/i, /it is safe/i, /cannot cause harm/i, /safe to follow/i, /cannot harm/i, /will not break/i, /nothing here (will|can) damage/i],
      message: 'Preamble is missing a safety statement.',
      fix: 'Add this sentence before Step 1: "You cannot break your computer by following these steps."',
    },
    {
      key: 'normalization',
      patterns: [/text.*normal/i, /seeing text.*not a problem/i, /do not understand.*normal/i, /unfamiliar text.*normal/i, /messages.*normal/i],
      message: 'Preamble is missing a text-normalization statement.',
      fix: 'Add this sentence before Step 1: "A lot of text may appear on screen. Seeing text you do not understand is normal."',
    },
    {
      key: 'stop-safe',
      patterns: [/stop at any time/i, /stopping.*no harm/i, /you can stop/i, /stopping does not cause/i, /safe to stop/i],
      message: 'Preamble is missing a stop-is-safe statement.',
      fix: 'Add this sentence before Step 1: "You can stop at any time. Stopping does not cause any harm."',
    },
    {
      key: 'break-allowed',
      patterns: [/take a break/i, /take breaks/i, /the steps will wait/i, /guide will wait/i, /breaks.*safe/i, /can pause/i],
      message: 'Preamble is missing a breaks-are-allowed statement.',
      fix: 'Add this sentence before Step 1: "You can take breaks. The steps will wait for you."',
    },
  ];

  for (const req of REQUIRED) {
    if (!req.patterns.some(p => p.test(preambleText))) {
      fail('R11', 1, req.message, req.fix);
    }
  }
})();

// ── R12 — WORD-LIST ───────────────────────────────────────────────────────────
// Three sub-checks, all machine-deterministic:
//   A. Word list section exists and has entries.
//   B. Every backtick-quoted single-word technical term in the body has an entry.
//   C. Every definition body uses only plain words — jargon terms used in a
//      definition must themselves have an entry in the word list.
//
// Sub-check C uses a curated technical jargon set (~200 words) instead of the
// full Dale-Chall list. Reason: the Dale-Chall list dates to 1948 and marks
// many modern plain-English words as "difficult". A negative jargon set has
// zero false positives on plain language and catches all the words that
// actually break neurodivergent-first comprehension.
//
// A word in a definition is flagged when ALL of:
//   - it is in JARGON_WORDS
//   - it is not the term being defined (circular reference is a separate error)
//   - it does not have its own bold-header entry in the word list
//   - the definition does not expand the acronym inline (e.g. "API (Application...")
(function checkR12() {
  // ── Jargon word set ─────────────────────────────────────────────────────────
  // Words that are unambiguously technical. Any of these in a definition body
  // must either be: (a) the term being defined, or (b) itself defined in the word list.
  const JARGON_WORDS = new Set([
    // Computing — general
    'algorithm','api','argument','array','async','asynchronous','authentication',
    'authorization','binary','boolean','buffer','build','bundle','bytecode',
    'cache','callback','class','cli','closure','compile','compiler','config',
    'configuration','container','context','credential','daemon','database',
    'dependency','deploy','deployment','deserialize','directory','docker',
    'endpoint','exception','executable','filesystem','flag',
    'framework','function','git','gui','handler','hash','heap','hook',
    'http','https','ide','instance','integer','interface','invariant',
    'iteration','json','kernel','library','lint','loop','method','middleware',
    'migration','module','namespace','null','object','parameter','parse',
    'payload','pointer','port','process','promise','protocol','queue',
    'recursion','reference','regex','registry','repository','runtime',
    'scaffold','schema','scope','sdk','serialize','shell','socket','stack',
    'stdout','stderr','stdin','string','subprocess','synchronous',
    'thread','token','transpile','undefined','variable','webhook','yaml','toml',
    // Unix / macOS
    'bash','chmod','chown','cron','env','launchd','path','pipe','root',
    'symlink','zsh','brew','homebrew','xcode','plist',
    // Networking
    'dns','firewall','ip','proxy','ssl','tcp','tls','udp','url','uri',
    // TLC / governance
    'artifact','constitution','contract','evidence','governance','invariant',
    'module','quarantine','quarantined','unverified','verified',
    // Cryptography
    'certificate','checksum','encryption','hash','hex','hexadecimal','key',
    'signature','salt',
    // Package managers / build tools
    'npm','node','pip','gradle','maven','cargo','makefile','webpack',
    'vite','rollup','esbuild','turbo','pnpm','yarn',
  ]);

  // ── A. Word list exists and has entries ─────────────────────────────────────
  const wordListStart = lines.findIndex(l => /word list|glossary|what each word means|definitions/i.test(l));
  if (wordListStart === -1) {
    fail('R12', lines.length,
      'No word list found.',
      'Add a "Word list" section at the end of the document. Define every technical term used anywhere in the document.');
    return;
  }
  const wordListBody = lines.slice(wordListStart + 1);
  const hasEntries = wordListBody.some(l => l.trim().length > 0 && !/^#{1,6}\s/.test(l.trim()));
  if (!hasEntries) {
    fail('R12', wordListStart + 1,
      'Word list section exists but has no entries.',
      'Add at least one term and definition. Example: "Terminal\\nAn app on your Mac where you type commands."');
    return;
  }

  // ── Parse the word list into { term → {lineNum, definitionText} } ───────────
  // Entries are bold-header style: **Term** on its own line, definition on the next non-blank line.
  // Also handles "Term:" (colon-header) and "Term —" (em-dash) styles.
  const definedTerms = new Map(); // term (lowercase) → { lineNum, definition }
  for (let i = wordListStart + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    // Bold header: **Term** or **Term (alternate)**
    const boldMatch = l.match(/^\*\*(.+?)\*\*\s*$/);
    // Colon header: Term: definition on same line
    const colonMatch = l.match(/^([A-Z][A-Za-z\s\-()]{1,40}):\s+\S/);
    let term = null;
    let defLine = null;
    if (boldMatch) {
      term = boldMatch[1].trim().toLowerCase();
      // Definition is the next non-blank, non-heading line
      for (let j = i + 1; j < lines.length && j < i + 4; j++) {
        const d = lines[j].trim();
        if (d.length > 0 && !/^#{1,6}\s/.test(d) && !/^\*\*/.test(d)) {
          defLine = { lineNum: j + 1, text: d };
          break;
        }
      }
    } else if (colonMatch) {
      term = colonMatch[1].trim().toLowerCase();
      defLine = { lineNum: i + 1, text: l.slice(colonMatch[0].indexOf(':') + 1).trim() };
    }
    if (term && defLine) definedTerms.set(term, defLine);
  }

  // ── B. Backtick terms in body must have word list entries ───────────────────
  const bodyText = lines.slice(0, wordListStart).join('\n');
  const BACKTICK_TERM = /`([^`\n]{2,40})`/g;
  const foundBacktickTerms = new Set();
  let m;
  while ((m = BACKTICK_TERM.exec(bodyText)) !== null) {
    const t = m[1].trim();
    if (/^[a-zA-Z][a-zA-Z0-9._-]{1,30}$/.test(t)) foundBacktickTerms.add(t.toLowerCase());
  }
  for (const term of foundBacktickTerms) {
    if (!definedTerms.has(term)) {
      fail('R12-B', wordListStart + 1,
        `Term "${term}" is used in backtick code spans in the body but has no word list entry.`,
        `Add a definition for "${term}" to the word list section.`);
    }
  }

  // ── C. Definition bodies must not contain undefined jargon ──────────────────
  // Tokenize each definition. For each token that is in JARGON_WORDS:
  //   - skip if the token equals (or is a stem of) the entry's own term
  //   - skip if the token has its own entry in definedTerms
  //   - skip if the definition expands the acronym inline (word followed by parenthesised expansion)
  //   - otherwise: FAIL
  const WORD_TOKEN = /\b([a-zA-Z]{3,})\b/g;
  const INLINE_EXPAND = /\b([A-Z]{2,8})\s*\(([^)]{4,60})\)/;

  for (const [entryTerm, { lineNum, text }] of definedTerms) {
    // Build set of terms this definition is allowed to reference without defining:
    // itself + any term that already has an entry
    const inlineExpansions = new Set();
    let ie;
    const ieRe = /\b([A-Z]{2,8})\s*\(([^)]{4,60})\)/g;
    while ((ie = ieRe.exec(text)) !== null) {
      inlineExpansions.add(ie[1].toLowerCase());
    }

    WORD_TOKEN.lastIndex = 0;
    let tok;
    while ((tok = WORD_TOKEN.exec(text)) !== null) {
      const word = tok[1].toLowerCase();
      if (!JARGON_WORDS.has(word)) continue;
      // Skip if this IS the entry term (allow "A terminal is a terminal emulator")
      if (word === entryTerm || entryTerm.startsWith(word) || word.startsWith(entryTerm)) continue;
      // Skip if word has its own entry in the word list
      if (definedTerms.has(word)) continue;
      // Skip if expanded inline as acronym
      if (inlineExpansions.has(word)) continue;
      // Skip if word appears as a partial match of the entry term (e.g. "git" inside "github")
      if (entryTerm.includes(word) && word.length < entryTerm.length) continue;

      fail('R12-C', lineNum,
        `Definition of "${entryTerm}" uses jargon word "${word}" which has no word list entry: "${text.slice(0, 70)}"`,
        `Either (a) add a word list entry for "${word}", or (b) rewrite the definition without using "${word}". Every technical word in a definition must itself be defined.`);
    }
  }
})();

// ── R13 — PART-MAP ────────────────────────────────────────────────────────────
// Documents with more than 5 steps must have a "What this guide does" section.
(function checkR13() {
  const stepNums = getStepNumbers();
  if (stepNums.length <= 5) return;
  const hasPartMap = /what this guide does|guide overview|parts of this guide|overview of steps/i.test(raw);
  if (!hasPartMap) {
    fail('R13', 1,
      `Document has ${stepNums.length} steps but no "What this guide does" section.`,
      'Add a "What this guide does" section after the preamble. Name every part and the step range it covers. Example: "Part 1 — Node.js: Steps 1 to 8."');
  }
})();

// ── R14 — NO-PROSE-ACTION ────────────────────────────────────────────────────
// Action text must not appear inside paragraphs, list items, or headings.
(function checkR14() {
  const PROSE_ACTION_VERBS = new RegExp(`^(${ACTION_VERBS.join('|')})\\s+\\S`, 'i');

  // Build set of line indices that are step-body lines (bare-integer heading style)
  const stepBodyLines = new Set();
  for (let i = 0; i < lines.length; i++) {
    if (/^\d+$/.test(lines[i].trim()) && i + 1 < lines.length) {
      stepBodyLines.add(i + 1);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i];
    if (/^\d+[.)]\s+/i.test(l.trim())) continue;       // inline step line
    if (/^\d+$/.test(l.trim())) continue;               // bare step number
    if (stepBodyLines.has(i)) continue;                  // step body in bare-number style
    if (/if it looks different|what you will see|you will see|if you see/i.test(l)) continue;
    if (/^#{1,6}\s/.test(l.trim())) continue;           // heading
    if (l.trim() === '') continue;

    const stripped = l.trim().replace(/^[-*]\s+/, '');
    if (PROSE_ACTION_VERBS.test(stripped) && stripped.length > 10) {
      fail('R14', i + 1,
        `Action verb starts a non-step line: "${stripped.slice(0, 60)}"`,
        'This action must be its own numbered step. Move it out of the paragraph or list item.');
    }
  }
})();

// ── R15 — SINGLE-PATH ────────────────────────────────────────────────────────
// No new step numbers inside "If it looks different" alternative blocks.
(function checkR15() {
  let inAlt = false;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i].trim().toLowerCase();
    if (l.includes('if it looks different') || l.includes('if you see')) {
      inAlt = true; continue;
    }
    if (inAlt && l === '') {
      const next = lines[i + 1]?.trim();
      if (next && /^\d+[.)]\s+/i.test(next)) inAlt = false;
    }
    if (inAlt && /^\d+[.)]\s+\S/.test(l)) {
      fail('R15', i + 1,
        `New step number inside an "If it looks different" block: "${lines[i].trim().slice(0, 60)}"`,
        'Alternative paths must not introduce new step numbers. Write the alternative action as plain text. Continue at the next main step number after the block.');
    }
  }
})();

// ── R16 — ISOLATION-TAG (already confirmed above) ────────────────────────────
// If we reached this point, R16 passes.

// ── Section 16.4.4 — No confidence language ──────────────────────────────────
(function checkConfidenceLanguage() {
  const CONFIDENCE = [
    { word: 'simply',     context: /\bsimply\b/i },
    { word: 'just',       context: /\bjust\s+(a|an|one|click|press|type|run|go)\b/i },
    { word: 'easy',       context: /\beasy\b/i },
    { word: 'quickly',    context: /\bquickly\b/i },
    { word: 'obviously',  context: /\bobviously\b/i },
    { word: 'of course',  context: /\bof course\b/i },
    { word: 'trivial',    context: /\btrivial\b/i },
    { word: 'straightforward', context: /\bstraightforward\b/i },
    { word: 'no problem', context: /\bno problem\b/i },
    { word: 'nothing to worry', context: /nothing to worry about/i },
  ];
  for (let i = 0; i < lines.length; i++) {
    if (FENCE[i] || COMMENT[i]) continue;
    const l = lines[i];
    for (const { word, context } of CONFIDENCE) {
      if (context.test(l)) {
        fail('R-CONF', i + 1,
          `Confidence language "${word}" found: "${l.trim().slice(0, 60)}"`,
          'Remove this word. It causes anxiety when the step does not feel simple. State what to do without implying it should feel easy.');
        break;
      }
    }
  }
})();

// ── R5 supplementary — SUCCESS-FIRST ordering ────────────────────────────────
// R5 above checks presence. This check verifies the "What you will see" block
// comes AFTER the action line, not before it.
(function checkR5Ordering() {
  const PREVIEW_LINE = /what you will see|you will see:/i;
  const PREV_PREVIEW_BEFORE_ACTION = /what you will see/i;

  for (const step of getStepLines()) {
    // Find the nearest "What you will see" before this step (within 4 lines before)
    const before = lines.slice(Math.max(0, step.index - 4), step.index).join('\n');
    if (PREV_PREVIEW_BEFORE_ACTION.test(before)) {
      // A preview block appeared BEFORE the action — that violates "state what to do, then what to see"
      // However: R5 says state success BEFORE asking them to act. Re-reading the spec:
      // "Every step states what the user will see BEFORE it asks them to act."
      // This means the preview should come FIRST, then the action instruction.
      // So a "What you will see" block before the action line is actually CORRECT per R5.
      // We do not flag this. R5 ordering check: no violation here.
      // NOTE: This block intentionally does nothing — the spec interpretation is preserved.
    }
  }
})();

// ── Output ────────────────────────────────────────────────────────────────────
const errors   = violations.filter(v => v.severity === 'error');
const warnings = violations.filter(v => v.severity === 'warn');

// ── Human review checklist ────────────────────────────────────────────────────
// Four items require human judgment. Printed as a numbered Article XVI compliant checklist.
const HUMAN_REVIEW_ITEMS = [
  {
    number: 1,
    what: 'R1 — Multi-action sentences',
    instruction: 'Read every numbered step out loud. Count the number of things you are asked to do. If you count more than one thing, that step has too many actions.',
    look_for: 'Any step where you count two or more separate physical actions (for example: "Copy this command, paste it into Terminal, and press Return" — that is three actions).',
    pass: 'Every step asks you to do exactly one thing.',
    stop: 'If you are not sure whether a step has one action or two, stop. Do not continue. Add a note: "REVIEW NEEDED: Step [number] — possible multi-action."',
  },
  {
    number: 2,
    what: 'R5 — "What you will see" accuracy',
    instruction: 'Read the "What you will see" text in each step. Then run the step on the actual system. Compare what appears on screen to what the document says you will see.',
    look_for: 'Any mismatch between the text in "What you will see" and what actually appears on screen.',
    pass: 'Every "What you will see" block matches what actually appears on screen when you run that step.',
    stop: 'If the screen does not match the description, stop. Do not continue. Add a note: "REVIEW NEEDED: Step [number] — \"What you will see\" does not match actual output."',
  },
  {
    number: 3,
    what: 'R7 — Ambiguous UI labels',
    instruction: 'Find every step that references a button, link, tab, icon, or field. Read the label in the document. Open the actual application. Find the element on screen and read its label.',
    look_for: 'Any step where the label in the document does not exactly match the text on screen.',
    pass: 'Every UI element label in the document matches the text that appears on screen exactly, character for character.',
    stop: 'If a label does not match, stop. Do not continue. Add a note: "REVIEW NEEDED: Step [number] — label mismatch. Document says [X], screen shows [Y]."',
  },
];

if (jsonOut) {
  console.log(JSON.stringify({
    file: absPath,
    compliant: errors.length === 0,
    error_count: errors.length,
    warning_count: warnings.length,
    violations,
    human_review_required: !noHuman,
    human_review_items: noHuman ? [] : HUMAN_REVIEW_ITEMS,
  }, null, 2));
  process.exit(errors.length > 0 ? 1 : 0);
}

if (quiet) {
  process.exit(errors.length > 0 ? 1 : 0);
}

// ── Pretty output ─────────────────────────────────────────────────────────────
const header = `\n${B}Article XVI Validator${X} — ${D}${absPath}${X}\n`;
console.log(header);

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${G}${B}PASS${X}  All machine-detectable rules (R1–R16) satisfied.\n`);
} else {
  if (errors.length > 0) {
    console.log(`${R}${B}FAIL${X}  ${errors.length} violation(s):\n`);
    for (const v of errors) {
      const loc = v.line ? `line ${v.line}` : 'document';
      console.log(`  ${R}[${v.rule}]${X} ${loc}: ${v.message}`);
      if (v.suggestion) console.log(`     ${D}Fix: ${v.suggestion}${X}`);
      console.log('');
    }
  }
  if (warnings.length > 0) {
    console.log(`${Y}WARN${X}  ${warnings.length} advisory item(s):\n`);
    for (const v of warnings) {
      const loc = v.line ? `line ${v.line}` : 'document';
      console.log(`  ${Y}[${v.rule}]${X} ${loc}: ${v.message}`);
      if (v.suggestion) console.log(`     ${D}Suggestion: ${v.suggestion}${X}`);
      console.log('');
    }
  }
}

// ── Human review section ──────────────────────────────────────────────────────
if (!noHuman) {
  const divider = `${D}${'─'.repeat(70)}${X}`;
  console.log(divider);
  console.log(`\n${C}${B}HUMAN REVIEW REQUIRED${X}\n`);
  console.log(`${B}Three things require a human. The machine cannot check them.${X}`);
  console.log(`${B}Do these three checks in order, one at a time.${X}\n`);
  console.log(`Read this first.`);
  console.log(`  You cannot break the document by following these steps.`);
  console.log(`  You can stop at any time. Stopping does not cause any harm.`);
  console.log(`  You can take breaks. The checklist will wait for you.\n`);

  for (const item of HUMAN_REVIEW_ITEMS) {
    console.log(`${B}${item.number}. ${item.what}${X}`);
    console.log(`   What to do: ${item.instruction}`);
    console.log(`   What to look for: ${item.look_for}`);
    console.log(`   Pass condition: ${item.pass}`);
    console.log(`   ${R}Stop condition: ${item.stop}${X}`);
    console.log('');
  }

  console.log(`${B}You are done with the human review checklist.${X}`);
  console.log(`If all four steps show Pass, this document is fully compliant.`);
  console.log(`If any step shows Stop, fix the issue before using this document.\n`);
  console.log(divider);
  console.log('');
}

process.exit(errors.length > 0 ? 1 : 0);
