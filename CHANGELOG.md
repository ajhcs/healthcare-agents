# Changelog

All notable changes to this project will be documented in this file.

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
