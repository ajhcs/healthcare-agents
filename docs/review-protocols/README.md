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

The `service-line-count` fixture adds six explicitly `unavailable_public`
cells. AHRQ establishes identity but contains no service-line field, while CMS
RBCS classifies paid Medicare Part B activity rather than offered services.
It routes evidence/methods review plus a deliberately limited portfolio,
source-rights, transaction, and governance review. The latter is not taxonomy
competence: the registry gap remains an explicit blocker and human route.

The `safety-net-patient-mix` fixture appends six more
`unavailable_public` cells. AHRQ's binary high-burden indicators are not
patient-mix percentages, and CMS FY 2024 DPP combines two hospital/IPPS
fractions with different denominators. Independent-first evidence/methods and
population-health/health-services reviews preserve the exact 35 prior
discrepancies and 434 ordered prior concern entries, append three new
discrepancies and 28 new concern entries, and route all unresolved numerator,
denominator, attribution, setting, boundary, period, selection, ecological,
and transportability questions to named human competence-matched review.

The `emergency-department-count` fixture appends six unavailable cells and
routes independent-first evidence/methods plus the exact registered
operations/access/capacity lane. AHRQ hospital membership, CMS facility-level
Emergency Services flags, and the 42 CFR dedicated-department definition do
not enumerate dedicated emergency departments at one approved product-system
boundary and period. The review therefore prohibits flag summation, facility
aggregation, campus inference, missing-as-no, and fabricated zeroes, and
retains all definition, multiplicity, roster, period, and rights questions for
named human competence-matched review.

### Family-module maintainability

The operating-revenue, annual-discharges, physician-count,
service-line-count, safety-net-patient-mix, and emergency-department-count
adapters share
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
