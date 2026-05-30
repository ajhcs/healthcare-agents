# Workflow Contribution Guide

New workflows should be added to `workflows/workflows.json` and must pass `node scripts/validate-workflows.js` and `node scripts/validate-workup-canaries.js`.

Required contribution elements:

- Schema-compliant workflow definition.
- Explicit safety constraints using `safety/snippets.json` keys.
- At least one example input and one canary test.
- Primary specialist and handoff specialists that exist in `agents/registry.json`.
- Output artifact sections and a quality checklist expectation.
- Platform prompt templates for Claude, Codex, GitHub Copilot, and Microsoft 365 Copilot.

Do not add workflows that require direct EHR access, hosted PHI processing, medical-device behavior, diagnosis, treatment, or emergency medical guidance.
