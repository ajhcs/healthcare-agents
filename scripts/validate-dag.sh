#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-scripts/test-fixtures/dag}"
shift || true

python3 - "$ROOT" "$@" <<'PY'
from __future__ import annotations

import sys
import re
from collections import defaultdict, deque
from pathlib import Path

import yaml


ALLOWED_BLOCKER_TYPES = {"missing_input", "compliance_escalation", "domain_conflict", "no_covering_agent"}
ALLOWED_WORKFLOW_STATUS = {"blocked", "paused", "partial"}
ALLOWED_CAPABILITIES = {
    "provider_directory",
    "provider_enrollment_status",
    "coverage_determination",
    "coding_edit_policy",
    "trial_registry",
    "literature_search",
    "current_regulatory_policy",
    "drug_coverage_exclusion",
}


def fail(message: str) -> None:
    raise SystemExit(message)


def load_yaml(path: Path) -> dict[str, object]:
    if path.suffix == ".md":
        text = path.read_text(encoding="utf-8")
        matches = re.findall(r"```ya?ml\s*\n(.*?)```", text, flags=re.DOTALL)
        for block in matches:
            data = yaml.safe_load(block)
            if isinstance(data, dict) and "workflow" in data:
                return data
        fail(f"{path}: no fenced yaml block with a workflow mapping found")

    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        fail(f"{path}: top-level YAML must be a mapping")
    return data


