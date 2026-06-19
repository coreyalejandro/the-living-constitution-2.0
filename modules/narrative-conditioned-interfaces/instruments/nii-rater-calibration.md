# Narrative Invariance Index (NII) — Rater Calibration Protocol

**Module:** NARRATIVE-CONDITIONED-INTERFACES  
**Version:** 1.0  
**Date:** 2026-06-19  
**truth_status:** PROPOSED — instrument not yet validated; Krippendorff's α not yet measured

---

## Purpose

The NII scores an emergent interpretive pattern on its robustness across three
independent perturbations. It functions as a gate in the NFL Stage 3: only patterns
scoring ≥ 4 proceed to Stage 4 (Adversarial Challenge).

This document provides: the scoring instrument, rater calibration procedure, and
5 annotated exemplars anchoring scores 1–5.

---

## Instrument

### Score Sheet — Narrative Invariance Index

**Pattern under evaluation:** ________________________________  
**Analyst ID:** ____________  **Session:** ____________  **Date:** ____________

---

**Dimension 1: Source Invariance**

*Does the pattern appear across independent data sources?*

| Score | Criterion |
|-------|-----------|
| 0 | Pattern found in one data source only |
| 1 | Pattern found in exactly 2 independent sources |
| 2 | Pattern found in 3 or more independent sources |

Score: ___  
Evidence (brief): ________________________________

---

**Dimension 2: Investigator Invariance**

*Was the pattern identified independently by multiple analysts?*

| Score | Criterion |
|-------|-----------|
| 0 | Identified by one analyst only |
| 1 | Identified independently by exactly 2 analysts (verify: no communication prior to comparison) |
| 2 | Identified independently by 3 or more analysts |

Score: ___  
Evidence: ________________________________

---

**Dimension 3: Adversarial Invariance**

*Does the pattern survive formal adversarial challenge?*

| Score | Criterion |
|-------|-----------|
| 0 | Pattern collapses under first challenge (alternative explanation is more parsimonious) |
| 1 | Pattern survives 1 formal challenge; collapses or requires major revision under a second |
| 2 | Pattern survives 2 or more formal challenges with evidence-based rebuttal |

Score: ___  
Challenges documented: ________________________________

---

**Total (0–6):** ___

**NII Label:**

| Total | Label | Interpretation | NFL Gate Decision |
|-------|-------|---------------|------------------|
| 0–2 | Fragile | Source-specific or analyst-specific pattern; likely spurious | STOP — revise hypothesis |
| 3 | Tentative | Partial stability; insufficient for robust claim | STOP — gather more evidence |
| 4 | Moderate | Stable across most perturbations; proceed with documented caveats | PROCEED with caution |
| 5 | Robust | Stable across all three dimensions | PROCEED |
| 6 | Core Invariant | Equivalent to grounded theory core category | PROCEED — strong basis for claim |

---

## Rater Calibration Procedure

### Timeline: 3-hour synchronous session

**Hour 1: Conceptual Training (60 min)**

- 00:00–20:00 — Introduce NII construct: what invariance means in qualitative
  narrative analysis vs. ML/causal inference. Distinction: this is NOT about
  statistical replication. It is about whether a *pattern of meaning* holds up
  when subjected to independent scrutiny.
- 20:00–40:00 — Walk through each dimension with one clear example. Emphasize:
  "Source Invariance does not mean the same word appears in two datasets. It means
  the same *interpretive pattern* — the same explanation of why something is true —
  can be supported from two independent bodies of evidence."
- 40:00–60:00 — Common scoring errors:
  - Inflation: giving Score 2 on Source Invariance because data was collected from
    two channels that both had the same bias. Wrong — sources must be genuinely
    independent.
  - Confusion: treating Adversarial Invariance as "no one disagreed" rather than
    "the pattern survived a formal structured challenge."

**Hour 2: Guided Practice — 5 Training Cases (60 min)**

Raters score each of the 5 calibration exemplars independently (see below).
After each, facilitator reveals the anchor score and reasoning. Discussion: where
do scores differ? Why?

Target after training: pairwise agreement ≥ 80% within 1 point.

**Hour 3: Independent Test + Calibration Check (60 min)**

