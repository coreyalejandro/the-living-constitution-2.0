# TLC 2.0 Workspace — Onboarding Guide

You have a governance system running on your machine. It lives at
~/Projects/the-living-constitution-2.0. Its job is to hold your work to the same
standard you hold your thinking — rigorous, honest about what is and isn't verified,
and structured enough that you don't have to rely on memory or momentum to keep going.
Every project you work on gets registered, every claim gets evidence, and every AI
session gets a contract that tells the AI exactly what it can and cannot say you've done.
This guide walks you through using that system on a real session, from cold start to commit.

---

## Before You Read Anything Else

1. Nothing in this system is automatic. You start sessions, you end them, you produce evidence.
   The system tracks and enforces — it does not do the work for you.

2. A "session" is a bounded unit of work. It has a start (`tlc-work`), a middle (you build),
   and an end (`tlc-done`). Between start and end, you work inside a contract.

3. The dashboard is not a to-do list. It shows truth — what is verified, what isn't, what
   is frozen. Looking at it tells you what is actually real, not what you hope is real.

---

## The Mental Model (Read This Before Anything Else)

The system has five moving parts. You only ever interact with three of them.

```
Registry ─── knows about every project you've registered
    │
    ├── Module ─── one project, one ID, one truth status
    │       │
    │       └── Contract ─── what you're allowed to claim on this project
    │
    └── Session ─── a bounded unit of work (start → evidence → end)
                        │
                        └── Evidence ─── the proof that a claim is real
```

You never edit the registry by hand. The scripts do it.
You never self-report completion. Evidence files do it.
The only question the system asks is: "Can you prove that?"

---

## Cognitive Safety: What This System Does for You

This section exists because the system was designed with your cognitive profile in mind.

### What it prevents

- Scope creep mid-session: the contract defines what you can work on before you start,
  so the AI cannot drag you sideways into unrelated territory
- False completion: the pre-commit hook blocks commits that claim ACs are done without
  evidence. You physically cannot lie to the repo by accident.
- Lost context between sessions: the `active-session.md` file gets regenerated at the
  start of every session, so you never have to reconstruct what you were doing from memory
- Compulsive re-explanation to AI: paste `active-session.md` at the start of any chat.
  The AI reads your contract, your constraints, your preferences. You don't repeat yourself.

### What it does NOT manage for you

- You still decide when to start a session
- You still decide when work is done enough to end the session
- You still write the evidence (it can be brief — a terminal output, a passing test, a note)
- You still decide which projects to register

### A note on intrusive thoughts and session boundaries

If you are mid-session and an intrusive thought says "this isn't working" or "you should
be working on something else" — the session contract is your answer. Open the contract.
Read the scope. If the thought is outside the scope, it is not your problem right now.
The contract is the boundary. You agreed to it before the session. Trust past-you.

If the thought is about the current work — write it in a `notes.md` scratch file in the
project. Don't act on it. End the session with `tlc-done` when the intrusive loop has
a named place to go.

---

## First Session Walkthrough

This is the full loop, start to finish, for a project that is already registered.

### Step 1 — Check the dashboard

```bash
tlc-dashboard
```

You will see all registered modules grouped by truth status. Find the module you plan
to work on. Note its current truth_status. That status is what's true right now.

### Step 2 — Generate your AI context

```bash
tlc-context --module YOUR-MODULE-ID
```

This writes `.ai-context/active-session.md` — a file that tells any AI assistant your
contract, your scope, your invariants, and your preferences. Do this before you open a chat.

### Step 3 — Start the session

```bash
tlc-work --module YOUR-MODULE-ID
```

This does three things:
- Confirms the module is not quarantined
- Creates a session record in `.sessions/`
- Opens your project in your editor

If the module IS quarantined, the command will stop and tell you why. Fix the violation
before proceeding. Quarantine means something broke a governance rule. The message will
tell you what.

### Step 4 — Load the AI context

In whatever chat you use (Claude, Kimi, anything):

```
Read .ai-context/active-session.md before responding.
Module: YOUR-MODULE-ID
Contract: CRSP-YOUR-MODULE-ID
All work must comply with I1-I6 invariants.
```

Or use the clipboard shortcut:

```bash
tlc-copy
```

Then paste into the chat. The AI now knows exactly what it can and cannot claim.

### Step 5 — Do the work

