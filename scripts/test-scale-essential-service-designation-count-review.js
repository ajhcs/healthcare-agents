#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { analyzeReviewConflicts, validateConflictAnalysis, validateConflictRequest } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const {
  ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT,
  deriveEssentialServiceDesignationCountCanonical
} = require('../lib/scale-essential-service-designation-count-canonical');
const {
  ACQUISITION_RAW_HASH,
  ACQUISITION_REF,
  ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF,
  EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF,
  EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH,
  PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_RUNTIME_HANDOFF_FILE_HASH,
  validateEssentialServiceDesignationCountReviewHandoff,
  validateEssentialServiceDesignationCountReviewRequest,
  validateEssentialServiceDesignationCountUpstream
} = require('../lib/scale-essential-service-designation-count-review');
const { evaluateStrategicReview, validateReviewRequest, validateStrategicReview } = require('../lib/strategic-review');
const {
  validateConflictAnalysisShape,
  validateConflictRequestShape,
  validateReviewRequestShape,
  validateStrategicReviewShape
} = require('../lib/review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'essential-service-designation-count');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const generatedNames = ['upstream/data-mcp/producer-bound-input.json', 'upstream/data-mcp/public-evidence-bundle.json', 'upstream-manifest.json', 'methods-review-request.json', 'regulatory-review-request.json', 'methods-review.json', 'regulatory-review.json', 'conflict-analysis-request.json', 'conflict-analysis.json', 'handoff.json'];
const objectPaths = {
  prior_cumulative_packet: 'prior/cumulative-packet.json', cumulative_packet: 'cumulative-packet.json', decision_scenario: 'decision-scenario.json',
  identity_binding: 'identity-binding.json', no_execution_result: 'no-execution-result.json', process_claim: 'process-claim.json',
  prior_review_record: 'prior/cumulative-review-record.json', prior_assurance_case: 'prior/cumulative-module-assurance-case.json', toolkit_handoff: 'handoff.json'
};

function load(relativePath, base = FIXTURES) { return JSON.parse(fs.readFileSync(path.join(base, relativePath), 'utf8')); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rawHash(relativePath) { return 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(path.join(UPSTREAM, relativePath))).digest('hex'); }
function mutateAndValidate(mutator) {
  const mutated = clone(objects);
  mutator(mutated);
  return validateEssentialServiceDesignationCountUpstream(manifest, mutated, artifactHashes, evidenceArtifacts).join('; ');
}
function withSelfHash(value, hashField) {
  const body = Object.fromEntries(Object.entries(value).filter(([key]) => key !== hashField));
  return { ...body, [hashField]: sha256(body) };
}

function validateSynchronizedMutation(manifestMutator, requestMutator = () => {}) {
  let mutatedManifest = clone(manifest);
  manifestMutator(mutatedManifest);
  mutatedManifest = withSelfHash(mutatedManifest, 'manifest_sha256');
  const mutatedMethodsRequest = clone(methodsRequest);
  const mutatedRegulatoryRequest = clone(regulatoryRequest);
  requestMutator(mutatedMethodsRequest);
  requestMutator(mutatedRegulatoryRequest);
  const mutatedMethods = evaluateStrategicReview(mutatedMethodsRequest);
  const mutatedRegulatory = evaluateStrategicReview(mutatedRegulatoryRequest);
  const mutatedConflict = analyzeReviewConflicts({
    schema_version: 'ushso.ai-conflict-analysis-request.v1',
    request_id: conflictRequest.request_id,
    review_tier: conflictRequest.review_tier,
    reviews: [mutatedMethods, mutatedRegulatory]
  });
  let mutatedHandoff = clone(handoff);
  mutatedHandoff.upstream_manifest_hash = mutatedManifest.manifest_sha256;
  mutatedHandoff.review_hashes = {
    methods: mutatedMethods.output_sha256,
    regulatory: mutatedRegulatory.output_sha256
  };
  mutatedHandoff.first_assessment_hashes = {
    methods: mutatedMethods.first_assessment_hash,
    regulatory: mutatedRegulatory.first_assessment_hash
  };
  mutatedHandoff.conflict_output_hash = mutatedConflict.output_sha256;
  mutatedHandoff = withSelfHash(mutatedHandoff, 'handoff_sha256');
  return [
    ...validateEssentialServiceDesignationCountUpstream(mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateEssentialServiceDesignationCountReviewRequest(mutatedMethodsRequest, mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateEssentialServiceDesignationCountReviewRequest(mutatedRegulatoryRequest, mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateEssentialServiceDesignationCountReviewHandoff(mutatedHandoff, [mutatedMethods, mutatedRegulatory], mutatedConflict, mutatedManifest, objects, artifactHashes, evidenceArtifacts)
  ].join('; ');
}

const before = new Map(generatedNames.map(name => [name, fs.readFileSync(path.join(FIXTURES, name))]));
for (let build = 0; build < 2; build += 1) {
  const generation = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'generate-scale-essential-service-designation-count-review.js')], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(generation.status, 0, generation.stderr);
  for (const name of generatedNames) assert(before.get(name).equals(fs.readFileSync(path.join(FIXTURES, name))), `${name} rebuild ${build + 1} must be byte-identical`);
}

const objects = Object.fromEntries(Object.entries(objectPaths).map(([role, relativePath]) => [role, load(relativePath, UPSTREAM)]));
const artifactHashes = Object.fromEntries(Object.entries(objectPaths).map(([role, relativePath]) => [role, rawHash(relativePath)]));
const evidencePaths = {
  acquisition: 'data-mcp/acquisition.json',
  normalized_input: 'data-mcp/normalized-input.json',
  producer_bound_input: 'data-mcp/producer-bound-input.json',
  public_evidence_bundle: 'data-mcp/public-evidence-bundle.json'
};
const evidenceArtifacts = Object.fromEntries(Object.entries(evidencePaths).map(([role, relativePath]) => {
  const raw = fs.readFileSync(path.join(UPSTREAM, relativePath));
  return [role, { value: JSON.parse(raw), raw_hash: 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex') }];
}));
const manifest = load('upstream-manifest.json');
const methodsRequest = load('methods-review-request.json');
const regulatoryRequest = load('regulatory-review-request.json');
const methods = load('methods-review.json');
const regulatory = load('regulatory-review.json');
const conflictRequest = load('conflict-analysis-request.json');
const conflict = load('conflict-analysis.json');
const handoff = load('handoff.json');

assert.deepStrictEqual(ESSENTIAL_SERVICE_DESIGNATION_COUNT_CANONICAL_CONTEXT.evidencePaths, evidencePaths);
assert.deepStrictEqual(
  deriveEssentialServiceDesignationCountCanonical({ objects, artifactHashes }).upstreamManifest,
  manifest
);
assert.deepStrictEqual(validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactHashes, evidenceArtifacts), []);
for (const request of [methodsRequest, regulatoryRequest]) {
  assert.deepStrictEqual(validateReviewRequestShape(request), []);
  assert.deepStrictEqual(validateReviewRequest(request), []);
  assert.deepStrictEqual(validateEssentialServiceDesignationCountReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts), []);
  assert.strictEqual(request.candidate_review.exposure_status, 'independent_first');
  assert.strictEqual(request.candidate_review.overall_disposition, 'block');
}
for (const review of [methods, regulatory]) {
  assert.deepStrictEqual(validateStrategicReviewShape(review), []);
  assert.deepStrictEqual(validateStrategicReview(review), []);
  assert.strictEqual(review.professional_disposition_authority, 'human_required');
  assert.strictEqual(review.evaluation.advisory_only, true);
  assert.strictEqual(review.output_sha256, sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'output_sha256'))));
}
assert.deepStrictEqual(methodsRequest.frozen_inputs, regulatoryRequest.frozen_inputs);
assert.deepStrictEqual(methodsRequest.decision_scenario, regulatoryRequest.decision_scenario);
assert.strictEqual(methods.review_context_hash, regulatory.review_context_hash);
assert.notStrictEqual(methods.reviewer.reviewer_id, regulatory.reviewer.reviewer_id);
assert.strictEqual(methods.reviewer.independence.prior_exposure, 'none');
assert.strictEqual(regulatory.reviewer.independence.prior_exposure, 'none');
assert.strictEqual(methods.protocol.protocol_id, 'cso.evidence-methods-measurement.v1');
assert.strictEqual(methods.reviewer.agent_slug, 'healthit-clinical-data-analyst');
assert.strictEqual(regulatory.protocol.protocol_id, 'cso.transaction-regulatory-governance.v1');
assert.strictEqual(regulatory.reviewer.agent_slug, 'quality-compliance-officer');
const methodsRequestText = JSON.stringify(methodsRequest);
const regulatoryRequestText = JSON.stringify(regulatoryRequest);
for (const leaked of [regulatoryRequest.request_id, regulatoryRequest.reviewer.reviewer_id, regulatory.review_id, regulatory.output_sha256]) assert(!methodsRequestText.includes(leaked), `methods request must not leak later regulatory review state: ${leaked}`);
for (const leaked of [methodsRequest.request_id, methodsRequest.reviewer.reviewer_id, methods.review_id, methods.output_sha256]) assert(!regulatoryRequestText.includes(leaked), `regulatory request must not leak methods review state: ${leaked}`);

