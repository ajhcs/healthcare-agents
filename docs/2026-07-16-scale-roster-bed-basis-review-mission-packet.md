# Scale Roster and Bed-Basis Review Mission Packet

Tracking bead: `beads-0z7`

Cross-repository parent: `healthcare-toolkit-2rr9.6`

Upstream bead: Healthcare Data MCP `HDM-nuq`

Downstream bead: Healthcare Toolkit `healthcare-toolkit-2rr9.6.1`

## Mission

Evaluate whether the frozen all-six system identity, hospital roster, and bed-
basis evidence is fit for later cross-system Scale use. Produce structured,
independent-first specialist review and conflict analysis. Do not calculate a
Scale score, choose a strategic posture, adjudicate professional concerns, or
authorize public release.

## Frozen boundary

- Start from merged Agents main `0618e4a688b6e5322b96ccce719dfca18d1a0305`.
- Consume the exact `ushso.public-evidence-bundle.v1` hash handed off by
  `HDM-nuq` and a Toolkit-owned Decision Scenario/identity binding hash.
- Use the published Review Protocol Registry plus
  `ushso.review-request.v1`, `ushso.strategic-review.v1`, and
  `ushso.ai-conflict-analysis.v1` as the authoritative schema/runtime contract.
- Agents owns competence routing, review depth, independent-first evaluation,
  discrepancies, and structured methods concerns. It does not mutate evidence,
  run Toolkit formulas, approve projections, or impersonate human authority.

## Required review questions

The review must address, with criterion-specific evidence references:

1. Are the six system identities and facility rosters bounded consistently for
   the intended Scale comparison date and geography?
2. Are bed measures comparable by basis, facility status, reporting period,
   denominator, and aggregation rule?
3. Do missingness and source conflicts prevent a common all-six denominator?
4. Could ownership changes, aliases, children, joint ventures, specialty-only
   facilities, or inactive sites create double counting or omissions?
5. What evidence would overturn each material concern, and which claims remain
   prohibited until that evidence exists?

Review depth must route at least evidence/methods competence and the frozen
operations/access/capacity/workforce subject competence. Reviewer identities
must be unique; competence, conflicts, prior exposure, and first-assessment
hashes must validate for every reviewer.

## Conflict completeness

Conflict analysis covers evidence references, warrants, limitations, overturn
conditions, challenges, prohibited claims, discrepancies, and preserved
concerns. It must not collapse conflicts into narrative prose or omit a concern
because the overall disposition is no-go. Any accepted-use disposition still
requires named human professional adjudication outside this bead.

## Deliverables

- A frozen review request bound to the upstream bundle, Toolkit scenario, and
  identity hashes.
- Structured specialist review and AI conflict-analysis envelopes with complete
  protocol/reviewer provenance and no evidence mutation.
- Adversarial fixtures for mismatched bed bases, stale ownership, roster double
  counting, missing all-six coverage, duplicate reviewers, incomplete criterion
  evidence, and fabricated authority.
- A handoff of exact output hashes and unresolved concerns to
  `healthcare-toolkit-2rr9.6.1`.

## Verification

Run `npm run release:check`, JSON Schema/runtime parity, malformed-envelope
tests, competence/conflict/depth cases, criterion-evidence cases, duplicate-
reviewer cases, and adversarial discrepancy fixtures. Review the exact diff
against repository standards and this packet. Hard/high findings block handoff;
medium findings require correction or an explicit packet disposition.

## Authority and sequencing

This bead remains unassigned until `HDM-nuq` freezes its verified bundle. At
handoff, assign exactly one implementation owner; do not overlap ownership with
Toolkit implementation. Human professional review, adjudication, and release
approval remain mandatory and outside the model's authority.

## No-go and rollback

If identity, roster, temporal, or bed-basis comparability is incomplete, the
valid output is a structured no-go with preserved concerns. Do not calculate or
recommend a partial Scale result.

Rollback is a reviewable revert of additive protocol fixture, evaluator test,
and documentation changes. Do not rewrite merged contract v1 or historical
evaluation records; publish a new contract version for breaking changes.
