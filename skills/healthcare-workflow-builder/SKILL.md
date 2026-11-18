---
name: healthcare-workflow-builder
description: Create or adapt a reusable local workflow for US healthcare administration when the user wants a repeatable artifact, a defined evidence contract, and human review.
license: Apache-2.0
---

# Build a healthcare workflow

Deliver a reusable local bundle for the user's artifact. Use [the community interview example](../../workflows/admin-v2/custom-example.json) for the supported contract shape.

- Describe who will use the artifact, the decision it supports, and what a reviewer should be able to verify. Choose one primary specialist and name the accountable human owner.
- Specify the minimum required inputs, how to identify their sources and dates, and which gaps or conflicts would leave a conclusion pending. Write steps for domain decisions and evidence checks. Let the host choose routine mechanics. Turn the user's requested format and review criteria into `output_sections` and `acceptance`.
- Run `healthcare-agents admin validate <spec.json>`, then `healthcare-agents admin build <spec.json> --output <new-directory>`. Read back the generated skill and reference, check the case template against the input fields, and verify the manifest against the generated files.
- Exercise a synthetic or approved aggregate example and one missing or conflicting evidence case. Compare the resulting drafts against known facts and the acceptance criteria. If the workflow produces a visual, use a governing example when available and check the output at its intended size, including any interactions. Report any checks still pending.

Use an approved environment and minimum necessary controls for PHI. Keep regulated decisions and external actions with authorized human owners. The reviewed local bundle is the deliverable. Activation and deployment require their own scope.