Work on what the contract says. The contract has an Acceptance Criteria list. Each item
is a binary: done or not done. Focus on one AC at a time if possible.

If the AI tries to work outside the contract scope, say: "That is outside the contract scope.
Stay within the declared ACs." The AI has the contract — it will comply.

### Step 6 — Capture evidence

When you complete an AC, capture proof. This can be:

- A copy of terminal output showing it working: save it to `evidence/session-YYYY-MM-DD.md`
- A test run result: `npm test > evidence/test-run-YYYY-MM-DD.txt`
- A brief note: "AC-003 verified: dashboard renders all 21 modules. Confirmed by visual check."

There is no required format. The required thing is: something on disk that wasn't there before.

### Step 7 — End the session

```bash
tlc-done --module YOUR-MODULE-ID \
  --evidence ./evidence/session-2026-06-17.md \
  --ac-completed "AC-001,AC-002" \
  --notes "Brief description of what happened"
```

This:
- Validates your evidence file exists
- Appends a retrospective entry to STATUS.md
- Checks whether the ACs you listed are met
- Proposes a truth_status upgrade if warranted (does not auto-apply — you decide)
- Closes the session record

If you don't have clean evidence but still need to end the session cleanly, end it without
`--ac-completed`. You can always run `tlc-done` again after capturing evidence.

---

## Registering a New Project

For any project you already have on disk that isn't yet governed:

```bash
tlc-register --path ~/Projects/your-project-name
```

This creates `.tlc-module`, a stub `C_RSP_BUILD_CONTRACT.md`, `STATUS.md`, and an
`evidence/` directory inside that project. It adds the project to the registry with
`truth_status: unverified`. It installs the pre-commit hook. It does not touch your code.

For a brand new project that doesn't exist yet:

```bash
tlc-new --name my-project-name --template tlc-research-template --surface private_lab
```

This creates the folder, fills it from the template, and registers it in one step.

---

## Checking the Portfolio

To see everything at once:

```bash
tlc-dashboard              # terminal, color-coded by status
tlc-report                 # markdown output to stdout
tlc-report --format brief  # condensed table
tlc-report --out reports/2026-06-17.md  # save to file
```

The report shows every module, its truth status, its unverified scope items, and its
evidence file count. This is what's real. Not what you remember building. What the
registry says and what the evidence directory confirms.

---

## The Pre-Commit Hook

Every registered project gets a pre-commit hook installed that checks:

- I1: Is this module registered? (blocks if not)
- I2: If ACs are claimed done, is there evidence? (warns if not)
- I5: Is any staged file accidentally containing PII? (blocks if yes)
- I6: Is this module quarantined? (blocks if yes)

If a commit is blocked, the hook tells you exactly what rule was violated and how to fix it.

To bypass in a genuine emergency:

```bash
TLC_BYPASS_HOOKS=1 git commit -m "..."
```

You must write a justification and commit it within 24 hours. Without justification, the
module is automatically quarantined on next use.

---

## If You Get Stuck

### "I don't know what to work on"

```bash
tlc-dashboard
```

Look at the `partial` modules. Each one has unverified scope items. Pick the smallest one.

### "The AI went off-script"

Paste the contract scope back into the chat:
"Return to scope. The active contract is CRSP-[MODULE-ID]. What is the next incomplete AC?"

### "I can't remember what I did last session"

```bash
cat ~/Projects/your-project/STATUS.md | tail -30
cat ~/Projects/your-project/evidence/index.md
```

The retrospective section of STATUS.md is appended by `tlc-done` after every session.
Evidence/index.md lists every evidence file with its date.

### "The pre-commit hook is blocking me and I don't know why"

The hook prints the specific rule it violated. Read the message. It will say:
`HALT_CONTRACT_MISSING` or `HALT_INVARIANT_FAILED` or similar. Cross-reference with
Article VIII of `SOCIOTECHNICAL_CONSTITUTION.md` for the resolution steps.

### "I'm overwhelmed and can't start"

Run:

```bash
tlc-dashboard
tlc-context --module [any partial module]
```

Then open the `active-session.md` and read only the "Unverified Scope" section. Pick
the first item. That is the next thing. Not all the things. Just that one.

The contract prevents you from having to decide scope mid-session. You decided it when
you started. Trust that decision.

### "A quarantine happened and I don't know how to resolve it"