assert.deepStrictEqual(validateConflictRequestShape(conflictRequest), []);
assert.deepStrictEqual(validateConflictRequest(conflictRequest), []);
assert.deepStrictEqual(validateConflictAnalysisShape(conflict), []);
assert.deepStrictEqual(validateConflictAnalysis(conflict), []);
assert.strictEqual(conflict.discrepancies.length, 3);
assert(conflict.discrepancies.every(item => item.material && item.human_route_required && item.deterministic_resolution === null));
assert.strictEqual(conflict.automatic_resolution, 'prohibited');
assert.strictEqual(methodsRequest.candidate_review.preserved_reviewer_concerns.length, 258);
assert.strictEqual(regulatoryRequest.candidate_review.preserved_reviewer_concerns.length, 260);
assert.deepStrictEqual(methodsRequest.candidate_review.preserved_reviewer_concerns.slice(0, 244), objects.prior_review_record.current_methods_preserved_concerns);
assert.deepStrictEqual(regulatoryRequest.candidate_review.preserved_reviewer_concerns.slice(0, 246), objects.prior_review_record.current_operations_preserved_concerns);
assert.strictEqual(conflict.preserved_reviewer_concerns.length, 518);
assert.deepStrictEqual(validateEssentialServiceDesignationCountReviewHandoff(handoff, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts), []);
assert.strictEqual(handoff.downstream_bead, 'healthcare-toolkit-2rr9.6.3.14');
assert.deepStrictEqual(handoff.cumulative_cell_counts, { total: 54, populated: 0, blocked_source_conflict: 30, unavailable_public: 24, not_yet_researched: 0 });
assert.deepStrictEqual(handoff.prior_counts, {
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, physician_methods_preserved_concerns: 202,
  physician_workforce_preserved_concerns: 202,
  service_line_discrepancies: 3, service_line_methods_preserved_concerns: 216,
  service_line_governance_preserved_concerns: 218,
  safety_net_discrepancies: 3, safety_net_methods_preserved_concerns: 230,
  safety_net_population_health_preserved_concerns: 232,
  emergency_department_discrepancies: 3, current_methods_preserved_concerns: 244,
  current_operations_preserved_concerns: 246,
  cumulative_discrepancies: 41, prior_review_open_conflicts: 41
});
assert.strictEqual(handoff.prior_discrepancy_ids.length, 41);
assert.strictEqual(handoff.current_discrepancy_ids.length, 3);
assert.strictEqual(handoff.cumulative_discrepancy_count, 44);
assert.strictEqual(manifest.toolkit_handoff_file_hash, TOOLKIT_HANDOFF_FILE_HASH);
assert.strictEqual(manifest.toolkit_runtime_handoff_file_hash, TOOLKIT_RUNTIME_HANDOFF_FILE_HASH);
assert(objects.identity_binding.observation_bindings.every(binding => binding.source_candidate_value === null));
assert(objects.identity_binding.observation_bindings.every(binding => binding.approved_value === null && binding.input_state === 'unavailable_public' && binding.source_backed_zero === false && binding.imputed === false));
assert(Object.values(handoff.output_inventory).every(value => value === 0));
assert.strictEqual(methodsRequest.frozen_inputs.evidence_bundle_ref, EVIDENCE_BUNDLE_REF);
assert.strictEqual(manifest.evidence_lineage.committed_input_ref, COMMITTED_INPUT_REF);
assert.strictEqual(manifest.evidence_lineage.acquisition_ref, ACQUISITION_REF);
assert.strictEqual(manifest.evidence_lineage.acquisition_raw_hash, ACQUISITION_RAW_HASH);
assert.strictEqual(manifest.evidence_lineage.acquisition_semantic_hash, ACQUISITION_SEMANTIC_HASH);
assert.strictEqual(manifest.evidence_lineage.normalized_input_raw_hash, NORMALIZED_INPUT_RAW_HASH);
assert.strictEqual(manifest.evidence_lineage.producer_bound_input_raw_hash, PRODUCER_BOUND_INPUT_RAW_HASH);
assert.strictEqual(manifest.evidence_lineage.bundle_raw_hash, EVIDENCE_BUNDLE_RAW_HASH);
assert.strictEqual(manifest.evidence_lineage.bundle_semantic_hash, EVIDENCE_BUNDLE_SEMANTIC_HASH);

