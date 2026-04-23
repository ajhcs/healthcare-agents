# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-04-23

Installer and documentation compatibility release.

### Changed

- Normalized all agent frontmatter `name` fields to lowercase hyphen slugs for Claude Code and OpenCode compatibility.
- Added `display_name` frontmatter to preserve human-readable agent names.
- Expanded the installer with aliases for Codex App, Claude Desktop, Claude Cowork, OpenCode, and portable SKILL.md targets.
- Generated valid per-agent `SKILL.md` folders for Claude Skills, OpenCode skills, and the open `.agents/skills` convention.
- Updated Codex install behavior to write a managed `~/.codex/AGENTS.md` discovery block.
- Refreshed `README.md` and `INSTALL.md` for v1.1.x, current eval status, and cross-tool install paths.
- Updated the self-improvement kit installer to copy all role baselines, not only the medical coding baseline.

## [1.1.0] - 2026-04-23

Agent-stack optimization release for the full 51-agent healthcare administration library.

### Changed

- Improved all 51 healthcare agent prompts through same-question before/after eval passes.
- Raised the first 15 evaluated agents from an 85.0 average score to 93.9.
- Raised the remaining 36 evaluated agents from an 85.11 average score to 95.50.
- Added more role-specific mechanics, compliance boundaries, source hierarchies, workflow handoffs, and deliverable requirements across clinical, operations, payer, quality, health IT, population health, pharmacy, revenue, and strategy agents.
- Reworked the eval workflow for modern SOTA model routing with parent orchestrator, scorer/judge, editor, and optional adjudicator roles.
- Required reusable full-question artifacts for before/after evals so score deltas can be audited against exact Q001-Q025 prompts.

### Added

- Role baselines for all 51 installable healthcare agents.
- Eval scorer guidance in `docs/eval/exam-architect-playbook.md`.
- Current model-routing guidance in `docs/eval/model-tuning.md`.
- Meta-eval checks for judge calibration, scorer consistency, and prompt-overfitting risk.
- Local run-log documentation for retained questions, scorer outputs, editor briefs, and summaries.

### Removed

- Retired the unused Python/DSPy eval harness and related schema, rubric, test, and runner files.
- Removed the standalone eval exam architect agent prompt in favor of the documented eval skill/playbook workflow.

See [docs/release-notes/2026-04-23-agent-stack-optimization.md](docs/release-notes/2026-04-23-agent-stack-optimization.md) for full details.

## [1.0.0] - 2026-04-09

Initial release of the healthcare-agents repository.

### Added

- 51 healthcare administration agent system prompts across 10 categories: Revenue, Clinical, Quality, Payer, Operations, Health IT, Population Health, Pharmacy, Strategy, and Emergency Preparedness.
- Karpathy-style automated eval loop (`/eval` command) with frozen rubric (Accuracy 0.40, Completeness 0.35, Specificity 0.25).
- Split-role scoring architecture: strong judge model generates exams and critiques, fast editor model patches prompts, parent orchestrator owns git writes.
- Identity-preservation constraints to prevent prompt drift during automated improvement.
- Git-ratcheted commit strategy: improvements commit atomically, regressions revert automatically.
- Append-only results log at `eval/results.tsv`.
- 10 agents improved to 80+ scores through the eval loop, including Revenue Medical Coding Specialist (82.15), Revenue Finance Manager (81.55), and Revenue 340B Program Manager (81.20).
- Cross-tool self-improvement kit and agent quality review infrastructure.

See [docs/release-notes/2026-04-09-eval-loop-milestone.md](docs/release-notes/2026-04-09-eval-loop-milestone.md) for full details.
