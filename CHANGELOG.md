# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

No unreleased changes.

## [1.6.0] - 2026-07-09

### Added

- Added generated compact workflow-first and agent-fallback router indexes with freshness and context-size validation.
- Added GPT-5.6 model-role, prompting, reasoning-effort, and migration guidance grounded in current OpenAI documentation.
- Added three synthetic HealthAdminBench-derived reliability canaries for prior authorization, denial appeals, and closed-loop DME processing.

### Changed

- Updated the plugin router, generated platform instructions, workflow skills, per-agent skill wrappers, and CLI starter prompts with a compact state-ledger and terminal-completion contract.
- Updated the eval workflow and exam-architect playbook to test long-horizon state, document transitions, and full-task completion separately from subtask quality.
- Replaced the 500-line prompt incentive with a prompt-economy review band and tightened eval growth caps for future compaction passes.
- Bumped npm, installer, Codex plugin, README, changelog, and release metadata to v1.6.0.

## [1.5.0] - 2026-05-31

Operator OS catalog hardening for all 16 healthcare administration workflows.

### Added

- Added the Healthcare Admin Workup Engine with workflow listing, workflow detail, workup routing, and Microsoft/Copilot export commands.
- Added 16 canonical healthcare administration workflows, workflow/platform schemas, centralized safety snippets, platform renderers, routing canaries, platform export validation, snapshot checks, and workflow docs validation.
- Added Claude and Codex workflow skill installation, stronger Codex AGENTS.md generation, GitHub Copilot repository instructions, path instructions, custom agents, prompt files, and issue templates.
- Added Microsoft 365 Copilot declarative agent, Copilot Studio, and Azure AI Foundry export templates for governed enterprise review.
- Added workflow gallery pages, 35 example workup prompts, platform compatibility guides, demo setup folders, and workflow contribution guidance.
- Added a governed npm publication workflow and release publishing runbook for maintainer-authenticated public distribution.
- Added Operator OS coverage metadata and offline-first standard evidence packs for all 16 workflows, including citation-card source families, human owners, verification status, red flags, and PHI/compliance notes.
- Added scaffold generation for workflow-specific Operator OS evidence packs.

### Changed

- Expanded README and INSTALL around workflow-first routing, multi-runtime workflow installs, Copilot compatibility, and enterprise export paths.
- Expanded Operator OS docs with catalog coverage and evidence-pack authoring guidance.
- Bumped package, installer, README badge, and version metadata to v1.5.0.

### Fixed

- Accepted hyphenated `--data-mode` aliases such as `public-evidence` and documented valid data modes in CLI help.

### Validation

- Ran `npm test` / `npm run release:check` successfully on merged main before release edits.
- Dogfooded all 16 workflows through `operator-os coverage --json`, `evidence-pack show <workflow> --json`, `evidence-pack scaffold <workflow>`, and routed `workup ... --target codex --data-mode public-evidence --json`.

See [docs/release-notes/2026-05-31-operator-os-catalog-hardening.md](docs/release-notes/2026-05-31-operator-os-catalog-hardening.md) for full details.

## [1.4.0] - 2026-05-30

Release-grade eval coverage for the full Healthcare Agents catalog.

### Added

- Added latest tracked eval rows for all 51 registry agents in `eval/results.tsv`.
- Added strict full-coverage validation to the release-readiness gate via `REQUIRE_FULL_EVAL_COVERAGE=1 npm run validate:eval-coverage`.
- Added release notes for the 2026-05-30 eval coverage campaign.

### Changed

- Updated all 51 agent prompts with narrow, role-specific improvements retained from canonical eval loops.
- Regenerated `docs/eval/scorecard.md` and `docs/eval/scorecard.json` to show 51/51 evaluated agents, 51/51 tracked improved agents, and a 94.18 average latest tracked score.
- Updated README and `docs/release-manifest.json` claims to match generated scorecard evidence and preserve internal-eval scope limits.
- Bumped package, installer, and version metadata to v1.4.0.

See [docs/release-notes/2026-05-30-release-grade-eval-coverage.md](docs/release-notes/2026-05-30-release-grade-eval-coverage.md) for full details.

## [1.3.0] - 2026-05-21

Product-surface release for registry-backed discovery, safer installs, npm distribution, and public trust/eval artifacts.

### Added

- Added `agents/registry.json` with discovery, routing, handoff, trust, and provenance metadata for all 51 agents.
- Added CLI commands for `list`, `show`, `choose`, `prompt`, and `doctor`, plus slug-validated single-agent installs.
- Added CI gates for installer syntax, agent linting/audit, package dry-run, CLI smoke tests, and installer dry-run.
- Added public eval scorecard generation under `docs/eval/scorecard.md` and `docs/eval/scorecard.json`.
- Added `docs/trust-and-safety.md` for scope, PHI, human escalation, source freshness, and eval limitations.
- Published `healthcare-agents` to npm for direct `npx --yes healthcare-agents ...` usage.

### Changed

- Improved installer dry-run output to show exact planned writes and avoid dry-run directory creation.
- Added npm package scripts and Node engine metadata for distribution readiness.
- Updated install documentation to make npm-backed `npx` the primary path.

See [docs/release-notes/2026-05-21-product-surface-release.md](docs/release-notes/2026-05-21-product-surface-release.md) for full details.

## [1.2.0] - 2026-05-05

Usability release for task-based agent selection, output modes, and handoffs.

### Added

- Added `docs/usage/agent-selection-guide.md` with task-to-agent routing for common healthcare administration jobs.
- Added `docs/usage/starter-prompts.md` with copy-ready prompts across all 10 domains.
- Added `docs/usage/handoff-map.md` for cross-functional workflows and human escalation owners.
- Added release-only usability smoke scenarios in `docs/eval/usability-release-check.md`.

### Changed

- Added role-tailored `Best Inputs`, `Output Modes`, and `Collaboration & Handoffs` sections to all 51 agents.
- Updated README discovery flow, installer-managed Codex guidance, contribution template, lint checks, and audit scoring for the new usability contract.
- Bumped package and installer metadata to v1.2.0 for GitHub-backed installs.

See [docs/release-notes/2026-05-05-usability-release.md](docs/release-notes/2026-05-05-usability-release.md) for full details.

## [1.1.2] - 2026-04-23

Documentation correction for npm-backed install commands.

### Changed

- Updated README and INSTALL examples to use `npx --yes github:ajhcs/healthcare-agents` because the package name is not published to npm from this environment yet.
- Bumped installer/package metadata to v1.1.2 so GitHub-backed npx installs report the latest compatibility release.

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