// Evidence locator and normalized -> producer-bound -> bundle lineage fail closed.
for (const ref of [
  `git:${manifest.producer_pins.healthcare_data_mcp}:contracts/scale-inputs/v1/fixtures/essential-service-designation-count/public-evidence-bundle.json`,
  'https://example.invalid/public-evidence-bundle.json'
]) {
  const badRef = clone(methodsRequest);
  badRef.frozen_inputs.evidence_bundle_ref = ref;
  assert.match(validateEssentialServiceDesignationCountReviewRequest(badRef, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /truthful deterministic rebuild URI/);
}
const wrongPath = clone(manifest);
wrongPath.evidence_lineage.committed_input_ref = `git:${manifest.producer_pins.healthcare_data_mcp}:contracts/v1/fixtures/does-not-exist.json`;
wrongPath.manifest_sha256 = sha256(Object.fromEntries(Object.entries(wrongPath).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateEssentialServiceDesignationCountUpstream(wrongPath, objects, artifactHashes, evidenceArtifacts).join('; '), /committed evidence input Git path drift/);
for (const field of ['normalized_input_artifact_ref', 'producer_bound_input_artifact_ref', 'bundle_artifact_ref']) {
  const wrongArtifactRef = clone(manifest);
  wrongArtifactRef.evidence_lineage[field] = 'upstream/data-mcp/does-not-exist.json';
  wrongArtifactRef.manifest_sha256 = sha256(Object.fromEntries(Object.entries(wrongArtifactRef).filter(([key]) => key !== 'manifest_sha256')));
  assert.match(validateEssentialServiceDesignationCountUpstream(wrongArtifactRef, objects, artifactHashes, evidenceArtifacts).join('; '), /must resolve to the exact packaged evidence artifact/);
}
for (const [role, expected] of [
  ['acquisition', /acquisition exact bytes drift/],
  ['normalized_input', /normalized evidence input exact bytes drift/],
  ['producer_bound_input', /producer-bound evidence input exact bytes drift/],
  ['public_evidence_bundle', /public evidence bundle exact bytes drift/]
]) {
  const driftedArtifacts = clone(evidenceArtifacts);
  driftedArtifacts[role].raw_hash = 'sha256:' + '8'.repeat(64);
  assert.match(validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactHashes, driftedArtifacts).join('; '), expected);
}
const normalizedContentDrift = clone(evidenceArtifacts);
normalizedContentDrift.normalized_input.value.producer.version = 'fabricated';
assert.match(validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactHashes, normalizedContentDrift).join('; '), /producer-bound evidence input must differ only|deterministic rebuild hash mismatch/);
const boundContentDrift = clone(evidenceArtifacts);
boundContentDrift.producer_bound_input.value.producer.commit = '9'.repeat(40);
assert.match(validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactHashes, boundContentDrift).join('; '), /producer-bound evidence input must differ only|commit drift/);
const bundleSemanticDrift = clone(evidenceArtifacts);
bundleSemanticDrift.public_evidence_bundle.value.bundle_sha256 = 'sha256:' + 'a'.repeat(64);
assert.match(validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactHashes, bundleSemanticDrift).join('; '), /semantic self-hash drift/);

