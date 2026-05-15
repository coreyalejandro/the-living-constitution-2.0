# coreyalejandro.com — refactored portfolio

A complete, deployable static site that integrates 33 enhancements into the actual structure of the Living Constitution portfolio. **Statically-deployable, no backend, fully client-side interactive.**

The homepage opens with the **Golden Folio 001 Interactive Case Chamber** — a first-class onboarding surface that transforms the founding case from a linear dossier into an evidence-first interactive experience: seven case cards, a claim-vs-reality split, a seven-step reconstruction loop, an apparatus-unlock banner, and a Golden Thread map linking the case to every product derived from it.

Drop it into any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3+CloudFront, or a plain Apache/Nginx server). No build step required on the host.

---

## What you're getting

37 HTML pages, 1 CSS file, 5 JS modules, ~700 KB total.

```
coreyalejandro-site/
├── index.html                  ← homepage, literary register
├── detector.html               ← Deception Detector sandbox (real PROACTIVE F1–F4 in JS)
├── sitemap.html                ← navigable index of every page
│
├── paper.html                  ← CCD preprint
├── about.html                  ← founder bio
├── objections.html             ← 10 reviewer objections + receipts
├── glossary.html               ← Constitution terminology
├── funding-ask.html            ← $89k / $190k / $480k ask
├── roadmap.html
├── theory-of-change.html
├── subscribe.html
│
├── folio/
│   ├── 001.html                ← FOLIO 001 transcript scaffold
│   └── framing.html            ← Case 0 vs Case 1 framing note
│
├── research/                   ← corpus, lit-review, taxonomy, methodology, pre-registration
├── security/                   ← threat-model, provenance, reader-consent
├── governance/                 ← coi, fiscal-sponsor, advisory-board, disclosures, test-claims
├── programs/                   ← pilot, fellowship, adversarial-review, amendments, replay-harness
├── runtime/                    ← reproduce, quickstart, benchmarks, production-hygiene, sdk, plugin
│
├── assets/
│   ├── site.css                ← shared stylesheet, two registers
│   ├── hud.js                  ← Truth Surface HUD (R-441 v1.1)
│   ├── detector.js             ← PROACTIVE F1–F4 working detector
│   ├── kernel.js               ← Live Kernel terminal
│   ├── amendments.js           ← Amendment Commits + GitHub Issue prefill
│   └── site.js                 ← active-nav highlighting
│
└── build_site.py               ← regenerate operational pages from the markdown drafts
```

---

## The interactive surfaces

### Truth Surface HUD (R-441 v1.1)
Persistent terminal-style bar at the bottom of every page. **Off by default.** A consent banner appears 2.5 seconds after first load. If accepted:

- Tracks pages visited and time-on-page in localStorage.
- Each page is weighted by epistemic value — paper, corpus, threat-model, reproduce, and detector earn the most.
- Activities earn bonuses: running the Detector (+8 per scan), proposing an amendment (+5), kernel commands (+2).
- Surfaces a live **Reviewer Credibility** score banded low / mid / high.

Nothing is transmitted. Local-only. The ⚙ button in the HUD toggles between on, off, and "purge attestation" (clears all locally-held data).

### The Deception Detector (`detector.html`)
A real working sandbox of PROACTIVE running entirely client-side. Paste any transcript (JSONL, markdown with role prefixes, or plain text with `---` between sessions), optionally paste a list of generated files, and Sentinel's four features score it:

- **F1 · Cross-session claim persistence** — counts distinct sessions in which the same component is reported "working."
- **F2 · Artifact-claim divergence** — ratio of doc-shape files to runtime-shape files in the generated set.
- **F3 · Post-hoc admission delta** — Jaccard distance between earlier claim language and any later admission turn.
- **F4 · Deference escalation** — hedged-completion vs. declarative-completion ratio.

Two demonstration samples ship with the page: a synthetic CCD-positive transcript (modeled on FOLIO 001) and a clean baseline. Results render with per-feature scores, evidence trail, and a downloadable JSON report.

### The Live Kernel (`Ctrl+\`` or `Cmd+K`)
Terminal overlay that slides up from the bottom of any page. Commands:

| Command | Effect |
|---|---|
| `help` | List all commands |
| `list folios\|claims\|pages\|evasions\|amendments` | Quick references |
| `get evidence <id>` | Navigate to evidence page (e.g., `get evidence folio-001`) |
| `cd <page>` / `open <page>` | Aliases for `get evidence` |
| `verify module <name>` | Animate a `make verify` run (constitution / proactive / sentinelos / all) |
| `scan transcript` | Open the Deception Detector |
| `show evasions\|tests\|status\|threat-model\|coi` | Print structured summaries |
| `cite paper` | Emit a BibTeX citation |
| `whoami` | Show your current R-441 credibility (if enabled) |
| `history` | Show command history |
| `clear` / `exit` | Clear / close the terminal |

