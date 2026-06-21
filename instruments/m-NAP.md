# m-NAP: Minimal Neurodivergent Adaptation Profile

**Version:** 1.0
**Status:** SPECIFIED
**Truth-State:** SPECIFIED
**Source:** TALSP Template v4.2 — integrated into TLC Instruments
**Layer:** 3 — Research Framework (Instruments)
**Date:** 2026-06-21

---

## Purpose

m-NAP is the bootstrapped minimal Neurodivergent Adaptation Profile.
It is a participant-owned cognitive profile that drives system adaptation
and operationalizes the Profile Ownership (PO) Neurodivergent Success Metric.

It is participant-editable at any time during a governed session.
Editing is a right, not a feature.

---

## Schema (JSON)

```json
{
  "version": "1.0",
  "participant_id": "P001",
  "created_at": "2026-06-21T14:00:00Z",
  "last_modified": "2026-06-21T14:00:00Z",
  "edit_count": 0,
  "profile": {
    "cognitive_load_sensitivity": "medium",
    "preferred_modality": "text",
    "pacing_preference": "self_paced",
    "sensory_profile": "standard",
    "communication_style": "literal",
    "executive_function_support": "moderate"
  },
  "custom_notes": ""
}
```

---

## Field Definitions

### cognitive_load_sensitivity
How easily the participant reaches cognitive overload.
- `low`: can handle high information density; minimal scaffolding needed
- `medium`: standard adaptation; moderate scaffolding
- `high`: easily overloaded; maximum scaffolding, chunked content, frequent breaks

### preferred_modality
How the participant prefers to receive information.
- `text`: written content primary
- `voice`: audio/speech primary
- `visual`: diagrams, icons, visual schedules primary
- `multimodal`: combination preferred; participant selects per task

### pacing_preference
How the participant prefers to move through content.
- `self_paced`: no time constraints; advance on participant's own schedule
- `timed`: structured time blocks with visible countdown
- `flexible`: participant switches between modes during session

### sensory_profile
Sensory environment preferences.
- `standard`: default interface settings
- `low_stimulation`: reduced contrast, minimal animation, quiet mode
- `high_contrast`: maximum contrast, larger text, bold borders

### communication_style
How instructions and feedback are best delivered.
- `literal`: direct, unambiguous language; no idioms; no implied meaning
- `narrative`: story-based framing; context before content
- `structured`: numbered steps, explicit boundaries, visible progress

### executive_function_support
Degree of task management scaffolding needed.
- `minimal`: participant manages own task flow
- `moderate`: visual schedule + progress bar + pause button
- `full`: step-by-step HCIP instructions + confirmation checkpoints + explicit completion signals

---

## Administration

### At Session Start
Participant completes m-NAP before any task begins.
Time to complete: 2-5 minutes.
Interface: simple form with dropdowns + optional free-text notes field.

### Mid-Session Editing
Edit button always visible. Participant may modify any field at any time.
Changes take effect immediately.
Each edit is logged (edit_count incremented, last_modified updated).

### Profile Ownership Metric
PO = 1 if participant made ≥1 edit during study, 0 otherwise.
Edit count is a secondary PO measure.

---

## Adaptation Mapping

| Field | System Response |
|---|---|
| cognitive_load_sensitivity = high | Max chunking: ≤3 items per screen; HCIP protocol; frequent breaks |
| preferred_modality = voice | Text-to-speech enabled by default; visual labels remain |
| pacing_preference = self_paced | All timers disabled; no visible countdown |
| sensory_profile = low_stimulation | CSS class: .low-stim (reduced contrast, no animation, quiet mode) |
| communication_style = literal | Idiom filter active; all instructions reviewed against HCIP R1-R16 |
| executive_function_support = full | Full HCIP: numbered steps, explicit state transitions, completion signals |

---

## Full-Scale Equivalent (NAP)

At full scale, NAP includes additional fields:
- cultural_context
- language_preference
- assistive_technology
- session_history (adaptive from prior sessions)
- community_sharing (opt-in: share profile with NAB for governance improvement)

m-NAP covers the core fields sufficient for bootstrapped pilot validation.

---

## Storage

Bootstrapped: local JSON file in browser localStorage. No data leaves device.
Full scale: encrypted profile store with participant-controlled key.

---

## Citation

When publishing results using m-NAP, cite as:
[Author]. (2026). m-NAP: Minimal Neurodivergent Adaptation Profile.
The Living Constitution 2.0 Instruments Library. [DOI TBD — Zenodo deposition]