// Raw and semantic upstream drift are rejected independently.
const artifactDrift = { ...artifactHashes, toolkit_handoff: 'sha256:' + '0'.repeat(64) };
assert.match(validateEssentialServiceDesignationCountUpstream(manifest, objects, artifactDrift, evidenceArtifacts).join('; '), /exact artifact bytes drift|frozen raw hash/);
const commitDrift = clone(manifest);
commitDrift.producer_pins.healthcare_toolkit = '1'.repeat(40);
assert.match(validateEssentialServiceDesignationCountUpstream(commitDrift, objects, artifactHashes, evidenceArtifacts).join('; '), /self-hash|Toolkit producer pin drift/);
for (const [field, expected] of [
  ['toolkit_feature', /Toolkit feature\/tracker provenance drift/],
  ['toolkit_tracker', /Toolkit feature\/tracker provenance drift/],
  ['data_feature', /Data feature\/tracker provenance drift/],
  ['data_tracker', /Data feature\/tracker provenance drift/]
]) {
  const driftedProvenance = clone(manifest);
  driftedProvenance.producer_provenance[field] = '6'.repeat(40);
  driftedProvenance.manifest_sha256 = sha256(Object.fromEntries(Object.entries(driftedProvenance).filter(([key]) => key !== 'manifest_sha256')));
  assert.match(validateEssentialServiceDesignationCountUpstream(driftedProvenance, objects, artifactHashes, evidenceArtifacts).join('; '), expected);
}
const semanticRepin = clone(manifest);
semanticRepin.objects.cumulative_packet.semantic_hash = 'sha256:' + '2'.repeat(64);
semanticRepin.manifest_sha256 = sha256(Object.fromEntries(Object.entries(semanticRepin).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateEssentialServiceDesignationCountUpstream(semanticRepin, objects, artifactHashes, evidenceArtifacts).join('; '), /semantic hash drift|exact Toolkit handoff pin/);
const normalizedHandoffRepin = mutateAndValidate(value => { value.toolkit_handoff.producer_pins.toolkit_runtime = value.toolkit_handoff.producer_pins.healthcare_data_mcp; });
assert.match(normalizedHandoffRepin, /normalized Toolkit handoff must preserve the zero runtime placeholder|deterministic substitution hash drift/);
for (const role of Object.keys(objectPaths)) {
  for (const locator of ['upstream/does-not-exist.json', undefined]) {
    const locatorDrift = clone(manifest);
    if (locator === undefined) delete locatorDrift.objects[role].artifact_ref;
    else locatorDrift.objects[role].artifact_ref = locator;
    locatorDrift.manifest_sha256 = sha256(Object.fromEntries(Object.entries(locatorDrift).filter(([key]) => key !== 'manifest_sha256')));
    assert.match(validateEssentialServiceDesignationCountUpstream(locatorDrift, objects, artifactHashes, evidenceArtifacts).join('; '), /exact artifact locator and hashes/);
  }
}

// Missing prior evidence, closed conflicts, fabricated values/zeroes, and output leakage are rejected.
assert.match(mutateAndValidate(value => value.prior_review_record.prior_preserved_concerns.pop()), /24 reviewer concerns/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_material_discrepancies.pop()), /26 material discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_concern_overturns.pop()), /ten overturn gates/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_revenue_preserved_concerns.pop()), /56 revenue-review concerns/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_revenue_discrepancies.pop()), /two revenue-review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_annual_preserved_concerns.pop()), /172 annual-review concerns/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_annual_discrepancies.pop()), /two annual-review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_physician_discrepancies.pop()), /two physician-review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_physician_methods_preserved_concerns.pop()), /202-item physician methods ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_physician_workforce_preserved_concerns.pop()), /202-item physician workforce ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_service_line_discrepancies.pop()), /three service-line discrepancies|41 prior review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.prior_safety_net_discrepancies.pop()), /three safety-net discrepancies|41 prior review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_discrepancies.pop()), /three emergency-department discrepancies|41 prior review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_methods_preserved_concerns.pop()), /244-item emergency-department methods ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_operations_preserved_concerns.pop()), /246-item emergency-department operations ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.open_conflict_refs.pop()), /forty-one open conflicts/);
assert.match(mutateAndValidate(value => value.cumulative_packet.unresolved_conflict_refs.pop()), /forty-seven cumulative open conflicts/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'essential_service_designation_count').state = 'populated'; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'essential_service_designation_count').source_backed_zero = true; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'essential_service_designation_count').approved_value = 0; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].approved_value = 1; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_candidate_value = 0; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_basis = 'summed CMS providerType rows'; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_period = '2026'; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.comparability_gates.find(gate => gate.dimension === 'designation_taxonomy').status = 'passed'; }), /all ten comparability gates must remain unresolved|all ten comparability gates must remain blocked|designation taxonomy gate must remain blocked/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'unavailable_public').state = 'not_yet_researched'; }), /exactly 0 populated, 30 blocked_source_conflict, 24 unavailable_public, and 0 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'unavailable_public').state = 'populated'; }), /exactly 0 populated, 30 blocked_source_conflict, 24 unavailable_public, and 0 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.output_inventory.scale_scores = 1; }), /inventory zero/);
assert.match(mutateAndValidate(value => { value.no_execution_result.sensitivity_results.push({ fabricated: true }); }), /sensitivity_results must remain empty/);
assert.match(mutateAndValidate(value => { value.cumulative_packet = null; }), /canonical essential-service-designation-count derivation failed closed/);

