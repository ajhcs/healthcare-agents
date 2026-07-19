#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { analyzeReviewConflicts } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const {
  EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT,
  deriveEmergencyDepartmentCountCanonical
} = require('../lib/scale-emergency-department-count-canonical');
const {
  PROHIBITED_USES,
  ZERO_OUTPUT_KEYS,
  stablePrettyJson,
  validateEmergencyDepartmentCountReviewHandoff,
  validateEmergencyDepartmentCountReviewRequest,
  validateEmergencyDepartmentCountUpstream
} = require('../lib/scale-emergency-department-count-review');
const { evaluateStrategicReview } = require('../lib/strategic-review');
const { rebuildEvidenceChain } = require('../lib/scale-input-fitness-kernel');
const {
  DATA_PRODUCER, EVIDENCE_BUNDLE_REF, PRIOR_COUNTS,
  TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH, TOOLKIT_PRODUCER
} = EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.constants;

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'emergency-department-count');
const UPSTREAM = path.join(OUT, 'upstream');
const roles = Object.fromEntries(Object.entries(EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.objectArtifactRefs)
  .map(([role, artifactRef]) => [role, artifactRef.replace(/^upstream\//, '')]));
const evidencePaths = EMERGENCY_DEPARTMENT_COUNT_CANONICAL_CONTEXT.evidencePaths;

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
  upstreamManifest, methodsRequest, operationsRequest, priorDiscrepancies,
  emergencyDepartmentConflicts
} = deriveEmergencyDepartmentCountCanonical({
  objects,
  artifactHashes
});
const methodsReview = evaluateStrategicReview(methodsRequest);
const operationsReview = evaluateStrategicReview(operationsRequest);
const conflictRequest = {
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:scale-emergency-department-count:2026-07-19',
  review_tier: 'ordinary_material_claim',
  reviews: [methodsReview, operationsReview]
};
const conflictAnalysis = analyzeReviewConflicts(conflictRequest);
const handoffBody = {
  schema_version: 'ushso.scale-input-fitness-review-handoff.v1',
  active_family: 'emergency_department_count',
  upstream_manifest_hash: upstreamManifest.manifest_sha256,
  toolkit_producer_commit: TOOLKIT_PRODUCER,
  data_producer_commit: DATA_PRODUCER,
  toolkit_handoff_file_hash: TOOLKIT_HANDOFF_FILE_HASH,
  toolkit_runtime_handoff_file_hash: TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  evidence_bundle_ref: EVIDENCE_BUNDLE_REF,
  evidence_lineage: upstreamManifest.evidence_lineage,
  review_hashes: { methods: methodsReview.output_sha256, operations: operationsReview.output_sha256 },
  first_assessment_hashes: { methods: methodsReview.first_assessment_hash, operations: operationsReview.first_assessment_hash },
  conflict_output_hash: conflictAnalysis.output_sha256,
  prior_counts: PRIOR_COUNTS,
  prior_discrepancy_ids: priorDiscrepancies.map(item => item.discrepancy_id),
  current_discrepancy_ids: conflictAnalysis.discrepancies.map(item => item.discrepancy_id),
  cumulative_discrepancy_count: priorDiscrepancies.length + conflictAnalysis.discrepancies.length,
  emergency_department_count_unavailable_cell_count: 6,
  emergency_department_count_open_conflict_count: 6,
  emergency_department_count_open_conflict_refs: emergencyDepartmentConflicts,
  cumulative_open_conflict_count: 41,
  cumulative_cell_counts: { total: 54, populated: 0, blocked_source_conflict: 30, unavailable_public: 18, not_yet_researched: 6 },
  final_disposition: 'block',
  route: 'human_competence_matched_adjudication',
  automatic_resolution: 'prohibited',
  positions_averaged: false,
  adjudication_performed: false,
  human_authority_conveyed: false,
  output_inventory: Object.fromEntries(ZERO_OUTPUT_KEYS.map(key => [key, 0])),
  prohibited_uses: [...PROHIBITED_USES],
  downstream_bead: 'healthcare-toolkit-2rr9.6.3.12'
};
const handoff = { ...handoffBody, handoff_sha256: sha256(handoffBody) };
const handoffMessages = validateEmergencyDepartmentCountReviewHandoff(handoff, [methodsReview, operationsReview], conflictAnalysis, upstreamManifest, objects, artifactHashes, evidenceArtifacts);
if (handoffMessages.length) throw new Error(handoffMessages.join('; '));

const outputs = {
  'upstream-manifest.json': upstreamManifest,
  'methods-review-request.json': methodsRequest,
  'operations-review-request.json': operationsRequest,
  'methods-review.json': methodsReview,
  'operations-review.json': operationsReview,
  'conflict-analysis-request.json': conflictRequest,
  'conflict-analysis.json': conflictAnalysis,
  'handoff.json': handoff
};
for (const [name, value] of Object.entries(outputs)) fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
console.log(`Generated emergency-department-count fitness review: ${methodsReview.output_sha256}, ${operationsReview.output_sha256}, ${conflictAnalysis.output_sha256}, ${handoff.handoff_sha256}`);
