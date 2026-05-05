# Healthcare Agents v1.2.0 Release Notes

Released: 2026-05-05

This release makes the 51-agent healthcare administration library easier to use
without adding runtime complexity. The prompts remain plain Markdown and
generated `SKILL.md` packages, but the user experience is now more explicit:
choose the right agent, provide the right inputs, request the right output mode,
and see the right handoffs when work crosses departments.

## Highlights

- Added task-based agent selection docs for common healthcare administration jobs.
- Added copy-ready starter prompts across all 10 domains.
- Added a cross-agent handoff map for workflows that span departments.
- Added role-tailored `Best Inputs`, `Output Modes`, and `Collaboration & Handoffs` sections to all 51 agent prompts.
- Updated installer-managed Codex guidance so installed users get the new routing, output-mode, and handoff behavior.
- Added release-only usability smoke scenarios for future checks.

## Agent Usability Improvements

Every agent now tells users what information produces the strongest answer,
which output modes it supports, which adjacent agents to involve, and which human
owners must make final high-risk decisions.

The four standardized output modes are:

- `quick triage`: likely root causes, missing data, immediate checks, escalation triggers.
- `workplan`: owners, dependencies, KPIs, sequence, validation checkpoints.
- `audit/checklist`: evidence requests, pass/fail criteria, remediation owners.
- `artifact/template`: a draft deliverable with assumptions, placeholders, and review notes.

## Documentation

New usage docs:

- `docs/usage/agent-selection-guide.md`
- `docs/usage/starter-prompts.md`
- `docs/usage/handoff-map.md`
- `docs/eval/usability-release-check.md`

The README now includes a compact "Choose the Right Agent" section with common
starting points and output modes.

## Validation

Validation performed before release:

- `bash scripts/lint-agents.sh`
- `python3 scripts/audit-agents.py --top 20`
- `bash install.sh --all --dry-run`
- `node bin/cli.js --help`
- `git diff --check`
- Usability smoke scenarios from `docs/eval/usability-release-check.md`
