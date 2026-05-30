# Healthcare Agents v1.4.0 Release Notes

Date: 2026-05-30

This minor release makes the eval evidence posture match the product surface:
every installable Healthcare Agents specialist now has tracked internal
prompt-rubric evidence.

The release campaign appended latest rows to `eval/results.tsv`, regenerated
`docs/eval/scorecard.md` and `docs/eval/scorecard.json`, and updated README
and release-manifest claims to match the generated scorecard.

Current generated scorecard values:

- 51/51 evaluated agents.
- 51/51 tracked improved agents.
- 94.18 average latest tracked score.

## What Changed

- Retained narrow, role-specific prompt improvements for all 51 agents from
  canonical eval loops.
- Closed the previous 41-agent eval backlog while preserving the lightweight
  markdown eval workflow.
- Added strict full-coverage validation to the local release gate.
- Updated package, installer, README, changelog, and version metadata for v1.4.0.

## Evidence Artifacts

- `eval/results.tsv`
- `docs/eval/scorecard.md`
- `docs/eval/scorecard.json`
- `docs/release-manifest.json`
- `scripts/release-readiness.sh`

Scope limits remain unchanged: these are internal prompt-rubric scores for prompt
quality and task coverage. They are not certification, accreditation, legal
review, coding validation, billing approval, clinical validation, compliance
approval, or proof that any runtime is appropriate for PHI.

Validation commands:

```bash
npm run validate:registry
npm run validate:safety
npm run validate:scorecard
REQUIRE_FULL_EVAL_COVERAGE=1 npm run validate:eval-coverage
npm test
```
