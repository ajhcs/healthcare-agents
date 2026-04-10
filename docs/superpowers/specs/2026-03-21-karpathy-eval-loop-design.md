# Karpathy-Style Agent Eval Loop

**Date**: 2026-03-21
**Status**: Approved
**Replaces**: `2026-03-20-exam-architect-eval-loop-design.md` (6,771-line Python pipeline — over-engineered)

## Problem

We have 51 healthcare administration AI agents (system prompt .md files in `agents/`; 52 files total but `eval-exam-architect.md` is a meta-agent from the previous design and is excluded from eval). We need a way to point at one, find its weaknesses, improve it, and produce a standardized score. Personal tool, not production system.

## Inspiration

Karpathy's autoresearch (~630 lines total):
- `program.md` — tells Claude Code what to do in the loop
- `prepare.py` — frozen metric the agent can't touch
- `train.py` — the only file the agent can edit
- Git as ratchet — commit if better, `git reset HEAD~1` if worse
- ~12 experiments/hour, ~100 overnight, zero API cost

The pattern has been replicated by dozens of people (Ralph Wiggum Loop, Continuous Claude, Anthropic's own skill eval loop). The universal structure is three things: a frozen metric, a bash/session loop, and git as ratchet.

## Design

### Core Files

1. **`/eval` slash command** — the program. Drives the loop. Can read and edit agent .md files.
2. **`eval/rubric.md`** — the frozen metric. Scoring criteria Claude-as-judge uses. The loop can NEVER modify this file.
3. **`eval/results.tsv`** — append-only log of every iteration.
4. **`eval/role-baselines/{name}.md`** — optional frozen capability checklists for blind spot detection (see Role Baselines).

### Preflight Checks

Before entering the loop, the slash command MUST verify:

1. **Not on main**: `git branch --show-current` must NOT be `main` or `master`. Abort with message: "Switch to a feature branch first (e.g., `git checkout -b eval/{agent-name}`)."
2. **Clean index**: `git diff --cached --name-only` must be empty (no staged changes). Unstaged changes to other files are OK, but a dirty index would leak unrelated files into eval commits. Abort with: "You have staged changes. Commit or unstage them first (`git reset HEAD`)."
3. **Clean target file**: `git diff --name-only -- agents/{name}.md` must be empty (no unstaged changes to the target). Abort with: "agents/{name}.md has uncommitted changes. Commit or stash first."
4. **Agent file exists**: `agents/{name}.md` must exist. Abort with: "No agent file found at agents/{name}.md."
5. **Rubric exists**: `eval/rubric.md` must exist. Abort with: "Frozen rubric not found at eval/rubric.md."

### The Loop (up to 5 iterations per invocation)

```
0. Run preflight checks (see above) — abort if any fail
1. Record session-start line count: wc -l agents/{name}.md → BASELINE_LINES
2. Read agents/{name}.md
3. Read eval/role-baselines/{name}.md if it exists (see Role Baselines section)
4. Generate 25 questions from BOTH the agent .md AND the role baseline (if present)
5. Answer all 25 as the agent (using the .md as system context)
6. Judge each answer against rubric.md (score all 3 criteria per question)
7. Compute weighted score → 0-100
8. Identify the 2-3 weakest areas
9. Edit agents/{name}.md to strengthen weak areas
   - Must not exceed BASELINE_LINES × 1.2 OR BASELINE_LINES + 50 (whichever is greater)
   - Cap is against SESSION-START baseline, not pre-edit — prevents compounding across iterations
   - Prefer appending specific guidance to existing sections over rewriting
10. Check line count: if capped, skip to step 12 with status=capped
11. Re-answer the SAME 25 questions with the edited agent, re-judge → new score
12. Append to eval/results.tsv (BEFORE commit/revert — ensures every iteration is logged)
13. Commit decision (three paths):
    - improved (new > old) → git add agents/{name}.md eval/results.tsv && git commit -m "eval: {agent} {before}→{after} (+{delta})"
    - reverted (new <= old) → git restore agents/{name}.md && git add eval/results.tsv && git commit -m "eval: {agent} reverted ({delta})"
    - capped (line count exceeded) → git restore agents/{name}.md && git add eval/results.tsv && git commit -m "eval: {agent} capped (exceeded line limit)"
14. Next iteration (generate fresh 25 questions)
```

### Invocation

```
/eval revenue-medical-coding-specialist
```

One agent per session. Do not run multiple agents in a single invocation — context window fills after ~325K tokens (5 iterations × ~65K each), and judgment quality degrades with too much prior conversation in context.

The argument is the agent filename without `.md`. It must match a file in `agents/`:
```
/eval revenue-medical-coding-specialist
/eval quality-compliance-officer
/eval clinical-prior-authorization-specialist
...
```

### The Frozen Rubric

`eval/rubric.md` — immutable. The loop cannot touch this file.

**Scale**: 0-4 per criterion per question.

| Level | Score | Meaning |
|-------|-------|---------|
| Exemplary | 4 | Correct, comprehensive, cites specific regulations/codes by name, immediately actionable |
| Proficient | 3 | Correct, covers main points, references specific codes or sections, practical |
| Developing | 2 | Mostly correct but vague, missing key details, generic guidance |
| Novice | 1 | Partially correct, significant gaps, no specific citations |
| Incorrect | 0 | Factually wrong, hallucinated citations, or dangerously misleading |

**Criteria** (applied to every question):

| Criterion | Weight | What it measures |
|-----------|--------|-----------------|
| Accuracy | 40% | Consistent with the agent's own stated guidelines and source documents. Score of 3+ requires specific codes or regulatory sections that appear in the agent .md or its referenced sources. Score of 4 requires named sources with publication dates or CFR numbers. Judge accuracy against what the prompt claims — do NOT independently verify external facts (that is a v2 concern). |
| Completeness | 35% | All relevant steps covered, exceptions flagged, edge cases noted, nothing critical omitted |
| Specificity | 25% | Cites specific codes/sections/timelines, actionable recommendations, not generic advice |

**Score computation**: Each question yields 3 scores (0-4). Apply weights (0.40, 0.35, 0.25) for a weighted score per question (0-4). Average across 25 questions. Multiply by 25 for 0-100 scale.

### Results Log

`eval/results.tsv` — append-only.

```
iteration	agent	score_pre_edit	score_post_edit	delta	status	weak_areas	description
1	revenue-medical-coding-specialist	68	74	+6	improved	accuracy:E/M coding	Strengthened 2021 AMA E/M guidelines section
2	revenue-medical-coding-specialist	71	69	-2	reverted	completeness:modifier logic	Attempted modifier 25/59 expansion, no improvement
```

Column names use `pre_edit` / `post_edit` to make clear these are same-question-set comparisons within a single iteration. The score_pre_edit of iteration 2 (71) is NOT the score_post_edit of iteration 1 (74) — they use different question sets.

**Status values**: `improved` (committed), `reverted` (checked out), `capped` (edit exceeded line limit, reverted without re-scoring — `score_post_edit` and `delta` are `N/A` since no post-edit scoring occurred).

**Important**: Scores across iterations are NOT comparable. Each iteration uses different questions. Only the delta within an iteration (same questions, before vs after) is meaningful.

### Commit Gate

Karpathy-simple. Every iteration commits (the log is always persisted):
- Score improved → `git add agents/{name}.md eval/results.tsv && git commit`
- Score same or worse → `git restore agents/{name}.md && git add eval/results.tsv && git commit`

No threshold. No regression check beyond the same-question re-score. The ratchet self-corrects over iterations.

### Edit Guardrails

Two deterministic constraints on the edit step:

1. **Line count cap**: After editing, run `wc -l agents/{name}.md`. If it exceeds `BASELINE_LINES × 1.2` OR `BASELINE_LINES + 50` (whichever is greater), revert immediately without re-scoring. Log as `status: capped`. **BASELINE_LINES is recorded once at session start (step 1)** and does not change between iterations — this prevents 5 successive 20% expansions from compounding. The floor of 50 lines prevents the cap from blocking legitimate improvements on shorter files.
2. **Append-preferred**: The program instructs Claude to prefer adding specific guidance to existing sections over rewriting or reorganizing. Soft constraint but biases toward targeted fixes.

### Role Baselines (Blind Spot Detection)

`eval/role-baselines/{name}.md` — optional, frozen. A minimal checklist of capabilities and responsibilities expected for the role, independent of what the agent .md currently claims. Used to generate questions about things the agent SHOULD know but might not mention.

Example for `revenue-medical-coding-specialist`:
```
## Expected Capabilities
- ICD-10-CM/PCS code assignment and sequencing
- CPT/HCPCS Level II coding
- E/M level selection (2021 AMA guidelines)
- Modifier usage (25, 59, 76, 77, etc.)
- MS-DRG/APR-DRG optimization
- HCC/RAF risk adjustment
- NCCI edit resolution
- Medical necessity documentation
- Charge capture workflows
- Denial management and appeals
```

These are short (10-20 lines), written once per agent, and never modified by the loop. They exist so the question generator can test for omitted responsibilities — not just what the prompt already covers. If no baseline exists for an agent, the loop generates questions from the agent .md only (graceful degradation).

The baselines can be populated incrementally. Start with the first agent you eval, add others as you go.

### Question Persistence

Questions are ephemeral — they exist only in the conversation context during the iteration. They are NOT written to disk. This is intentional:

- Writing questions to disk adds file I/O complexity for no benefit (questions are single-use within an iteration)
- The same-question comparison happens within one iteration, so both scoring passes see the questions in context
- Fresh questions each iteration prevents overfitting to a specific question set
- If debugging is needed, the results.tsv `weak_areas` and `description` columns capture what matters

By iteration 5, the context contains ~5 iterations of Q&A (~325K tokens). This is within the 1M context window but near the practical limit. The slash command should cap at 5 iterations and end the session.

### Git Branch Policy

Run `/eval` on a feature branch (e.g., `eval/{agent-name}`), not on main. The ratchet commits directly to the current branch. Merge to main when satisfied with results.

### Known Limitations (Accepted for v1)

1. **Claude judges Claude** — same model generates questions, answers them, and judges them. Systematic bias cancels out in same-question comparison (bias applies equally to before and after scores). Remaining risk: Claude rewards confident-sounding wrong answers. Mitigated by rubric requiring specific citations for high accuracy scores.

2. **Stochastic metric** — unlike Karpathy's deterministic BPB, our judge has variance. Same-question comparison adds structural determinism (the only variable is the agent .md edit). Across iterations, noise averages out.

3. **No gold standard** — v2 could add 5-10 hand-written question-answer pairs per agent as a canary set. Not needed for v1.

4. **No cross-agent comparison** — the standardized score (0-100) uses the same rubric across all agents, so scores are comparable in principle. But question difficulty varies by agent domain, so a 75 on medical coding is not the same difficulty as a 75 on patient experience.

## What This Replaces

The previous design (`2026-03-20-exam-architect-eval-loop-design.md`) specified:
- 10-stage Python pipeline (6,771 lines across 24 files)
- DSPy GEPA/MIPROv2 optimizer integration
- IRT 2PL/3PL psychometric calibration
- 3-judge panel with weighted kappa agreement
- Pydantic v2 schemas with 16 validation rules
- Anthropic API with prompt caching
- Estimated cost: ~$17,850 for 51 agents

This design specifies:
- 4 core files (slash command, rubric, results log, optional role baselines)
- Runs inside Claude Code (zero API cost)
- No Python, no dependencies
- Estimated time: ~15-20 minutes per agent per session

The previous infrastructure (eval/schema/, eval/harness/, agents/eval-exam-architect.md) can be archived or deleted. The rubric files in eval/rubrics/ informed the rubric.md design and can be referenced but are not used by this system.

## File Manifest

| File | Purpose | Mutable by loop? |
|------|---------|-------------------|
| `.claude/commands/eval.md` | The program — loop instructions | NO (read-only) |
| `eval/rubric.md` | Frozen scoring metric | NO (never) |
| `eval/role-baselines/{name}.md` | Frozen capability checklist (optional) | NO (never) |
| `eval/results.tsv` | Iteration log (git-tracked) | APPEND-ONLY |
| `agents/{name}.md` | The thing being optimized | YES (the only mutable target) |
