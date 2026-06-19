# arXiv Submission Package — NARRATIVE-CONDITIONED-INTERFACES

**Module:** NARRATIVE-CONDITIONED-INTERFACES  
**Date:** 2026-06-19  
**truth_status:** PROPOSED — arXiv submission has not been made

---

## What This Package Is

This directory constitutes the complete pre-submission package for the position
paper:

> Alejandro, C. (2026). *Narrative-Conditioned Interfaces: Preserving Analytical
> Cognition in AI-Augmented Workflows.* Position paper submitted to NeurIPS 2026.

The package is ready for LaTeX formatting and external review. It has not been
submitted. arXiv requires LaTeX source; the files here are in Markdown and must
be converted before submission.

---

## File Manifest

### Core Paper

| File | Description | Status |
|------|-------------|--------|
| `paper/paper_v02_neurips_trimmed.md` | NeurIPS position paper, ~3400 words, 9 verified citations. F-002 and F-005 resolved. | READY FOR LATEX PASS |
| `paper/paper_v01_tlc_aligned.md` | Full internal draft with extended sections. Not for submission. Reference only. | INTERNAL ONLY |

### Instruments (Supplementary)

| File | Description | Status |
|------|-------------|--------|
| `instruments/nii-rater-calibration.md` | NII instrument + 5 exemplars + calibration protocol | COMPLETE |
| `instruments/iqr-scoring-rubric.md` | IQR instrument + 5 exemplars + calibration protocol | COMPLETE |

### Study Protocol

| File | Description | Status |
|------|-------------|--------|
| `study/pilot-protocol.md` | N=24 pilot, pre-registration-ready, 4 gate conditions | COMPLETE — requires IRB before execution |

### Governance

| File | Description | Status |
|------|-------------|--------|
| `CRSP_NARRATIVE_CONDITIONED_INTERFACES.md` | C-RSP build contract, AC-001–AC-008 | COMPLETE |
| `INTERNAL_REVIEW.md` | Self-review record, citation log, issues log, AC status | COMPLETE |
| `evidence/index.md` | Source material provenance log | COMPLETE |

---

## Submission Checklist

Complete every item in order before submitting to arXiv or NeurIPS.

### Step 1 — Resolve Remaining Issues

- [ ] Read F-002 and F-005 entries in INTERNAL_REVIEW.md — both patched in
      paper_v02; verify the patches read naturally in context
- [ ] Re-read paper_v02 cover to cover as a single document after F patches
- [ ] Confirm no new issues introduced by F-002/F-005 patches

### Step 2 — External Reviewer

- [ ] Identify one external reviewer (domain: HCI, cognitive science, or applied
      analytics; must not be affiliated with this project)
- [ ] Send paper_v02 + INTERNAL_REVIEW.md to reviewer
- [ ] Receive written feedback
- [ ] Resolve or formally defer all reviewer issues with documented rationale
- [ ] Add reviewer to Acknowledgements section before submission

### Step 3 — Missing Citations

The following citations were removed from v02 because they could not be directly
verified. Attempt to find and verify each before v03:

| Citation | What to do |
|----------|-----------|
| Fan et al. 2024 "Metacognitive Laziness" | Search Google Scholar directly; read the paper; confirm the specific claim being cited |
| Forr / GreenBook 2025 "Insight Atrophy" | Visit greenbook.org/search; find the article; get direct URL |
| Gerlich 2025 note re: Adham Khaled | Verify Khaled Medium article independently; add if confirmed |
| Kalyuga & Plass 2025 | Search UNSW/NYU faculty pages + Google Scholar |
| Hong et al. 2025 (COS instrument) | Search "cognitive offloading scale beneficial detrimental 2025" |

If any are confirmed: add to paper_v02, add to INTERNAL_REVIEW.md verified column,
increment reference list, re-run internal review checklist.

If none are confirmed by submission time: the paper is complete as-is at 9
verified citations. Do not reintroduce unverified citations under deadline pressure.

### Step 4 — LaTeX Conversion

- [ ] Download NeurIPS 2026 LaTeX template from neurips.cc
- [ ] Convert paper_v02_neurips_trimmed.md to LaTeX:
  - Section headings → \section{}, \subsection{}
  - Tables → tabular environments
  - References → BibTeX entries (bib file provided below)
  - truth_status tags → \textit{} or footnotes (remove governance-internal
    notation; replace with standard academic hedging)
- [ ] Compile PDF; verify page count ≤ 4 pages body + unlimited references
- [ ] Check: no author names in body (NeurIPS requires double-blind); remove
      self-identifying language from body text. Move to author metadata only.
- [ ] Spell-check final PDF
- [ ] Save compiled PDF as: `submission/nci-paper-v03-submission.pdf`

### Step 5 — arXiv Submission

- [ ] Create arXiv account at arxiv.org (if not already registered)
- [ ] Select category: cs.HC (Human-Computer Interaction) primary;
      cs.AI, cs.LG secondary
- [ ] Upload: LaTeX source (.tex file + figures if any) OR PDF
- [ ] Title: "Narrative-Conditioned Interfaces: Preserving Analytical Cognition
      in AI-Augmented Workflows"
- [ ] Authors: Corey Alejandro
- [ ] Abstract: copy from paper Section 0 (Abstract)
- [ ] Subject class: cs.HC
- [ ] Comments field: "Position paper. NeurIPS 2026 submission. Instruments
      and pilot protocol available at [repo URL]."
