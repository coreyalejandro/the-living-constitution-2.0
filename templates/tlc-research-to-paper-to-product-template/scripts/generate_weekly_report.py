#!/usr/bin/env python3
"""
Weekly Report Generator
Reads the latest workbook data (or evidence_index.csv) and generates
a markdown weekly review report in reports/weekly/.

Usage:
    python3 scripts/generate_weekly_report.py [--week NN]

If --week is omitted, infers week number from the latest session date.
"""

import csv
import os
import sys
import argparse
from datetime import date, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT, "evidence", "index", "evidence_index.csv")
WEEKLY_DIR = os.path.join(ROOT, "reports", "weekly")
TEMPLATE_PATH = os.path.join(ROOT, "templates", "weekly_review_template.md")


def load_evidence_index():
    if not os.path.isfile(INDEX_PATH):
        return []
    with open(INDEX_PATH, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def infer_week_number(rows):
    """Simple: count distinct ISO weeks in the data."""
    dates = set()
    for row in rows:
        d = row.get("date_captured", "").strip()
        if d:
            try:
                dates.add(datetime.strptime(d[:10], "%Y-%m-%d").date().isocalendar()[1])
            except ValueError:
                pass
    return max(dates) if dates else 1


def main():
    parser = argparse.ArgumentParser(description="Generate weekly review report")
    parser.add_argument("--week", type=int, help="Week number (e.g. 1, 2, 3)")
    args = parser.parse_args()

    rows = load_evidence_index()
    week = args.week if args.week else infer_week_number(rows)
    week_str = f"WEEK_{week:02d}"

    # Load template
    if os.path.isfile(TEMPLATE_PATH):
        with open(TEMPLATE_PATH, encoding="utf-8") as f:
            template = f.read()
    else:
        template = """# Weekly Review — {{WEEK}}

**Date generated:** {{DATE}}
**Evidence items this week:** {{EVIDENCE_COUNT}}

## Sessions completed

{{SESSIONS}}

## Anomalies or concerns

None recorded.

## Next-week plan

- Continue data collection per STUDY_PROTOCOL.md
- Review any MISSING fields

## V&T

EXISTS: Weekly report generated from evidence_index.csv
VERIFIED AGAINST: evidence_index.csv row count
NOT CLAIMED: analysis outputs, paper progress
FUNCTIONAL STATUS: report generated, data collection ongoing
"""

    # Count evidence items (rough: items logged this week)
    today = date.today()
    evidence_count = len(rows)

    # Session summaries from evidence index
    sessions_seen = {}
    for row in rows:
        sid = row.get("session_id", "").strip()
        if sid and sid not in sessions_seen:
            sessions_seen[sid] = row.get("date_captured", "")

    sessions_block = "\n".join(
        f"- {sid} ({d})" for sid, d in sorted(sessions_seen.items())
    ) or "No sessions logged yet."

    report = (
        template
        .replace("{{WEEK}}", week_str)
        .replace("{{DATE}}", today.isoformat())
        .replace("{{EVIDENCE_COUNT}}", str(evidence_count))
        .replace("{{SESSIONS}}", sessions_block)
    )

    os.makedirs(WEEKLY_DIR, exist_ok=True)
    out_path = os.path.join(WEEKLY_DIR, f"{week_str}.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"Generated: {out_path}")
    print(f"Week:      {week_str}")
    print(f"Evidence:  {evidence_count} items in index")


if __name__ == "__main__":
    main()
