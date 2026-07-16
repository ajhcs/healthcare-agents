# Review Protocol Registry

Healthcare Agents owns versioned, role-specific standards for AI-assisted
review. It does not own evidence acquisition, deterministic metric formulas,
professional credentials, adjudication, product truth, or release approval.

The canonical registry is [`review-protocols/registry.json`](../../review-protocols/registry.json).
It defines seven competence-routed protocols and the frozen USHSO posture
taxonomy. [`review-protocols/index.json`](../../review-protocols/index.json) is
the generated compact consumer surface with content hashes.

## Evaluate a frozen review

```bash
healthcare-agents review protocols --json
healthcare-agents review evaluate \
  --input review-protocols/fixtures/evidence-methods-review-request.json \
  --output /tmp/strategic-review.json
```

The evaluator accepts a frozen evidence bundle reference/hash, identity
binding, deterministic computations, atomic claims, Decision Scenario, exact
protocol hash, and an independently exposed candidate assessment. It rejects
evidence mutation, unknown evidence/claim references, incomplete posture
coverage, protocol drift, recommendation/score fields, and model-claimed human
authority. Valid output is canonical `ushso.strategic-review.v1` JSON.

`lib/conflict-analysis.js` compares two or more schema-valid reviews over the
same frozen hashes. It preserves both positions, types discrepancies, and
routes material differences to human competence-matched adjudication. Its
output is advisory; automatic resolution is prohibited.

## Human boundary

Agent slugs in the registry are candidate prompt implementations, not proof of
professional qualification. A named human must verify reviewer competence and
owns professional disposition, material residual disagreement, adjudication,
and release approval. No registry or model output may represent an affected
community stakeholder.

Contract v1 files are immutable. Breaking changes require a new schema version,
new protocol version, regenerated index, compatibility tests, and named human
approval of the professional standard.
