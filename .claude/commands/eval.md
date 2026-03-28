Evaluate and improve a healthcare agent's system prompt. Run up to 5 iterations of: generate questions → answer → judge → improve → re-score → commit if better.

**Target agent:** agents/$ARGUMENTS.md

---

## Rules

- NEVER modify `eval/rubric.md` or any file in `eval/role-baselines/`.
- NEVER modify `eval/results.tsv` except to append rows.
- The ONLY file you may edit is `agents/$ARGUMENTS.md`.
- One agent per session. After 5 iterations, print the summary and stop.
- Each iteration is independent. Read the agent file fresh each time. Do NOT reference or build on previous iterations' questions, answers, or analysis.
- You are both the test-taker and the judge. Be rigorous — do not inflate scores.
- Scores across iterations are NOT comparable (different questions). Only the delta within an iteration (same questions, before vs after edit) is meaningful.

---

## Preflight Checks

Run these checks before entering the loop. If ANY fail, print the error message and stop immediately.

1. Verify not on main:
   Run: `git branch --show-current`
   If the result is `main` or `master`, stop with: "❌ Switch to a feature branch first: `git checkout -b eval/$ARGUMENTS`"

2. Verify clean index:
   Run: `git diff --cached --name-only`
   If there is any output, stop with: "❌ You have staged changes. Commit or unstage them first: `git reset HEAD`"

3. Verify clean target file:
   Run: `git diff --name-only -- agents/$ARGUMENTS.md`
   If there is any output, stop with: "❌ agents/$ARGUMENTS.md has uncommitted changes. Commit or stash first."

4. Verify agent file exists:
   Check that `agents/$ARGUMENTS.md` exists. If not, stop with: "❌ No agent file found at agents/$ARGUMENTS.md"

5. Verify rubric exists:
   Check that `eval/rubric.md` exists. If not, stop with: "❌ Frozen rubric not found at eval/rubric.md"

6. Record session-start line count (this value is FIXED for the entire session — do NOT recompute it in later iterations):
   Run: `wc -l < agents/$ARGUMENTS.md`
   Store as BASELINE_LINES.
   Compute LINE_CAP = max(BASELINE_LINES × 1.2, BASELINE_LINES + 50), rounded up to nearest integer.
   Print: "✓ Preflight passed. Baseline: {BASELINE_LINES} lines. Cap: {LINE_CAP} lines."

---

## The Loop

Repeat the following up to 5 times. Number each iteration starting from 1.

### Step 1: Read inputs

- Read `agents/$ARGUMENTS.md` fresh (do not rely on your memory of it from prior iterations).
- Read `eval/role-baselines/$ARGUMENTS.md` if it exists. If not, that is fine — proceed without it.
- Read `eval/rubric.md`.

### Step 2: Generate 25 questions

Generate 25 challenge questions covering the agent's key responsibilities. Draw questions from BOTH:
- The agent's .md content (what it claims to know)
- The role baseline (what it SHOULD know, which may include things the .md omits)

Mix of question types: factual knowledge, applied reasoning, edge cases, cross-domain scenarios. Each iteration must generate FRESH questions — never reuse questions from a prior iteration.

### Step 3: Answer all 25 questions

Answer each question as if you ARE the agent — the .md file is your system prompt. Base your answers ONLY on what the agent .md contains. If the .md does not cover a topic, acknowledge the gap rather than fabricating an answer.

### Step 4: Judge each answer

Read the rubric. For each of the 25 question-answer pairs:
- Score Accuracy (0-4), Completeness (0-4), Specificity (0-4)
- Give a one-line justification per score
- Apply scoring thresholds strictly: Accuracy 3+ requires specific codes/sections, Accuracy 4 requires named sources with dates/CFR numbers
- Compute weighted score per question: (Accuracy × 0.40) + (Completeness × 0.35) + (Specificity × 0.25)

Average weighted scores across 25 questions. Multiply by 25 for a 0-100 score. This is `score_pre_edit`.

### Step 5: Identify weaknesses

From the scores, identify the 2-3 weakest areas (lowest-scoring questions and which criteria drove the low scores).

### Step 6: Edit the agent

Edit `agents/$ARGUMENTS.md` to strengthen the weak areas identified in Step 5. Prefer adding specific guidance to existing sections over rewriting or reorganizing entire sections.

After editing, check line count:
Run: `wc -l < agents/$ARGUMENTS.md`
If the count exceeds LINE_CAP (computed in preflight — do NOT recompute from current file):
  - Immediately run: `git restore agents/$ARGUMENTS.md`
  - Append a row to `eval/results.tsv` with status `capped`, `score_pre_edit` as computed, `score_post_edit` as `N/A`, `delta` as `N/A`, and description noting the line cap was exceeded. The N/A values mark this row as a sentinel — no post-edit scoring occurred.
  - Run: `git add eval/results.tsv && git commit -m "eval: $ARGUMENTS capped (exceeded line limit)"`
  - Skip to the next iteration

### Step 7: Re-score

Re-answer the SAME 25 questions from Step 2 using the EDITED agent .md as your system prompt.
Re-judge using the same rubric. Compute the new 0-100 score. This is `score_post_edit`.

### Step 8: Log and commit

Append a tab-separated row to `eval/results.tsv` BEFORE the commit decision (so every commit/revert path has a row ready to persist):

```
{iteration}\t{$ARGUMENTS}\t{score_pre_edit}\t{score_post_edit}\t{delta}\t{status}\t{weak_areas}\t{description}
```

Where `delta` = score_post_edit - score_pre_edit, and `status` is determined next.

Commit decision (three paths):
- **If score_post_edit > score_pre_edit** (improved):
  ```
  git add agents/$ARGUMENTS.md eval/results.tsv
  git commit -m "eval: $ARGUMENTS {score_pre_edit}→{score_post_edit} (+{delta})"
  ```
- **If score_post_edit <= score_pre_edit** (reverted):
  ```
  git restore agents/$ARGUMENTS.md
  git add eval/results.tsv
  git commit -m "eval: $ARGUMENTS reverted ({delta})"
  ```

(The capped path is handled in Step 6 above.)

---

## Completion

After 5 iterations (or if interrupted), print a summary:

```
=== Eval Complete: $ARGUMENTS ===
Iterations: {N}
Results: {improved} improved, {reverted} reverted, {capped} capped
Starting score (iteration 1 pre-edit): {score}
Retained score on disk (last committed iteration): {score_post_edit from most recent iteration with status=improved, or starting score if none improved}
Last attempted score: {score_post_edit from the last non-capped iteration, or N/A if the final iteration was capped}
Results log: eval/results.tsv
```

Note: "Retained score on disk" reflects the actual state of the agent .md on disk. "Last attempted score" is for the final scored attempt only; capped iterations have no post-edit score and should be shown as `N/A` in the TSV.
