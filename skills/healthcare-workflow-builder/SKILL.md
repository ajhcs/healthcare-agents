---
name: healthcare-workflow-builder
description: Build a reusable local healthcare administration workflow from a defined outcome, evidence fields, specialist owner and acceptance criteria. Use when an existing workflow does not fit or the user asks to customize one.
license: Apache-2.0
---

# Build a healthcare workflow

Start from the user's outcome and actual evidence. Choose one primary specialist, a responsible human owner, the smallest useful input set and observable completion criteria.

Use [the example contract](../../workflows/admin-v2/custom-example.json). Each input needs a source and date; distinguish required facts from assumptions. Steps should describe meaningful domain decisions rather than prescribe a conversation script.

Run healthcare-agents admin validate <spec.json>, then healthcare-agents admin build <spec.json> --output <new-directory>. The builder creates a compact skill, workflow reference, case template and hashed manifest; it rejects unsupported fields and existing destinations.

Test the generated workflow on a synthetic or approved aggregate example and one missing or conflicting evidence case. Verify the artifact against independent expected facts and its acceptance criteria. A schema-valid skill has not yet demonstrated model usefulness.

Keep clinical decisions and consequential approvals with qualified owners. The generated pack grants no credentials, scheduling, external action or PHI-processing authority. Deployment and source review remain separate from local file generation.
