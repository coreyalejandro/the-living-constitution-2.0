#!/usr/bin/env python3
"""
TLC Research-to-Paper-to-Product Template — Repository Structure Validator
Verifies required files, directories, .gitignore, STATUS.md, and visual layer.
Exits 0 on PASS. Exits 1 on FAIL.

Generated from: sociotechnical-constitution-runtime/templates/tlc-research-to-paper-to-product-template
"""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REQUIRED_FILES = [
    "README.md",
    "STATUS.md",
    "C_RSP_BUILD_CONTRACT.md",
    ".gitignore",
    "docs/STUDY_PROTOCOL.md",
    "docs/SAFETY_PROTOCOL.md",
    "docs/ETHICS_AND_BOUNDARIES.md",
    "docs/DATA_DICTIONARY.md",
    "docs/BLIND_MANS_REPO_SETUP.md",
    "docs/RESEARCHER_ENGINEER_HANDBOOK.md",
    "docs/PORTFOLIO_PUBLICATION_GATE.md",
    "docs/GITHUB_REVIEWER_SUMMARY_GATE.md",
    "docs/VISUAL_UNDERSTANDING_LAYER.md",
    "schemas/event_schema.json",
    "schemas/session_schema.json",
    "schemas/artifact_schema.json",
    "schemas/claim_schema.json",
    "schemas/portfolio_packet_schema.json",
    "evidence/index/evidence_index.csv",
    "scripts/validate_repo.py",
    # Visual Understanding Layer — I8 nonnegotiable invariant
    "visuals/README.md",
    "visuals/architecture/system-architecture.mmd",
    "visuals/app-flow/app-flow.mmd",
    "visuals/user-journey/user-journey.mmd",
    "visuals/pictographs/research-loop-pictograph.md",
    "visuals/mock-demo/mock-demo-storyboard.md",
    "visuals/illustrations/illustration-brief.md",
]

REQUIRED_DIRS = [
    "docs",
    "visuals",
    "visuals/architecture",
    "visuals/app-flow",
    "visuals/user-journey",
    "visuals/pictographs",
    "visuals/mock-demo",
    "visuals/illustrations",
    "schemas",
    "data/raw",
    "data/processed",
    "data/private",
    "evidence/screenshots",
    "evidence/excerpts",
    "evidence/verification",
    "evidence/index",
    "analysis/notebooks",
    "analysis/scripts",
    "analysis/outputs",
    "paper",
    "product",
    "reports/weekly",
    "reports/final",
    "templates",
    "scripts",
]

GITIGNORE_REQUIRED = [
    "data/private/*",
    "evidence/screenshots/*",
    "evidence/excerpts/*",
]

STATUS_REQUIRED = [
    "RETROSPECTIVE",
    "PROSPECTIVE_START",
]

FORBIDDEN_PATTERNS = [
    "quiz_answers",
    "answer_bank",
    "lesson_text_full",
    "lms_export",
]

# Visual layer files must not be empty placeholder stubs
# A file is considered placeholder-only if it is <= 50 bytes
VISUAL_MIN_BYTES = 50

VISUAL_FILES = [
    "visuals/architecture/system-architecture.mmd",
    "visuals/app-flow/app-flow.mmd",
    "visuals/user-journey/user-journey.mmd",
    "visuals/pictographs/research-loop-pictograph.md",
    "visuals/mock-demo/mock-demo-storyboard.md",
    "visuals/illustrations/illustration-brief.md",
]

errors = []
warnings = []


def section(title):
    print(f"\n{title}")
    print("-" * len(title))


def ok(msg):
    print(f"  OK    {msg}")


def fail_item(msg):
    print(f"  FAIL  {msg}")
    errors.append(msg)


def warn_item(msg):
    print(f"  WARN  {msg}")
    warnings.append(msg)


print("TLC Research-to-Paper-to-Product Template — Repository Validator")
print(f"Root: {ROOT}")

# Required files
section("Required files")
for f in REQUIRED_FILES:
    path = os.path.join(ROOT, f)
    if not os.path.isfile(path):
        fail_item(f"MISSING FILE: {f}")
    else:
        ok(f)

