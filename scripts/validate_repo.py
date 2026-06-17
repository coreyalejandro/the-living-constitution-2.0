#!/usr/bin/env python3
"""
validate_repo.py
TLC 2.0 Workspace — Repository Scaffold Validator

Checks a project directory for TLC governance integrity:
  - Required files present (contract, STATUS.md, README.md, evidence/)
  - Visual Understanding Layer (I8) — diagram or visual description
  - Schema files if declared
  - Evidence index initialized
  - .tlc-module file present (for pre-commit hook)

Usage:
  python validate_repo.py                  # validate cwd
  python validate_repo.py --path /path     # validate specific project
  python validate_repo.py --fix            # auto-create missing stubs

Exit codes:
  0 — pass (0 errors)
  1 — fail (1+ errors)

Output format: plain text, one line per check, PASS/FAIL/WARN prefix.
"""

import sys
import os
import json
import argparse
from pathlib import Path
from datetime import date

# -------------------------------------------------------------------
# Config
# -------------------------------------------------------------------
TLC_ROOT = Path(__file__).parent.resolve()
REQUIRED_FILES = [
    # (candidates, severity, description) — first candidate that exists wins
    (["C_RSP_BUILD_CONTRACT.md", "contracts/active/BUILD_CONTRACT.md", "BUILD_CONTRACT.md"],
     "error", "C-RSP contract"),
    (["STATUS.md", "MODULE_STATUS.md"],
     "error", "Truth status tracker"),
    (["README.md"],
     "error", "Project README"),
    (["evidence", "verification"],
     "error", "Evidence directory"),
]
RECOMMENDED_FILES = [
    ("evidence/index.md",       "warn",  "Evidence index"),
    (".tlc-module",             "warn",  "Module ID file (for pre-commit hook)"),
]
VISUAL_PATTERNS = [
    "mermaid", "flowchart", "graph td", "graph lr", "sequencediagram",
    "classDiagram", "diagram", "architecture", "topology",
    "visual understanding", "system overview"
]

# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def check(label, passed, severity="error", detail=None):
    status = "PASS" if passed else ("FAIL" if severity == "error" else "WARN")
    line = f"  [{status}] {label}"
    if detail and not passed:
        line += f"\n         {detail}"
    print(line)
    return passed or severity != "error"

# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="TLC 2.0 repo validator")
    parser.add_argument("--path", default=".", help="Project path to validate")
    parser.add_argument("--fix", action="store_true", help="Auto-create missing stub files")
    args = parser.parse_args()

    project_path = Path(args.path).resolve()

    print(f"\nTLC 2.0 — Scaffold Validator")
    print(f"Project: {project_path}")
    print(f"Date:    {date.today()}")
    print(f"{'─' * 60}")

    errors = 0
    warnings = 0

    # --- Required files ---
    print("\n[1] Required Files")
    for candidates, severity, description in REQUIRED_FILES:
        # Find first existing candidate
        found_path = None
        for filename in candidates:
            target = project_path / filename
            if target.exists():
                found_path = filename
                break
        primary = candidates[0]  # use for display / fix
        if found_path:
            check(f"{description}: {found_path}", True)
        else:
            passed = check(f"{description}: {primary}", False, severity,
                           detail=f"Missing — create {primary}" if not found_path else None)
            if not passed:
                errors += 1
                if args.fix:
                    target = project_path / primary
                    if primary == "evidence":
                        target.mkdir(exist_ok=True)
                        (target / ".gitkeep").touch()
                        print(f"         [FIXED] Created {primary}/")
                    elif primary == "STATUS.md":
                        target.write_text("# STATUS\n\n## STATUS\n- **Truth Status:** unverified\n")
                        print(f"         [FIXED] Created stub {primary}")
                    elif primary == "README.md":
                        target.write_text(f"# {project_path.name}\n\nSee STATUS.md.\n")
                        print(f"         [FIXED] Created stub {primary}")
                    elif primary == "C_RSP_BUILD_CONTRACT.md":
                        target.write_text(f"# C-RSP Build Contract — {project_path.name}\n\n**Status:** Draft\n")
                        print(f"         [FIXED] Created stub {primary}")

    # --- Recommended files ---
    print("\n[2] Recommended Files")
    for filename, severity, description in RECOMMENDED_FILES:
        target = project_path / filename
        exists = target.exists()
        passed = check(f"{description}: {filename}", exists, severity,
                       detail=f"Missing — consider creating {filename}" if not exists else None)
        if not passed:
            warnings += 1
            if args.fix and filename == ".tlc-module":
                # Try to derive module ID from contract
                contract = project_path / "C_RSP_BUILD_CONTRACT.md"
                module_id = project_path.name.upper().replace("-", "_")
                if contract.exists():
                    content = contract.read_text()
                    import re
                    m = re.search(r"\*\*Module(?:\s*ID)?\*\*:?\s*([A-Z][A-Z0-9_-]+)", content)
                    if m:
                        module_id = m.group(1)
                target.write_text(module_id + "\n")
                print(f"         [FIXED] Created .tlc-module with ID: {module_id}")

    # --- C-RSP contract checks ---
    print("\n[3] Contract Integrity")
    # Find actual contract path (same candidate logic as required files)
    contract_candidates = ["C_RSP_BUILD_CONTRACT.md", "contracts/active/BUILD_CONTRACT.md", "BUILD_CONTRACT.md"]
    contract_path = None
    for c in contract_candidates:
        cp = project_path / c
        if cp.exists():
            contract_path = cp
            break
    if contract_path and contract_path.exists():
        content = contract_path.read_text()
        check("Contract has Objective section",
              "## 1. Objective" in content or "## Objective" in content or
              "Objective" in content or "objective" in content)
        check("Contract has Not Claimed section",  "Not Claimed" in content, "warn",
              detail="Add '## Not Claimed' section — required for claim integrity")
        check("Contract has Acceptance Criteria",  "Acceptance Criteria" in content or "AC-001" in content)
        check("Contract has Halt Conditions",      "Halt" in content or "HLT-" in content, "warn",
              detail="Consider adding halt conditions for governance enforcement")
        check("Contract has V&T Statement",        "V&T" in content or "EXISTS" in content, "warn",
              detail="Add V&T statement at end of contract")
        if "## 1. Objective" not in content and "## Objective" not in content and \
           "Objective" not in content and "objective" not in content:
            errors += 1
        if "Acceptance Criteria" not in content and "AC-001" not in content:
            errors += 1
    else:
        check("Contract readable", False, "error", detail="Contract file not found — cannot validate")
        errors += 1

    # --- STATUS.md checks ---
    print("\n[4] STATUS.md Integrity")
    status_candidates = ["STATUS.md", "MODULE_STATUS.md"]
    status_path = None
    for s in status_candidates:
        sp = project_path / s
        if sp.exists():
            status_path = sp
            break
    if status_path and status_path.exists():
        content = status_path.read_text()
        check("Truth status declared",
              "Truth Status:" in content or "truth_status" in content.lower() or
              "[WORKING]" in content or "[PARTIAL]" in content or "[UNVERIFIED]" in content or
              "working" in content.lower() or "unverified" in content.lower(),
              "error", detail="Add 'Truth Status: unverified' to STATUS.md")
        check("Has RETROSPECTIVE section", "RETROSPECTIVE" in content.upper(), "warn",
              detail="Consider adding a RETROSPECTIVE section")
        check("Has PROSPECTIVE section",   "PROSPECTIVE" in content.upper() or "Next Required" in content, "warn",
              detail="Consider adding a PROSPECTIVE / Next Required Action section")
        if "Truth Status:" not in content and "truth_status" not in content.lower() and \
           "[WORKING]" not in content and "[PARTIAL]" not in content and "[UNVERIFIED]" not in content and \
           "working" not in content.lower() and "unverified" not in content.lower():
            errors += 1
    else:
        check("STATUS.md readable", False, "error", detail="STATUS.md not found")
        errors += 1

    # --- Visual Understanding Layer (I8) ---
    print("\n[5] Visual Understanding Layer (I8)")
    visual_found = False
    for filename in ["README.md", "docs/ARCHITECTURE.md", "docs/OVERVIEW.md", "ARCHITECTURE.md"]:
        fp = project_path / filename
        if fp.exists():
            content = fp.read_text().lower()
            if any(pattern.lower() in content for pattern in VISUAL_PATTERNS):
                visual_found = True
                check(f"Visual/diagram found in {filename}", True)
                break
    if not visual_found:
        check("Visual Understanding Layer (diagram / topology description)", False, "warn",
              detail="Add a Mermaid diagram or topology description to README.md — required for I8")
        warnings += 1

    # --- Evidence directory ---
    print("\n[6] Evidence Directory")
    evidence_dir = project_path / "evidence"
    if evidence_dir.exists():
        check("evidence/ directory exists", True)
        has_index = (evidence_dir / "index.md").exists()
        check("evidence/index.md exists", has_index, "warn",
              detail="Create evidence/index.md to track evidence files")
        if not has_index:
            warnings += 1
            if args.fix:
                (evidence_dir / "index.md").write_text("# Evidence Index\n\n| Date | Session | File | ACs |\n|------|---------|------|-----|\n")
                print("         [FIXED] Created evidence/index.md")
    else:
        check("evidence/ directory exists", False, "error",
              detail="Create evidence/ directory to store session evidence")
        errors += 1

    # --- Summary ---
    print(f"\n{'─' * 60}")
    print(f"SUMMARY")
    print(f"  Errors:   {errors}")
    print(f"  Warnings: {warnings}")
    status = "PASS" if errors == 0 else "FAIL"
    print(f"  Result:   {status}")
    print()

    if errors > 0:
        print("Run with --fix to auto-create missing stub files.")
        print()

    sys.exit(0 if errors == 0 else 1)


if __name__ == "__main__":
    main()
