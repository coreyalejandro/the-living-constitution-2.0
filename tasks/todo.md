# Operator Experience Layer — Implementation Plan
# Goal: add a neurodivergent-first dual Web UI + TUI product skin over the existing governance control plane
# Constraint: governance infrastructure untouched. src/ui/ is the insertion point.
# Web stack: Vite + React (not Next.js — no server needed, purely reads governance artifacts via node scripts)
# TUI: enhance src/tui/app.tsx in place (do NOT replace, do NOT rewrite from scratch)
# Neurodivergent-first principles applied throughout:
#   - One thing at a time. Single primary action per screen.
#   - Explicit state. Every step confirms what just happened.
#   - No ambiguous "are you sure?" loops — clear YES/NO with consequence stated.
#   - Consistent nav. Tab order never changes. Keyboard shortcuts labeled inline.
#   - Color coded by truth_status (working=green, partial=yellow, unverified=gray, quarantined=red).
#   - No spinner without a timeout message. Every loading state has a fallback.

## Status Legend
## [ ] = pending  [x] = done  [~] = in-progress  [!] = blocked

---

## PHASE 1 — Scaffold (Vite + React reads governance artifacts)
## Outcome: `tlc web` command launches localhost:5173, reads registry, shows 30 modules

- [ ] T01: Install Vite + React into src/ui/ — zero config, standalone
- [ ] T02: Add `tlc:web` script to package.json (vite dev --root src/ui)
- [ ] T03: Add `tlc web` command to scripts/tlc.mjs dispatcher
- [ ] T04: Write src/ui/vite.config.js — set root, alias @tlc/data → scripts/
- [ ] T05: Write src/ui/index.html — minimal shell, loads main.jsx
- [ ] T06: Write src/ui/main.jsx — ReactDOM.createRoot, imports App
- [ ] T07: Write src/ui/App.jsx — route shell: Dashboard / Modules / Work / Evidence

## PHASE 2 — Dashboard view (single screen, status at a glance)
## Outcome: opens to a dashboard showing: module health counts, active work session, last evidence event

- [ ] T08: Write src/ui/lib/useRegistry.js — reads registry/modules.registry.json via fetch('./data/modules.json') or direct import
- [ ] T09: Write scripts/export-web-data.mjs — exports registry + active session to src/ui/public/data/*.json (run before vite dev)
- [ ] T10: Add `tlc:export-data` script to package.json
- [ ] T11: Write src/ui/views/Dashboard.jsx — status ring (working/partial/unverified/quarantined counts), active session card, last 3 evidence events
- [ ] T12: Write src/ui/components/StatusRing.jsx — color-coded ring per truth_status (no library needed, plain SVG)
- [ ] T13: Write src/ui/components/SessionCard.jsx — shows active module, contract, what to do next

## PHASE 3 — Modules view (list + drill-down)
## Outcome: browse 30 modules, filter by truth_status/surface, click to see detail

- [ ] T14: Write src/ui/views/Modules.jsx — sortable list, filter bar (truth_status + surface), keyboard nav
- [ ] T15: Write src/ui/components/ModuleRow.jsx — id, truth_status badge, surface, last-updated
- [ ] T16: Write src/ui/views/ModuleDetail.jsx — full module card: scope, ACs, invariant status, evidence files listed
- [ ] T17: Wire router: /modules → Modules.jsx, /modules/:id → ModuleDetail.jsx

## PHASE 4 — Work view (session-aware operator console)
## Outcome: one-click start/done work sessions, confirm at each step

- [ ] T18: Write src/ui/views/Work.jsx — shows: current module in session, tlc work / tlc done buttons, confirm modal before done
- [ ] T19: Write src/ui/lib/useSession.js — reads .ai-context/active-session.md (via exported data), parses session state
- [ ] T20: Write src/ui/components/ConfirmModal.jsx — plain modal: action stated, consequence stated, YES/NO — NO is the default (neurodivergent safe)

## PHASE 5 — Evidence view (timeline of evidence events)
## Outcome: chronological evidence log, color-coded by type, filterable

- [ ] T21: Write src/ui/views/Evidence.jsx — chronological list of evidence events, color by type
- [ ] T22: Write src/ui/components/EvidenceItem.jsx — timestamp, module, event type, brief description

## PHASE 6 — TUI enhancements (in-place, not a rewrite)
## Outcome: TUI respects neurodivergent-first patterns — explicit state, no silent transitions

- [ ] T23: Add status line to TUI bottom bar: shows active module ID when a work session is open (reads active-session.md)
- [ ] T24: Add confirmation prompt to tlc done: "About to close session for MODULE-ID. Evidence file will be required. Continue? y/N"
- [ ] T25: Add color coding to Modules tab: truth_status colors already in SKINS — ensure they apply to module rows consistently
- [ ] T26: Document keyboard shortcuts inline on the Help screen (/help command)

## PHASE 7 — Integration + docs
## Outcome: `tlc web` is in docs, both surfaces are in README

- [ ] T27: Update docs/HOW-TO-USE.md — add Web UI section (tlc web, what it shows, how to use)
- [ ] T28: Update README.md — add "Operator Surfaces" section listing TUI + Web UI
- [ ] T29: Write tasks/lessons.md — capture decisions made during this build

---
## Notes
- src/ui/public/data/ is gitignored — generated at dev time by tlc:export-data, not committed
- All Web UI reads are read-only. Writes (work, done, register) still go through tlc CLI commands
- Vite hot-reload means the web UI updates automatically when export-data re-runs
- Web UI does NOT require a server — pure static read of JSON exports from governance scripts
