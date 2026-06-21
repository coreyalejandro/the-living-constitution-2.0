# m-DTCI: Minimal Dynamic Trust Calibration Index

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Instruments
**Layer:** 3 — Research Framework (Instruments)
**Date:** 2026-06-21

---

## Purpose

m-DTCI is the bootstrapped minimal instrument for measuring trust calibration
between a participant's expressed confidence and their actual performance.
It requires no proprietary software, no paid platform, and can be administered
in any browser-based interface.

It is a first-class research artifact, not a placeholder.
It will be published as an open-source instrument paper (FOSS/ICSE target).

---

## Construct Definition

Trust calibration is the alignment between:
- Expressed confidence: how certain the participant says they are
- Actual correctness: whether their response was correct

A perfectly calibrated participant says "I'm 80% sure" and is correct 80% of the time.
Over-confidence: expresses high certainty, frequently wrong.
Under-confidence: expresses low certainty, frequently correct.

---

## Formula

m-DTCI (per assessment point) = 1 - |expressed_confidence_normalized - proportion_correct|

Where:
- expressed_confidence_normalized = (expressed_confidence_rating - 1) / (scale_max - 1)
  Maps any Likert scale to [0, 1]
- proportion_correct = correct_responses / total_responses in the window

m-DTCI range: [0, 1]
- 1.0 = perfect calibration
- 0.0 = maximum miscalibration

---

## Administration

### Per Item
After each response, prompt:
"How confident are you in this response?"
Scale: 1 (not at all confident) to 5 (completely confident)

Record: item_id, response, correct (boolean), confidence_rating, timestamp

### Per Session Window (last N items)
Compute m-DTCI over a sliding window of N=5 items (bootstrapped default).

### Over Time
Plot m-DTCI trajectory across sessions.
Convergence toward 1.0 = improving calibration (constitutional governance effect).
Divergence = trust miscalibration requiring CHAE review.

---

## Data Schema (JSON)

```json
{
  "participant_id": "P001",
  "session_id": "S001",
  "timestamp": "2026-06-21T14:30:00Z",
  "item_id": "ITEM-042",
  "response": "participant response text",
  "correct": true,
  "confidence_rating": 4,
  "confidence_scale_max": 5,
  "confidence_normalized": 0.75,
  "window_proportion_correct": 0.8,
  "m_dtci": 0.95,
  "constitution_id": "EIGHT-WONDERS-v1.0"
}
```

---

## Reporting Thresholds

| m-DTCI Value | Interpretation | Action |
|---|---|---|
| ≥ 0.80 | Well calibrated | No action |
| 0.60 – 0.79 | Moderate miscalibration | Log; check at next window |
| 0.40 – 0.59 | High miscalibration | CHAE notification |
| < 0.40 | Severe miscalibration | Session review required |

---

## Full-Scale Equivalent (DTCI)

At full scale, DTCI uses polynomial regression residuals between the DTCI
trajectory and self-reported confidence ratings over time. m-DTCI is a
proof-of-concept sufficient for bootstrapped pilot effect size estimation.

m-DTCI results from the pilot will be used to calibrate the full DTCI model
before the megaproject preregistration amendment.

---

## Citation

When publishing results using m-DTCI, cite as:
[Author]. (2026). m-DTCI: Minimal Dynamic Trust Calibration Index.
The Living Constitution 2.0 Instruments Library. [DOI TBD — Zenodo deposition]
