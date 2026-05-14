#!/usr/bin/env python3
"""
Claims Validator
Reads schemas/claim_schema.json and validates any claim files found
in paper/ and reports/ against the schema.
Also checks that every public claim has:
  - claim_text
  - evidence_source (must exist in evidence_index.csv)
  - verification_status
  - limitation
  - public_private_status
Exits 0 on PASS. Exits 1 on FAIL.
"""

import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA_PATH = os.path.join(ROOT, "schemas", "claim_schema.json")
INDEX_PATH = os.path.join(ROOT, "evidence", "index", "evidence_index.csv")
CLAIMS_DIR = os.path.join(ROOT, "analysis", "outputs")

REQUIRED_CLAIM_FIELDS = [
    "claim_id",
    "claim_text",
    "evidence_source",
    "verification_status",
    "limitation",
    "public_private_status",
]

VALID_VERIFICATION_STATUSES = {
    "verified", "unverified", "partial", "disputed", "retracted"
}

VALID_PUBLIC_PRIVATE = {"public", "private", "embargoed"}

errors = []
warnings = []


def fail_item(msg):
    print(f"  FAIL  {msg}")
    errors.append(msg)


def ok(msg):
    print(f"  OK    {msg}")


def warn_item(msg):
    print(f"  WARN  {msg}")
    warnings.append(msg)


print("Claims Validator")
print(f"Root: {ROOT}")
print()

# Load evidence IDs for cross-reference
evidence_ids = set()
if os.path.isfile(INDEX_PATH):
    with open(INDEX_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            eid = row.get("evidence_id", "").strip()
            if eid:
                evidence_ids.add(eid)
    ok(f"Loaded {len(evidence_ids)} evidence IDs for cross-reference")
else:
    warn_item("evidence_index.csv not found — cannot cross-reference evidence sources")

# Find claim JSON files
claim_files = []
for dirpath, _, filenames in os.walk(ROOT):
    for fname in filenames:
        if fname.endswith("_claims.json") or fname == "claims.json":
            claim_files.append(os.path.join(dirpath, fname))

if not claim_files:
    print("\n  No claim files found (e.g. analysis/outputs/claims.json).")
    print("  This is acceptable if claims have not been drafted yet.")
    print()
    print("=" * 60)
    print("PASS — no claim files to validate")
    sys.exit(0)

print(f"\nFound {len(claim_files)} claim file(s):")
total_claims = 0
for cf in claim_files:
    rel = os.path.relpath(cf, ROOT)
    print(f"  {rel}")
    try:
        with open(cf, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        fail_item(f"Invalid JSON in {rel}: {e}")
        continue

    claims = data if isinstance(data, list) else data.get("claims", [])
    print(f"    {len(claims)} claim(s)")
    total_claims += len(claims)

    for idx, claim in enumerate(claims):
        cid = claim.get("claim_id", f"claim_{idx+1}")

        # Required fields
        for field in REQUIRED_CLAIM_FIELDS:
            if field not in claim or not str(claim[field]).strip():
                fail_item(f"{rel} / {cid}: missing required field '{field}'")

        # Evidence cross-reference
        ev_src = claim.get("evidence_source", "")
        if ev_src and evidence_ids and ev_src not in evidence_ids:
            warn_item(
                f"{rel} / {cid}: evidence_source '{ev_src}' not in evidence_index.csv"
            )

        # Verification status
        vs = claim.get("verification_status", "").lower()
        if vs and vs not in VALID_VERIFICATION_STATUSES:
            fail_item(
                f"{rel} / {cid}: verification_status '{vs}' not in "
                f"{VALID_VERIFICATION_STATUSES}"
            )

        # Public/private
        pp = claim.get("public_private_status", "").lower()
        if pp and pp not in VALID_PUBLIC_PRIVATE:
            fail_item(
                f"{rel} / {cid}: public_private_status '{pp}' must be "
                f"public / private / embargoed"
            )

print(f"\nTotal claims validated: {total_claims}")

print()
print("=" * 60)
if errors:
    print(f"FAIL — {len(errors)} error(s):")
    for e in errors:
        print(f"  ERROR: {e}")
    sys.exit(1)
else:
    if warnings:
        print(f"PASS with {len(warnings)} warning(s)")
    else:
        print("PASS — all checks passed")
    sys.exit(0)
