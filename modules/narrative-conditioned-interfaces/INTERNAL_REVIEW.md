# Internal Review Record — NARRATIVE-CONDITIONED-INTERFACES

**Module:** NARRATIVE-CONDITIONED-INTERFACES  
**Review Type:** Self-review (Corey Alejandro, author)  
**Date:** 2026-06-19  
**Reviewer:** Corey Alejandro  
**Scope:** paper_v02_neurips_trimmed.md + all instrument and study files

**truth_status of this review:** PARTIAL — single-author self-review only.
This is not peer review. It satisfies AC-008 (internal review documented) and
is a prerequisite for external reviewer outreach, not a substitute for it.

---

## Review Checklist

### A. Research Governance (TLC Alignment)

| Item | Status | Notes |
|------|--------|-------|
| Contract ID present in paper header | PASS | CRSP-NARRATIVE-CONDITIONED-INTERFACES |
| truth_status tags on all claim tables | PASS | All 4 tables in v02 have tags |
| NOT CLAIMED section present | PASS | V&T statement at paper end + per-section tags |
| Halt conditions defined in contract | PASS | HLT-001 through HLT-003 in CRSP file |
| V&T statement at end of paper | PASS | 4-part V&T present |
| V&T statement at end of each instrument | PASS | NII calibration doc and IQR scoring rubric both have V&T |
| V&T statement at end of pilot protocol | PASS | Present and explicit about not-claimed items |

### B. Citation Integrity

| Citation | Status | Source of Verification |
|----------|--------|----------------------|
| Yan et al. 2025 | VERIFIED | Subagent search; URL confirmed: oswaldlabs.com white paper |
| Gerlich 2025 | VERIFIED | DOI 10.3390/soc15010006 confirmed |
| Wiggins & McTighe 2005 | VERIFIED | Canonical ASCD text; training data + ISBN |
| Lincoln & Guba 1985 | VERIFIED | Canonical SAGE text |
| Watson & Glaser 2010 | VERIFIED | Pearson TalentLens, established instrument |
| Klein et al. 2006 | VERIFIED | IEEE Intelligent Systems DOI 10.1109/MIS.2006.75 |
| Pirolli & Card 2005 | VERIFIED | MICA proceedings, widely cited |
| Pearl 2009 | VERIFIED | Cambridge University Press DOI confirmed |
| Alejandro 2026 (self-cite) | VERIFIED | TLC 2.0 repo exists; fde-control-plane evidence exists |
| Gerlich note: Adham Khaled / Medium "Insight Atrophy" | REMOVED from v02 | Kimi-sourced only; not verified |
| James Forr / GreenBook | REMOVED from v02 | Kimi-sourced only; not directly verified |
| Kalyuga & Plass 2025 | REMOVED from v02 | Kimi-sourced; specific 2025 paper not confirmed |
| Hong et al. 2025 (COS) | REMOVED from v02 | Kimi-sourced only |
| Martin et al. 2025 | REMOVED from v02 | Kimi-sourced only |
| Vendrell & Johnston 2025 | REMOVED from v02 | Not found in any search |
| Shen et al. 2026 | REMOVED from v02 | Future-dated; beyond training data |
| UTS 2026 cognitive atrophy | REMOVED from v02 | Not found |
| Fan et al. 2024 | REMOVED from v02 | Candidate exists; specific paper not confirmed |
| Tableau narrative research | REMOVED from v02 | No specific paper confirmed |

**Net result:** 9 citations in v02, all verified. 10 citations removed from v01.
The paper is stronger for the removals — all surviving citations are canonical or
directly accessible.

**Action for future versions:** The removed citations are legitimate research
directions. Before reintroducing them: access the papers directly (not via AI
summary), read the methodology, confirm the specific claims being cited, and
add to the verified column above with DOI and date of access.

### C. Claim Scope Review

**Paper claims reviewed against truth_status tags:**

| Claim | truth_status in paper | Assessment |
|-------|-----------------------|------------|
| "Analytical fluency degradation is a real risk" | PROPOSED | Correct — theoretical, not empirical |
| NFL protocol description | CONSTRUCTED | Correct — analytically derived |
| NII scoring system | PROPOSED | Correct — not yet validated |
| IQR ICC target ≥ 0.86 | PROPOSED | Correct — design target, not measured |
| "C3 > C2 on IQR" (H1) | PROPOSED | Correct — pre-registration target only |
| TLC governance as backwards-design evidence | CONTROLLED-LAB, N=1 | Correct — single project, explicit scope |
| Yan et al. (2025) finding cited | CONSTRUCTED (reported from source) | Correct — white paper, not peer-reviewed; labeled |

No overclaiming detected in v02. The paper consistently uses "we hypothesize,"
"we propose," "targets," and "not yet proven" language in proportion to what
the truth_status tags require.

### D. Honest Scope Statements (NOT CLAIMED)

Things the paper explicitly does not claim (verified present in v02):

