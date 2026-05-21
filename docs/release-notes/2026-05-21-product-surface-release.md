# Healthcare Agents v1.3.0 Release Notes

Released: 2026-05-21

This release turns Healthcare Agents from a portable prompt pack into a more
usable product surface. The 51 specialist healthcare administration agents are
now easier to discover, inspect, route, install selectively, and evaluate before
use.

## Highlights

- Published the package to npm as `healthcare-agents`.
- Added registry-backed discovery and provenance metadata for all 51 agents.
- Added CLI commands for `list`, `show`, `choose`, `prompt`, and `doctor`.
- Added single-agent install support with slug validation.
- Improved installer dry-run and doctor output for safer file writes.
- Added public eval scorecard generation.
- Added trust and safety documentation covering scope, PHI limits, human
  escalation, source freshness, and eval interpretation limits.
- Added CI gates for lint, audit, package, CLI, and installer smoke checks.

## CLI Product Surface

The CLI now supports direct discovery workflows:

```bash
npx --yes healthcare-agents list
npx --yes healthcare-agents show revenue-cycle-specialist
npx --yes healthcare-agents choose "clean claim rate dropped"
npx --yes healthcare-agents prompt quality-compliance-officer --mode audit/checklist
npx --yes healthcare-agents doctor
```

Users can now install one agent instead of the full pack:

```bash
npx --yes healthcare-agents install revenue-cycle-specialist --codex --dry-run
```

## Trust And Evaluation

The new registry and scorecard make the library easier to inspect without
opening every prompt manually. Scores remain internal prompt-rubric results, not
external certification, accreditation, legal review, coding validation, billing
approval, clinical validation, or compliance approval.

The prompts still do not create a PHI-safe runtime. Use approved environments,
minimum-necessary data, local source verification, and human sign-off for final
clinical, legal, coding, billing, audit, compliance, contracting, employment, or
executive decisions.

## Validation

Validation performed before release:

- `bash -n install.sh`
- `bash scripts/lint-agents.sh`
- `python3 scripts/audit-agents.py --top 10`
- `npm pack --dry-run`
- `node bin/cli.js --help`
- `node bin/cli.js list`
- `bash install.sh --all --dry-run`
- `node -c bin/cli.js`
- `node -c scripts/generate-scorecard.js`
- `git diff --check`
- GitHub Actions CI on pull request and `main`
