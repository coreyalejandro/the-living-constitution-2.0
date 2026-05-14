#!/usr/bin/env python3
"""
Paper Packet Generator
Assembles paper/ section files into a single combined paper packet
in reports/final/.

Output: reports/final/paper_packet_YYYYMMDD.md

Sections assembled in order:
  abstract, outline, methods, results, discussion, limitations, related_work
"""

import os
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAPER_DIR = os.path.join(ROOT, "paper")
FINAL_DIR = os.path.join(ROOT, "reports", "final")

SECTION_ORDER = [
    ("abstract", "Abstract"),
    ("outline", "Outline"),
    ("related_work", "Related Work"),
    ("methods", "Methods"),
    ("results", "Results"),
    ("discussion", "Discussion"),
    ("limitations", "Limitations"),
]


def read_section(name):
    path = os.path.join(PAPER_DIR, f"{name}.md")
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            return f.read().strip()
    return None


def main():
    today = date.today().strftime("%Y%m%d")
    out_name = f"paper_packet_{today}.md"
    out_path = os.path.join(FINAL_DIR, out_name)

    sections_found = []
    sections_missing = []

    lines = [
        "# Paper Packet",
        f"",
        f"Generated: {date.today().isoformat()}",
        f"Source: paper/",
        f"",
        "---",
        "",
    ]

    for name, label in SECTION_ORDER:
        content = read_section(name)
        if content:
            lines.append(f"## {label}")
            lines.append("")
            lines.append(content)
            lines.append("")
            lines.append("---")
            lines.append("")
            sections_found.append(name)
        else:
            sections_missing.append(name)
            lines.append(f"## {label}")
            lines.append("")
            lines.append(f"*Section not yet written: paper/{name}.md*")
            lines.append("")
            lines.append("---")
            lines.append("")

    lines.append("## V&T")
    lines.append("")
    lines.append(f"EXISTS: Paper packet assembled from paper/ section files")
    lines.append(f"VERIFIED AGAINST: File reads from paper/*.md")
    lines.append(
        f"NOT CLAIMED: Peer review, submission, acceptance, publication"
    )
    lines.append(
        f"FUNCTIONAL STATUS: {len(sections_found)}/{len(SECTION_ORDER)} sections present; "
        f"missing: {', '.join(sections_missing) if sections_missing else 'none'}"
    )

    os.makedirs(FINAL_DIR, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated: {out_path}")
    print(f"Sections:  {len(sections_found)}/{len(SECTION_ORDER)} present")
    if sections_missing:
        print(f"Missing:   {', '.join(sections_missing)}")


if __name__ == "__main__":
    main()
