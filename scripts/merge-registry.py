#!/usr/bin/env python3
from __future__ import annotations

import argparse
from copy import deepcopy
from pathlib import Path


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


def parse_scalar(text: str):
    text = text.strip()
    if text == "[]":
        return []
    if text.startswith("'") and text.endswith("'") and len(text) >= 2:
        return text[1:-1].replace("''", "'")
    if text.startswith('"') and text.endswith('"') and len(text) >= 2:
        return text[1:-1].replace('\\"', '"')
    if text == "true":
        return True
    if text == "false":
        return False
    if text.isdigit():
        return int(text)
    return text


def dump_scalar(value) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    if value == []:
        return "[]"
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def parse_registry(path: Path) -> dict:
    lines = path.read_text().splitlines()
    data = {"agents": [], "utility_agents": []}
    section = None
    current_agent = None
    current_deliverable = None
    current_tool = None
    current_list = None

    def finish_inline_item(target, rest: str):
        if not rest:
            return
        if ":" in rest:
            key, value = rest.split(":", 1)
            target[key.strip()] = parse_scalar(value.strip())
        else:
            target["value"] = parse_scalar(rest)

    for raw in lines:
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        stripped = line.strip()

        if indent == 0:
            if stripped in {"agents: []", "utility_agents: []"}:
                key = stripped.split(":", 1)[0]
                data[key] = []
                section = None
                current_agent = None
                current_deliverable = None
                current_tool = None
                current_list = None
                continue
            section = stripped[:-1] if stripped.endswith(":") else None
            current_agent = None
            current_deliverable = None
            current_tool = None
            current_list = None
            if section not in {"agents", "utility_agents"}:
                fail(f"unexpected top-level key: {stripped}")
            continue

        if section == "utility_agents":
            if indent != 2 or not stripped.startswith("- "):
                fail(f"invalid utility_agents entry: {stripped}")
            data["utility_agents"].append(parse_scalar(stripped[2:]))
            continue

        if section != "agents":
            fail(f"unexpected content outside known sections: {stripped}")

        if indent == 2 and stripped.startswith("- "):
            current_agent = {}
            data["agents"].append(current_agent)
            current_deliverable = None
            current_tool = None
            current_list = None
            finish_inline_item(current_agent, stripped[2:].strip())
            continue

        if current_agent is None:
            fail(f"agent content without current agent: {stripped}")

        if indent == 4 and stripped.endswith(":"):
            current_list = stripped[:-1]
            if current_list not in {"deliverables", "routing_triggers", "tool_opportunities"}:
                current_agent[current_list] = []
            else:
                current_agent[current_list] = []
            current_deliverable = None
            current_tool = None
            continue

        if indent == 4 and ":" in stripped and not stripped.startswith("- "):
            key, value = stripped.split(":", 1)
            current_agent[key.strip()] = parse_scalar(value.strip())
            continue

        if current_list == "routing_triggers":
            if indent != 6 or not stripped.startswith("- "):
                fail(f"invalid routing trigger entry: {stripped}")
            current_agent[current_list].append(parse_scalar(stripped[2:]))
            continue

        if current_list == "deliverables":
            if indent == 6 and stripped.startswith("- "):
                current_deliverable = {}
                current_agent[current_list].append(current_deliverable)
                current_tool = None
                finish_inline_item(current_deliverable, stripped[2:].strip())
                continue
            if indent == 8 and current_deliverable is not None and ":" in stripped:
                key, value = stripped.split(":", 1)
                current_deliverable[key.strip()] = parse_scalar(value.strip())
                continue
            fail(f"invalid deliverable entry: {stripped}")

        if current_list == "tool_opportunities":
            if indent == 6 and stripped.startswith("- "):
                current_tool = {}
                current_agent[current_list].append(current_tool)
                current_deliverable = None
                finish_inline_item(current_tool, stripped[2:].strip())
                continue
            if indent == 8 and current_tool is not None and ":" in stripped:
                key, value = stripped.split(":", 1)
                current_tool[key.strip()] = parse_scalar(value.strip())
                continue
            fail(f"invalid tool opportunity entry: {stripped}")

        fail(f"unhandled registry line: {stripped}")

    return data


