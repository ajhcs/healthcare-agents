Evaluate and improve one healthcare agent's system prompt. Run up to 5 iterations of: prepare fixed questions -> answer -> judge -> improve -> re-score -> commit if better.

**Target agent:** agents/$ARGUMENTS.md

---

## Support Docs

Read these as operating instructions for the eval run:

- `eval/rubric.md` — frozen scoring metric.
- `eval/role-baselines/$ARGUMENTS.md` — frozen expected-capability baseline for this agent.
- `eval/role-baselines/INDEX.md` — confirms baseline coverage for all installable agents.
- `docs/eval/exam-architect-playbook.md` — scorer and question-writing guidance.
- `docs/eval/model-tuning.md` — model-role and manifest guidance for current SOTA models.
- `eval/meta/README.md` and linked meta-eval docs — optional calibration checks for release or close-call scoring.

Do not use or recreate the retired Python/DSPy harness. The active system is this command, the frozen rubric, role baselines, optional local run logs, and git.

---

## Preferred Execution Mode

When the runtime supports native subagents, model routing, or specialist workers, prefer a four-role loop:

- **Parent orchestrator** — owns preflight checks, fixed-question persistence within an iteration, line-cap enforcement, local run logs, `eval/results.tsv` append, and commit/revert.
- **Scorer/judge** — strongest available reasoning model; read-only; generates the exam, scores answers, checks calibration risk, and returns structured critique.
- **Editor** — faster strong model; edits only `agents/$ARGUMENTS.md` using the scorer's brief.
- **Adjudicator** — optional different model family for close deltas, high-risk roles, suspicious scoring, or release scoring.

Do not recursively invoke a full agent CLI inside itself when native subagents are available. If no subagents are available, a single agent may run the same workflow end-to-end.

Use `docs/eval/model-tuning.md` for model-role guidance. Pin exact model IDs in run logs when the runtime exposes them; do not rely only on UI or marketing names.

---

## Rules

- Never modify `eval/rubric.md`.
- Never modify files in `eval/role-baselines/` during an eval run.
- Never modify `eval/results.tsv` except to append rows.
- The editor may edit only `agents/$ARGUMENTS.md`.
- The parent may write local run artifacts under `eval/run-logs/`.
- One agent per session. After 5 iterations, print the summary and stop.
- Each iteration is independent. Read the agent file fresh each time.
- Scores across iterations are not comparable because questions differ. Only the same-question pre/post delta within an iteration is meaningful.
- Do not broaden the role into generic healthcare administration. Preserve the agent's specialty, practitioner voice, and strongest differentiators.
- Prefer sharpening missing mechanics, formulas, workflows, citations, and deliverables over adding broad best-practices boilerplate.
- Do not log API keys, secrets, PHI, patient data, or private operational credentials.

---

## Preflight Checks

Run these checks before entering the loop. If any fail, print the error message and stop immediately.

1. Verify not on main:
   Run: `git branch --show-current`
   If the result is `main` or `master`, stop with: "Switch to a feature branch first: `git checkout -b eval/$ARGUMENTS`"

2. Verify clean index:
   Run: `git diff --cached --name-only`
   If there is any output, stop with: "You have staged changes. Commit or unstage them first: `git reset HEAD`"

3. Verify clean target file:
   Run: `git diff --name-only -- agents/$ARGUMENTS.md`
   If there is any output, stop with: "agents/$ARGUMENTS.md has uncommitted changes. Commit or stash first."

4. Verify agent file exists:
   Check that `agents/$ARGUMENTS.md` exists. If not, stop with: "No agent file found at agents/$ARGUMENTS.md"

5. Verify required eval files exist:
   Required:
   - `eval/rubric.md`
   - `eval/role-baselines/$ARGUMENTS.md`
   - `docs/eval/exam-architect-playbook.md`
   - `docs/eval/model-tuning.md`

   If the role baseline is missing, stop and create the baseline first. Baselines are now expected for all 51 installable agents.

