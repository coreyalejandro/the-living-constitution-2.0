# Installing TLC 2.0

TLC 2.0 (The Living Constitution) is a governance workspace for AI-assisted development.
It gives you a structured environment where every project has a contract, every claim has
evidence, and every AI session operates within declared scope. You get the same enforced
governance the original author uses — not a documentation template, a running system.

This guide installs TLC 2.0 on your machine and registers your first project.

---

## Before You Start

**Required:**
- macOS 12+ or Linux (Ubuntu 20.04+ or equivalent)
- Node.js 18 or later: `node --version`
- Python 3.10 or later: `python3 --version`
- Git: `git --version`

**Optional but recommended:**
- [Hermes Agent](https://hermes-agent.nousresearch.com) — for governed AI sessions
- tmux — for running the dashboard alongside work

Check your versions:

```bash
node --version    # should say v18 or higher
python3 --version # should say 3.10 or higher
git --version
```

If Node.js is missing: https://nodejs.org/en/download
If Python is missing: https://python.org/downloads

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/coreyalejandro/the-living-constitution-2.0.git ~/Projects/the-living-constitution-2.0
cd ~/Projects/the-living-constitution-2.0
```

---

## Step 2 — Run the Installer

```bash
bash install.sh
```

The installer:
- Checks Node.js and Python versions
- Creates `~/Workspace/` and symlinks `~/Workspace/tlc-2.0`
- Runs `npm install`
- Makes all scripts executable
- Adds TLC shell aliases to `~/.zshrc` or `~/.bashrc`
- Initializes your personal registry (separate from the example modules)
- Runs `validate_repo.py` to confirm the scaffold is intact
- Runs `tlc-dashboard` to confirm the scripts work

The install takes under a minute on a normal machine.

---

## Step 3 — Activate the Shell Aliases

```bash
source ~/.zshrc     # if you use zsh
# or
source ~/.bashrc    # if you use bash
```

Verify:

```bash
tlc-dashboard
```

You should see a terminal table. If you see a "command not found" error, try opening a new
terminal tab — the aliases are set and will be available in any new shell.

---

## Step 4 — Register Your First Project

You have two paths:

**For a project that already exists on disk:**

```bash
tlc-register --path ~/Projects/your-project-name
```

This adds the project to your registry, creates a stub contract, initializes an evidence
directory, and installs the pre-commit hook. It does not touch your code.

**For a new project:**

```bash
tlc-new --name my-project --template tlc-research-template --surface private_lab
```

This creates the project folder, fills it from the template, and registers it. The new
project appears in `~/Workspace/projects/my-project/` and in your dashboard.

---

## Step 5 — Verify the Installation

```bash
tlc-dashboard       # should show your registered modules
tlc-report          # should generate a markdown portfolio snapshot
tlc-validate --path ~/Projects/the-living-constitution-2.0   # should exit clean
```

If all three commands run without errors, your installation is complete.

---

## Optional: Connect Hermes Agent

If you want Hermes Agent as your AI backbone (governed sessions, daily digest, session
search by module ID), install it and sync your skills:

```bash
# Install Hermes
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
source ~/.zshrc

# Sync your TLC modules to Hermes skills
tlc-sync-skills

# Launch a governed session
tlc-hermes --module YOUR-MODULE-ID
```

The `tlc-hermes` command validates the module, loads the contract as a Hermes skill,
creates a session record, and launches Hermes with full contract context pre-loaded.

---

## The Daily Workflow

### Start your day

```bash
tlc-dashboard          # see all modules and their truth status
```

### Start a session

```bash
tlc-context --module MODULE-ID   # generates .ai-context/active-session.md
tlc-copy                         # copies it to clipboard
# paste into whatever AI you use (or use tlc-hermes to skip the paste step)
tlc-work --module MODULE-ID      # creates session record, opens editor
```

### End a session

```bash
tlc-done --module MODULE-ID \
  --evidence ./evidence/session-$(date +%Y-%m-%d).md \
  --ac-completed "AC-001,AC-002" \
  --notes "What you did"
```

---

## What You Get

| Capability | How |
|------------|-----|
| Every project has a contract | `tlc-register` creates C_RSP_BUILD_CONTRACT.md |
| Claims require evidence | Evidence files in `evidence/`; pre-commit hook enforces |
| AI sessions are contract-scoped | `active-session.md` injected before every chat |
| Commits are validated | Pre-commit hook checks I1/I2/I5/I6 invariants |
| Portfolio reflects truth | `tlc-report` shows actual truth_status per module |
| Hermes sessions governed | `tlc-hermes` loads contract as skill; Hermes operates in scope |
| Dashboard shows reality | `tlc-dashboard` shows verified vs unverified per module |
| Daily governance digest | Hermes cron delivers a summary to Telegram (optional) |

---

## Constitutional Tiers

TLC 2.0 has three optional compliance tiers above the baseline.
You do not need them to start. They define what it means to make specific claims.

| Tier | Article | Claim it enables | Key conditions |
|------|---------|-----------------|----------------|
| Baseline | I-IX | "Governed work" | Contract, evidence, invariants I1-I8 |
| Enterprise | X | "Enterprise-level" | 90-day audit retention, role-based break-glass, SLA-traceable evidence chains |
| Production-Ready | XI | "Production-ready" | Zero-downtime contract transitions, rollback evidence before deploy, health checks, HANDOFF.md |
| Privacy-First | XII | "Privacy-first" | No PII in evidence trails, data minimization, operator-controlled purge, local-first |

A module may only be represented with a tier label when it meets all conditions in
that Article and has evidence on file. These are not aspirational categories.
They are verifiable states with constitutional definitions.

Full definitions: `SOCIOTECHNICAL_CONSTITUTION.md`, Articles X-XII.

---

## Governance Files You Will Encounter

| File | What it is |
|------|-----------|
| `.tlc-module` | Module ID for the project — one line |
| `C_RSP_BUILD_CONTRACT.md` | The contract for this project: scope, ACs, halt conditions |
| `STATUS.md` | Current truth status and session retrospectives |
| `evidence/index.md` | Index of all evidence files |
| `HANDOFF.md` | Current state, what's working, next steps |
| `registry/modules.registry.json` | Your registry — all registered modules |
| `SOCIOTECHNICAL_CONSTITUTION.md` | The full constitutional framework |

---

## Troubleshooting

**"command not found: tlc-dashboard"**
Run `source ~/.zshrc` (or `~/.bashrc`). If still missing, check that
`~/Projects/the-living-constitution-2.0/shell-integration.zsh` was appended to your shell config.
Re-run: `cat ~/Projects/the-living-constitution-2.0/shell-integration.zsh >> ~/.zshrc`

**"Registry not found"**
The registry is created during install. If missing, create it:
```bash
echo '{"modules": []}' > ~/Projects/the-living-constitution-2.0/registry/modules.registry.json
```

**"Pre-commit hook blocking my commit"**
Read the message — it names the specific invariant. Common causes:
- Module not registered: run `tlc-register --path .`
- Module quarantined: check the registry `notes` field; resolve the violation
- PII detected: redact the file or add `pii_authorized` to the contract

**"tlc-hermes says Hermes not found"**
Install Hermes: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
Then `source ~/.zshrc` and retry.

**"validate_repo.py reports errors"**
Run `python3 scripts/validate_repo.py --path . --fix` — it resolves common scaffold issues
automatically. For manual fixes, the error output names the exact missing file.

---

## Uninstalling

TLC 2.0 does not install system-level components. To remove it:

```bash
# Remove the shell aliases from ~/.zshrc
# (delete the block between "# TLC 2.0 Workspace" markers)

# Remove the repo
rm -rf ~/Projects/the-living-constitution-2.0

# Remove the workspace symlink
rm -rf ~/Workspace/tlc-2.0

# Remove Hermes skills (if synced)
rm -rf ~/.hermes/skills/tlc
```

Your registered projects are not deleted. Only the governance infrastructure is removed.

---

## Forking

TLC 2.0 is designed to be forked. The registry is personal to each operator — forking
the repo gives you the governance infrastructure. Your modules are your own.

If you fork and improve the system, the constitutional amendment process (Article IX)
governs how changes are made: branch, edit, log the amendment, get approval, merge.

---

## V&T Statement

EXISTS — docs/INSTALLING.md written and committed
VERIFIED AGAINST — install.sh tested on macOS 15.7.8; all tlc-* commands verified working
NOT CLAIMED — Install verified on Linux; install on Windows
FUNCTIONAL STATUS — Installation guide complete. Source of truth for install process is install.sh.
