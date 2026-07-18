# Scale service-line-count fitness review implementation record

Date: 2026-07-18
Bead: `beads-1aq`
Branch: `codex/beads-1aq-service-line-count-review`
Disposition: blocked; `human_review_required`

## Scope and immutable lineage

This is serial stage 3/4 for `service_line_count`. It performs only two
independent-first fitness reviews, deterministic conflict analysis, and a
Toolkit handoff. It does not calculate, score, rank, run sensitivities,
populate a profile, project, recommend, adjudicate, promote, or deploy.

- Healthcare Agents review base: `0bf8fb60c789a441363389f1cd39a0868da5eb34`
- Data implementation merge: `599904b82e99ac389e632e2736415a04a01b633d`
- Data feature/tracker: `4ea01109986ffab16fb5efc493bd841d62c2c3cb` / `9204b5d4cf4a773d3596701e7b4cec5380a1a9f8`
- Toolkit implementation merge: `d57b1883044475f9dac87eae1ac6806fda1d9728` (PR #375)
- Toolkit feature/tracker: `eddba3c1b9949110ace23738cb4daaa2635feb96` / `3d612de3c5137624e845771334807e550bbf8b83` (tracker PR #376)
- Toolkit normalized/runtime handoff bytes: `sha256:aea012f0382a99b22fdc430e3b1111d959dd1ad23f76cd752581b6449b542584` / `sha256:805118104932fc7d9fa2541871ba9313c1075520510ed02f6736670660d10593`

The verifier proved feature-to-producer-to-tracker ancestry and exact Git
object equality for both upstream repositories.

## Evidence and generated hashes

- Acquisition: raw `sha256:59a1debb97e6dd3cb2cbc6ce680c996cac8dbd17050c3b55563d3c90fa1f3946`; semantic `sha256:87b8b2ded72ad667ed51c9d99cc9df8f7e86adff4472b1fa883175a96091c5ca`
- Normalized input: raw `sha256:22321f105525f32475d395739021ba6730e4b86ab044e85b24fac639e0b265f4`
- Producer-bound input: raw `sha256:3b00ae6473196902b28de35ff2b00669446fe2301044788d65b7d60b4c68eeb9`; semantic `sha256:0e4d0ade949873603638abb1d6e3542ecc7a038be191d139affe6583faa921b2`
- Evidence bundle: raw `sha256:e706ec3f986eded782bca2b5e14bf8b12ab7f9b2acd5f2b5caa4a160fdc318d4`; semantic `sha256:dfda9c60da75e2cb241c050965ec2cbeff9e3ebb305543ae859f4458345c81f9`
- Upstream manifest: raw `sha256:58bb0869dea559b38d42b18b105be4ad4ef306159d61c8f54fe77f13befeb770`; semantic `sha256:a879f19b759e4506e1b90332d56c648576bdca85e08e8ee5059d1384362179ff`
- Methods request/review/first assessment: `sha256:6605d1e88eecffcdd5bb6f036e4666a7cbb7e85dacd530659c7ad37072a21492` / `sha256:072263dcb2523d64a88b883bba13ca4e8b55076a6cb79eb444952d0326fe50cb` / `sha256:a7558e1fc75af434e436fdecfe8ce3d91a05f9f5f9b23baa83f7a31f1dae7744`
- Limited portfolio/rights governance request/review/first assessment: `sha256:f302845edb21860f2e1f0affe61e2ec4766dd13cd394f866047606eafe517f5e` / `sha256:02a1c8fe0d23ff8905734553651a64b57661314f0e20a8086df4ad5a596e9158` / `sha256:0d72a93b133c741cce87d8e31228db898d286d23c4eca0937660a98cbfe4cf12`
- Conflict request/output: `sha256:06e715fd79e5c465231878c1bb4fefa855d2d2f12f651484443af02e9bf67f7e` / `sha256:33ffabd5c46c0a70547c6eb8cb8d5479c4f0d514d958628270ebbcdf883ba5ff`
- Agents handoff: raw `sha256:4a3e52d87ae0be8e65b0a18dfe68201b9d40d3529d01d7ceff6640b17162a71e`; semantic `sha256:a324aaa92b3197f2cf8538fc44098ac268a23ae78c08a18e93de369743fcb16f`

## Review result and blockers

The cumulative packet remains 54 cells: zero populated, 30
`blocked_source_conflict`, six `unavailable_public`, and 18
`not_yet_researched`. Twenty-nine conflicts remain open. All ten comparability
gates remain unresolved (seven blocked and three not assessed). The conflict
artifact preserves three material discrepancies and both independent concern
arrays: 216 methods concerns (exact 202-item methods ancestry plus 14 new) and
218 governance concerns (exact 202-item workforce ancestry plus 16 new).

AHRQ supplies identity but no service-line field. CMS RBCS describes paid
Medicare Part B HCPCS activity rather than offered services. Both source-access
reviews remain `unknown_review_required`; reuse of embedded CPT/HCPCS content
also lacks clearance. Marketing-page hand counting, claims aggregation,
facility inference, imputation, and fabricated zeroes remain prohibited.

The active registry has no service-taxonomy competence lane. The second review
uses `cso.transaction-regulatory-governance.v1` only for bounded portfolio,
rights, transaction, and governance constraints. It is not taxonomy competence
and conveys no taxonomy or human authority. A qualified human taxonomy review
therefore remains an explicit blocker.

Every output-inventory field is zero: adjudications, component scores,
deployments, formula executions, projections, promotion attempts,
recommendations, Scale scores, and sensitivity runs.

## Verification

- Deterministic generator: two isolated invocations reproduced every generated fixture byte-for-byte.
- Service-line adversarial suite: passed.
- Shared kernel plus operating-revenue, annual-discharges, and physician-count regression suites: passed.
- External upstream verifier against the pinned Data and Toolkit repositories: passed.
- Release-manifest validation and npm packlist validation: passed.
- Exact-head `npm run release:check`: passed, including the service-line suite.
- Installed-tarball smoke: passed.
- Two clean-checkout rebuilds: byte-identical to each other and the committed fixture tree.

## Tracker synchronization

The required initial `bd-agent-sync pull` was attempted in the fresh clone and
reported `No active beads workspace found.` The workspace was then initialized
from the repository-managed JSONL export, and only `beads-1aq` was assigned and
moved to `in_progress`. The implementation diff excludes `.beads`. A final
`bd-agent-sync push` then imported and exported 92 issues, found no pending
Dolt change, and reported only that the locally excluded `.beads` path could
not be staged; it did not publish or alter the implementation diff. The known
cross-repository Dolt divergence did not recur in this isolated Agents
workspace and was not repaired. Tracker closure remains a separate post-merge
change.

## Privacy, runtime, and rollback

The fixtures contain public institutional evidence and deterministic review
metadata only; no patient, employee, credential, secret, or production data is
introduced. The implementation adds no route, database migration, network
service, runtime configuration, production write, profile mutation, or
deployment behavior. Runtime impact is limited to opt-in local Node generators,
validators, and tests.

Rollback is additive: revert the final implementation commit to remove the
service-line adapter, scripts, fixtures, documentation, package entries, and
the family-neutral unavailable-state extension. Existing v1 review contracts
and the prior three Scale family fixtures remain unchanged and independently
verifiable.