Open the registry:

```bash
cat ~/Projects/the-living-constitution-2.0/registry/modules.registry.json | grep -A 10 "YOUR-MODULE-ID"
```

Check the `notes` field — it records why the quarantine happened. Fix the underlying
issue (write missing evidence, remove PII, add a bypass justification). Then manually
update the `truth_status` from `quarantined` to `unverified` in the registry JSON, and
run `git commit` to record the resolution.

---

## Folder Map

```
~/Projects/the-living-constitution-2.0/
│
├── scripts/                  All TLC workspace commands
│   ├── tlc-work.mjs          Start a governed session
│   ├── tlc-done.mjs          End a session, capture evidence
│   ├── tlc-new.mjs           Create a new governed project
│   ├── tlc-register.mjs      Register an existing project
│   ├── tlc-dashboard.mjs     View all modules (terminal)
│   ├── tlc-report.mjs        Generate portfolio markdown report
│   ├── inject-ai-context.mjs Generate .ai-context/active-session.md
│   ├── validate-module-here.mjs  Auto-runs on cd (via shell hook)
│   └── validate_repo.py      Full scaffold validator (6 checks)
│
├── src/git-hooks/
│   └── pre-commit.mjs        I1/I2/I5/I6 enforcement at commit
│
├── registry/
│   └── modules.registry.json All registered modules (21 as of 2026-06-17)
│
├── contracts/active/
│   └── BUILD_CONTRACT.json   Active C-RSP contract for TLC root
│
├── templates/
│   └── tlc-research-template/ Used by tlc-new to scaffold projects
│
├── .ai-context/
│   ├── user-profile.md       Your preferences — loaded into AI sessions
│   └── active-session.md     Regenerated before each session (do not edit)
│
├── .sessions/                Session records — auto-created by tlc-work/tlc-done
├── evidence/                 Evidence for TLC root itself
│
├── SOCIOTECHNICAL_CONSTITUTION.md  Articles I-IX, Invariants I1-I8
├── HANDOFF.md                Current state, file manifest, next steps
├── shell-integration.zsh     Shell aliases (sourced in ~/.zshrc)
└── install.sh                One-shot bootstrap for fresh machines
```

---

## Cognitive Load Notes

- You do not need to edit the registry manually. Every script that changes registration
  status updates the JSON for you.
- You do not need to format evidence files. Any file with content counts. A one-line note
  counts. A pasted terminal output counts.
- You do not need to remember module IDs. `tlc-dashboard` lists all of them.
- You do not need to manage the pre-commit hook on new projects. `tlc-register` installs it.
- You do not need to explain your context to the AI at the start of every session.
  `tlc-copy` puts `active-session.md` in your clipboard in one keystroke.
- You do not need to decide what to do next. The dashboard and the contract scope decide
  it. Your job is to open the session and follow the contract.
- The one thing that will cause silent failure: starting a chat session without pasting
  `active-session.md`. If the AI doesn't have the contract, it is operating ungoverned.
  That output cannot support a status upgrade.

---

## Quick Reference Card

```
Start the day
  tlc-dashboard

Start a session
  tlc-context --module MODULE-ID
  tlc-copy                          (paste into chat)
  tlc-work --module MODULE-ID

During a session
  Save evidence to evidence/session-YYYY-MM-DD.md as you go

End a session
  tlc-done --module MODULE-ID --evidence ./evidence/session-YYYY-MM-DD.md --ac-completed "AC-001"

Register an existing project
  tlc-register --path ~/Projects/project-name

Create a new project
  tlc-new --name project-name --template tlc-research-template --surface private_lab

Check portfolio
  tlc-report --format brief

Validate scaffold
  tlc-validate --path .
```

---

## V&T Statement

EXISTS (Verified Present) — docs/ONBOARDING.md written and placed in TLC 2.0 repo
VERIFIED AGAINST — All commands described were smoke-tested during 2026-06-17 build session; tlc-dashboard, tlc-report, inject-ai-context, validate_repo.py all returned expected output
NOT CLAIMED — That following this guide produces working output on any machine other than the machine where the scripts were tested; that the quarantine resolution process has been exercised end-to-end
FUNCTIONAL STATUS — Onboarding guide complete. Source of truth for all commands is the scripts in ~/Projects/the-living-constitution-2.0/scripts/.
