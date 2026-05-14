# Classification Status Rules

**Version:** 1.0.0
**Status:** Active
**Last updated:** 2026-05-13

---

## Truth Status Decision Tree

Apply this decision tree to determine the correct truth_status for a module.
Start at the top and take the first branch that applies.

```
Is the module's declared scope fully covered by a passing test suite?
├── YES → truth_status = working
└── NO → continue

Does the module have real implementation code (not just scaffolding or stubs)?
├── NO → continue to draft/static branch below
└── YES → continue

Does any component of the module have passing tests or a verified build?
├── YES → truth_status = partial (with verified_scope for that component only)
└── NO → Does the module have structured content without code? → truth_status = draft
         Does the module have no content? → truth_status = unverified
         Is it a deprecated or replaced module? → truth_status = deprecated
         Is it known to be broken? → truth_status = quarantined
```

---

## Status Definitions

### working

WHEN TO USE:
- The module's own test suite runs and passes without configuration workarounds.
- The passing tests cover the module's declared primary function, not just edge utilities.
- The module is not "working in one subcomponent while the rest is unverified."

WRONG USES OF WORKING:
- "The TypeScript compiles clean." → That is verified_scope evidence, not working status.
- "The test suite was passing at the last commit according to HANDOFF." → That is history, not
  current verification. Use partial unless you run the tests yourself this session.
- "One package inside a monorepo passes tests." → Use partial at module level.

REQUIRED REGISTRY FIELDS:
- verified_scope: what was tested, by what command, on what date

---

### partial

WHEN TO USE:
- Real implementation exists (not scaffolding).
- At least one component is verified (tsc passes, some tests pass, a verifiable artifact exists).
- The complete project scope is broader than what was verified.

REQUIRED REGISTRY FIELDS:
- verified_scope: exact component(s) and verification method
- unverified_scope: every incomplete, untested, unresolved, or externally-dependent part

COMMON PARTIAL SIGNALS:
- TypeScript compiles but no tests exist or tests fail due to config gaps
- One package in a monorepo has passing tests; other packages do not
- Core logic verified; external integrations (Auth0, Gemini API, database) not tested
- HANDOFF says "In Progress" with incomplete phases documented
- mock executors present (google-executor, vault-client placeholders)

---

### draft

WHEN TO USE:
- Structured content exists (documentation, evidence archive, proposals, specs).
- No runnable code, no verifier, no test suite.
- Content is actively curated but not executable.

EXAMPLES:
- Evidence archive with session transcripts + codebook (tlc-artifacts-restructure)
- Research proposal documents
- Design specifications without implementation

---

### static_prototype

WHEN TO USE:
- A UI or demo was built once and is not maintained.
- No test suite, no build pipeline, no update cadence.
- May be functional in a browser snapshot sense but is not a living codebase.

EXAMPLES:
- Hyperagent Folio 001 (single-file HTML demo)
- A v0-generated page saved as a static HTML file

---

### unverified

DEFAULT. Applied to any module not yet inspected this session.
Remove only after completing Phase 2 + Phase 3 of the ingest SOP.

---

### planned

WHEN TO USE:
- The module is intended but no files exist yet.
- A CRSP contract or design doc references it by name.

---

### deprecated

WHEN TO USE:
- The module has been explicitly superseded by another module.
- Reference the replacement in notes.

---

### quarantined

WHEN TO USE:
- The module is known to be broken (build fails, runtime errors, data corruption risk).
- Do not use quarantined for "tests blocked by config gap" — use partial.

---

## Surface Definitions

| Surface | Meaning |
|---|---|
| governance_core | Runtime enforcement, policy engine, ledger, contract management |
| private_lab | Research tools, analysis modules, internal experiments |
| public_portfolio | Public-facing portfolio site or app |
| documentation | Evidence archives, research artifacts, prose documents |
| module_library | Reusable packages without a runtime UI |
| exhibit | Hackathon submissions, demos, one-off showcases |

---

## implementation_status vs truth_status

truth_status = epistemic status of the CLAIM being made about the module.
implementation_status = degree of build completion.

These are independent. A module can be:
- truth_status=partial, implementation_status=partial (most common)
- truth_status=working, implementation_status=partial (working core, incomplete scope)
- truth_status=draft, implementation_status=draft (docs only)

Do not conflate the two.

---

## public_display_status

Controls what appears in the public Portfolio surface.

| Value | Meaning |
|---|---|
| working | Displayed as a working project |
| demo | Displayed as a demo or exhibit |
| draft | Displayed as in-progress / coming soon |
| hidden | Not displayed publicly |
| coming_soon | Placeholder entry only |

Every module with surface=public_portfolio or surface=exhibit must have public_display_status set.