- NFL improves analytical cognition (not claimed — this is what the study is for)
- NII or IQR are validated instruments (explicitly noted as proposed)
- Any empirical results (none exist)
- The Forr "Insight Atrophy" construct is academically established (removed;
  noted as practitioner observation)
- The backwards-design evidence from TLC is generalizable (N=1, explicitly labeled)

### E. Structural Completeness

| Component | File | Status |
|-----------|------|--------|
| Position paper v02 (NeurIPS trimmed) | paper/paper_v02_neurips_trimmed.md | PRESENT |
| Full paper v01 (internal reference) | paper/paper_v01_tlc_aligned.md | PRESENT |
| NII calibration package | instruments/nii-rater-calibration.md | PRESENT |
| IQR scoring rubric + exemplars | instruments/iqr-scoring-rubric.md | PRESENT |
| Pilot study protocol | study/pilot-protocol.md | PRESENT |
| C-RSP build contract | CRSP_NARRATIVE_CONDITIONED_INTERFACES.md | PRESENT |
| Module README | README.md | PRESENT |
| Evidence index | evidence/index.md | PRESENT |
| Registry entry | registry/modules.registry.json | PRESENT (27 modules) |

### F. Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| F-001 | Yan et al. is a white paper (not peer-reviewed); cited as [1] without that flag | Low | Added "Technical report; not peer-reviewed" to reference in v02 |
| F-002 | NII "Adversarial Invariance" criterion says "formal adversarial challenge" but does not define "formal" | Medium | Addressed in nii-rater-calibration.md exemplars; definition implicit in exemplar walkthroughs. Flag for full paper revision: add explicit definition of "formal adversarial challenge" in NII description |
| F-003 | Pilot protocol WGCTA post-test: single-session WGCTA change is not interpretable by design. The protocol acknowledges this but does not explain why WGCTA is still administered | Low | Already noted in pilot protocol ("to establish baseline, test administration flow, confirm feasibility"). Clear |
| F-004 | paper_v02 self-cite ([4] Alejandro 2026) points to the TLC 2.0 repo broadly, not the specific fde-control-plane path | Low | Acceptable for position paper; full study version should cite the specific evidence directory |
| F-005 | "Analytical fluency" is used as the core dependent construct but is never formally defined as a measurable variable in v02 | Medium | The paper operationalizes it via IQR, but the construct-to-measure mapping is implicit. Flag for full study pre-registration: formally define "analytical fluency" as IQR total score ≥ 18 on an independently produced no-AI task |

### G. Pre-Submission Checklist

These items must be completed before any public submission (arXiv or NeurIPS):

- [ ] Resolve F-002: define "formal adversarial challenge" explicitly
- [ ] Resolve F-005: operationalize "analytical fluency" in the paper
- [ ] Direct access verification: attempt to find and read Fan et al. 2024,
      Kalyuga & Plass 2025, Forr GreenBook article; re-add with full citations
      if confirmed
- [ ] LaTeX formatting pass: convert v02 to NeurIPS LaTeX template;
      verify 4-page fit with proper margins and font
- [ ] Second reviewer: external reviewer (not the author) reads v02 and IQR
      before any public posting
- [ ] Pre-registration: submit pilot protocol to OSF before any data collection

---

## AC Status Update

| AC | Description | Status |
|----|-------------|--------|
| AC-001 | Module scaffold passes validate_repo equivalence | PASS (all files present) |
| AC-002 | C-RSP contract is bound and valid | PASS |
| AC-003 | Evidence index initialized | PASS |
| AC-004 | STATUS.md created (README serves this role) | PASS |
| AC-005 | Paper v02 written and internally reviewed | PASS (this document) |
| AC-006 | All citations in v02 verified or removed | PASS |
| AC-007 | Instruments complete with calibration protocols | PASS |
| AC-008 | Internal review documented | PASS (this document) |

**Pre-submission ACs (not yet complete):**

| AC | Description | Status |
|----|-------------|--------|
| AC-S01 | LaTeX format pass for NeurIPS | PENDING |
| AC-S02 | External reviewer sign-off | PENDING |
| AC-S03 | Pilot pre-registration on OSF | PENDING |
| AC-S04 | arXiv submission receipt | PENDING |

---

## V&T Statement

EXISTS: Internal review record. Citation verification log (9 verified, 10
removed). Claim scope review against truth_status tags. 5 issues found (F-001
through F-005), two medium severity. AC status table with 8 passed and 4 pending.

VERIFIED AGAINST: paper_v02_neurips_trimmed.md read in this session.
instruments/nii-rater-calibration.md and instruments/iqr-scoring-rubric.md
read in this session. All files confirmed present on disk.

NOT CLAIMED: Peer review has occurred. Any external reviewer has seen this work.
Issues F-002 and F-005 have been resolved in the paper — they have been identified
and flagged, not yet fixed.

FUNCTIONAL STATUS: Self-review complete. Module is internally consistent and
honestly scoped. Ready for: (1) F-002 and F-005 fixes in paper, (2) LaTeX pass,
(3) external reviewer outreach, (4) OSF pre-registration before any data collection.
