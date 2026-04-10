# Karpathy-Style Eval Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/eval` slash command that tests a healthcare agent, improves its system prompt, and commits if the score improves — running entirely inside Claude Code with zero API cost.

**Architecture:** A Claude Code slash command (`.claude/commands/eval.md`) reads an agent .md, generates 25 challenge questions, answers them, judges them against a frozen rubric (`eval/rubric.md`), edits the agent to fix weaknesses, re-scores the same questions, and commits if improved. Git as ratchet. Up to 5 iterations per invocation.

**Tech Stack:** Claude Code slash commands (markdown), git, `wc -l`. No Python, no dependencies.

**Spec:** `docs/superpowers/specs/2026-03-21-karpathy-eval-loop-design.md`

**Note on old pipeline:** The previous 6,771-line Python pipeline (eval/schema/, eval/harness/, agents/eval-exam-architect.md) is superseded by this design. Those files can be archived or deleted at any time — they are not used by this system.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `.claude/commands/eval.md` | Create | The program — all loop logic, preflight checks, scoring, commit gate |
| `eval/rubric.md` | Create | Frozen scoring metric — 3 criteria, 0-4 scale, 15 anchor definitions |
| `eval/results.tsv` | Create | Seed with header row |
| `eval/role-baselines/revenue-medical-coding-specialist.md` | Create | First role baseline for blind spot detection |

Four files total. No tests — this is a Claude Code slash command (markdown), not code. Validation is running `/eval` against a real agent and inspecting results.

---

### Task 1: Create the frozen rubric

**Files:**
- Create: `eval/rubric.md`

This is the frozen metric. Once written, the eval loop can never modify it.

- [ ] **Step 1: Write `eval/rubric.md`**

Write the following content exactly:

```markdown
# Healthcare Agent Evaluation Rubric

> **FROZEN** — This file is the evaluation metric. The eval loop must NEVER modify it.
> Changing this file changes what "good" means, invalidating all prior scores.

## Scale

| Level | Score | General Definition |
|-------|-------|--------------------|
| Exemplary | 4 | Correct, comprehensive, cites specific regulations/codes by name, immediately actionable |
| Proficient | 3 | Correct, covers main points, references specific codes or sections, practical |
| Developing | 2 | Mostly correct but vague, missing key details, generic guidance |
| Novice | 1 | Partially correct, significant gaps, no specific citations |
| Incorrect | 0 | Factually wrong, hallucinated citations, or dangerously misleading |

## Criteria

### Accuracy (Weight: 0.40)

Judge accuracy against what the agent's own .md file states — its guidelines, its referenced sources, its cited regulations. Do NOT independently verify external facts.

| Score | Anchor |
|-------|--------|
| 4 | All statements consistent with the agent's stated guidelines. Names specific sources with publication dates or CFR numbers (e.g., "42 CFR §482.12", "FY 2026 ICD-10-CM Guidelines, Section I.C.9.a.3", "CMS-1785-F published November 2025"). No hallucinated citations. |
| 3 | Statements consistent with the agent's guidelines. References specific codes or regulatory sections (e.g., "ICD-10-CM code I11.-", "CPT 99214") but may lack publication dates or exact CFR numbers. No factual errors. |
| 2 | Mostly correct but relies on general statements without citing specific codes or sections. May reference a regulation by name ("HIPAA") without pinpointing the relevant provision. |
| 1 | Partially correct. Contains vague or unsupported claims. May reference outdated guidelines or use imprecise terminology (e.g., "CMS rules" without specifying which). |
| 0 | Factually wrong. Cites regulations or codes that do not exist, applies guidelines to the wrong context, or provides advice that would cause compliance violations. |

### Completeness (Weight: 0.35)

Does the answer cover all relevant aspects of the question? Are exceptions, edge cases, and conditional logic addressed?

| Score | Anchor |
|-------|--------|
| 4 | Addresses every aspect of the question. Flags relevant exceptions, edge cases, and conditional pathways. Mentions cross-domain implications where applicable (e.g., coding impact on DRG, compliance impact on audit risk). Nothing critical omitted. |
| 3 | Covers the main aspects of the question with minor gaps. May miss one edge case or exception but captures the core workflow and primary decision points. |
| 2 | Addresses the surface-level question but misses significant sub-steps, exceptions, or conditional logic. A practitioner following this advice would need to look up additional information. |
| 1 | Answers only part of the question. Major workflow steps, regulatory requirements, or decision branches are omitted. |
| 0 | Does not meaningfully address the question, or addresses a different question entirely. |

### Specificity (Weight: 0.25)

Does the answer provide actionable, specific guidance rather than generic advice? Could a practitioner act on this immediately?

| Score | Anchor |
|-------|--------|
| 4 | Provides specific codes, section references, timelines, dollar thresholds, or step-by-step procedures. A practitioner could act on this answer without further research. Example: "Assign I11.0 (Hypertensive heart disease with heart failure) per Section I.C.9.a.1, then assign a code from I50.- to identify the type of heart failure." |
| 3 | Provides specific guidance with named codes or sections but lacks the step-by-step detail or conditional logic for full autonomy. The practitioner would need minimal additional lookup. |
| 2 | Gives directionally correct advice but in generic terms. References categories of regulations rather than specific provisions (e.g., "follow CMS guidelines for modifier usage" instead of naming the modifier and the NCCI edit policy). |
| 1 | Vague advice that could apply to almost any healthcare scenario. No specific codes, timelines, or procedures. |
| 0 | Pure platitudes or boilerplate. No actionable content whatsoever. |

## Score Computation

For each question, compute:

```
weighted_score = (Accuracy × 0.40) + (Completeness × 0.35) + (Specificity × 0.25)
```

Average `weighted_score` across all 25 questions. Multiply by 25 for a 0-100 scale.

Example: If a question scores Accuracy=3, Completeness=4, Specificity=3:
  weighted_score = (3 × 0.40) + (4 × 0.35) + (3 × 0.25) = 1.20 + 1.40 + 0.75 = 3.35

## Judge Instructions

1. Score one question at a time. Do not batch or rush.
2. For each question-answer pair, score all three criteria independently.
3. Provide a one-line justification for each score citing specific evidence from the answer.
4. Do NOT inflate scores. A correct but vague answer is Developing (2), not Proficient (3).
5. Do NOT independently verify external facts. Judge accuracy against what the agent's .md file claims and references.
6. Apply the scoring thresholds strictly: a score of 3+ on Accuracy requires specific codes or regulatory sections; a score of 4 requires named sources with dates or CFR numbers.
7. After scoring all 25 questions, compute the overall weighted average and multiply by 25.
```

