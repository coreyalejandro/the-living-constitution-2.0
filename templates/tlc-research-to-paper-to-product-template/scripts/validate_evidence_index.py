#!/usr/bin/env python3
"""
Evidence Index Validator
Checks evidence/index/evidence_index.csv for:
- Header row presence
- Required columns
- No duplicate evidence_id values
- No missing required fields in each row
- public_safe field is 'yes' or 'no'
Exits 0 on PASS. Exits 1 on FAIL.
"""

import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT, "evidence", "index", "evidence_index.csv")

REQUIRED_COLUMNS = [
    "evidence_id",
    "session_id",
    "evidence_type",
    "description",
    "location",
    "date_captured",
    "public_safe",
]

VALID_EVIDENCE_TYPES = {
    "screenshot", "note", "log", "artifact", "excerpt",
    "annotation", "report", "schema", "code", "other"
}

VALID_PUBLIC_SAFE = {"yes", "no"}

errors = []
warnings = []


def fail_item(msg):
    print(f"  FAIL  {msg}")
    errors.append(msg)


def warn_item(msg):
    print(f"  WARN  {msg}")
    warnings.append(msg)


def ok(msg):
    print(f"  OK    {msg}")


print("Evidence Index Validator")
print(f"Path: {INDEX_PATH}")
print()

if not os.path.isfile(INDEX_PATH):
    print(f"  FAIL  evidence_index.csv not found at {INDEX_PATH}")
    sys.exit(1)

with open(INDEX_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames or []

    # Check required columns
    print("Checking required columns...")
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in fieldnames]
    if missing_cols:
        for col in missing_cols:
            fail_item(f"Missing required column: {col}")
    else:
        ok(f"All {len(REQUIRED_COLUMNS)} required columns present")

    # Check rows
    rows = list(reader)

if not rows:
    ok("No data rows yet — acceptable for a new project")
    print()
    print("=" * 60)
    print("PASS — header only, no data to validate")
    sys.exit(0)

print(f"\nChecking {len(rows)} data row(s)...")

seen_ids = {}
for i, row in enumerate(rows, start=2):
    eid = row.get("evidence_id", "").strip()

    # Duplicate IDs
    if eid in seen_ids:
        fail_item(f"Row {i}: duplicate evidence_id '{eid}' (first seen row {seen_ids[eid]})")
    else:
        seen_ids[eid] = i

    # Required fields not empty (MISSING is acceptable, blank is not)
    for col in ["evidence_id", "session_id", "evidence_type", "date_captured"]:
        val = row.get(col, "").strip()
        if not val:
            fail_item(f"Row {i} ({eid}): required field '{col}' is blank")

    # evidence_type valid
    etype = row.get("evidence_type", "").strip().lower()
    if etype and etype not in VALID_EVIDENCE_TYPES:
        warn_item(f"Row {i} ({eid}): unknown evidence_type '{etype}'")

    # public_safe valid
    ps = row.get("public_safe", "").strip().lower()
    if ps and ps not in VALID_PUBLIC_SAFE:
        fail_item(f"Row {i} ({eid}): public_safe must be 'yes' or 'no', got '{ps}'")

ok(f"Checked {len(rows)} rows, {len(seen_ids)} unique IDs")

print()
print("=" * 60)
if errors:
    print(f"FAIL — {len(errors)} error(s):")
    for e in errors:
        print(f"  ERROR: {e}")
    sys.exit(1)
else:
    if warnings:
        print(f"PASS with {len(warnings)} warning(s) — see above")
    else:
        print("PASS — all checks passed")
    sys.exit(0)
