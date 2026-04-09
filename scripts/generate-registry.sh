#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Generate a registry.yaml skeleton from agent markdown files.

Usage:
  scripts/generate-registry.sh [--root DIR] [--output FILE] <agent.md|slug>...

Each positional argument may be an explicit markdown path or a slug that
resolves to <root>/agents/<slug>.md.
EOF
}

ROOT_DIR=""
OUTPUT_FILE=""
ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --root)
      ROOT_DIR="${2:-}"
      if [[ -z "$ROOT_DIR" ]]; then
        echo "error: --root requires a directory" >&2
        exit 1
      fi
      shift 2
      ;;
    --output|-o)
      OUTPUT_FILE="${2:-}"
      if [[ -z "$OUTPUT_FILE" ]]; then
        echo "error: --output requires a file path" >&2
        exit 1
      fi
      shift 2
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        ARGS+=("$1")
        shift
      done
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#ARGS[@]} -eq 0 ]]; then
  usage >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${ROOT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}" && pwd)"

python3 - "$REPO_ROOT" "$OUTPUT_FILE" "${ARGS[@]}" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path


REPO_ROOT = Path(sys.argv[1]).resolve()
OUTPUT_FILE = sys.argv[2] or None
INPUTS = [Path(arg) for arg in sys.argv[3:]]

DELIVERABLE_RE = re.compile(r"^<!--\s*deliverable:\s*(.+?)\s*-->$")
HEADING_RE = re.compile(r"^(#{2,6})\s+(.*)$")
STOPWORD_SUFFIXES = {
    "specialist",
    "consultant",
    "officer",
    "engineer",
    "manager",
    "analyst",
    "coordinator",
    "advisor",
    "director",
    "administrator",
    "architect",
    "navigator",
}


def fail(message: str) -> None:
    raise SystemExit(f"error: {message}")


def unquote(value: str):
    value = value.strip()
    if not value:
        return ""
    if value.startswith("'") and value.endswith("'") and len(value) >= 2:
        return value[1:-1].replace("''", "'")
    if value.startswith('"') and value.endswith('"') and len(value) >= 2:
        return value[1:-1].replace('\\"', '"')
    if value == "true":
        return True
    if value == "false":
        return False
    if value.isdigit():
        return int(value)
    return value


def parse_frontmatter(text: str) -> tuple[dict[str, object], list[str]]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        fail("missing opening frontmatter delimiter")
    end = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end = idx
            break
    if end is None:
        fail("missing closing frontmatter delimiter")

    frontmatter: dict[str, object] = {}
    for raw in lines[1:end]:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = unquote(value.strip())
    return frontmatter, lines[end + 1 :]


def slug_abbrev(slug: str) -> str:
    tokens = [part for part in slug.split("-") if part]
    if not tokens:
        return "agent"
    kept = list(tokens)
    if len(tokens) > 1 and tokens[-1] in STOPWORD_SUFFIXES:
        kept = tokens[:-1]
    abbrev = "".join(token[0] for token in kept if token[0].isalnum()).lower()
    if len(abbrev) < 3:
        for token in tokens[len(kept) :]:
            if token and token[0].isalnum():
                abbrev += token[0].lower()
            if len(abbrev) >= 3:
                break
    return abbrev or "agent"


def quote(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def resolve_input(path_like: Path) -> Path:
    if path_like.exists():
      return path_like.resolve()
    candidate = REPO_ROOT / "agents" / f"{path_like}.md"
    if candidate.exists():
        return candidate.resolve()
    candidate = REPO_ROOT / path_like
    if candidate.exists():
        return candidate.resolve()
    fail(f"cannot resolve input: {path_like}")


def extract_deliverables(lines: list[str], slug: str) -> tuple[list[dict[str, str]], str | None]:
    current_section = None
    deliverables: list[dict[str, str]] = []
    i = 0
    in_fence = False
    while i < len(lines):
        stripped = lines[i].strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            i += 1
            continue
        if not stripped:
            i += 1
            continue
        if in_fence:
            i += 1
            continue
        heading = HEADING_RE.match(stripped)
        if heading:
            level = len(heading.group(1))
            title = heading.group(2).strip()
            if level == 2:
                current_section = title
        marker = DELIVERABLE_RE.match(stripped)
        if marker:
            title = marker.group(1).strip()
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j >= len(lines):
                fail(f"{slug}: deliverable '{title}' is missing its visible heading")
            visible = lines[j].strip()
            if not visible.startswith("### "):
                fail(f"{slug}: deliverable '{title}' must be followed by a ### heading")
            visible_title = visible[4:].strip()
            if visible_title != title:
                fail(
                    f"{slug}: deliverable marker '{title}' does not match visible heading '{visible_title}'"
                )
            deliverables.append(
                {
                    "id": f"{slug_abbrev(slug)}-d{len(deliverables) + 1:02d}",
                    "title": title,
                    "prompt_section": current_section or "Technical Deliverables",
                }
            )
            i = j
        i += 1
    return deliverables, current_section


def render_yaml(lines: list[str], indent: int = 0) -> list[str]:
    out: list[str] = []
    space = " " * indent
    for item in lines:
        out.append(f"{space}{item}")
    return out


def emit_registry(agents: list[dict[str, object]], utility_agents: list[str]) -> str:
    out: list[str] = []
    if agents:
        out.append("agents:")
        for agent in agents:
            out.append(f"  - slug: {quote(agent['slug'])}")
            out.append(f"    name: {quote(agent['name'])}")
            out.append("    deliverables:")
            for deliverable in agent["deliverables"]:
                out.append(f"      - id: {quote(deliverable['id'])}")
                out.append(f"        title: {quote(deliverable['title'])}")
                out.append(f"        prompt_section: {quote(deliverable['prompt_section'])}")
    else:
        out.append("agents: []")
    if utility_agents:
        out.append("utility_agents:")
        for slug in utility_agents:
            out.append(f"  - {quote(slug)}")
    else:
        out.append("utility_agents: []")
    out.append("")
    return "\n".join(out)


def main() -> None:
    agents: list[dict[str, object]] = []
    utility_agents: list[str] = []
    seen_slugs: set[str] = set()

    for input_path in INPUTS:
        resolved = resolve_input(input_path)
        text = resolved.read_text()
        frontmatter, body = parse_frontmatter(text)
        slug = resolved.stem
        if slug in seen_slugs:
            fail(f"duplicate input slug: {slug}")
        seen_slugs.add(slug)

        if bool(frontmatter.get("utility", False)):
            utility_agents.append(slug)
            continue
        if str(frontmatter.get("agent_type", "")).strip() == "orchestrator":
            continue

        name = frontmatter.get("name")
        if not isinstance(name, str) or not name.strip():
            fail(f"{slug}: missing frontmatter field 'name'")

        deliverables, _ = extract_deliverables(body, slug)
        if not deliverables:
            fail(f"{slug}: no deliverable markers found")

        agents.append(
            {
                "slug": slug,
                "name": name.strip(),
                "deliverables": deliverables,
            }
        )

    agents.sort(key=lambda item: item["slug"])
    utility_agents = sorted(dict.fromkeys(utility_agents))

    rendered = emit_registry(agents, utility_agents)
    if OUTPUT_FILE:
        Path(OUTPUT_FILE).write_text(rendered)
    else:
        sys.stdout.write(rendered)


if __name__ == "__main__":
    main()
PY
