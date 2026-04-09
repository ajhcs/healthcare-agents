#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Iterable


DELIVERABLE_SECTION_RE = re.compile(r"^##\s+(?:📋\s+)?Your Technical Deliverables\s*$")
HEADING_RE = re.compile(r"^###\s+(.*\S)\s*$")
MARKER_RE = re.compile(r"^<!--\s*deliverable:\s*(.+?)\s*-->\s*$")


def parse_frontmatter(lines: list[str]) -> tuple[dict[str, str], int]:
    if not lines or lines[0].strip() != "---":
        return {}, 0
    end = None
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            end = index
            break
    if end is None:
        return {}, 0
    frontmatter: dict[str, str] = {}
    for raw in lines[1:end]:
        if ":" not in raw:
            continue
        key, value = raw.split(":", 1)
        frontmatter[key.strip()] = value.strip().strip("'").strip('"')
    return frontmatter, end + 1


def previous_nonempty(lines: list[str], index: int) -> str | None:
    cursor = index - 1
    while cursor >= 0:
        text = lines[cursor].strip()
        if text:
            return text
        cursor -= 1
    return None


def insert_markers(path: Path, check: bool) -> tuple[bool, int]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    frontmatter, start_index = parse_frontmatter(lines)
    if frontmatter.get("utility", "").lower() == "true":
        return False, 0

    in_deliverables = False
    in_fence = False
    insertions = 0
    output: list[str] = []

    for original_index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence

        if not in_fence and DELIVERABLE_SECTION_RE.match(stripped):
            in_deliverables = True
        elif not in_fence and in_deliverables and stripped.startswith("## "):
            in_deliverables = False

        heading_match = HEADING_RE.match(stripped) if in_deliverables and not in_fence else None
        if heading_match:
            title = heading_match.group(1).strip()
            previous = None
            cursor = len(output) - 1
            while cursor >= 0:
                prev = output[cursor].strip()
                if prev:
                    previous = prev
                    break
                cursor -= 1
            if not previous or not MARKER_RE.match(previous):
                output.append(f"<!-- deliverable: {title} -->")
                insertions += 1

        output.append(line)

    if insertions and not check:
        path.write_text("\n".join(output) + ("\n" if text.endswith("\n") or not text else "\n"), encoding="utf-8")

    return insertions > 0, insertions


def resolve_inputs(paths: Iterable[str], repo_root: Path) -> list[Path]:
    resolved: list[Path] = []
    for value in paths:
        candidate = Path(value)
        if candidate.exists():
            resolved.append(candidate.resolve())
            continue
        slug_path = repo_root / "agents" / f"{value}.md"
        if slug_path.exists():
            resolved.append(slug_path.resolve())
            continue
        raise SystemExit(f"error: cannot resolve input: {value}")
    return resolved


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="report files missing markers without modifying them")
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    files = resolve_inputs(args.paths, repo_root)

    changed = 0
    missing = 0
    for path in files:
        did_change, insertions = insert_markers(path, args.check)
        if args.check:
            if did_change:
                missing += 1
                print(f"{path}: missing {insertions} deliverable marker(s)")
        else:
            if did_change:
                changed += 1
                print(f"{path}: inserted {insertions} deliverable marker(s)")
            else:
                print(f"{path}: ok")

    if args.check and missing:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
