# Release-Grade Eval Coverage

Date: 2026-05-30

Healthcare Agents now has tracked internal eval evidence for all 51 registry
agents. The release campaign appended latest rows to `eval/results.tsv`,
regenerated `docs/eval/scorecard.md` and `docs/eval/scorecard.json`, and
updated README and release-manifest claims to match the generated scorecard.

Current generated scorecard values:

- 51/51 evaluated agents.
- 51/51 tracked improved agents.
- 94.18 average latest tracked score.

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
