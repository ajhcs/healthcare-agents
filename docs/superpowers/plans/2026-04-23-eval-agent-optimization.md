# Eval Agent Optimization Plan

**Date**: 2026-04-23  
**Status**: Executed implementation plan  
**Scope**: Improve the lightweight healthcare-agent self-improvement loop without depending on the retired Python eval harness.

## Goal

Make `/eval` more reliable at improving the 51 healthcare administration agents by strengthening the scorer, question generation, role baselines, judge contracts, calibration discipline, provenance, and SOTA-model routing guidance.

This plan covers the previously identified priorities:

1. Train/validation/holdout separation
2. Multi-domain Exam Architect behavior beyond medical coding
3. Role baselines for all 51 healthcare agents
6. Criterion-level judging
7. Calibration and meta-evals
8. Provenance logging
9. SOTA model tuning instructions

It intentionally excludes the old `eval/harness/` Python system. That code path has been removed.

## Current State

The active eval path is:

- `.claude/commands/eval.md`: canonical loop program for Claude Code and Codex
- `eval/rubric.md`: frozen 0-4 rubric
- `eval/results.tsv`: append-only result log
- `eval/role-baselines/revenue-medical-coding-specialist.md`: one existing baseline
- `AGENTS.md`: tells Codex to use `.claude/commands/eval.md`

The old `agents/eval-exam-architect.md` prompt was tied to the superseded Python harness and has been deleted from `agents/`. Its useful psychometric guidance should be migrated into an internal playbook and the `/eval` scorer contract.

## Design Principles

- Keep the slash-command loop simple enough for Claude Code and Codex to execute directly.
- Use native subagents or runtime-native model routing when available; avoid recursive CLI calls.
- Keep the parent orchestrator responsible for git writes, line caps, and `eval/results.tsv`.
- Keep scorers and editors separate where possible.
- Prevent prompt overfitting by separating improvement questions from final validation questions.
- Preserve each role's identity; do not optimize agents into generic healthcare-administration prompts.
- Make all scoring traceable to the prompt, questions, rubric, model choices, and git state.

## Architecture

### Active Files

| Path | Role |
|---|---|
| `.claude/commands/eval.md` | Executable eval/self-improvement workflow |
| `docs/eval/exam-architect-playbook.md` | Internal item-writing and scorer guidance |
| `docs/eval/model-tuning.md` | Current model-routing and effort guidance |
| `eval/rubric.md` | Frozen metric |
| `eval/results.tsv` | Append-only result log |
| `eval/role-baselines/*.md` | Frozen role-specific capability baselines |
| `eval/question-banks/*.md` | Optional curated question sets, split by purpose |
| `eval/meta/*.md` | Judge calibration and meta-eval cases |

### Retired Files

The following should not be part of the active architecture:

- `eval/harness/`
- `eval/schema/`
- `eval/rubrics/`
- `eval/items/`
- `eval/requirements.txt`
- `scripts/run-eval.sh`
- `agents/eval-exam-architect.md` as a shipped end-user agent

## Phase 1: Split Discipline Without Rebuilding the Harness

### Problem

The current `/eval` loop generates fresh questions each iteration and uses same-question pre/post scoring within an iteration. That is good for immediate deltas, but it does not protect against broader overfitting or give a locked final validation set.

### Plan

Add lightweight markdown question banks:

```text
eval/question-banks/
  README.md
  train/
    <agent-slug>.md
  validation/
    <agent-slug>.md
  holdout/
    <agent-slug>.md
```

Each bank file should contain structured markdown:

```markdown
# <Agent Name> — <Split> Question Bank

> Split: train | validation | holdout
> Frozen: yes/no
> Last reviewed: YYYY-MM-DD

## Questions

### Q001 — <short label>
- Domain: <role domain>
- Type: factual | applied | edge_case | cross_domain | deliverable
- Prompt: ...
- Must cover:
  - ...
- Must avoid:
  - ...
- Source expectation:
  - ...
```

### Split Semantics

