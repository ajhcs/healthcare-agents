# Healthcare Agents v1.1.0 Release Notes

Released: 2026-04-23

This release upgrades the healthcare-agents stack from a broad first release into a calibrated, eval-driven 51-agent library. The work focused on two things: improving every installable healthcare agent, and making the eval/improvement loop reliable enough to run under current SOTA coding and reasoning models.

## Highlights

- Improved all 51 healthcare administration agents.
- Rebuilt the eval workflow around native subagents and model specialization.
- Added role baselines for every installable agent.
- Required exact, persisted Q001-Q025 question artifacts for before/after comparisons.
- Removed the unused Python/DSPy harness and consolidated the project around the lightweight self-improvement workflow.

## Agent Quality Improvements

All 51 prompts were evaluated and improved in two passes:

- First 15 agents: average score improved from 85.0 to 93.9.
- Remaining 36 agents: average score improved from 85.11 to 95.50.

The prompt changes were intentionally narrow. They sharpen role mechanics, regulatory boundaries, source hierarchies, handoffs, deliverables, and edge-case behavior without flattening the agents into generic healthcare-administration assistants.

Major improvement areas included:

- Clinical operations: observation/SNF status, utilization notices, infection prevention attribution, research consent and closeout controls, EMTALA transfer handling, and emergency-preparedness activation details.
- Health IT: Epic master-file dependencies, interoperability replay/backfill controls, USCDI/TEFCA readiness, telehealth payer matrices, PHI extract governance, and AI/ambient documentation controls.
- Payer and value-based care: network adequacy evidence, credentialing adverse-file routing, Medicare outreach boundaries, attribution and quality-gate controls, and downside-risk readiness.
- Quality and population health: CAHPS setting selection, PSWP/PSES boundaries, QI/SPC mechanics, accreditation evidence, surveillance reporting matrices, CBO MOU controls, and community-benefit documentation.
- Revenue and pharmacy: 340B duplicate-discount controls, CDM edit checks, contract analytics source hierarchy, EDI denial workflows, finance reserve boundaries, coding appeal source hierarchy, and medication-safety governance.
- Strategy: actuarial certification/reliance caveats, MLR workflow detail, opportunity-sizing formulas, and predictive-operations validation checks.

## Eval System Changes

The active eval system is now the lightweight self-improvement kit:

- `.claude/commands/eval.md`
- `eval/rubric.md`
- `eval/role-baselines/`
- `eval/meta/`
- `eval/run-logs/README.md`
- `docs/eval/exam-architect-playbook.md`
- `docs/eval/model-tuning.md`

The workflow now prefers four roles when the runtime supports it:

- Parent orchestrator: owns preflight, git writes, run logs, and commit/revert decisions.
- Scorer/judge: strongest available reasoning model; generates exams and critiques answers.
- Editor: faster strong model; edits only the requested agent prompt.
- Adjudicator: optional different model family for close deltas, high-risk roles, or release scoring.

The eval command now requires before/after or score-only baseline runs to persist full question artifacts before answers are generated. Focus labels and weak-area summaries are no longer enough. Retests must identify whether they used exact baseline questions or fresh comparable questions.

## Cleanup

The old Python/DSPy harness was removed because it was not the active path for agent improvement. Deleted components included the deeper harness implementation, schema models, legacy JSON rubrics, tests, and the shell runner.

This reduces maintenance burden and makes the repo's active improvement path clearer for both Codex and Claude Code.

## Validation

Validation performed before release:

- `bash scripts/lint-agents.sh`
- `git diff --check`
- Exact-question retests using retained Q001-Q025 question artifacts for the remaining 36-agent pass.

The final tracked state contains 51 lint-clean agent prompts and the simplified eval stack.