# Required directories
section("Required directories")
for d in REQUIRED_DIRS:
    path = os.path.join(ROOT, d)
    if not os.path.isdir(path):
        fail_item(f"MISSING DIR: {d}")
    else:
        ok(f"{d}/")

# Visual layer — I8 invariant (nonnegotiable)
section("Visual Understanding Layer — Invariant I8 (nonnegotiable)")
print("  A repo is incomplete without all 6 visual files with content.")
for vf in VISUAL_FILES:
    path = os.path.join(ROOT, vf)
    if not os.path.isfile(path):
        fail_item(f"VISUAL LAYER MISSING: {vf}")
    else:
        size = os.path.getsize(path)
        if size <= VISUAL_MIN_BYTES:
            fail_item(f"VISUAL LAYER PLACEHOLDER ONLY ({size} bytes): {vf}")
        else:
            ok(f"{vf} ({size} bytes)")

# .gitignore
section(".gitignore exclusions")
gitignore_path = os.path.join(ROOT, ".gitignore")
if os.path.isfile(gitignore_path):
    with open(gitignore_path) as f:
        content = f.read()
    for pattern in GITIGNORE_REQUIRED:
        if pattern in content:
            ok(pattern)
        else:
            fail_item(f".gitignore missing exclusion: {pattern}")
else:
    fail_item(".gitignore not found")

# STATUS.md
section("STATUS.md content")
status_path = os.path.join(ROOT, "STATUS.md")
if os.path.isfile(status_path):
    with open(status_path) as f:
        content = f.read()
    for term in STATUS_REQUIRED:
        if term in content:
            ok(f"STATUS.md contains '{term}'")
        else:
            fail_item(f"STATUS.md missing required term: '{term}'")
else:
    fail_item("STATUS.md not found")

# C_RSP_BUILD_CONTRACT.md non-empty
section("C_RSP_BUILD_CONTRACT.md")
contract_path = os.path.join(ROOT, "C_RSP_BUILD_CONTRACT.md")
if os.path.isfile(contract_path):
    size = os.path.getsize(contract_path)
    if size > 100:
        ok(f"C_RSP_BUILD_CONTRACT.md ({size} bytes)")
    else:
        fail_item("C_RSP_BUILD_CONTRACT.md too short — appears empty or placeholder")
else:
    fail_item("C_RSP_BUILD_CONTRACT.md not found")

# evidence_index.csv header
section("Evidence index")
idx_path = os.path.join(ROOT, "evidence/index/evidence_index.csv")
if os.path.isfile(idx_path):
    with open(idx_path) as f:
        first_line = f.readline().strip()
    if "evidence_id" in first_line:
        ok("evidence_index.csv has header")
    else:
        fail_item("evidence_index.csv missing header row")
else:
    fail_item("evidence_index.csv not found")

# Forbidden content scan
section("Forbidden content scan")
found_forbidden = False
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [
        d for d in dirnames
        if d not in [".git", "__pycache__", ".venv", "node_modules",
                     "private", "screenshots", "excerpts"]
    ]
    for filename in filenames:
        if filename == "validate_repo.py":
            continue
        if filename.endswith((".py", ".md", ".json", ".csv", ".txt")):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, encoding="utf-8", errors="ignore") as f:
                    content = f.read().lower()
                for pattern in FORBIDDEN_PATTERNS:
                    if pattern in content:
                        warn_item(f"Possible forbidden pattern '{pattern}' in {filepath}")
                        found_forbidden = True
            except Exception:
                pass

if not found_forbidden:
    ok("No forbidden patterns found")

# Summary
print()
print("=" * 60)
if errors:
    print(f"FAIL — {len(errors)} error(s):")
    for e in errors:
        print(f"  ERROR: {e}")
    if warnings:
        print(f"\n  + {len(warnings)} warning(s) — see above")
    sys.exit(1)
else:
    if warnings:
        print(f"PASS with {len(warnings)} warning(s) — see above")
    else:
        print("PASS — all checks passed")
    sys.exit(0)
