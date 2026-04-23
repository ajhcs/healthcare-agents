# Prompt Overfitting Check

Use this check after retained prompt edits or before validation/holdout scoring. The goal is to catch prompts that improve a local question set by memorizing wording, adding generic boilerplate, or weakening role identity.

## Overfitting Signals

- The prompt includes wording that mirrors recent eval questions.
- The prompt adds broad healthcare-administration coverage unrelated to the agent's role.
- The prompt grows by repeating "cite sources, be specific" without adding role mechanics.
- The prompt improves same-question post-score but fails fresh validation questions.
- The prompt becomes less distinctive than the role baseline or adjacent agents.
- The editor adds unsupported source names or fake citation expectations.

## Quick Check

Run this manually after an edit is retained:

1. Compare the edit against the scorer's weakness brief.
2. Identify which changed lines map to a scored weakness.
3. Search for copied phrases from the 25 eval questions.
4. Ask whether each addition would help on a fresh but similar role task.
5. Ask whether the addition preserves the role's practitioner identity.
6. If a validation bank exists, score a small validation sample without exposing holdout questions to the editor.

## Fresh-Question Probe

Generate 3-5 new questions that test the same weak areas without reusing the original wording.

Pass:

- The edited prompt improves or maintains performance on fresh questions.
- The improvement comes from reusable role mechanics, workflows, source families, or decision criteria.

Warning:

- The edit helps only when the question resembles the original prompt wording.
- The agent gives broader but less role-specific answers.

Fail:

- The edit embeds answer keys, question-specific phrasing, or generic boilerplate that would not help a practitioner.

## Role-Boundary Probe

Ask one adjacent-role question and one in-role question.

Pass:

- The agent handles the in-role question specifically.
- The agent either declines, scopes, or collaborates appropriately on the adjacent-role question.

Warning:

- The agent answers both with the same generic framework.

Fail:

- The edit pulls the agent into another specialist's domain or erases its original differentiators.

## Validation and Holdout Discipline

- Train questions may guide edits.
- Validation questions may check whether an edit generalizes.
- Holdout questions should not guide normal edits.
- If a holdout question influences a prompt edit, mark that holdout item contaminated and replace it before release scoring.

## Minimal Report

Record:

```text
Prompt overfitting check
Date:
Agent slug:
Editor model ID:
Scorer model ID:
Question source reviewed:
Fresh-question probe: passed | warning | failed
Role-boundary probe: passed | warning | failed
Contaminated holdout items: none | list
Notes:
```

## Remediation

When overfitting is detected:

- Remove copied question wording.
- Replace broad boilerplate with role-specific mechanics.
- Keep only changes tied to recurring weakness patterns.
- Re-score on fresh questions before committing another improvement.
- Use an adjudicator if same-question gains conflict with validation behavior.