- 00:00–40:00 — Raters independently score 5 new test cases (not used in training)
- 40:00–60:00 — Calculate Krippendorff's α across all raters on test cases
  - **Accept if α ≥ 0.80**
  - **Conditional pass (0.70–0.79):** Raters may proceed with joint review of
    borderline cases (Scores 3–4 only)
  - **Fail (<0.70):** Diagnose disagreement source; re-train on that dimension only;
    re-test before study launch

---

## Annotated Exemplars — Calibration Cases

*Domain: Retail analytics. Each exemplar describes a candidate analytical pattern
and provides the scoring rationale.*

---

### Exemplar 1 — NII Score: 1 (FRAGILE)

**Pattern:** "Customers in Store A buy premium private-label pasta on Sunday evenings."

**Source Invariance:** 0  
Only observed in Store A transaction data. No second independent source (e.g.,
loyalty card cohort, survey data, receipt interviews) confirms this behavior.

**Investigator Invariance:** 1  
Two analysts both noted the Sunday evening concentration. However, one attributes it
to promotion scheduling, the other to shopper demographics. The *pattern* (Sunday
concentration) is shared but the *interpretation* is not.

**Adversarial Invariance:** 0  
First challenge: "This is entirely explained by the weekly promotion cycle — pasta is
on promotion every Sunday in this store." Pattern collapses. The analyst cannot
rebut with evidence.

**Total: 1 — FRAGILE.** STOP. Revise hypothesis. The pattern is store-specific and
promotion-confounded.

---

### Exemplar 2 — NII Score: 3 (TENTATIVE)

**Pattern:** "Locked display cabinets reduce conversion rates for health-and-beauty
SKUs in urban stores by increasing access friction."

**Source Invariance:** 2  
Pattern confirmed in: (1) transaction data (lower conversion on locked vs. comparable
unlocked SKUs), (2) shopper exit survey data (friction as a stated barrier), (3) staff
observation logs (longer time-to-purchase for locked items). Three independent sources.

**Investigator Invariance:** 0  
Only one analyst coded the pattern. No independent second analyst ran the analysis.

**Adversarial Invariance:** 1  
First challenge: "The conversion gap reflects price sensitivity, not friction — locked
items are systematically higher-priced." Analyst rebuts with evidence (conversion gap
persists after controlling for price tier). Second challenge: "The effect is seasonal —
the data window captures a period of elevated theft concern that changed shopper
behavior." Analyst cannot rebut — no off-season comparison data available. Pattern
survives 1 of 2 challenges.

**Total: 3 — TENTATIVE.** STOP. Need independent analyst replication before
proceeding. Gather off-season comparison data to address Challenge 2.

---

### Exemplar 3 — NII Score: 4 (MODERATE)

**Pattern:** "Trust in a grocery brand — measured as repeat purchase despite price
increases — is a stronger predictor of basket penetration than promotion exposure
among high-frequency shoppers."

**Source Invariance:** 2  
Pattern supported by: (1) loyalty card cohort analysis (repeat purchase under price
increase as proxy), (2) household panel survey (self-reported trust scores correlated
with basket penetration), (3) A/B test logs showing promotion uplift flattens for
high-frequency shoppers. Three independent sources.

**Investigator Invariance:** 2  
Three analysts (two quantitative, one qualitative) identified the pattern independently
before comparing notes. All three reached the same core interpretation: trust
outperforms promotion for this segment.

**Adversarial Invariance:** 0  
First challenge: "Your 'trust' proxy is actually just measuring category need —
high-frequency shoppers buy pasta regardless of brand." Analyst reviews data — cannot
distinguish brand loyalty from category need in current dataset. Proxy requires
refinement. Pattern partially survives (the relative contribution finding holds) but
the mechanism claim (trust, not need) is weakened.

**Total: 4 — MODERATE.** PROCEED with documented caveat: trust proxy requires
refinement to disentangle from category need. Stage 4 adversarial work should target
this specific weakness.

---

### Exemplar 4 — NII Score: 5 (ROBUST)

**Pattern:** "Status signaling — measured as premium-brand share in high-visibility
product categories — is elevated in stores located in neighborhoods with higher
income-inequality, independent of median income."

**Source Invariance:** 2  
Pattern observed in: (1) transaction data (premium share by store × neighborhood
income-inequality index), (2) external census data cross-referenced to store catchment
areas, (3) independent academic literature on visible consumption and inequality
[independent prior to this analysis].

