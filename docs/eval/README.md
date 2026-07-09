# Eval and Release Gates

This directory contains tracked, no-network evidence for prompt quality and
release readiness.

- `scorecard.md` and `scorecard.json` are generated from `eval/results.tsv`.
  Current public claims must match these files.
- `routing-benchmark.json` is the deterministic labeled benchmark for
  `healthcare-agents choose`. Run `node scripts/run-routing-benchmark.js`.
- `canary-suite.json` is the scenario-level release canary bank. Run it with a
  configured model before publication, store artifacts under ignored
  `eval/run-logs/<date>/canaries/`, and feed failures into the self-improvement
  loop for the named primary agent.
- Scenarios whose IDs start with `hab-` are synthetic, prompt-level reliability
  probes derived from HealthAdminBench's published failure taxonomy. They test
  state carryover, document transitions, cross-system reconciliation, and
  terminal completion. They are not substitutes for running the benchmark's
  GUI environments.

Canary runs are not a substitute for human healthcare authority. They check
structure, safety boundaries, handoffs, and deliverable shape; final clinical,
legal, coding, billing, audit, compliance, contracting, employment, and executive
decisions remain with the named human owners.
