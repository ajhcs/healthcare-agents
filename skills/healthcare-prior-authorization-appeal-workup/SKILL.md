---
name: healthcare-prior-authorization-appeal-workup
description: "Prepare an administrative appeal evidence map without determining medical necessity or submitting an appeal."
license: Apache-2.0
---

# Prior authorization appeal preparation

Prepare an administrative appeal evidence map without determining medical necessity or submitting an appeal.

Read [the workflow contract](references/workflow.json) when this task applies. Use its evidence fields and decision checks; adapt the artifact to the user.

Work from approved aggregate, synthetic or otherwise authorized evidence. Keep sources, effective dates, missing facts and conflicts visible.
Preserve the named human owner. External submissions, messages and production changes require scoped authorization.
Provide administrative support; do not make final clinical, legal, coding, billing, audit or compliance decisions.
Report the artifact delivered and remaining evidence or action; calculation alone does not complete the operational workflow.

## Calculations

- When a calculation is needed, call `prepare_appeal_evidence` with `{ "case": ... }` if available. Follow its schema and supply the human owner and dated evidence for every data field. Use synthetic data by default and approved aggregate data only in operator-enabled mode.
- Leave results pending if evidence is missing or conflicting or if the tool rejects the case. Name the gap and draft what the evidence supports. Respect policy rejections across runtimes. Advice and checklists can proceed without a complete case.
- Treat successful results as `draft_for_human_review`. Carry the values, evidence and interpretation checks into the draft for the human owner.
