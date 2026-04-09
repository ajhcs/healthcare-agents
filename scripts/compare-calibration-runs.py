#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import defaultdict
from pathlib import Path
from typing import Any

import yaml


def load_yaml(path: Path) -> Any:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def run_manifest(root: Path, run_id: str) -> dict[str, Any]:
    return load_yaml(root / "calibration" / "run-manifests" / f"{run_id}.yaml")


def agent_means(root: Path, run_id: str) -> dict[str, float]:
    scores: dict[str, list[float]] = defaultdict(list)
    run_dir = root / "calibration" / "results" / run_id
    for path in sorted(run_dir.glob("*.gap.yaml")):
        data = load_yaml(path)
        agent_slug = data.get("agent_slug")
        weighted = data.get("scores", {}).get("weighted_total")
        if isinstance(agent_slug, str) and isinstance(weighted, (int, float)):
            scores[agent_slug].append(float(weighted))
    return {
        agent_slug: round(sum(values) / len(values), 3)
        for agent_slug, values in scores.items()
        if values
    }


def compare_runs(baseline_root: Path, baseline_run: str, candidate_root: Path, candidate_run: str) -> dict[str, Any]:
    baseline_manifest = run_manifest(baseline_root, baseline_run)
    candidate_manifest = run_manifest(candidate_root, candidate_run)
    baseline_agents = agent_means(baseline_root, baseline_run)
    candidate_agents = agent_means(candidate_root, candidate_run)
    all_agents = sorted(set(baseline_agents) | set(candidate_agents))

    per_agent = []
    improved = 0
    regressed = 0
    unchanged = 0
    for agent_slug in all_agents:
        baseline_value = baseline_agents.get(agent_slug, 0.0)
        candidate_value = candidate_agents.get(agent_slug, 0.0)
        delta = round(candidate_value - baseline_value, 3)
        if delta > 0:
            improved += 1
        elif delta < 0:
            regressed += 1
        else:
            unchanged += 1
        per_agent.append(
            {
                "agent_slug": agent_slug,
                "baseline_mean": baseline_value,
                "candidate_mean": candidate_value,
                "delta": delta,
            }
        )

    baseline_mean = float(baseline_manifest.get("mean_calibration_score", 0.0))
    candidate_mean = float(candidate_manifest.get("mean_calibration_score", 0.0))
    return {
        "baseline_run": baseline_run,
        "candidate_run": candidate_run,
        "overall": {
            "baseline_mean": baseline_mean,
            "candidate_mean": candidate_mean,
            "delta": round(candidate_mean - baseline_mean, 3),
            "agents_improved": improved,
            "agents_regressed": regressed,
            "agents_unchanged": unchanged,
        },
        "per_agent": per_agent,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline-root", default=".")
    parser.add_argument("--baseline-run", required=True)
    parser.add_argument("--candidate-root", default=".")
    parser.add_argument("--candidate-run", required=True)
    args = parser.parse_args()

    comparison = compare_runs(
        Path(args.baseline_root).resolve(),
        args.baseline_run,
        Path(args.candidate_root).resolve(),
        args.candidate_run,
    )
    print(yaml.safe_dump(comparison, sort_keys=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
