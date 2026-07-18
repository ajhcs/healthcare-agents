#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { analyzeReviewConflicts } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const {
  ANNUAL_DISCHARGES_CANONICAL_CONTEXT,
  deriveAnnualDischargesCanonical
} = require('../lib/scale-annual-discharges-canonical');
const {
  PROHIBITED_USES,
  ZERO_OUTPUT_KEYS,
  stablePrettyJson,
  validateAnnualDischargesReviewHandoff,
  validateAnnualDischargesReviewRequest,
  validateAnnualDischargesUpstream
} = require('../lib/scale-annual-discharges-review');
const { evaluateStrategicReview } = require('../lib/strategic-review');
const { rebuildEvidenceChain } = require('../lib/scale-input-fitness-kernel');
const {
  DATA_PRODUCER, EVIDENCE_BUNDLE_REF, PRIOR_COUNTS,
  TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_PRODUCER
} = ANNUAL_DISCHARGES_CANONICAL_CONTEXT.constants;

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'annual-discharges');
const UPSTREAM = path.join(OUT, 'upstream');
const roles = Object.fromEntries(Object.entries(ANNUAL_DISCHARGES_CANONICAL_CONTEXT.objectArtifactRefs)
  .map(([role, artifactRef]) => [role, artifactRef.replace(/^upstream\//, '')]));
const evidencePaths = ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths;

const objects = {};
const artifactHashes = {};
for (const [role, relativePath] of Object.entries(roles)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  objects[role] = JSON.parse(raw);
  artifactHashes[role] = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
}
const normalizedInput = JSON.parse(fs.readFileSync(path.join(UPSTREAM, evidencePaths.normalized_input), 'utf8'));
const { producerBoundInput, publicEvidenceBundle } = rebuildEvidenceChain(normalizedInput, DATA_PRODUCER);
fs.writeFileSync(path.join(UPSTREAM, evidencePaths.producer_bound_input), stablePrettyJson(producerBoundInput));
fs.writeFileSync(path.join(UPSTREAM, evidencePaths.public_evidence_bundle), stablePrettyJson(publicEvidenceBundle));
const evidenceArtifacts = {};
for (const [role, relativePath] of Object.entries(evidencePaths)) {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  evidenceArtifacts[role] = {
    value: JSON.parse(raw),
    raw_hash: 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex')
  };
}

const {
  upstreamManifest, methodsRequest, operationsRequest, annualConflicts
} = deriveAnnualDischargesCanonical({
  objects,
  artifactHashes
});
const methodsReview = evaluateStrategicReview(methodsRequest);
const operationsReview = evaluateStrategicReview(operationsRequest);
const conflictRequest = {
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:scale-annual-discharges:2026-07-18',
  review_tier: 'ordinary_material_claim',
  reviews: [methodsReview, operationsReview]
};
const conflictAnalysis = analyzeReviewConflicts(conflictRequest);
const handoffBody = {
  schema_version: 'ushso.scale-input-fitness-review-handoff.v1',
  active_family: 'annual_discharges',
  upstream_manifest_hash: upstreamManifest.manifest_sha256,
  toolkit_producer_commit: TOOLKIT_PRODUCER,
  data_producer_commit: DATA_PRODUCER,
  toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_lineage: upstreamManifest.evidence_lineage,
  review_hashes: { methods: methodsReview.output_sha256, utilization_operations: operationsReview.output_sha256 },
  first_assessment_hashes: { methods: methodsReview.first_assessment_hash, utilization_operations: operationsReview.first_assessment_hash },
  conflict_output_hash: conflictAnalysis.output_sha256,
  prior_counts: PRIOR_COUNTS,
  annual_discharges_blocked_cell_count: 6,
  annual_discharges_open_conflict_count: 6,
  annual_discharges_open_conflict_refs: annualConflicts,
  cumulative_open_conflict_count: 17,
  cumulative_cell_counts: { total: 54, populated: 0, blocked_source_conflict: 24, not_yet_researched: 30 },
  final_disposition: 'block',
  route: 'human_competence_matched_adjudication',
  automatic_resolution: 'prohibited',
  positions_averaged: false,
  adjudication_performed: false,
  human_authority_conveyed: false,
  output_inventory: Object.fromEntries(ZERO_OUTPUT_KEYS.map(key => [key, 0])),
  prohibited_uses: [...PROHIBITED_USES],
  downstream_bead: 'healthcare-toolkit-2rr9.6.3.4'
};
const handoff = { ...handoffBody, handoff_sha256: sha256(handoffBody) };
const handoffMessages = validateAnnualDischargesReviewHandoff(handoff, [methodsReview, operationsReview], conflictAnalysis, upstreamManifest, objects, artifactHashes, evidenceArtifacts);
if (handoffMessages.length) throw new Error(handoffMessages.join('; '));

const outputs = {
  'upstream-manifest.json': upstreamManifest,
  'methods-review-request.json': methodsRequest,
  'utilization_operations-review-request.json': operationsRequest,
  'methods-review.json': methodsReview,
  'utilization_operations-review.json': operationsReview,
  'conflict-analysis-request.json': conflictRequest,
  'conflict-analysis.json': conflictAnalysis,
  'handoff.json': handoff
};
for (const [name, value] of Object.entries(outputs)) fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
console.log(`Generated annual-discharges fitness review: ${methodsReview.output_sha256}, ${operationsReview.output_sha256}, ${conflictAnalysis.output_sha256}, ${handoff.handoff_sha256}`);
