#!/usr/bin/env python3
"""
Portfolio Packet Generator
Reads STATUS.md, C_RSP_BUILD_CONTRACT.md, evidence_index.csv, and
paper/abstract.md to assemble a portfolio packet in reports/final/.

Output: reports/final/portfolio_packet_YYYYMMDD.md

The portfolio packet is the artifact submitted to the PORTFOLIO_PUBLICATION_GATE.
"""

import csv
import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FINAL_DIR = os.path.join(ROOT, "reports", "final")


def read_file(rel_path):
    path = os.path.join(ROOT, rel_path)
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            return f.read().strip()
    return None


def count_evidence():
    index_path = os.path.join(ROOT, "evidence", "index", "evidence_index.csv")
    if not os.path.isfile(index_path):
        return 0
    with open(index_path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return len(rows)


def extract_status_line(status_md):
    """Pull the public_display_status line from STATUS.md."""
    if not status_md:
        return "unknown"
    m = re.search(r"\*\*Public display status:\*\*\s*(.+)", status_md)
    if m:
        return m.group(1).strip()
    return "unknown"


def main():
    today = date.today()
    out_name = f"portfolio_packet_{today.strftime('%Y%m%d')}.md"
    out_path = os.path.join(FINAL_DIR, out_name)

    status_md = read_file("STATUS.md")
    abstract_md = read_file("paper/abstract.md")
    readme_md = read_file("README.md")
    evidence_count = count_evidence()
    display_status = extract_status_line(status_md)

    lines = [
        "# Portfolio Packet",
        "",
        f"Generated: {today.isoformat()}",
        f"Source: STATUS.md, paper/abstract.md, README.md, evidence_index.csv",
        "",
        "---",
        "",
        "## Project identity",
        "",
        "**Project slug:** {{PROJECT_SLUG}}",
        "**Public display status:** " + display_status,
        "**Evidence items:** " + str(evidence_count),
        "",
        "---",
        "",
        "## Abstract / summary",
        "",
        abstract_md if abstract_md else "*paper/abstract.md not yet written*",
        "",
        "---",
        "",
        "## Current status (from STATUS.md)",
        "",
        status_md if status_md else "*STATUS.md not found*",
        "",
        "---",
        "",
        "## Reviewer paths",
        "",
        "<!-- Fill in reviewer-facing links before submitting to portfolio gate -->",
        "",
        "- Registry entry: sociotechnical-constitution-runtime/registry/modules.registry.json",
        "- Evidence index: evidence/index/evidence_index.csv",
        "- Visual layer: visuals/",
        "- Paper packet: reports/final/paper_packet_*.md",
        "",
        "---",
        "",
        "## Portfolio publication gate status",
        "",
        "See docs/PORTFOLIO_PUBLICATION_GATE.md — all gates must pass before submission.",
        "",
        "---",
        "",
        "## V&T",
        "",
        "EXISTS: Portfolio packet assembled from project files",
        "VERIFIED AGAINST: File reads from STATUS.md, paper/abstract.md, evidence_index.csv",
        "NOT CLAIMED: Portfolio promotion approved, reviewer acceptance, publication",
        f"FUNCTIONAL STATUS: packet generated; {evidence_count} evidence items; "
        f"display_status={display_status}",
    ]

    os.makedirs(FINAL_DIR, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated: {out_path}")
    print(f"Evidence:  {evidence_count} items")
    print(f"Status:    {display_status}")


if __name__ == "__main__":
    main()
