# Eval Meta-Evals

These lightweight checks keep the markdown eval loop calibrated without adding a harness. They are meant for Claude Code, Codex, or another parent orchestrator to run manually before major eval batches, release scoring, or suspicious score decisions.

## Files

- `judge-calibration-cases.md`: role-family answer examples that test whether a scorer applies `eval/rubric.md` strictly.
- `scorer-consistency-check.md`: repeatability and bias checks for judge drift.
- `prompt-overfitting-check.md`: checks that prompt edits improve role capability instead of memorizing questions or broadening into generic healthcare administration.

## When To Run

- Before a release scoring batch.
- When switching scorer model classes or exact model IDs.
- When a model update changes judge tone, strictness, or citation behavior.
- When an eval delta is small, surprising, or driven by verbosity.
- After several retained edits to the same agent.

## Operating Rules

- Keep all meta-eval runs read-only unless the task is explicitly to edit these docs.
- Use the frozen rubric as the scoring authority.
- Record exact model IDs, date, effort, temperature, and search/tool settings in the run manifest when one exists.
- Prefer a different model family for adjudication when possible.
- Search stays off unless a separate run explicitly tests source-research behavior.
- Do not modify `eval/rubric.md`, role baselines, or `eval/results.tsv` except through the canonical eval workflow.

## Minimal Pass/Warning/Fail

Use this summary for a calibration note in a run manifest or final report:

- `passed`: scorer applies score caps, penalizes unsupported specificity, and gives stable results across order changes.
- `warning`: scorer is usable but shows mild verbosity bias, inconsistent thresholds, or weak role-boundary enforcement.
- `failed`: scorer gives high scores to hallucinated citations, unsafe omissions, role-boundary violations, or materially changes scores under answer-order swaps.

## Recommended Sequence

1. Run 2-3 cases from `judge-calibration-cases.md` that match the target role family.
2. Run the short scorer consistency protocol if the eval result will be committed or used for release decisions.
3. Run the prompt-overfitting check after retained edits or before a holdout/validation pass.
4. Record `calibration_status` and any warning in the run manifest or final eval summary.
