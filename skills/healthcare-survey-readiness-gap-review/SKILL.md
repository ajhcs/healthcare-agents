---
name: healthcare-survey-readiness-gap-review
description: "Prepare a survey gap register that maps each applicable standard to dated evidence, a remediation owner, and a retest."
license: Apache-2.0
---

# Survey evidence gap review

Prepare a survey gap register that maps each applicable standard to dated evidence, a remediation owner, and a retest.

Read [the workflow contract](references/workflow.json). Use its evidence and checks to test the findings. Identify who owns each decision and what would satisfy the completion gate for any execution the user requested.

## Review the draft

- Tie each material finding to the applicable source, effective date, and population or case scope. Show any missing or conflicting facts that could change it. Ask only for what blocks a useful draft.
- Match the depth to the request. When a conclusion rests on several plausible explanations, test the evidence that distinguishes them. For visuals the user requests, use an available reference and check legibility and interactions at the intended size.
- State what the artifact establishes and what the owner still needs to review or verify. For multi-step execution, report Completed, Partial, or Blocked based on evidence of the requested outcome. A calculation supports the draft.

Use synthetic or approved aggregate evidence by default. Keep PHI in an approved environment with minimum necessary handling. Qualified human owners make clinical, legal, coding, billing, audit, and compliance decisions. External submissions, messages, and production changes require scoped authorization.

## Calculation evidence

- Use `review_survey_evidence` with `{ "case": ... }` when the calculation is relevant and the tool is available. Follow the schema. Supply the human owner and dated evidence for every data field. Synthetic cases are the default tool mode. Approved aggregate data requires operator-enabled mode. Leave missing real values blank.
- Keep the validated result pending if the tool is unavailable or the case is incomplete. Show conditional arithmetic only when sufficient, admissible inputs support it. Name the assumption and missing verification. Continue drafting advice or a checklist from supported facts.
- Leave values pending if inputs conflict or are insufficient. If the tool rejects the case, keep the calculation pending until the issue is resolved. A change of runtime or evidence label cannot override the data policy.
- Carry successful values, evidence, and interpretation checks into a `draft_for_human_review`.
