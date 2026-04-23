# Eval Model Tuning

This guide is volatile operating guidance for healthcare-agent eval runs. It should age by model class and role contract, not by hard-coded marketing names.

Use the strongest current models available for judgment and adjudication, and use faster bounded models for edits. Examples such as GPT-5.5, Mythos, and Opus 4.7 should be treated as examples of model classes, not stable run identifiers. Every recorded run must pin the exact model ID actually used.

## Roles

| Role | Model class | Effort | Temperature | Tools and search | Contract |
|---|---|---:|---:|---|---|
| Parent orchestrator | Reliable coding/agent model | Medium | 0-0.3 | Filesystem and git allowed | Owns preflight, fixed-question persistence, line caps, run manifests, result logging, commit/revert. |
| Scorer/judge | Strongest available reasoning model | High or max | 0-0.2 | Read-only files; no web unless the run explicitly permits it | Generates questions, scores answers against `eval/rubric.md`, cites evidence from the answer, and produces an improvement brief. |
| Editor | Fast strong coding/writing model | Low-medium | 0.2-0.5 | Edit only the assigned agent prompt | Implements the scorer brief without broadening the role or changing eval files. |
| Adjudicator | Strong reasoning model from a different family than the scorer when possible | High or max | 0-0.2 | Read-only | Resolves close, disputed, or suspicious scoring decisions. |
| Meta-eval judge | Strongest available model or mixed panel | High or max | 0-0.2 | Read-only | Checks scorer drift, bias, calibration cases, and overfitting risk. |

## Model Selection

Choose by role capability, then pin the exact ID in the run manifest.

- Parent orchestrator: prioritize reliable tool use, git discipline, and local-file awareness. It does not need to be the most expensive reasoning model.
- Scorer/judge: use the best available reasoning model, especially for release scoring, close deltas, role-boundary calls, and safety/compliance-heavy agents.
- Editor: use a model that edits cleanly and follows file boundaries. It should be good enough to implement targeted prompt changes, but it should not be the final judge of its own work.
- Adjudicator: prefer a different model family or provider lineage than the scorer when available. If the scorer used a GPT-5.5-class model, an Opus 4.7-class or Mythos-class adjudicator is useful; reverse the pairing if those roles are swapped.
- Meta-eval judge: use the strongest available model or a small mixed panel when judge drift would materially affect a release decision.

Avoid treating names like GPT-5.5, Mythos, or Opus 4.7 as magic labels. The model class matters less than the exact deployed model, date, configuration, and role isolation.

## Runtime Settings

- Scorer/judge: high reasoning effort, low temperature, concise but evidence-rich output.
- Editor: moderate effort, moderate temperature, bounded by the improvement brief and line cap.
- Parent: deterministic settings are preferred because it is making filesystem and git decisions.
- Adjudicator/meta-eval: high reasoning effort, low temperature, and explicit comparison against calibration expectations.
- Search: default off for normal `/eval` scoring because the rubric judges against the agent prompt, not external truth. Enable search only for a separately documented research or baseline-building run.
- Tools: scorer, adjudicator, and meta-eval roles should be read-only. The parent owns writes to `eval/results.tsv`, manifests, and git. The editor only touches the target agent file during a normal eval run.

## Prompting Style

Newer instruction-following models usually need clear contracts more than heavy imperative phrasing.

- State file boundaries and role boundaries once, concretely.
- Ask judges to cite response evidence, not preference or external memory.
- Ask editors for targeted improvements tied to scored weaknesses.
- Avoid generic "make it better" instructions.
- Avoid excessive all-caps language except for frozen safety rules already present in canonical workflow files.

## Manifest Fields

When a run log exists, record at least:

- `agent_slug`
- `timestamp_utc`
- `git_branch`
- `git_commit_before`
- `git_commit_after` when available
- `target_file_hash_before`
- `target_file_hash_after`
- `rubric_hash`
- `role_baseline_hash` or `null`
- `question_source`: generated, train-bank, validation-bank, holdout-bank, or calibration
- `question_artifact`: path to the full preserved question set, usually `questions.md`
- `question_artifact_complete`: true only when all full prompts are present
- `parent_runtime`: Claude Code, Codex, or other runtime
- `parent_model_id`
- `parent_effort`
- `scorer_model_id`
- `scorer_effort`
- `scorer_temperature`
- `editor_model_id`
- `editor_effort`
- `editor_temperature`
- `adjudicator_model_id` or `null`
- `meta_eval_model_id` or `null`
- `search_enabled`
- `tool_permissions`
- `line_cap`
- `status`: improved, reverted, capped, calibration-only, or review-only
- `calibration_status`: not-run, passed, warning, or failed

Exact model IDs should be copied from the runtime or provider response, not inferred from UI labels. If only a UI label is available, record the label and mark `model_id_precision` as `ui-label-only`.

## When To Escalate

Use an adjudicator or meta-eval pass when:

- `score_post_edit - score_pre_edit` is small enough that judge noise could flip the decision.
- The scorer rewards a long answer that is vague or unsafe.
- The scorer gives high accuracy without citations required by the rubric.
- The edit improves the exam questions but weakens the agent's role identity.
- The target role is compliance, legal-risk, patient safety, coding, payment integrity, medication safety, or another high-risk domain.

## What Not To Do

- Do not reintroduce the retired Python harness.
- Do not add DSPy, GEPA, MIPRO, OpenRouter benchmark routing, or external benchmark automation to the normal loop.
- Do not let the editor choose the final score.
- Do not compare scores across different question sets as if they were interchangeable.
- Do not log secrets, API keys, PHI, patient data, or private operational credentials.
