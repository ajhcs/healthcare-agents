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
protocol hash, review tier, competence-routed reviewer identity, independence
and conflict disclosure, criterion-specific evidence, and an independently
exposed candidate assessment. The checked-in JSON Schemas are the runtime
structural authority. Semantic validation additionally rejects evidence
mutation, unknown evidence/claim references, incomplete posture or criterion
coverage, protocol drift, direct material conflicts, prior exposure,
recommendation/score fields, and model-claimed human authority. Valid output is
canonical `ushso.strategic-review.v1` JSON.

`lib/conflict-analysis.js` compares schema-valid reviews over the same frozen
hashes. It rejects duplicate reviewer identities and incomplete ordinary or
high-consequence review cohorts, preserves both positions, compares evidence,
warrants, limitations, overturn conditions, challenges, prohibited claims, and
concerns, and routes material differences to human competence-matched
adjudication. Its output is advisory; automatic resolution is prohibited.

Scale input fitness fixtures are cumulative and family-specific. The
`annual-discharges` fixture binds the exact Data MCP acquisition and Toolkit
packet, routes independent-first evidence/methods and utilization-operations
reviews, preserves every earlier discrepancy, concern, conflict, and overturn
gate, and emits only a blocked human-review handoff. It is not a Scale
calculation, sensitivity, projection, recommendation, adjudication, or release.

The `physician-count` fixture continues that cumulative chain with an
independent-first evidence/methods review and physician-workforce review. It
keeps all source-local `total_mds` candidates unapproved until physician roster,
employment, affiliation, credentialing, active-status, specialty, deduplication,
APP-inclusion, current-vintage, and aggregation bases are comparable.

### Family-module maintainability

The operating-revenue, annual-discharges, and physician-count adapters share
the fail-closed validation, deterministic evidence rebuild, and pinned-upstream
verification kernels. Each family keeps only its frozen constants, specialist
routing, cumulative counts, prior-record checks, and other family-specific
invariants. Cross-family tests prove that a valid packet for one family is
rejected by the others, while two isolated rebuilds and checked-in fixture
comparisons preserve exact canonical bytes.

## Human boundary

Agent slugs in the registry are candidate prompt implementations, not proof of
professional qualification. A named human must verify reviewer competence and
owns professional disposition, material residual disagreement, adjudication,
and release approval. No registry or model output may represent an affected
community stakeholder.

Contract v1 files are immutable. Breaking changes require a new schema version,
new protocol version, regenerated index, compatibility tests, and named human
approval of the professional standard.