def validate_workflow(path: Path) -> list[str]:
    errors: list[str] = []
    data = load_yaml(path)
    if "derived" in data:
        errors.append(f"{path}: derived fields must not be manually authored in DAG input")
    workflow = data.get("workflow")
    if not isinstance(workflow, dict):
        errors.append(f"{path}: missing workflow mapping")
        return errors
    if "derived" in workflow:
        errors.append(f"{path}: workflow.derived fields must not be manually authored in DAG input")
    steps = workflow.get("steps")
    if not isinstance(steps, list) or not steps:
        errors.append(f"{path}: workflow.steps must be a non-empty list")
        return errors

    step_ids: set[int] = set()
    step_map: dict[int, dict[str, object]] = {}
    for index, step in enumerate(steps):
        if not isinstance(step, dict):
            errors.append(f"{path}: steps[{index}] must be a mapping")
            continue
        required = [
            "step_id",
            "agent_slug",
            "agent_name",
            "deliverable_id",
            "deliverable_title",
            "why",
            "required_inputs",
            "outputs_passed_forward",
            "depends_on",
            "independent_review",
            "tool_recommendation",
        ]
        for key in required:
            if key not in step:
                errors.append(f"{path}: steps[{index}] missing {key}")
        step_id = step.get("step_id")
        if not isinstance(step_id, int):
            errors.append(f"{path}: steps[{index}].step_id must be an integer")
            continue
        if step_id in step_ids:
            errors.append(f"{path}: duplicate step_id {step_id}")
            continue
        step_ids.add(step_id)
        step_map[step_id] = step

        for key in ["agent_slug", "agent_name", "deliverable_id", "deliverable_title", "why"]:
            if not isinstance(step.get(key), str) or not step[key].strip():
                errors.append(f"{path}: steps[{index}].{key} must be a non-empty string")
        if not isinstance(step.get("independent_review"), bool):
            errors.append(f"{path}: steps[{index}].independent_review must be boolean")
        required_inputs = step.get("required_inputs")
        if not isinstance(required_inputs, list):
            errors.append(f"{path}: steps[{index}].required_inputs must be a list")
        else:
            for j, item in enumerate(required_inputs):
                if not isinstance(item, dict):
                    errors.append(f"{path}: steps[{index}].required_inputs[{j}] must be a mapping")
                    continue
                if item.get("source") not in {"user"} and not (
                    isinstance(item.get("source"), str) and item["source"].startswith("step_")
                ):
                    errors.append(f"{path}: steps[{index}].required_inputs[{j}].source is invalid")
                if not isinstance(item.get("data"), str) or not item["data"].strip():
                    errors.append(f"{path}: steps[{index}].required_inputs[{j}].data must be a non-empty string")
        outputs = step.get("outputs_passed_forward")
        if not isinstance(outputs, list):
            errors.append(f"{path}: steps[{index}].outputs_passed_forward must be a list")
        else:
            for j, item in enumerate(outputs):
                if not isinstance(item, dict):
                    errors.append(f"{path}: steps[{index}].outputs_passed_forward[{j}] must be a mapping")
                    continue
                if not isinstance(item.get("field"), str) or not item["field"].strip():
                    errors.append(f"{path}: steps[{index}].outputs_passed_forward[{j}].field must be a non-empty string")
                consumers = item.get("consumers")
                if not isinstance(consumers, list):
                    errors.append(f"{path}: steps[{index}].outputs_passed_forward[{j}].consumers must be a list")
                elif consumers and not all(isinstance(c, int) for c in consumers):
                    errors.append(f"{path}: steps[{index}].outputs_passed_forward[{j}].consumers must be integers")
        depends_on = step.get("depends_on")
        if not isinstance(depends_on, list):
            errors.append(f"{path}: steps[{index}].depends_on must be a list")
        else:
            if step.get("independent_review") is True and depends_on:
                errors.append(f"{path}: independent_review steps may not depend on other steps")
            elif not all(isinstance(dep, int) for dep in depends_on):
                errors.append(f"{path}: steps[{index}].depends_on must contain integers")
        tool = step.get("tool_recommendation")
        if tool is not None:
            if not isinstance(tool, dict):
                errors.append(f"{path}: steps[{index}].tool_recommendation must be a mapping or null")
            else:
                capability = tool.get("capability_class")
                if capability is not None and capability not in ALLOWED_CAPABILITIES:
                    errors.append(f"{path}: steps[{index}].tool_recommendation.capability_class is invalid")
                for key in ["query_template", "materiality"]:
                    if tool.get(key) is not None and (not isinstance(tool.get(key), str) or not tool[key].strip()):
                        errors.append(f"{path}: steps[{index}].tool_recommendation.{key} must be null or a non-empty string")

    if errors:
        return errors

    # Validate dependency references and reject cycles.
    for step in steps:
        step_id = step["step_id"]
        for dep in step.get("depends_on", []):
            if dep not in step_ids:
                errors.append(f"{path}: step {step_id} depends on unknown step {dep}")
        for output in step.get("outputs_passed_forward", []):
            for consumer in output.get("consumers", []):
                if consumer not in step_ids:
                    errors.append(f"{path}: step {step_id} passes output to unknown step {consumer}")

    if errors:
        return errors

    indegree = {step_id: 0 for step_id in step_ids}
    graph: dict[int, list[int]] = defaultdict(list)
    for step in steps:
        step_id = step["step_id"]
        for dep in step.get("depends_on", []):
            graph[dep].append(step_id)
            indegree[step_id] += 1

    queue = deque(sorted(step_id for step_id, deg in indegree.items() if deg == 0))
    visited: list[int] = []
    while queue:
        node = queue.popleft()
        visited.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    if len(visited) != len(step_ids):
        errors.append(f"{path}: workflow contains a cycle")
        return errors

    blockers = workflow.get("blockers", [])
    if blockers:
        if not isinstance(blockers, list):
            errors.append(f"{path}: workflow.blockers must be a list")
        else:
            for index, blocker in enumerate(blockers):
                if not isinstance(blocker, dict):
                    errors.append(f"{path}: blockers[{index}] must be a mapping")
                    continue
                if blocker.get("type") not in ALLOWED_BLOCKER_TYPES:
                    errors.append(f"{path}: blockers[{index}].type must be one of {sorted(ALLOWED_BLOCKER_TYPES)}")
                if not isinstance(blocker.get("condition"), str) or not blocker["condition"].strip():
                    errors.append(f"{path}: blockers[{index}].condition must be a non-empty string")
                affects = blocker.get("affects")
                if not isinstance(affects, list) or not affects or not all(isinstance(x, int) for x in affects):
                    errors.append(f"{path}: blockers[{index}].affects must be a non-empty list of step ids")
                if blocker.get("escalate_to") != "user":
                    errors.append(f"{path}: blockers[{index}].escalate_to must be user")
                if blocker.get("workflow_status") not in ALLOWED_WORKFLOW_STATUS:
                    errors.append(f"{path}: blockers[{index}].workflow_status is invalid")
                if not isinstance(blocker.get("resolution"), str) or not blocker["resolution"].strip():
                    errors.append(f"{path}: blockers[{index}].resolution must be a non-empty string")

    return errors


def gather_paths(root: Path) -> list[Path]:
    if root.is_file():
        return [root]
    if not root.exists():
        fail(f"{root}: path does not exist")
    return sorted(p for p in root.rglob("*") if p.is_file() and p.suffix in {".yaml", ".md"})


root = Path(sys.argv[1]).resolve()
paths = [Path(arg).resolve() for arg in sys.argv[2:]] or gather_paths(root)
errors: list[str] = []
for path in paths:
    errors.extend(validate_workflow(path))

if errors:
    for error in errors:
        print(error, file=sys.stderr)
    raise SystemExit(1)

for path in paths:
    print(f"{path}: ok")
PY
