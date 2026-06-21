# Bootstrapped Pilot Protocol

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Research Framework
**Layer:** 3 — Research Framework
**Date:** 2026-06-21

---

## Purpose

The Bootstrapped Pilot is the mandatory first phase of every TLC research program.
It validates assumptions before megaproject investment.
It runs on zero budget using free-tier infrastructure.
It produces a Tier-1 Compliance Report before any funding request.

No TLC study advances to full scale without a completed Bootstrapped Pilot.

---

## Budget

| Item | Cost |
|---|---|
| Participant stipends (10 x $50) | $500 |
| Domain + hosting (optional) | $15 |
| Infrastructure (Render/Netlify/HuggingFace/Airtable) | $0 |
| Total | < $1,000 |

The zero-infrastructure path: all computation runs locally or on free tiers.
No cloud spend required for Phase 0-1.

---

## Phases

### Phase 0 — Protocol Design (Weeks 1-4)
Output: Preregistered analysis plan (GitHub registered report)

Steps:
1. Define research questions (from CAMM Protocol)
2. Specify minimal instruments (m-DTCI, m-NAP)
3. Write analysis plan: non-parametric pre-post + effect sizes
4. Register on OSF or as GitHub issue with locked analysis plan label
5. Form volunteer advisory circle (2-3 neurodivergent peers via Discord/social media)
6. Complete Minimal Ethics Checklist (governance/ethics/Minimal_Ethics_Checklist.md)
7. Publish NIST bootstrapped mapping (governance/nist/Bootstrapped_NIST_Mapping.md)

### Phase 1 — Build (Weeks 5-8)
Output: Working single-page prototype, open-source, publicly deployed

Steps:
1. Build minimal CCAR (Constitutional Compliance + Adaptation + Reporting) interface
2. Implement m-NAP editing form (local JSON file)
3. Implement m-DTCI tracking (confidence vs. correctness difference score)
4. Deploy to free tier (Render / Netlify one-click)
5. Add high-contrast CSS, ARIA, three interaction modes (text, voice, visual icons)
6. Add universal "pause" button and progress visibility
7. Add "How was this?" feedback button linked to free database (Airtable)
8. Open-source all code (GitHub template repository)
9. Run manual chaos tabletop exercise (instruments/chaos-tabletop-checklist.md)

### Phase 2 — Pilot (Weeks 9-16)
Output: N=10 dataset, Tier-1 Compliance Report v1

Steps:
1. Recruit N=10 participants (≥3 cognitive profiles) via social media/Discord
2. Administer bootstrapped instruments: SCS, AI, CLV, TCM, PO
3. Run weekly audit buddy session (CHAE proxy) — log on GitHub Issues
4. Conduct post-session focus group for Community Influence (CI) measurement
5. Analyze: non-parametric pre-post, effect sizes for power analysis input
6. Publish public repository of 10 adversarial prompts + system responses
7. Member checking: participants review interpretations before report

### Phase 3 — Open Source Release (Weeks 17-28)
Output: Community PRs, public feedback loop, refined instruments

Steps:
1. Release bootstrapped starter kit as public GitHub template
2. Publish minimal instruments (m-DTCI, m-NAP) as open-source artifact
3. Submit m-DTCI and m-NAP as open-source instrument paper (FOSS/ICSE)
4. Update OSF preregistration with bootstrapped pilot effect sizes
5. Produce Tier-1 Compliance Report v2 (post-pilot)
6. Begin megaproject preparation: grant writing using pilot as preliminary data

---

## Infrastructure Stack (Bootstrapped)

| Component | Free Tool |
|---|---|
| Frontend | Static site (Netlify / GitHub Pages) |
| Backend | FastAPI on localhost / Render free tier |
| Database | Airtable free tier / local JSON |
| Auth | None (anonymous sessions) |
| Monitoring | Static page reading public Airtable view |
| Governance log | GitHub Issues (public, timestamped) |
| Participant data | No raw data leaves browser (localStorage) |
| Deployment | One-click Render deploy button |

---

## Mandatory Deliverables Before Full-Scale Request

- [ ] Bootstrapped prototype live and publicly deployed
- [ ] Source code fully open-sourced on GitHub
- [ ] N=10 pilot completed with all 6 Neurodivergent Success Metrics collected
- [ ] Tier-1 Compliance Report v1 published on repository
- [ ] OSF preregistration filed with locked analysis plan
- [ ] 10 adversarial prompts + responses published
- [ ] Minimal instruments (m-DTCI, m-NAP) published
- [ ] Power analysis updated with bootstrapped effect sizes
- [ ] Advisory circle review completed (CHAE proxy)

No megaproject funding request may proceed without all items checked.

---

## Connection to Tier-1 Readiness

The Bootstrapped Pilot produces early evidence for every Tier-1 criterion:

| Tier-1 Criterion | Bootstrapped Evidence |
|---|---|
| Research Design & Statistical Rigor | Preregistered pilot analysis plan |
| Governance & Ethics | Minimal Ethics Checklist + advisory circle audit log |
| Engineering & Scalability | Live public prototype |
| Open Science & Reproducibility | Open-source starter kit, one-click deploy |
| Resource Management | < $1,000 validated prototype |
| Theoretical Innovation | CALT H8 bootstrapping hypothesis result |
