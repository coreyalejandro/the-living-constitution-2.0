# GitHub Reviewer Summary Gate — {{PROJECT_NAME}}

A repo README may not overclaim.

Before pushing a README to a public GitHub repo, every item in this
checklist must be confirmed.

---

## Required README elements

- [ ] **Truth status** — states the current truth_status from STATUS.md
  (working / partial / draft / static_prototype / planned / unverified)

- [ ] **Verified scope** — states specifically what has been confirmed working,
  with a method (e.g. "validate_repo.py passes exit 0 as of 2026-05-14")

- [ ] **Unverified scope** — states specifically what is not confirmed,
  not tested, or not complete

- [ ] **Reviewer path** — links to at least one route where a reviewer can
  inspect evidence (e.g. /status, /modules, an evidence index, a test report)

- [ ] **What is not claimed** — explicitly states what the README does NOT claim
  (generalizability, statistical significance, production readiness, etc.)

- [ ] **Public/private boundary** — states that private data, evidence
  screenshots/excerpts, and copyrighted content are excluded from the repo

- [ ] **Current functional status** — plain-language statement of what is
  running, what is not, and what exists only as a scaffold

---

## Overclaim checks

The README must NOT:
- [ ] Claim a system is "working" if validate_repo.py fails
- [ ] Claim a paper is "published" or "submitted" if it has not been
- [ ] Claim tests pass if they have not been run in this session
- [ ] Claim deployment is live if no live URL exists
- [ ] Claim generalizability beyond the stated scope
- [ ] Use words like "complete", "full", "final", "production-ready" without
  a specific verified scope attached

---

## Format requirement

The README must include a V&T (Verification and Truth) block with:

```
EXISTS (Verified Present): [what exists and how it was confirmed]
VERIFIED AGAINST: [specific evidence — test output, file read, browser check]
NOT CLAIMED: [explicit list of non-claims]
FUNCTIONAL STATUS: [plain-language current state]
```

---

## Gate result

**Reviewer:** {{REVIEWER}}
**Review date:** {{REVIEW_DATE}}
**All items checked:** yes / no
**README pushed:** yes / no