- `train`: allowed for repeated prompt improvement and scorer/editor discussion.
- `validation`: allowed to decide whether an edit probably improved the prompt during active work.
- `holdout`: only used for release scoring or final comparison; never used to guide edits.

### `/eval` Changes

Update `.claude/commands/eval.md`:

- Prefer generated fresh questions when no bank exists.
- If banks exist, use `train` questions for weakness discovery.
- Use same-question pre/post scoring inside the iteration.
- Run an optional `validation` pass after a retained edit.
- Never use `holdout` during normal `/eval`.
- Print whether the run used generated questions, train-bank questions, or validation questions.

### Acceptance Criteria

- `/eval <slug>` still works when no bank files exist.
- If `eval/question-banks/train/<slug>.md` exists, the scorer uses it before generating new questions.
- Holdout questions are never shown to the editor or used to propose changes.
- `eval/results.tsv` description records the question source.

## Phase 2: Replace Exam Architect With an Internal Playbook

### Problem

The old Exam Architect prompt was strong but coding-centric. It has been deleted from `agents/` so it is no longer installed as if it were one of the 51 healthcare specialists.

### Plan

Create:

```text
docs/eval/exam-architect-playbook.md
```

The playbook should be used by the scorer role inside `/eval`; it is not an end-user agent.

### Playbook Content

Include:

- Universal item-writing rules
- Role-family blueprints
- Question-type targets
- Citation/source expectations
- Anti-overfitting rules
- Weakness-to-edit mapping
- Judge calibration examples

### Role-Family Blueprints

Define question patterns and scoring expectations for:

- Revenue cycle and finance
- Compliance, legal-risk, and enterprise risk
- Quality, safety, accreditation, and patient experience
- Clinical operations and care management
- Payer, managed care, value-based care, and credentialing
- Health IT, informatics, interoperability, and analytics
- Population health and community health
- Pharmacy, medication safety, and 340B
- Strategy, operations consulting, actuarial, and structural improvement
- Emergency preparedness

Each blueprint should specify:

- Canonical deliverables
- Required mechanics
- Primary source families
- Common failure modes
- Red-flag unsafe or noncompliant answers
- Strong answer markers

### Acceptance Criteria

- `agents/` contains only installable healthcare specialist agents.
- Scorer instructions in `.claude/commands/eval.md` reference the internal playbook.
- The playbook includes non-coding examples for at least compliance, health IT, quality, operations, payer, pharmacy, and strategy.
- The linter scans the 51 installable agents without any utility-agent special case.

## Phase 3: Role Baselines for All 51 Agents

### Problem

Only one role baseline exists. Without baselines, question generation mostly tests what the prompt already claims, missing omitted responsibilities.

### Plan

Create:

```text
eval/role-baselines/INDEX.md
eval/role-baselines/<agent-slug>.md
```

for all 51 healthcare agents. Do not create a baseline for any retired utility prompt.

### Baseline Template

```markdown
# <Role Name> — Role Baseline

> FROZEN expected capability baseline for eval question generation.
> This file defines what the role should handle, independent of the current prompt.

## Core Responsibilities

- ...

## Required Frameworks and Source Families

- ...

## Core Deliverables

- ...

## Edge Cases and Failure Modes

- ...

## Identity to Preserve

- ...

## Boundaries

- ...
```

### Generation Workflow

1. Read the target agent.
2. Draft a baseline from the agent plus the public role definition.
3. Compare against adjacent agents to avoid role bleed.
4. Keep each baseline concise, typically 25-45 bullets.
5. Mark baselines as frozen once reviewed.

### Acceptance Criteria

- Every installable agent has a matching role baseline.
- `eval/role-baselines/INDEX.md` lists all baselines and their review status.
- `/eval` warns if a requested baseline is missing.
- Baselines preserve role boundaries and do not turn every agent into a general administrator.

## Phase 4: Criterion-Level Judging in `/eval`

### Problem

The frozen rubric scores accuracy, completeness, and specificity. The scorer currently produces weak areas, but the result log does not preserve per-criterion details.

### Plan