6. Record session-start line count:
   Run: `wc -l < agents/$ARGUMENTS.md`
   Store as `BASELINE_LINES` for the whole session. Do not recompute it in later iterations.
   Compute `LINE_CAP = max(BASELINE_LINES * 1.2, BASELINE_LINES + 50)`, rounded up.
   Print: "Preflight passed. Baseline: {BASELINE_LINES} lines. Cap: {LINE_CAP} lines."

7. Create a local run-log directory:
   Use `eval/run-logs/<timestamp>-<agent-slug>/`.
   Raw run logs are ignored by git by default. See `eval/run-logs/README.md`.

---

## The Loop

Repeat the following up to 5 times. Number each iteration starting from 1.

### Step 1: Read Inputs

Read fresh:

- `agents/$ARGUMENTS.md`
- `eval/role-baselines/$ARGUMENTS.md`
- `eval/rubric.md`
- `docs/eval/exam-architect-playbook.md`
- `docs/eval/model-tuning.md`

For release scoring, close deltas, or high-risk agents, also read:

- `eval/meta/judge-calibration-cases.md`
- `eval/meta/scorer-consistency-check.md`
- `eval/meta/prompt-overfitting-check.md`

### Step 2: Prepare 25 Questions

Choose the question source in this order:

1. If a deliberate train bank exists at `eval/question-banks/train/$ARGUMENTS.md`, use it for weakness discovery.
2. Otherwise generate 25 fresh questions from the agent prompt, role baseline, and `docs/eval/exam-architect-playbook.md`.
3. Use validation-bank questions only after a retained edit, and only for confidence checking.
4. Never use holdout-bank questions to guide edits.

Draw questions from both:

- The agent prompt: what it claims to know.
- The role baseline: what the role should know, including omitted responsibilities.

Default mix:

- 5 factual mechanics
- 8 applied reasoning
- 5 edge cases
- 4 cross-domain scenarios
- 3 deliverable-production prompts

Persist the exact questions for the iteration in the run log before answering them. Reuse these same questions for the post-edit re-score within the same iteration.

### Step 3: Answer All Questions

Answer each question as if you are the target agent, with `agents/$ARGUMENTS.md` as the system prompt.

Use only the agent prompt as the answerer's authority. If the prompt does not cover a topic, acknowledge the gap instead of fabricating detail.

### Step 4: Judge Each Answer

The scorer reads `eval/rubric.md` and scores each question-answer pair independently:

- Accuracy: 0-4
- Completeness: 0-4
- Specificity: 0-4

Apply the rubric strictly:

- Accuracy 3+ requires specific codes, sections, standards, source families, or concrete authority references when the role calls for them.
- Accuracy 4 requires the most specific authority level the prompt makes available.
- Do not grant high accuracy for invented citations.
- Do not reward verbosity when the answer is vague or unsafe.
- Cite evidence from the answer and prompt; do not score from preference alone.

Compute weighted score per question:

```text
(Accuracy * 0.40) + (Completeness * 0.35) + (Specificity * 0.25)
```

Average across 25 questions and multiply by 25 for a 0-100 score. This is `score_pre_edit`.

The scorer output must include structured criterion detail:

```json
{
  "question_source": "generated | train-bank | validation-bank | holdout-bank | calibration",
  "score_pre_edit": 0,
  "criteria_summary": {
    "accuracy": {"score": 0, "evidence": "..."},
    "completeness": {"score": 0, "evidence": "..."},
    "specificity": {"score": 0, "evidence": "..."}
  },
  "weaknesses": [
    {
      "criterion": "accuracy | completeness | specificity",
      "question_ids": ["Q003"],
      "issue": "...",
      "proposed_prompt_change": "..."
    }
  ],
  "identity_to_preserve": [],
  "anti_patterns_to_avoid": []
}
```

### Step 5: Produce Improvement Brief

From the scores, identify the 2-3 weakest areas. The scorer gives the editor a narrow improvement brief containing:

- 2-4 representative low-scoring questions or paraphrased failure patterns.
- 2-4 targeted prompt changes with expected gain.
- The rubric criterion each change should improve.
- `identity_to_preserve`: role traits, sections, and differentiators that must survive editing.
- `anti_patterns_to_avoid`: generic broadening, duplicated boilerplate, bland executive-speak, or question-specific patching.

