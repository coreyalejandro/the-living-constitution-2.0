# Portfolio Publication Gate — {{PROJECT_NAME}}

A project CANNOT be promoted to a public portfolio item until every
gate in this document passes. No exceptions.

Run this checklist before updating the registry entry to
`public_display_status: working` or adding a portfolio card.

---

## Gate 1 — Repo integrity

- [ ] `python3 scripts/validate_repo.py` exits 0 with no errors
- [ ] STATUS.md exists and is current (not placeholder text)
- [ ] C_RSP_BUILD_CONTRACT.md exists and is non-empty
- [ ] evidence/index/evidence_index.csv exists with at least one entry

---

## Gate 2 — Visual understanding layer

- [ ] visuals/architecture/system-architecture.mmd exists and is not placeholder
- [ ] visuals/app-flow/app-flow.mmd exists and is not placeholder
- [ ] visuals/user-journey/user-journey.mmd exists and is not placeholder
- [ ] visuals/pictographs/research-loop-pictograph.md exists and is not placeholder
- [ ] visuals/mock-demo/mock-demo-storyboard.md exists and is not placeholder
- [ ] visuals/illustrations/illustration-brief.md exists and is not placeholder
- [ ] Visual layer does not contradict the written protocol

---

## Gate 3 — Claims review

- [ ] Every public claim has a truth status (working/partial/draft/static_prototype/planned/unverified)
- [ ] Every claim is traceable to at least one evidence item in evidence_index.csv
- [ ] No claim exceeds what the evidence supports
- [ ] `python3 scripts/validate_claims.py` exits 0

---

## Gate 4 — Private content review

- [ ] `git ls-files` shows no files from data/private/, evidence/screenshots/, evidence/excerpts/
- [ ] No .env or credential files are committed
- [ ] No copyrighted LMS content is in any committed file
- [ ] No unpublished paper draft content is exposed without author review

---

## Gate 5 — Paper/product braid

- [ ] The relationship between research findings and any paper claim is stated in paper/abstract.md
- [ ] If a product exists, product/README.md states what research question the product addresses
- [ ] The portfolio card states: research lane, product lane, and paper lane (or marks each as planned/absent)

---

## Gate 6 — Public/private boundary review

- [ ] The README.md does not expose private lab mechanics
- [ ] The README.md does not expose raw incident transcripts
- [ ] The README.md does not expose unpublished paper content
- [ ] The README.md does not expose any private reviewer routes

---

## Gate 7 — Registry and portfolio packet

- [ ] Registry entry exists in modules.registry.json with correct truth_status
- [ ] `python3 scripts/generate_portfolio_packet.py` runs without error
- [ ] Portfolio packet is in reports/final/
- [ ] docs/GITHUB_REVIEWER_SUMMARY_GATE.md checklist passes

---

## Gate result

All gates must be checked before promotion.
Record the date gates passed and who reviewed them here:

**Gate review date:** {{GATE_REVIEW_DATE}}
**Reviewer:** {{REVIEWER}}
**Registry entry updated:** yes / no
**Portfolio packet path:** reports/final/{{PORTFOLIO_PACKET_FILENAME}}