- [ ] License: CC BY 4.0 (recommended for open access + NeurIPS compatibility)
- [ ] Submit and record: arXiv ID, submission date, URL
- [ ] Add arXiv ID to INTERNAL_REVIEW.md AC-S04

### Step 6 — Registry Update

After arXiv submission:

- [ ] Update registry/modules.registry.json:
  - truth_status: keep as "partial" until pilot completes
  - Add field: `"arxiv_id": "<ID>"`
  - Add field: `"arxiv_url": "https://arxiv.org/abs/<ID>"`
  - Remove "arXiv submission receipt" from unverified_scope
  - Add "Pilot study IRB approval" to unverified_scope if not already present
- [ ] Commit registry update: `git commit -m "chore: add arXiv ID to NCI module registry"`

---

## BibTeX Source

Paste this into your `.bib` file for the LaTeX submission.

```bibtex
@techreport{yan2025ai,
  author = {Yan, Vivienne and Patterson, Michael and Luo, Lucia and Nguyen, Emily
            and Rogers, Todd and Renzulli, Kara and Shvarts, Anna},
  title  = {The {AI} Performance Paradox: How Artificial Intelligence Tools Boost
            Short-Term Results While Undermining Durable Skill Development},
  institution = {Oswald Labs},
  year   = {2025},
  note   = {Technical report. Available at
            \url{https://oswaldlabs.com/wp-content/uploads/2025/06/The-AI-Performance-Paradox.pdf}},
}

@article{gerlich2025ai,
  author  = {Gerlich, Michael},
  title   = {{AI} Tools in Society: Impacts on Cognitive Offloading and the Future
             of Critical Thinking},
  journal = {Societies},
  volume  = {15},
  number  = {1},
  pages   = {6},
  year    = {2025},
  doi     = {10.3390/soc15010006},
}

@book{wigginsmc2005,
  author    = {Wiggins, Grant and McTighe, Jay},
  title     = {Understanding by Design},
  edition   = {2nd},
  publisher = {ASCD},
  year      = {2005},
  isbn      = {978-1-4166-0035-1},
}

@misc{alejandro2026tlc,
  author       = {Alejandro, Corey},
  title        = {{TLC} 2.0: {fde-control-plane} governance evidence},
  howpublished = {GitHub. \url{https://github.com/coreyalejandro/the-living-constitution-2.0}},
  year         = {2026},
  note         = {N=1 controlled-lab evidence; not generalizable without re-validation},
}

@book{lincoln1985naturalistic,
  author    = {Lincoln, Yvonna S. and Guba, Egon G.},
  title     = {Naturalistic Inquiry},
  publisher = {SAGE Publications},
  year      = {1985},
  isbn      = {978-0-8039-2431-4},
}

@book{watson2010wgcta,
  author    = {Watson, Goodwin and Glaser, Edward Morison},
  title     = {Watson-{G}laser Critical Thinking Appraisal ({WGCTA})},
  publisher = {Pearson Education},
  year      = {2010},
}

@article{klein2006sensemaking,
  author  = {Klein, Gary and Moon, Brian and Hoffman, Robert R.},
  title   = {Making Sense of Sensemaking 1: Alternative Perspectives},
  journal = {{IEEE} Intelligent Systems},
  volume  = {21},
  number  = {4},
  pages   = {70--73},
  year    = {2006},
  doi     = {10.1109/MIS.2006.75},
}

@inproceedings{pirolli2005sensemaking,
  author    = {Pirolli, Peter and Card, Stuart},
  title     = {The Sensemaking Process and Leverage Points for Analyst Technology
               as Identified Through Cognitive Task Analysis},
  booktitle = {Proceedings of the 2005 International Conference on Intelligence
               Analysis},
  volume    = {5},
  pages     = {2--4},
  year      = {2005},
  organization = {MITRE Corporation},
}

@book{pearl2009causality,
  author    = {Pearl, Judea},
  title     = {Causality: Models, Reasoning and Inference},
  edition   = {2nd},
  publisher = {Cambridge University Press},
  year      = {2009},
  doi       = {10.1017/CBO9780511803161},
}
```

---

## What Cannot Be Done Here

The following require action outside this repository:

- **arXiv submission:** Requires your arXiv account credentials. Go to arxiv.org.
- **NeurIPS submission:** Requires NeurIPS submission portal access and a
  PDF compiled from their LaTeX template.
- **OSF pre-registration:** Go to osf.io, create a pre-registration entry,
  upload study/pilot-protocol.md as the protocol document.
- **IRB submission:** Contact the IRB at your affiliated institution with
  study/pilot-protocol.md as the base document.
- **WGCTA license:** Contact Pearson TalentLens at talentlens.com for
  a research license.

---

## V&T Statement

EXISTS: Complete arXiv submission package — file manifest, submission checklist
(6 steps, 25 line items), BibTeX source for all 9 verified references, list of
what requires external action.

VERIFIED AGAINST: All files listed in the manifest confirmed present on disk
in this session. BibTeX entries cross-checked against verified citations in
INTERNAL_REVIEW.md.

NOT CLAIMED: arXiv submission has been made. Any external review has occurred.
LaTeX compilation has been tested. OSF pre-registration exists. IRB has been
contacted.

FUNCTIONAL STATUS: Package is complete and actionable. Submitter needs:
(1) a LaTeX install, (2) NeurIPS 2026 template, (3) arXiv account. All
other work is done.