Update `.claude/commands/eval.md` to require the scorer to return structured markdown or JSON for each iteration:

```json
{
  "questions": [],
  "score_pre_edit": 0,
  "criteria_summary": {
    "accuracy": {"score": 0, "evidence": "..."},
    "completeness": {"score": 0, "evidence": "..."},
    "specificity": {"score": 0, "evidence": "..."}
  },
  "weaknesses": [
    {
      "criterion": "specificity",
      "question_ids": ["Q003", "Q014"],
      "issue": "...",
      "proposed_prompt_change": "..."
    }
  ],
  "identity_to_preserve": [],
  "anti_patterns_to_avoid": []
}
```

Add optional per-run artifacts:

```text
eval/run-logs/<timestamp>-<agent-slug>/
  questions.md
  pre-score.json
  improvement-brief.md
  post-score.json
  summary.md
```

`eval/results.tsv` remains the durable index, but detailed local artifacts make the score auditable.

### Acceptance Criteria

- Each weak area maps to at least one rubric criterion and at least one question.
- The editor receives targeted changes rather than broad advice.
- The final summary identifies whether gains came from accuracy, completeness, specificity, or multiple criteria.

## Phase 5: Calibration and Meta-Evals

### Problem

LLM judges are useful but biased. Known risks include position bias, verbosity bias, self-preference, and inconsistent scoring. The loop needs lightweight meta-evals to catch judge drift.

### Plan

Create:

```text
eval/meta/
  README.md
  judge-calibration-cases.md
  scorer-consistency-check.md
  prompt-overfitting-check.md
```

### Calibration Cases

Each role family should have examples of:

- Exemplary answer
- Correct but vague answer
- Verbose but unsafe answer
- Confident hallucination
- Role-boundary violation
- Missing citation
- Good uncertainty handling

The scorer should run these periodically or before major benchmark runs.

### Meta-Eval Checks

- Score the same response twice with answer order swapped.
- Compare short correct response against long vague response.
- Ask judge to cap scores when a critical unsafe omission appears.
- Use mixed judge models when available.
- Require judge to cite evidence from the response, not its own preference.

### Acceptance Criteria

- Calibration cases exist for every role family.
- The scorer instructions require evidence-grounded scoring.
- Release scoring includes a note on judge calibration status.
- Any model used as judge has a recorded model ID and date.

## Phase 6: Provenance Logging

### Problem

`eval/results.tsv` records scores but not enough context to reproduce or audit them.

### Plan

Extend `eval/results.tsv` conservatively only if needed. Prefer adding sidecar run logs so the append-only TSV remains simple.

