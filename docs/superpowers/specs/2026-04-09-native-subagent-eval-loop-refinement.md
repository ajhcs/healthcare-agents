# Native Subagent Eval Loop Refinement

**Date**: 2026-04-09  
**Status**: Approved refinement  
**Builds on**: `2026-03-21-karpathy-eval-loop-design.md`

## Why This Exists

The original Karpathy-style loop was intentionally simple: one agent generated questions, answered them, judged them, edited the prompt, and then rescored the same question set. That remains the canonical fallback.

In practice, Codex supports stronger orchestration patterns:

- a stronger scorer/judge can identify weaknesses more reliably than a cheap editor
- a faster editor can implement targeted changes more cheaply than the strongest model
- native subagents avoid the overhead and failure modes of recursively invoking a full CLI runtime inside itself

This refinement keeps the same frozen metric, line-cap rules, and git ratchet, while improving speed and edit quality.

## Core Refinements

### 1. Split the Loop Into Three Roles

- **Parent orchestrator**
  - runs preflight checks
  - records `BASELINE_LINES` and `LINE_CAP`
  - preserves the fixed question set within an iteration
  - enforces the line cap
  - appends to `eval/results.tsv`
  - commits or reverts

- **Scorer/judge**
  - read-only
  - strongest available reasoning model
  - generates the 25-question exam
  - answers from the prompt
  - judges with the frozen rubric
  - produces a structured critique for the editor

- **Editor**
  - cheaper or faster model
  - edits only `agents/{slug}.md`
  - implements the scorer's highest-leverage changes
  - must preserve the agent's identity and avoid generic broadening

### 2. Preserve Identity Explicitly

The scorer should not only say what is weak. It should also say what must remain intact.

Without this, prompt optimization can drift toward:

- generic executive tone
- duplicated best-practice boilerplate
- broader but shallower role definitions
- loss of domain-specific edge

The editor should be constrained to make the prompt **more capable**, not more average.

### 3. Avoid Nested CLI Recursion

Do **not** prefer a pattern like:

- parent agent shells out to `codex exec`
- nested agent shells out to more tools
- each nested runtime manages its own sandbox, session, and tool layer

This adds avoidable runtime, tool recursion, and sandbox complexity.

Prefer native subagents or equivalent runtime-native worker primitives whenever available.

## Scorer Contract

For the **pre-edit** pass, the scorer should return structured JSON like:

```json
{
  "score": 77.15,
  "weak_areas": [
    "Managed care contract modeling",
    "Observation-status economics"
  ],
  "description": "Short explanation of where the prompt is currently strong and weak.",
  "questions": [
    "Question 1",
    "Question 2"
  ],
  "weak_examples": [
    {
      "question": "How should observation economics be modeled?",
      "why_low": "The prompt mentions observation hours but not margin mechanics."
    }
  ],
  "improvement_proposals": [
    {
      "change": "Add an observation-margin bridge",
      "expected_gain": "high",
      "why": "Would improve completeness and specificity on outpatient finance questions."
    }
  ],
  "identity_to_preserve": [
    "Dense practitioner finance voice",
    "Strong cost-report and reimbursement mechanics",
    "Board-and-CFO framing"
  ],
  "anti_patterns_to_avoid": [
    "Generic stakeholder-management filler",
    "Broad healthcare-administration advice",
    "Repeating benchmark lists without mechanics"
  ]
}
```

Minimum required fields remain:

- `score`
- `weak_areas`
- `description`
- `questions`
- `weak_examples`

The new fields are strongly recommended whenever the runtime supports role specialization:

- `improvement_proposals`
- `identity_to_preserve`
- `anti_patterns_to_avoid`

## Editor Contract

The editor should receive:

- the current prompt
- `weak_areas`
- `weak_examples`
- `improvement_proposals`
- `identity_to_preserve`
- `anti_patterns_to_avoid`
- the fixed `LINE_CAP`

The editor should follow these rules:

- edit only `agents/{slug}.md`
- prefer additive changes to relevant sections
- implement the highest-leverage 1-3 changes first
- preserve the items in `identity_to_preserve`
- avoid everything in `anti_patterns_to_avoid`
- avoid broadening the role just to answer more generic questions

## Post-Edit Scoring Contract

For the **post-edit** pass, the scorer should receive:

- the current on-disk prompt
- the frozen rubric
- the exact same 25 questions from the pre-edit pass

It should return:

```json
{
  "score": 80.70,
  "description": "Short explanation of why the edit improved or failed."
}
```

The parent orchestrator then decides:

- improved → keep edit, append TSV row, commit
- reverted → restore prompt, append TSV row, commit
- capped → restore prompt, append sentinel TSV row, commit

## Batch Scaling Pattern

For multi-agent throughput:

- run one agent per branch or worktree
- keep scorer workers read-only
- keep editor workers single-file
- let only the parent write `eval/results.tsv`
- stop when:
  - target score is reached, or
  - recent deltas are too small to justify another pass

This preserves the original git-ratchet simplicity while allowing much higher parallel throughput.

## What Did Not Change

This refinement does **not** change:

- the frozen rubric at `eval/rubric.md`
- the append-only log at `eval/results.tsv`
- the single mutable target file per run
- the same-question pre/post comparison inside each iteration
- the line-cap enforcement model
- the recommendation to avoid comparing scores across different iterations

The refinement is architectural, not metric-changing.
