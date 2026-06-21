# TLC Governance Framework

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Governance Framework
**Layer:** 5 — Governance Framework
**Date:** 2026-06-21

---

## Architecture

```
Continuous Human Audit Engine (CHAE)
        ↕ (binding authority)
Neurodivergent Advisory Board (NAB)
        ↕
Community Governance Board (CGB)
        ↕
Open-Source Stewardship Committee (OSSC)
        ↓
TLC Runtime + Constitutional Invariants
        ↓
Evidence Chain (tamper-evident, public)
```

Every governance body has binding authority within its domain.
Researcher decisions may be overridden by any governance body.
No governance body may lower the Neurodivergent-First baseline (Article VI, Core Constitution).

---

## 1. Continuous Human Audit Engine (CHAE)

**Role:** Real-time IRB. Functions as a live governance body with binding authority
over session design, publication decisions, and constitutional amendments.

**Composition (Full Scale):**
- 24/7 rotating panel of 5-7 members
- Minimum 3 members with lived neurodivergent experience
- Minimum 1 member with formal IRB/ethics training
- Minimum 1 member with AI safety expertise

**Composition (Bootstrapped):**
- Weekly "audit buddy" session: 1 neurodivergent volunteer peer
- Public audit log on GitHub Issues (timestamped, immutable)
- Audit buddy has binding authority to flag sessions for review

**Authority:**
- May halt any study phase
- May block publication submission
- May require protocol modification
- May request additional evidence before Truth-State advancement
- CANNOT lower the Neurodivergent-First baseline

**Audit Log Requirements:**
- Every CHAE decision is logged as a signed evidence entry
- Log is public and append-only
- Location: evidence/CHAE/chae-audit-log.jsonl
- Bootstrapped: GitHub Issues with label "chae-audit"

**Exceeds IRB standard because:**
Standard IRB = periodic review (monthly/quarterly).
CHAE = continuous monitoring with binding authority during active sessions.

---

## 2. Neurodivergent Advisory Board (NAB)

**Role:** Governance body with equal decision-making authority on all
research design, participant experience, and publication decisions.
Not advisory. Not consultative. Co-equal.

**Composition (Full Scale):**
- 8-10 members globally
- All members have lived neurodivergent experience
- Bi-weekly meetings
- Rotating chair (not researcher-chaired)
- Paid positions

**Composition (Bootstrapped):**
- Volunteer advisory circle: 2-3 neurodivergent peers
- Recruited via social media / Discord
- Weekly check-in (async acceptable)
- Documented on GitHub (public, named with consent)

**Authority:**
- Approve all research questions before preregistration
- Approve all participant-facing materials
- Co-author rights on publications using NAB-governed data
- Veto power over any protocol change
- Review all Tier-1 Compliance Reports before publication

**Community Influence Metric:**
≥ 50% of protocol decisions must originate from NAB proposals (not researcher proposals)
for a study to claim Neurodivergent-First status at publication.

---

## 3. Community Governance Board (CGB)

**Role:** Broader stakeholder governance: researchers, engineers, policy experts,
community members. Quarterly strategic review.

**Composition:**
- 10-15 members
- Researchers, engineers, policy experts, community advocates
- Quarterly meetings
- At least 30% neurodivergent representation

**Authority:**
- Strategic direction of the research program
- Constitution evolution proposals (must go to NAB + CHAE for ratification)
- Open-science compliance review
- Funding strategy review

**Bootstrapped equivalent:** Post-pilot community feedback session.
Public form (Google Form / Airtable) for ongoing input between sessions.

---

## 4. Open-Source Stewardship Committee (OSSC)

**Role:** Permanent maintainers of constitutional scripts, NAP schema,
instrument definitions, and interface modes. Ensures all community
contributions align with the Neurodivergent-First mission.

**Composition:**
- 3-5 permanent maintainers
- All contributions reviewed before merge
- Maintainer diversity requirement: ≥ 2 neurodivergent maintainers

**Authority:**
- Approve/reject pull requests to constitutional definitions
- Maintain versioning of instruments (m-DTCI, m-NAP, CAMM)
- Ensure backward compatibility of NAP schema
- Publish release notes for every instrument version change

**Bootstrapped equivalent:** Researcher acts as sole OSSC maintainer.
All changes logged in CHANGELOG.md with rationale.
Community proposals accepted via GitHub Issues.

---

## 5. Tier-1 Audit Trail Requirements

Per Article XVII of the Sociotechnical Constitution and TALSP v4.2:

Every governance decision must be:
1. Logged as a signed evidence entry (Ed25519, evidence-chain.mjs)
2. Stored in an append-only, publicly accessible file
3. Linked to the specific phase and artifact it governs
4. Reviewable without accessing the private key

**Audit trail locations:**
- CHAE decisions: evidence/CHAE/chae-audit-log.jsonl
- NAB decisions: evidence/NAB/nab-decisions.jsonl
- CGB decisions: evidence/CGB/cgb-decisions.jsonl
- OSSC decisions: evidence/OSSC/ossc-decisions.jsonl
- Break-glass events: evidence/bypass-log.jsonl (existing)

**Exceeds standard institutional accountability because:**
Standard: IRB meeting minutes (private, periodic).
TLC: Immutable signed public log, cryptographically verifiable by any third party.

---

## 6. Ethics Requirements

**Full Scale:** Formal IRB approval from home institution before Phase 2.
**Bootstrapped:** Minimal Ethics Checklist (see governance/ethics/Minimal_Ethics_Checklist.md).

Both require:
- Informed consent in accessible language
- Explicit opt-out mechanism (immediate, no consequences)
- No raw identifiable data outside participant browser
- Data retention policy stated before study begins
- Right to withdraw without penalty

Privacy baseline per Core Constitution Article X: no raw participant data
may be stored without explicit consent. Aggregate data only in publications.