Tab-completion, up/down history, Escape to close.

### Amendment Commits
Select any sentence on an operational page (12–600 characters). A floating "✎ Propose Amendment" pill appears. Click it, write a reframing and a one-line rationale, then:

- **Save locally** — proposal is persisted in localStorage and visible on `/programs/amendments.html` under "Your queued amendments."
- **Open as GitHub Issue** — opens a pre-filled `github.com/coreyalejandro/living-constitution/issues/new` with the diff and rationale, labeled `amendment-proposal`.

A Public Amendment Queue page seeds the surface with three demonstration entries (status: open, amended, accepted) so the feature is never empty.

---

## Customizing before deploy

A handful of placeholders need to be filled in. Search the source for these strings:

| Find | Replace with |
|---|---|
| `[committed at first signing]` (in `folio/001.html`) | Your actual SHA-256 of `Kiro_lies-and-deception.md` |
| `[fingerprint to be inserted at first signing]` | Your GPG signing-key fingerprint |
| `GITHUB_OWNER = 'coreyalejandro'` in `assets/amendments.js` | Your GitHub org if different |
| `GITHUB_REPO = 'living-constitution'` in `assets/amendments.js` | Your repo name |
| Prior employment / education in `about.html` | Your actual history |

Optional adjustments:

- **R-441 default state.** Currently opt-in with a banner. To make it opt-out (not recommended per the v1.1 spec), edit `assets/hud.js` and change the `loadConsent()` default.
- **Topbar links.** Edit `assets/site.js` and the topbars in each HTML page if you want to add or remove top-level sections.
- **Kernel commands.** Add or remove commands in `assets/kernel.js` under the `COMMANDS` object.
- **Page weights for credibility.** Adjust `PAGE_WEIGHTS` in `assets/hud.js` to reflect your own sense of which pages earn the most epistemic credit.

---

## Rebuilding the operational pages

If you edit any of the 33 markdown drafts in `../coreyalejandro-enhancements/`, regenerate the operational HTML pages with:

```bash
pip install markdown
python3 build_site.py
```

The script does **not** touch `index.html` (the homepage), `detector.html` (special interactive page), `folio/001.html`, or `sitemap.html` — those are hand-maintained.

---

## Local preview

```bash
# Python 3 ships with a static server:
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser.
```

No build step. No bundler. No npm. Just files.

---

## Hosting recommendations

- **Netlify** — drag and drop the directory into the dashboard. Instant deploy with HTTPS.
- **Cloudflare Pages** — connect a GitHub repo, push, done.
- **GitHub Pages** — push to a repo, enable Pages, point at the directory.
- **S3 + CloudFront** — upload the directory, set `index.html` as the index document.

No server-side anything is required. The Live Kernel, the HUD, the Detector, and Amendment Commits all run in the browser.

---

## Browser support

- Modern Chromium, Firefox, Safari (last two versions of each).
- The Deception Detector uses `URL.createObjectURL` for the JSON download; older browsers may not get the download button.
- The HUD uses `localStorage`; users with localStorage disabled will see R-441 permanently off.
- No frameworks, no transpiled JS. The source is the source.

---

## Licensing

- All HTML, CSS, and JS in this directory: CC-BY-4.0.
- The 33 source markdown drafts (in `../coreyalejandro-enhancements/`): CC-BY-4.0 unless otherwise noted in the individual draft.
- The CCD preprint specifically: CC-BY-4.0.
- Accompanying code referenced in the drafts: MIT.

If you fork or adapt this site, attribution is appreciated but not required.

---

## What's here that wasn't in the previous 33-draft package

- An actual homepage (the original portfolio's voice, preserved, with cross-links to every new operational surface).
- A working Deception Detector — not a placeholder, the real F1-F4 logic in JavaScript.
- The Live Kernel terminal — not described in the drafts, built fresh for this refactor.
- The Truth Surface HUD — not described in the drafts, built fresh.
- Amendment Commits with selection handling and a Public Queue — operationalizing what the quarterly-cadence draft only described.
- A FOLIO 001 transcript scaffold page — a navigable summary with provenance, key turns, and download instructions.
- A complete sitemap that renders all 37 pages by function.
- A consistent design system that translates the literary register into a deployable site.

This is the refactor. The drafts were the raw material; this is what they slot into.