**Investigator Invariance:** 2  
Four analysts independently analyzed the data without prior discussion. All four
identified premium-share concentration in high-inequality catchments. Two proposed
status signaling as the mechanism; two proposed value-signaling as an alternative.
The *pattern* (inequality × premium share) was unanimous.

**Adversarial Invariance:** 1  
Challenge 1: "High-inequality neighborhoods are also high-crime neighborhoods —
you're measuring security markup pricing (premium items kept behind counters), not
consumer choice." Analyst rebuts with store-format data: the pattern holds in
open-shelf stores where no locked-cabinet confound applies. Challenge 2: "Median
income controls may be insufficient — you need household-level income variance."
Analyst concedes this is a limitation and documents it; does not collapse the
finding, but acknowledges the caveat.

**Total: 5 — ROBUST.** PROCEED. Pattern survives both challenges. Document income-
variance limitation as a V&T not-claimed item in final insight.

---

### Exemplar 5 — NII Score: 6 (CORE INVARIANT)

**Pattern:** "In retail environments serving communities with high experiences of
surveillance (expressed through shopper behavior proxies: reduced dwell time, lower
trial rates in visible categories, lower complaint rates), brand trust acts as a
substitute for institutional trust — shoppers over-index on familiar brands across
categories as a risk-reduction strategy rather than a preference signal."

**Source Invariance:** 2  
Pattern supported by: (1) transaction cohort analysis (brand concentration index
by store × community surveillance proxy), (2) ethnographic shopper observation data
(dwell time, avoidance behavior near staff), (3) qualitative interviews (15
participants, independent coding), (4) external sociological literature on risk
reduction in low-trust environments. Four independent sources — exceeds threshold.

**Investigator Invariance:** 2  
Five analysts (3 quantitative, 2 qualitative) worked independently. All five
identified the brand-concentration × surveillance-proxy correlation. Three of five
proposed the trust-substitution mechanism independently; the other two proposed
habit/familiarity as a partial alternative. Core category (brand as risk reduction
in surveilled environments) emerged from all five.

**Adversarial Invariance:** 2  
Challenge 1: "This is category familiarity, not trust — frequent shoppers simply
know these brands and have no information cost." Analyst rebuts: familiarity alone
predicts brand choice but not the interaction with surveillance proxy. The interaction
term is significant and robust to familiarity controls.  
Challenge 2: "The surveillance proxy (dwell time + avoidance) is confounded with
store layout differences." Analyst rebuts: stores were matched on layout footprint;
partial invariance across store format types holds.  
Both challenges addressed with evidence.

**Total: 6 — CORE INVARIANT.** This pattern qualifies as a grounded theory core
category: it systematically relates to other constructs (trust, surveillance, risk
reduction, brand loyalty) and has reached theoretical saturation across five
independent analysts and four data sources. Strong basis for a claim.

---

## Using the Exemplars for Calibration

Present exemplars in randomized order. Do not reveal scores until all raters have
scored independently. After scoring, reveal the anchor score and walk through the
rationale for each dimension.

Flag for re-training if:
- Any rater gives Score 6 to exemplar 1 (inflation — no investigator invariance
  and adversarial collapse means no score above 2 is defensible)
- Any rater gives Score 1 to exemplar 5 (over-strict reading — all three dimensions
  are at maximum)
- Systematic divergence on Adversarial Invariance dimension (most common source
  of disagreement — raters must understand that "surviving a challenge" requires
  an *evidence-based rebuttal*, not just an assertion)

---

## V&T Statement

EXISTS: NII scoring instrument (dimensions, criteria, gate table), 3-hour
calibration procedure, 5 annotated exemplars (Scores 1–6), accept/fail α thresholds.

VERIFIED AGAINST: NII construct defined in paper_v01_tlc_aligned.md and
paper_v02_neurips_trimmed.md. Exemplar content is constructed from retail analytics
domain used throughout paper. No live dataset.

NOT CLAIMED: Krippendorff's α has been measured — it has not. Exemplar scores
represent intended anchor scores; real rater agreement may differ. Calibration
procedure is a proposed protocol, not an executed one.

FUNCTIONAL STATUS: Complete, usable calibration package. Ready for pilot rater
training session. Cannot be used to claim NII is validated until α ≥ 0.80 is
demonstrated in a live calibration session.