const weakened = clone(methodsRequest);
weakened.candidate_review.overall_disposition = 'pass';
assert.match(validateEssentialServiceDesignationCountReviewRequest(weakened, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /must remain block/);
for (const fabricated of [
  'Aggregate CMS providerType rows into one system designation count.',
  'Treat every providerType code as eligible under an invented taxonomy.',
  'Use the stale AHRQ rollup as the current facility-to-system crosswalk.',
  'Include expired and terminated records as currently effective.',
  'Expand combination codes and deduplicate them without an issuer rule.',
  'Mix state and federal designation taxonomies into one total.',
  'Substitute narrative service and safety-net claims for designations.',
  'Treat missing or unavailable designation evidence as zero.',
  'Assume source access means redistribution rights are cleared.'
]) {
  const leakedRecommendation = clone(methodsRequest);
  leakedRecommendation.candidate_review.prohibited_claims[0] = fabricated;
  assert.match(
    validateEssentialServiceDesignationCountReviewRequest(leakedRecommendation, manifest, objects, artifactHashes, evidenceArtifacts).join('; '),
    /canonical family and specialist derivation|frozen canonical specialist request/
  );
}
const swappedRegulatoryCandidate = clone(regulatoryRequest);
swappedRegulatoryCandidate.reviewer.agent_slug = 'strategy-healthcare-consultant';
assert.match(validateEssentialServiceDesignationCountReviewRequest(swappedRegulatoryCandidate, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact family specialist lane|canonical family and specialist derivation/);
const fabricatedDesignationRole = clone(regulatoryRequest);
fabricatedDesignationRole.candidate_review.competence_role = 'designation_taxonomy';
assert.match(validateEssentialServiceDesignationCountReviewRequest(fabricatedDesignationRole, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact family specialist lane|canonical family and specialist derivation/);
const missingCounts = clone(methodsRequest);
missingCounts.candidate_review.preserved_reviewer_concerns = [];
assert.match(validateEssentialServiceDesignationCountReviewRequest(missingCounts, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 244\/246-item prior lane ancestry/);
const replacedConcern = clone(methodsRequest);
replacedConcern.candidate_review.preserved_reviewer_concerns[1] = replacedConcern.candidate_review.preserved_reviewer_concerns[0];
assert.match(validateEssentialServiceDesignationCountReviewRequest(replacedConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 244\/246-item prior lane ancestry/);
const reorderedConcern = clone(regulatoryRequest);
[reorderedConcern.candidate_review.preserved_reviewer_concerns[0], reorderedConcern.candidate_review.preserved_reviewer_concerns[1]] = [reorderedConcern.candidate_review.preserved_reviewer_concerns[1], reorderedConcern.candidate_review.preserved_reviewer_concerns[0]];
assert.match(validateEssentialServiceDesignationCountReviewRequest(reorderedConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 244\/246-item prior lane ancestry/);
const fabricatedEvidence = clone(methodsRequest);
fabricatedEvidence.candidate_review.claim_dispositions[0].evidence_refs[0] = 'fabricated:evidence';
assert.match(validateEssentialServiceDesignationCountReviewRequest(fabricatedEvidence, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /evidence reference absent from frozen manifest/);

// Synchronized fabrication remains invalid even after every downstream artifact is recomputed and rehashed.
assert.match(validateSynchronizedMutation(
  value => value.evidence_identifiers.push('fabricated:evidence'),
  value => value.frozen_inputs.claim_candidates[0].evidence_refs.push('fabricated:evidence')
), /upstream manifest must exactly equal canonical derivation|review request must exactly equal the canonical family and specialist derivation|specialist reviews must exactly equal canonical evaluation/);
assert.match(validateSynchronizedMutation(value => { value.fabricated_human_authority = true; }), /upstream manifest must exactly equal canonical derivation/);
assert.match(validateSynchronizedMutation(value => {
  value.objects.fabricated_authority_record = {
    artifact_ref: 'upstream/fabricated-authority.json',
    artifact_hash: 'sha256:' + '1'.repeat(64)
  };
}), /upstream manifest must exactly equal canonical derivation/);
assert.match(validateSynchronizedMutation(value => { value.expected_counts.total_cells = 999; }), /upstream manifest must exactly equal canonical derivation/);

const duplicate = clone(conflictRequest);
duplicate.reviews[1].reviewer.reviewer_id = duplicate.reviews[0].reviewer.reviewer_id;
assert.match(validateConflictRequest(duplicate).join('; '), /unique independent reviewer identities/);
const reidentifiedConflict = analyzeReviewConflicts({
  ...clone(conflictRequest),
  request_id: 'conflict-request:scale-essential-service-designation-count:fabricated-rehash'
});
let reidentifiedHandoff = clone(handoff);
reidentifiedHandoff.conflict_output_hash = reidentifiedConflict.output_sha256;
reidentifiedHandoff = withSelfHash(reidentifiedHandoff, 'handoff_sha256');
assert.match(
  validateEssentialServiceDesignationCountReviewHandoff(reidentifiedHandoff, [methods, regulatory], reidentifiedConflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '),
  /conflict request identity must preserve|conflict output must preserve|frozen final family handoff hash/
);
const dependentReviewer = clone(methodsRequest);
dependentReviewer.reviewer.independence.prior_exposure = regulatory.review_id;
assert.match(validateReviewRequest(dependentReviewer).join('; '), /prior_exposure must be equal to one of the allowed values|prior exposure must be none/);
const averaged = clone(handoff);
averaged.positions_averaged = true;
assert.match(validateEssentialServiceDesignationCountReviewHandoff(averaged, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cannot fabricate authority, adjudicate, or average/);
const authority = clone(handoff);
authority.human_authority_conveyed = true;
assert.match(validateEssentialServiceDesignationCountReviewHandoff(authority, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cannot fabricate authority/);
const promoted = clone(handoff);
promoted.output_inventory.promotion_attempts = 1;
assert.match(validateEssentialServiceDesignationCountReviewHandoff(promoted, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /inventory zero/);
for (const prohibitedUses of [[], handoff.prohibited_uses.slice(1), [...handoff.prohibited_uses].reverse()]) {
  const weakenedUses = clone(handoff);
  weakenedUses.prohibited_uses = prohibitedUses;
  weakenedUses.handoff_sha256 = sha256(Object.fromEntries(Object.entries(weakenedUses).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateEssentialServiceDesignationCountReviewHandoff(weakenedUses, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered prohibited-use set/);
}
const wrongActiveFamily = clone(handoff);
wrongActiveFamily.active_family = 'annual_discharges';
wrongActiveFamily.handoff_sha256 = sha256(Object.fromEntries(Object.entries(wrongActiveFamily).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(wrongActiveFamily, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /active_family must remain essential_service_designation_count/);
const extraHandoffField = clone(handoff);
extraHandoffField.fabricated_release_authority = true;
extraHandoffField.handoff_sha256 = sha256(Object.fromEntries(Object.entries(extraHandoffField).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(extraHandoffField, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /closed review-handoff field set/);
const incompleteOutputInventory = clone(handoff);
delete incompleteOutputInventory.output_inventory.recommendations;
incompleteOutputInventory.handoff_sha256 = sha256(Object.fromEntries(Object.entries(incompleteOutputInventory).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(incompleteOutputInventory, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact closed zero-output inventory|inventory zero/);
const lostSliceConflictCount = clone(handoff);
lostSliceConflictCount.essential_service_designation_count_open_conflict_count = 0;
lostSliceConflictCount.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostSliceConflictCount).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(lostSliceConflictCount, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /six unavailable_public essential-service-designation-count cells/);
const lostUnavailableCount = clone(handoff);
lostUnavailableCount.essential_service_designation_count_unavailable_cell_count = 0;
lostUnavailableCount.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostUnavailableCount).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(lostUnavailableCount, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /six unavailable_public essential-service-designation-count cells/);
const lostSliceConflictRef = clone(handoff);
lostSliceConflictRef.essential_service_designation_count_open_conflict_refs.pop();
lostSliceConflictRef.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostSliceConflictRef).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(lostSliceConflictRef, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact six essential-service-designation-count conflict refs/);
const lostPriorDiscrepancy = clone(handoff);
lostPriorDiscrepancy.prior_discrepancy_ids.pop();
lostPriorDiscrepancy.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostPriorDiscrepancy).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(lostPriorDiscrepancy, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /all 41 prior discrepancy IDs/);
const reorderedPriorDiscrepancy = clone(handoff);
[reorderedPriorDiscrepancy.prior_discrepancy_ids[0], reorderedPriorDiscrepancy.prior_discrepancy_ids[1]] = [reorderedPriorDiscrepancy.prior_discrepancy_ids[1], reorderedPriorDiscrepancy.prior_discrepancy_ids[0]];
reorderedPriorDiscrepancy.handoff_sha256 = sha256(Object.fromEntries(Object.entries(reorderedPriorDiscrepancy).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(reorderedPriorDiscrepancy, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /all 41 prior discrepancy IDs/);
const rehashedMethods = clone(methods);
rehashedMethods.reviewer.reviewer_id = 'scale-essential-service-designation-count:methods:substituted';
rehashedMethods.output_sha256 = sha256(Object.fromEntries(Object.entries(rehashedMethods).filter(([key]) => key !== 'output_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoff, [rehashedMethods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /mutually link the exact specialist review IDs and hashes|review hashes must match exact specialist outputs/);
const substitutedConcernRequest = clone(methodsRequest);
substitutedConcernRequest.candidate_review.preserved_reviewer_concerns[1] = substitutedConcernRequest.candidate_review.preserved_reviewer_concerns[0];
const rehashedConcernReview = evaluateStrategicReview(substitutedConcernRequest);
assert.deepStrictEqual(validateStrategicReview(rehashedConcernReview), []);
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoff, [rehashedConcernReview, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /specialist reviews must exactly equal canonical evaluation/);
const rehashedConflict = clone(conflict);
rehashedConflict.review_refs[0].output_sha256 = 'sha256:' + '9'.repeat(64);
rehashedConflict.output_sha256 = sha256(Object.fromEntries(Object.entries(rehashedConflict).filter(([key]) => key !== 'output_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoff, [methods, regulatory], rehashedConflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /conflict review_refs must mutually link|conflict output hash must match/);
const deletedConflictDiscrepancy = clone(conflict);
deletedConflictDiscrepancy.discrepancies.pop();
deletedConflictDiscrepancy.output_sha256 = sha256(Object.fromEntries(Object.entries(deletedConflictDiscrepancy).filter(([key]) => key !== 'output_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoff, [methods, regulatory], deletedConflictDiscrepancy, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exactly equal deterministic recomputation/);
const deletedConflictConcern = clone(conflict);
deletedConflictConcern.preserved_reviewer_concerns.pop();
deletedConflictConcern.output_sha256 = sha256(Object.fromEntries(Object.entries(deletedConflictConcern).filter(([key]) => key !== 'output_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoff, [methods, regulatory], deletedConflictConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exactly equal deterministic recomputation/);
const wrongRegulatoryRole = clone(regulatory);
wrongRegulatoryRole.protocol.protocol_id = 'cso.evidence-methods-measurement.v1';
wrongRegulatoryRole.output_sha256 = sha256(Object.fromEntries(Object.entries(wrongRegulatoryRole).filter(([key]) => key !== 'output_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoff, [methods, wrongRegulatoryRole], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact limited regulatory\/designation governance review role/);
for (const [field, value, expected] of [
  ['upstream_manifest_hash', 'sha256:' + '3'.repeat(64), /upstream manifest hash must match/],
  ['toolkit_producer_commit', '4'.repeat(40), /producer commits must match/],
  ['data_producer_commit', '5'.repeat(40), /producer commits must match/],
  ['toolkit_handoff_file_hash', 'sha256:' + '6'.repeat(64), /frozen Toolkit handoff raw hash/]
]) {
  const changed = clone(handoff);
  changed[field] = value;
  changed.handoff_sha256 = sha256(Object.fromEntries(Object.entries(changed).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateEssentialServiceDesignationCountReviewHandoff(changed, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), expected);
}
const runtimeHandoffDrift = clone(handoff);
runtimeHandoffDrift.toolkit_runtime_handoff_file_hash = 'sha256:' + '8'.repeat(64);
runtimeHandoffDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(runtimeHandoffDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(runtimeHandoffDrift, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /runtime handoff raw hash/);
const firstAssessmentDrift = clone(handoff);
firstAssessmentDrift.first_assessment_hashes.methods = 'sha256:' + '7'.repeat(64);
firstAssessmentDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(firstAssessmentDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(firstAssessmentDrift, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /first-assessment hashes must (?:exactly )?match/);
const handoffCountDrift = clone(handoff);
handoffCountDrift.cumulative_cell_counts.unavailable_public = 0;
handoffCountDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(handoffCountDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateEssentialServiceDesignationCountReviewHandoff(handoffCountDrift, [methods, regulatory], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cumulative cell counts must equal/);

const regulatoryText = JSON.stringify(regulatory).toLowerCase();
for (const term of ['ahrq', 'providertype', 'issuer', 'eligible-code', 'effective-period', 'combination-code', 'deduplication', 'state', 'federal', 'crosswalk', 'rights', 'unavailable', 'not zero', 'no exact designation-taxonomy']) assert(regulatoryText.includes(term), `regulatory review must preserve ${term}`);
console.log('Scale essential-service-designation-count independent-first review, lineage, adversarial gates, and downstream handoff validated.');
