# Visual Understanding Layer

This directory contains all required visual artifacts for the project.

A repo is INCOMPLETE without all 6 required files containing real content.
validate_repo.py will FAIL if any visual file is missing or placeholder-only (<= 50 bytes).

## Required files

| File | Purpose | Status |
|---|---|---|
| architecture/system-architecture.mmd | System and data flow diagram | placeholder |
| app-flow/app-flow.mmd | Workflow step-by-step | placeholder |
| user-journey/user-journey.mmd | Participant/user journey | placeholder |
| pictographs/research-loop-pictograph.md | Plain-language process | placeholder |
| mock-demo/mock-demo-storyboard.md | Demo storyboard | placeholder |
| illustrations/illustration-brief.md | Illustration direction | placeholder |

Update the Status column as each file is filled in.

## Rendering Mermaid files

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Render to SVG
mmdc -i architecture/system-architecture.mmd -o architecture/system-architecture.svg

# Or use https://mermaid.live to preview and edit
```

## Reference

See docs/VISUAL_UNDERSTANDING_LAYER.md for the invariant specification
and per-file requirements.