- [ ] **Step 2: Verify rubric completeness**

Read `eval/rubric.md` back. Confirm:
- All 5 levels defined for all 3 criteria (15 anchor definitions total)
- Weights sum to 1.00 (0.40 + 0.35 + 0.25)
- Score computation formula is unambiguous with worked example
- Judge instructions include all 7 rules
- The "judge against prompt claims" grounding appears in both Accuracy anchors and Judge Instructions

- [ ] **Step 3: Commit**

```bash
git add eval/rubric.md
git commit -m "feat: add frozen evaluation rubric (3 criteria, 0-4 scale, 15 anchors)"
```

---

### Task 2: Seed the results log

**Files:**
- Create: `eval/results.tsv`

- [ ] **Step 1: Create `eval/results.tsv` with header**

Write exactly this content (tab-separated):
```
iteration	agent	score_pre_edit	score_post_edit	delta	status	weak_areas	description
```

One header row, no data rows. This file is append-only — the eval loop adds rows, never removes them. It is git-tracked (committed alongside agent changes).

- [ ] **Step 2: Commit**

```bash
git add eval/results.tsv
git commit -m "feat: seed eval results log with header"
```

---

### Task 3: Create the first role baseline

**Files:**
- Create: `eval/role-baselines/revenue-medical-coding-specialist.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p eval/role-baselines
```

- [ ] **Step 2: Read the target agent**

Read `agents/revenue-medical-coding-specialist.md` (451 lines). Note which CPC/CCS exam domains are well-covered and which might be gaps.

- [ ] **Step 3: Write `eval/role-baselines/revenue-medical-coding-specialist.md`**

Write this content:

```markdown
# Revenue Medical Coding Specialist — Role Baseline

> **FROZEN** — Expected capabilities for this role, independent of the agent prompt.
> Used by /eval to generate questions about potentially omitted responsibilities.

## Expected Capabilities (CPC/CCS Exam Domains)

- ICD-10-CM/PCS code assignment, sequencing, and 7th character selection
- CPT/HCPCS Level II coding for E/M, surgery, radiology, pathology, medicine
- E/M level selection using 2021 AMA guidelines (MDM-based and time-based)
- Modifier usage and sequencing (25, 59/X{EPSU}, 76, 77, 26/TC, 50, 51, 62)
- MS-DRG and APR-DRG assignment optimization through CC/MCC capture
- HCC/RAF risk adjustment coding and RADV audit compliance
- NCCI Column 1/Column 2 edit resolution and modifier indicators
- Medical necessity documentation and LCD/NCD compliance
- Charge capture workflows and charge reconciliation
- Denial management, appeals processes, and root cause analysis
- Coding compliance program design and OIG Work Plan alignment
- ICD-10-PCS multiaxial code construction for inpatient procedures
- Outpatient prospective payment (OPPS/APC) coding rules
- Surgical coding: global period rules, multiple procedure discounting
- Anesthesia coding: base units, time reporting, qualifying circumstances
- Pathology/lab coding: panel rules, 80502 vs component unbundling
```

