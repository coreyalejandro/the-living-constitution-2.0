# MODULE_STATUS.md
**Authority:** derived
**Truth surface:** false
**Machine enforced:** false
**Generated:** 2026-05-17
**Registry version:** 1.0.0
**Snapshot source:** registry/modules.registry.json via scripts/generate-module-status.mjs
**Evidence note:** This file is a generated reporting snapshot and is not sufficient evidence on its own.

---

## Summary

| Metric | Count |
|---|---|
| Total modules classified | 21 |
| Total artifacts indexed  | 36 |
| Total routes registered  | 18 |

### By Truth Status

| Status | Count |
|---|---|
| [WORKING] | 2 |
| [PARTIAL] | 8 |
| [DRAFT] | 1 |
| [UNVERIFIED] | 9 |
| [PLANNED] | 1 |

### By Surface

| Surface | Count |
|---|---|
| Documentation | 3 |
| Exhibit | 2 |
| Governance Core | 6 |
| Module Library | 2 |
| Private Lab | 6 |
| Public Portfolio | 2 |

---

## Working Modules

### SocioTechnical Constitution Runtime
- **ID:** CRSP-STC-RUNTIME-001
- **Surface:** Governance Core
- **Verified scope:** full runtime (5 suites) — node --experimental-vm-modules jest → 9/9 tests pass; npm run validate → schema VALID
- **Routes:** /
