# Paper — {{PROJECT_NAME}}

This directory contains all paper sections for {{PROJECT_NAME}}.

## Section files

| File | Purpose | Status |
|---|---|---|
| outline.md | Working paper structure | placeholder |
| abstract.md | Submission-facing abstract | placeholder |
| related_work.md | Literature review | placeholder |
| methods.md | Study design and protocol | placeholder |
| results.md | Findings with evidence sources | placeholder |
| discussion.md | Interpretation and implications | placeholder |
| limitations.md | Scope and validity constraints | placeholder |
| references.bib | Bibliography in BibTeX format | placeholder |

## Rules

- Every claim in results.md must have an evidence source in evidence_index.csv
- Do not finalize abstract.md until results are confirmed
- Write limitations.md early — not last
- references.bib uses BibTeX format
- Run `python3 scripts/validate_claims.py` before any public claim is made

## Generating a paper packet

```bash
python3 scripts/generate_paper_packet.py
```

Output goes to: `reports/final/paper_packet_YYYYMMDD.md`