16 bullet points. Items like anesthesia coding, pathology panel rules, and OPPS/APC rules are areas the agent .md may not deeply cover — these are the blind spots the baseline is designed to surface.

- [ ] **Step 4: Commit**

```bash
git add eval/role-baselines/revenue-medical-coding-specialist.md
git commit -m "feat: add role baseline for medical coding specialist"
```

---

### Task 4: Create the `/eval` slash command

**Files:**
- Create: `.claude/commands/eval.md`

This is the program — the core of the entire system.

- [ ] **Step 1: Create `.claude/commands/` directory**

```bash
mkdir -p .claude/commands
```

- [ ] **Step 2: Write `.claude/commands/eval.md`**

Write the following content. This is the complete slash command — it will be long (~150 lines of markdown instructions).

```markdown
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

- [ ] **Step 3: Verify the command file**

Read `.claude/commands/eval.md` back. Verify:
- `$ARGUMENTS` is used throughout (not a hardcoded agent name)
- All 6 preflight checks are present with abort messages (not on main, clean index, clean target, agent exists, rubric exists, record baseline)
- BASELINE_LINES is explicitly marked as "FIXED for the entire session — do NOT recompute"
- LINE_CAP is computed from BASELINE_LINES (not from current file length at edit time)
- The loop has all 8 steps including the capped path in Step 6
- The capped path writes `score_post_edit` and `delta` as `N/A` sentinel values, not fake scored values
- Step 8 appends to results.tsv BEFORE the commit decision
- Git commands use `git add <specific files>` — never `git add .` or `git add -A`
- The "one agent per session" rule is in the Rules section
- The "read fresh each iteration" instruction is in both Rules and Step 1
- The completion summary distinguishes the retained score on disk from the last attempted score

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/eval.md
git commit -m "feat: add /eval slash command for agent improvement loop"
```

---

### Task 5: Validation run

**Files:**
- None created — this is a test run against the first target agent.

**Important:** Tasks 1-4 must be committed to the current branch before this task. Validation runs ON the implementation branch — do NOT merge to main until the eval loop is proven to work.

- [ ] **Step 1: Confirm you are on the implementation branch**

```bash
git branch --show-current
```

You should be on the branch where Tasks 1-4 were committed (e.g., `feat/eval-loop`). If not, check it out. Do NOT switch to main.

- [ ] **Step 2: Run the eval**

```
/eval revenue-medical-coding-specialist
```

Watch the first iteration. Verify:
- Preflight checks pass (prints baseline and cap)
- 25 questions are generated (mix of topics from agent .md and role baseline)
- At least 1-2 questions test areas from the role baseline that the agent .md might not deeply cover (e.g., anesthesia coding, pathology panel rules) — this confirms blind spot detection is working
- Answers are grounded in the agent .md content
- Scores use the 0-4 scale with one-line justifications per criterion
- Weighted computation produces a reasonable 0-100 number
- Edit targets the identified weak areas and stays under the line cap
- Same 25 questions are re-answered after the edit (not new questions)
- results.tsv gets a new row with correct tab-separated columns
- Git commit (improved) or git restore + log commit (reverted/capped) happens

- [ ] **Step 3: Let it run for 2-3 more iterations**

Watch for:
- Fresh questions each iteration (not reusing prior questions)
- Agent file re-read fresh each time (explicitly stated in output)
- Line count stays under LINE_CAP (the session-start cap, not a per-iteration recalculation)
- At least one improvement committed (not guaranteed, but likely in early iterations)
- results.tsv accumulates rows with incrementing iteration numbers

- [ ] **Step 4: Inspect results**

```bash
cat eval/results.tsv
git log --oneline -10
wc -l agents/revenue-medical-coding-specialist.md
```

Verify:
- results.tsv has header + one row per completed iteration, all columns populated
- Git log shows eval commits with the correct message format
- Agent file line count ≤ LINE_CAP from session start
- The retained prompt score equals the last committed iteration, not the last attempted edit

- [ ] **Step 5: Merge to main (only after validation passes)**

If the eval loop worked correctly:

```bash
IMPL_BRANCH=$(git branch --show-current)
git checkout main
git merge --no-ff "$IMPL_BRANCH" -m "feat: add /eval loop + initial run on revenue-medical-coding-specialist"
```

If the eval loop was broken, fix it on the implementation branch and re-run. Do NOT merge broken infrastructure to main.

---

## Execution Order

Tasks 1-3 are independent (rubric, results log, role baseline) and can run in parallel.
Task 4 (slash command) depends on all three existing on disk.
Task 5 (validation) depends on Tasks 1-4 being committed to the implementation branch. Merge to main only AFTER validation passes.

```
[Task 1: rubric] ──────┐
[Task 2: results.tsv] ──┼──→ [Task 4: slash command] ──→ [Task 5: validation run]
[Task 3: role baseline] ┘
```
