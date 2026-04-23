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
  scorer-output-pre.json
  editor-brief.md
  scorer-output-post.json
  git.diff
  summary.md
```

`manifest.json` should record exact model IDs, git state, file hashes, rubric hash, baseline hash, question source, line cap, status, and calibration status.