Recommended result structure:

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
```

`manifest.json` should include:

- agent slug
- git branch and commit
- target file hash before/after
- rubric hash
- baseline hash
- question source
- scorer model and effort
- editor model and effort
- parent/orchestrator runtime
- line cap
- timestamp
- status

### Acceptance Criteria

- A future reviewer can reproduce what changed and why from the run log.
- No API keys, PHI, or secret values are logged.
- `eval/results.tsv` row points to the run-log directory when one exists.

## Phase 7: SOTA Model Tuning Guidance

### Problem

Model capabilities and prompting styles are changing quickly. Hard-coding current model names and aggressive prompt language into `/eval` will age badly.

### Plan

Create:

```text
docs/eval/model-tuning.md
```

The doc should define role-based model selection:

| Role | Recommended model class | Notes |
|---|---|---|
| Parent orchestrator | reliable coding/agent model | owns filesystem and git |
| Scorer/judge | strongest reasoning model | read-only; high/xhigh effort |
| Editor | fast strong model | single-file edits only |
| Adjudicator | different family than scorer when possible | resolves close calls |
| Meta-eval judge | strongest available or mixed panel | checks judge drift |

### Guidance

- Pin exact model IDs for any recorded run.
- Use strongest models for judging and adjudication.
- Use cheaper/faster models for bounded editing.
- Avoid same-family answerer/judge when possible.
- Reduce excessive all-caps imperative language for newer instruction-following models.
- Re-run evals after small prompt changes.
- Record reasoning effort, verbosity, temperature, and tool/search settings.

### Acceptance Criteria

- `.claude/commands/eval.md` points to this doc for volatile model guidance.
- Run logs record exact model IDs.
- Final summaries state which model served each role.

## Implementation Order

1. Cleanup retired harness and delete the old Exam Architect utility prompt.
2. Add `docs/eval/exam-architect-playbook.md`.
3. Update `.claude/commands/eval.md` with scorer/editor contracts and run-log manifest guidance.
4. Add all 51 role baselines and index.
5. Add optional train/validation/holdout question-bank structure.
6. Add meta-eval calibration docs.
7. Add model-tuning doc.
8. Run `/eval` manually on two representative agents.
9. Review resulting run logs and tighten instructions.

## Locked Execution Task List

| ID | Task | Dependencies | Owner | Files |
|---|---|---|---|---|
| T1 | Remove retired Python harness and shipped utility prompt | None | Complete | `eval/harness/`, `eval/schema/`, `eval/rubrics/`, `scripts/run-eval.sh`, `agents/eval-exam-architect.md`, docs/scripts references |
| T2 | Create internal Exam Architect playbook | T1 | Complete | `docs/eval/exam-architect-playbook.md` |
| T3 | Create SOTA model-routing guidance | T1 | Complete | `docs/eval/model-tuning.md` |
| T4 | Add judge calibration and meta-eval docs | T2, T3 | Complete | `eval/meta/README.md`, `eval/meta/judge-calibration-cases.md`, `eval/meta/scorer-consistency-check.md`, `eval/meta/prompt-overfitting-check.md` |
| T5 | Add role baselines for all 51 installable agents and index | T1 | Complete | `eval/role-baselines/*.md`, `eval/role-baselines/INDEX.md` |
| T6 | Update `/eval` with scorer/editor contracts, split discipline, provenance, and model guidance | T2, T3, T4, T5 | Complete | `.claude/commands/eval.md` |
| T7 | Decide and document run-log tracking policy | T6 | Complete | `.gitignore`, `eval/run-logs/README.md` |
| T8 | Repair or reset Beads tracking so stale Python/DSPy tasks no longer show as active | T1 | Complete | `bd ready` / `bd status` |
| T9 | Validate and review | T2-T8 | Complete | lint, audit, package dry-run, reference scans, git diff checks |

### Dependency Notes

- T2 and T3 can run in parallel after cleanup.
- T5 can run in parallel by role family because each baseline file is independent.
- T6 must wait for T2-T5 so the canonical eval command can reference the final playbook, model guidance, calibration docs, and role-baseline index.
- T7 is a policy decision made in T6: default to keeping raw run logs local unless a run is deliberately promoted for review.
- T8 is independent of the eval command but must be completed before the repo's work tracker can be trusted again.

## Risks

- Baselines can become generic if generated too quickly.
- Holdout questions can leak into edits if the workflow is not explicit.
- Too many run artifacts can clutter the repo; consider ignoring raw run logs unless deliberately committed.
- SOTA model names change quickly; docs must emphasize model roles and pinned run manifests over marketing names.
- The old Exam Architect has been removed from `agents/`, and lint/audit scripts now scan only installable healthcare agents.

## Open Questions

- Should role baselines be committed immediately as frozen, or drafted first with review status?
- Should run logs be git-tracked by default, or ignored unless a run is promoted?
- Should `/eval` ever use holdout locally, or should holdout be reserved only for release scoring?
- How many curated questions per agent are enough for v1: 10 train / 5 validation / 5 holdout, or more?

## References

- OpenAI eval guidance: https://developers.openai.com/api/docs/guides/evaluation-best-practices
- OpenAI graders guidance: https://developers.openai.com/api/docs/guides/graders
- OpenAI HealthBench: https://openai.com/index/healthbench/
- Anthropic eval design: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
- Anthropic prompting guidance: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- LLM judge bias study: https://aclanthology.org/2025.ijcnlp-long.18/