def render_registry(data: dict) -> str:
    lines = ["agents:"]
    for agent in data["agents"]:
        lines.append(f"  - slug: {dump_scalar(agent['slug'])}")
        lines.append(f"    name: {dump_scalar(agent.get('name', ''))}")
        preferred_order = [
            "domain",
            "routing_triggers",
            "tool_opportunities",
            "line_budget",
            "regulatory_refresh",
            "refresh_owner",
        ]
        extras = sorted(k for k in agent.keys() if k not in {"slug", "name", "deliverables", *preferred_order})
        for key in [*preferred_order, *extras]:
            if key not in agent:
                continue
            value = agent[key]
            if isinstance(value, list):
                lines.append(f"    {key}:")
                for item in value:
                    if isinstance(item, dict):
                        lines.extend(_render_inline_dict(item, indent=6))
                    else:
                        lines.append(f"      - {dump_scalar(item)}")
            else:
                lines.append(f"    {key}: {dump_scalar(value)}")
        lines.append("    deliverables:")
        for deliverable in agent.get("deliverables", []):
            lines.append(f"      - id: {dump_scalar(deliverable['id'])}")
            lines.append(f"        title: {dump_scalar(deliverable['title'])}")
            lines.append(
                f"        prompt_section: {dump_scalar(deliverable.get('prompt_section', 'Technical Deliverables'))}"
            )
    lines.append("utility_agents:")
    if data["utility_agents"]:
        for slug in data["utility_agents"]:
            lines.append(f"  - {dump_scalar(slug)}")
    else:
        lines.append("  []")
    lines.append("")
    return "\n".join(lines)


def _render_inline_dict(item: dict, indent: int) -> list[str]:
    parts: list[str] = []
    keys = list(item.keys())
    if not keys:
        return [f"{' ' * indent}{{}}"]
    prefix = " " * indent
    first = True
    for key in keys:
        value = item[key]
        piece = f"{key}: {dump_scalar(value)}"
        if first:
            parts.append(f"{prefix}- {piece}")
            first = False
        else:
            parts.append(f"{prefix}  {piece}")
    return parts


def merge_registry(skeleton: dict, existing: dict) -> dict:
    existing_by_slug = {agent["slug"]: deepcopy(agent) for agent in existing.get("agents", [])}
    utility_agents = set(existing.get("utility_agents", []))
    utility_agents.update(skeleton.get("utility_agents", []))

    merged_agents = []
    for skeleton_agent in skeleton.get("agents", []):
        slug = skeleton_agent["slug"]
        base = existing_by_slug.pop(slug, {})
        merged = deepcopy(base)
        merged["slug"] = slug
        merged["name"] = skeleton_agent.get("name", merged.get("name", ""))
        merged["deliverables"] = deepcopy(skeleton_agent.get("deliverables", []))
        for key, value in skeleton_agent.items():
            if key in {"slug", "name", "deliverables"}:
                continue
            merged[key] = deepcopy(value)
        merged_agents.append(merged)

    merged_agents.extend(existing_by_slug.values())
    merged_agents.sort(key=lambda agent: agent["slug"])

    merged_agents = [agent for agent in merged_agents if agent["slug"] not in utility_agents]
    return {"agents": merged_agents, "utility_agents": sorted(utility_agents)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Merge a generated registry skeleton into an existing curated registry.")
    parser.add_argument("skeleton", type=Path, help="generated registry skeleton")
    parser.add_argument("existing", type=Path, help="existing curated registry")
    parser.add_argument("--output", "-o", type=Path, help="write merged registry to this file instead of stdout")
    args = parser.parse_args()

    skeleton = parse_registry(args.skeleton)
    existing = parse_registry(args.existing)
    merged = merge_registry(skeleton, existing)
    rendered = render_registry(merged)
    if args.output:
        args.output.write_text(rendered)
    else:
        print(rendered, end="")


if __name__ == "__main__":
    main()
