#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import yaml


ATTACK_HEADING = "## What Auditors Actually Challenge"
LEARNING_HEADING = "## 🔄 Learning & Memory"
DELIVERABLES_HEADING = "## 📋 Your Technical Deliverables"


def load_registry(path: Path) -> dict[str, Any]:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def should_skip(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return False
    parts = text.split("\n---\n", 1)
    if len(parts) != 2:
        return False
    frontmatter = yaml.safe_load(parts[0].split("\n", 1)[1]) or {}
    return bool(frontmatter.get("utility")) or str(frontmatter.get("agent_type", "")).strip() == "orchestrator"


def render_prompt(template_path: Path, agent_entry: dict[str, Any], agent_text: str) -> str:
    prompt = template_path.read_text(encoding="utf-8")
    replacements = {
        "{{today}}": datetime.now(UTC).strftime("%Y-%m-%d"),
        "{{registry_yaml}}": yaml.safe_dump(agent_entry, sort_keys=False),
        "{{agent_markdown}}": agent_text,
    }
    for key, value in replacements.items():
        prompt = prompt.replace(key, value)
    return prompt


def validate_section(section: str) -> None:
    if ATTACK_HEADING not in section:
        raise SystemExit("generated attack-surface section is missing the required heading")
    if section.count("<!-- attack-surface:") < 4:
        raise SystemExit("generated attack-surface section must include at least four attack-surface markers")


def insert_section(agent_path: Path, section: str) -> bool:
    text = agent_path.read_text(encoding="utf-8")
    if ATTACK_HEADING in text:
        return False
    if LEARNING_HEADING in text:
        updated = text.replace(LEARNING_HEADING, section.rstrip() + "\n\n" + LEARNING_HEADING, 1)
    elif DELIVERABLES_HEADING in text:
        updated = text.replace(DELIVERABLES_HEADING, section.rstrip() + "\n\n" + DELIVERABLES_HEADING, 1)
    else:
        raise SystemExit(f"{agent_path}: missing insertion anchor")
    agent_path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default="registry.yaml")
    parser.add_argument("--template", default="scripts/prompts/attack-surfaces.md")
    parser.add_argument("--provider-cmd", default="./scripts/providers/codex-gpt54-medium.sh")
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()

    registry = load_registry(Path(args.registry))
    agent_by_slug = {agent["slug"]: agent for agent in registry.get("agents", [])}

    for raw in args.paths:
        path = Path(raw)
        slug = path.stem if path.suffix == ".md" else raw
        agent_path = path if path.suffix == ".md" else Path("agents") / f"{slug}.md"
        if should_skip(agent_path):
            print(f"{agent_path}: ok")
            continue
        if slug not in agent_by_slug:
            raise SystemExit(f"registry entry not found for {slug}")
        text = agent_path.read_text(encoding="utf-8")
        if ATTACK_HEADING in text:
            print(f"{agent_path}: ok")
            continue

        prompt = render_prompt(Path(args.template), agent_by_slug[slug], text)
        result = subprocess.run(
            ["bash", "-lc", args.provider_cmd],
            input=prompt,
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode != 0:
            raise SystemExit(result.stderr.strip() or f"provider command failed for {slug}")
        section = result.stdout.strip()
        validate_section(section)
        insert_section(agent_path, section)
        print(f"{agent_path}: inserted attack-surface section")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
