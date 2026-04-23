# Eval Run Logs

`eval/run-logs/` is for local provenance artifacts produced by `/eval`.

Raw run logs are ignored by default because they may be bulky, model-specific, or contain sensitive prompt/response details. Commit a run log only when it is deliberately promoted for review, and first verify that it contains no API keys, secrets, PHI, patient data, or private operational credentials.

Recommended per-run layout:

```text
eval/run-logs/<timestamp>-<agent-slug>/
  manifest.json
  agent-before.md
  agent-after.md
  questions.md
  questions.json
  scorer-output-pre.json
  editor-brief.md
  scorer-output-post.json
  git.diff
  summary.md
```

`questions.md` is mandatory for every scored run. It must preserve all full question prompts exactly as scored, not just focus rows or weak-area labels. `questions.json` is recommended for machine-readable consolidation.

Each question record should include:

- `id`: `Q001` through `Q025`
- `prompt`: full question text
- `type`: factual mechanics, applied reasoning, edge case, cross-domain scenario, or deliverable production
- `source_basis`: agent prompt, role baseline, playbook blueprint, train bank, validation bank, holdout bank, or calibration case
- `expected_coverage`
- `scoring_emphasis`

`manifest.json` should record exact model IDs, git state, file hashes, rubric hash, baseline hash, question source, question artifact paths, line cap, status, and calibration status.

For before/after experiments, post-edit retests may be called `baseline-exact` only when all full baseline question prompts are present and reused verbatim. If the baseline artifact contains only focus rows or paraphrases, mark the retest as `fresh-comparable`.
