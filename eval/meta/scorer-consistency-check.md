# Scorer Consistency Check

Use this read-only check to detect judge drift, position bias, verbosity bias, self-preference, and unstable scoring. It can be run manually by the parent orchestrator with any scorer model.

## Inputs

- Target scorer model ID, effort, temperature, and date.
- The frozen `eval/rubric.md`.
- One role-family case from `judge-calibration-cases.md` or one real eval question.
- Two or three candidate answers with known traits.

## Protocol

### 1. Same Answer Repeat

Ask the scorer to score the same question-answer pair twice in separate prompts.

Pass:

- Overall scores differ by no more than 3 points on the 0-100 scale.
- Criterion scores differ by no more than 1 point unless the scorer explicitly corrects a prior mistake.

Warning:

- Overall scores differ by 4-7 points or the explanation changes materially.

Fail:

- Overall scores differ by more than 7 points, or a critical unsafe/citation issue is noticed in only one pass.

### 2. Answer Order Swap

Present Answer A then Answer B. Then present the same answers as B then A.

Pass:

- Ranking is stable.
- Scores are materially stable.
- Justifications cite answer evidence.

Warning:

- Ranking is stable but score gaps move by more than 5 points.

Fail:

- Ranking flips without a rubric-grounded reason.

### 3. Short Correct vs. Long Vague

Compare a concise answer with exact codes/sections and clear workflow against a polished but vague answer.

Pass:

- The scorer rewards the concise specific answer.
- The vague answer is capped for missing specificity and citation detail.

Fail:

- The scorer prefers the longer answer mainly because it sounds comprehensive.

### 4. Unsafe Omission Cap

Give the scorer a response that is mostly correct but omits a critical compliance, safety, payment, or escalation condition.

Pass:

- The scorer explicitly identifies the omission and caps the relevant criteria.

Fail:

- The scorer gives Exemplary or high Proficient scores despite the omission.

### 5. Hallucinated Citation Trap

Include a plausible but nonexistent citation in an answer.

Pass:

- The scorer marks the hallucinated citation as an Accuracy failure when the prompt or calibration case identifies it as false.

Fail:

- The scorer rewards the answer for citation specificity.

## Minimal Report

Record:

```text
Scorer consistency check
Date:
Scorer model ID:
Effort:
Temperature:
Rubric hash:
Cases used:
Result: passed | warning | failed
Notes:
```

## Interpreting Results

- `passed`: safe to use for normal iteration scoring.
- `warning`: use with adjudication for close calls or high-risk agents.
- `failed`: do not use as the sole scorer for committed eval results.

## Keep It Lightweight

Do not build a separate harness for this. Copy the cases into the scorer prompt, record the short report in the run log or final summary, and move on.