Do not reveal hidden holdout material or answer-key wording to the editor.

### Step 6: Edit The Agent

Edit `agents/$ARGUMENTS.md` to strengthen the weak areas identified in Step 5.

Editor constraints:

- Implement the highest-leverage 1-3 changes first.
- Prefer adding specific guidance to existing sections over rewriting or reorganizing entire sections.
- Preserve all items under `identity_to_preserve`.
- Avoid all listed anti-patterns.
- Do not edit eval files, baselines, docs, or other agents.

After editing, check line count:

```bash
wc -l < agents/$ARGUMENTS.md
```

If the count exceeds `LINE_CAP`:

1. Immediately run `git restore agents/$ARGUMENTS.md`.
2. Append a row to `eval/results.tsv` with status `capped`, `score_post_edit` as `N/A`, and `delta` as `N/A`.
3. Write a capped summary in the run log.
4. Run `git add eval/results.tsv && git commit -m "eval: $ARGUMENTS capped (exceeded line limit)"`.
5. Skip to the next iteration.

### Step 7: Re-Score

Re-answer the same 25 questions from Step 2 using the edited agent prompt.

Re-judge using the same rubric and scoring method. This is `score_post_edit`.

If the delta is small, the role is high-risk, or the scorer behavior looks suspect, run the adjudicator or meta-eval checks described in `eval/meta/`.

### Step 8: Log And Commit

Before any commit/revert decision:

1. Write run-log artifacts for the iteration, including:
   - `manifest.json`
   - `questions.md`
   - `scorer-output-pre.json`
   - `editor-brief.md`
   - `scorer-output-post.json`
   - `summary.md`
2. Ensure the manifest records exact model IDs when available, git state, file hashes, rubric hash, baseline hash, question source, line cap, status, and calibration status.
3. Append a tab-separated row to `eval/results.tsv`:

```text
{iteration}\t{$ARGUMENTS}\t{score_pre_edit}\t{score_post_edit}\t{delta}\t{status}\t{weak_areas}\t{description}
```

The existing TSV schema remains unchanged. Put the run-log directory path in `description` when one exists.

Commit decision:

- If `score_post_edit > score_pre_edit`:

  ```bash
  git add agents/$ARGUMENTS.md eval/results.tsv
  git commit -m "eval: $ARGUMENTS {score_pre_edit}->{score_post_edit} (+{delta})"
  ```

- If `score_post_edit <= score_pre_edit`:

  ```bash
  git restore agents/$ARGUMENTS.md
  git add eval/results.tsv
  git commit -m "eval: $ARGUMENTS reverted ({delta})"
  ```

Do not commit raw `eval/run-logs/` artifacts unless a human explicitly asks to promote a run log for review.

---

## Completion

After 5 iterations, or if interrupted, print:

```text
=== Eval Complete: $ARGUMENTS ===
Iterations: {N}
Results: {improved} improved, {reverted} reverted, {capped} capped
Starting score: {iteration 1 score_pre_edit}
Retained score on disk: {score_post_edit from most recent improved iteration, or starting score if none improved}
Last attempted score: {score_post_edit from the last non-capped iteration, or N/A}
Results log: eval/results.tsv
Run log: eval/run-logs/<timestamp>-<agent-slug>/
Models: parent={id}, scorer={id}, editor={id}, adjudicator={id or none}
Calibration: {not-run | passed | warning | failed}
```

Remember: retained score reflects the actual agent prompt on disk. Last attempted score may include a reverted edit.

---

## Scaling Pattern

When improving many agents:

- Run one agent per branch or worktree to avoid file and commit collisions.
- Keep scorers and adjudicators read-only.
- Keep editors single-file.
- Let the parent orchestrator own git writes and `eval/results.tsv`.
- Stop early when an agent clears the target score or recent deltas are too small to justify another pass.
- Use role baselines for every agent; missing baselines are now a setup failure.

For Codex and Claude Code under newer models:

- Scorer/judge: strongest available reasoning model.
- Editor: faster strong model.
- Parent: reliable tool-using orchestrator.
- Adjudicator: different strong model family when available.
