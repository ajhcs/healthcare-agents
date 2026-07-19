#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { analyzeReviewConflicts, validateConflictAnalysis, validateConflictRequest } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const {
  SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT,
  deriveSafetyNetPatientMixCanonical
} = require('../lib/scale-safety-net-patient-mix-canonical');
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
  validateSafetyNetPatientMixReviewHandoff,
  validateSafetyNetPatientMixReviewRequest,
  validateSafetyNetPatientMixUpstream
} = require('../lib/scale-safety-net-patient-mix-review');
const { evaluateStrategicReview, validateReviewRequest, validateStrategicReview } = require('../lib/strategic-review');
const {
  validateConflictAnalysisShape,
  validateConflictRequestShape,
  validateReviewRequestShape,
  validateStrategicReviewShape
} = require('../lib/review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'safety-net-patient-mix');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const generatedNames = ['upstream/data-mcp/producer-bound-input.json', 'upstream/data-mcp/public-evidence-bundle.json', 'upstream-manifest.json', 'methods-review-request.json', 'population_health-review-request.json', 'methods-review.json', 'population_health-review.json', 'conflict-analysis-request.json', 'conflict-analysis.json', 'handoff.json'];
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
  return validateSafetyNetPatientMixUpstream(manifest, mutated, artifactHashes, evidenceArtifacts).join('; ');
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
  const mutatedPopulationRequest = clone(populationRequest);
  requestMutator(mutatedMethodsRequest);
  requestMutator(mutatedPopulationRequest);
  const mutatedMethods = evaluateStrategicReview(mutatedMethodsRequest);
  const mutatedPopulation = evaluateStrategicReview(mutatedPopulationRequest);
  const mutatedConflict = analyzeReviewConflicts({
    schema_version: 'ushso.ai-conflict-analysis-request.v1',
    request_id: conflictRequest.request_id,
    review_tier: conflictRequest.review_tier,
    reviews: [mutatedMethods, mutatedPopulation]
  });
  let mutatedHandoff = clone(handoff);
  mutatedHandoff.upstream_manifest_hash = mutatedManifest.manifest_sha256;
  mutatedHandoff.review_hashes = {
    methods: mutatedMethods.output_sha256,
    population_health: mutatedPopulation.output_sha256
  };
  mutatedHandoff.first_assessment_hashes = {
    methods: mutatedMethods.first_assessment_hash,
    population_health: mutatedPopulation.first_assessment_hash
  };
  mutatedHandoff.conflict_output_hash = mutatedConflict.output_sha256;
  mutatedHandoff = withSelfHash(mutatedHandoff, 'handoff_sha256');
  return [
    ...validateSafetyNetPatientMixUpstream(mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateSafetyNetPatientMixReviewRequest(mutatedMethodsRequest, mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateSafetyNetPatientMixReviewRequest(mutatedPopulationRequest, mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateSafetyNetPatientMixReviewHandoff(mutatedHandoff, [mutatedMethods, mutatedPopulation], mutatedConflict, mutatedManifest, objects, artifactHashes, evidenceArtifacts)
  ].join('; ');
}

const before = new Map(generatedNames.map(name => [name, fs.readFileSync(path.join(FIXTURES, name))]));
for (let build = 0; build < 2; build += 1) {
  const generation = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'generate-scale-safety-net-patient-mix-review.js')], { cwd: ROOT, encoding: 'utf8' });
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
const populationRequest = load('population_health-review-request.json');
const methods = load('methods-review.json');
const population = load('population_health-review.json');
const conflictRequest = load('conflict-analysis-request.json');
const conflict = load('conflict-analysis.json');
const handoff = load('handoff.json');

assert.deepStrictEqual(SAFETY_NET_PATIENT_MIX_CANONICAL_CONTEXT.evidencePaths, evidencePaths);
assert.deepStrictEqual(
  deriveSafetyNetPatientMixCanonical({ objects, artifactHashes }).upstreamManifest,
  manifest
);
assert.deepStrictEqual(validateSafetyNetPatientMixUpstream(manifest, objects, artifactHashes, evidenceArtifacts), []);
for (const request of [methodsRequest, populationRequest]) {
  assert.deepStrictEqual(validateReviewRequestShape(request), []);
  assert.deepStrictEqual(validateReviewRequest(request), []);
  assert.deepStrictEqual(validateSafetyNetPatientMixReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts), []);
  assert.strictEqual(request.candidate_review.exposure_status, 'independent_first');
  assert.strictEqual(request.candidate_review.overall_disposition, 'block');
}
for (const review of [methods, population]) {
  assert.deepStrictEqual(validateStrategicReviewShape(review), []);
  assert.deepStrictEqual(validateStrategicReview(review), []);
  assert.strictEqual(review.professional_disposition_authority, 'human_required');
  assert.strictEqual(review.evaluation.advisory_only, true);
  assert.strictEqual(review.output_sha256, sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'output_sha256'))));
}
assert.deepStrictEqual(methodsRequest.frozen_inputs, populationRequest.frozen_inputs);
assert.deepStrictEqual(methodsRequest.decision_scenario, populationRequest.decision_scenario);
assert.strictEqual(methods.review_context_hash, population.review_context_hash);
assert.notStrictEqual(methods.reviewer.reviewer_id, population.reviewer.reviewer_id);
assert.strictEqual(methods.reviewer.independence.prior_exposure, 'none');
assert.strictEqual(population.reviewer.independence.prior_exposure, 'none');
assert.strictEqual(methods.protocol.protocol_id, 'cso.evidence-methods-measurement.v1');
assert.strictEqual(methods.reviewer.agent_slug, 'healthit-clinical-data-analyst');
assert.strictEqual(population.protocol.protocol_id, 'cso.population-health-services.v1');
assert.strictEqual(population.reviewer.agent_slug, 'pophealth-population-health-manager');
const methodsRequestText = JSON.stringify(methodsRequest);
const populationRequestText = JSON.stringify(populationRequest);
for (const leaked of [populationRequest.request_id, populationRequest.reviewer.reviewer_id, population.review_id, population.output_sha256]) assert(!methodsRequestText.includes(leaked), `methods request must not leak later population review state: ${leaked}`);
for (const leaked of [methodsRequest.request_id, methodsRequest.reviewer.reviewer_id, methods.review_id, methods.output_sha256]) assert(!populationRequestText.includes(leaked), `population request must not leak methods review state: ${leaked}`);

assert.deepStrictEqual(validateConflictRequestShape(conflictRequest), []);
assert.deepStrictEqual(validateConflictRequest(conflictRequest), []);
assert.deepStrictEqual(validateConflictAnalysisShape(conflict), []);
assert.deepStrictEqual(validateConflictAnalysis(conflict), []);
assert.strictEqual(conflict.discrepancies.length, 3);
assert(conflict.discrepancies.every(item => item.material && item.human_route_required && item.deterministic_resolution === null));
assert.strictEqual(conflict.automatic_resolution, 'prohibited');
assert.strictEqual(methodsRequest.candidate_review.preserved_reviewer_concerns.length, 230);
assert.strictEqual(populationRequest.candidate_review.preserved_reviewer_concerns.length, 232);
assert.deepStrictEqual(methodsRequest.candidate_review.preserved_reviewer_concerns.slice(0, 216), objects.prior_review_record.current_methods_preserved_concerns);
assert.deepStrictEqual(populationRequest.candidate_review.preserved_reviewer_concerns.slice(0, 218), objects.prior_review_record.current_governance_preserved_concerns);
assert.strictEqual(conflict.preserved_reviewer_concerns.length, 462);
assert.deepStrictEqual(validateSafetyNetPatientMixReviewHandoff(handoff, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts), []);
assert.strictEqual(handoff.downstream_bead, 'healthcare-toolkit-2rr9.6.3.10');
assert.deepStrictEqual(handoff.cumulative_cell_counts, { total: 54, populated: 0, blocked_source_conflict: 30, unavailable_public: 12, not_yet_researched: 12 });
assert.deepStrictEqual(handoff.prior_counts, {
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, physician_methods_preserved_concerns: 202,
  physician_workforce_preserved_concerns: 202,
  service_line_discrepancies: 3, current_methods_preserved_concerns: 216,
  current_governance_preserved_concerns: 218, cumulative_discrepancies: 35,
  prior_review_open_conflicts: 29
});
assert.strictEqual(handoff.prior_discrepancy_ids.length, 35);
assert.strictEqual(handoff.current_discrepancy_ids.length, 3);
assert.strictEqual(handoff.cumulative_discrepancy_count, 38);
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
  `git:${manifest.producer_pins.healthcare_data_mcp}:contracts/scale-inputs/v1/fixtures/safety-net-patient-mix/public-evidence-bundle.json`,
  'https://example.invalid/public-evidence-bundle.json'
]) {
  const badRef = clone(methodsRequest);
  badRef.frozen_inputs.evidence_bundle_ref = ref;
  assert.match(validateSafetyNetPatientMixReviewRequest(badRef, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /truthful deterministic rebuild URI/);
}
const wrongPath = clone(manifest);
wrongPath.evidence_lineage.committed_input_ref = `git:${manifest.producer_pins.healthcare_data_mcp}:contracts/v1/fixtures/does-not-exist.json`;
wrongPath.manifest_sha256 = sha256(Object.fromEntries(Object.entries(wrongPath).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateSafetyNetPatientMixUpstream(wrongPath, objects, artifactHashes, evidenceArtifacts).join('; '), /committed evidence input Git path drift/);
for (const field of ['normalized_input_artifact_ref', 'producer_bound_input_artifact_ref', 'bundle_artifact_ref']) {
  const wrongArtifactRef = clone(manifest);
  wrongArtifactRef.evidence_lineage[field] = 'upstream/data-mcp/does-not-exist.json';
  wrongArtifactRef.manifest_sha256 = sha256(Object.fromEntries(Object.entries(wrongArtifactRef).filter(([key]) => key !== 'manifest_sha256')));
  assert.match(validateSafetyNetPatientMixUpstream(wrongArtifactRef, objects, artifactHashes, evidenceArtifacts).join('; '), /must resolve to the exact packaged evidence artifact/);
}
for (const [role, expected] of [
  ['acquisition', /acquisition exact bytes drift/],
  ['normalized_input', /normalized evidence input exact bytes drift/],
  ['producer_bound_input', /producer-bound evidence input exact bytes drift/],
  ['public_evidence_bundle', /public evidence bundle exact bytes drift/]
]) {
  const driftedArtifacts = clone(evidenceArtifacts);
  driftedArtifacts[role].raw_hash = 'sha256:' + '8'.repeat(64);
  assert.match(validateSafetyNetPatientMixUpstream(manifest, objects, artifactHashes, driftedArtifacts).join('; '), expected);
}
const normalizedContentDrift = clone(evidenceArtifacts);
normalizedContentDrift.normalized_input.value.producer.version = 'fabricated';
assert.match(validateSafetyNetPatientMixUpstream(manifest, objects, artifactHashes, normalizedContentDrift).join('; '), /producer-bound evidence input must differ only|deterministic rebuild hash mismatch/);
const boundContentDrift = clone(evidenceArtifacts);
boundContentDrift.producer_bound_input.value.producer.commit = '9'.repeat(40);
assert.match(validateSafetyNetPatientMixUpstream(manifest, objects, artifactHashes, boundContentDrift).join('; '), /producer-bound evidence input must differ only|commit drift/);
const bundleSemanticDrift = clone(evidenceArtifacts);
bundleSemanticDrift.public_evidence_bundle.value.bundle_sha256 = 'sha256:' + 'a'.repeat(64);
assert.match(validateSafetyNetPatientMixUpstream(manifest, objects, artifactHashes, bundleSemanticDrift).join('; '), /semantic self-hash drift/);

// Raw and semantic upstream drift are rejected independently.
const artifactDrift = { ...artifactHashes, toolkit_handoff: 'sha256:' + '0'.repeat(64) };
assert.match(validateSafetyNetPatientMixUpstream(manifest, objects, artifactDrift, evidenceArtifacts).join('; '), /exact artifact bytes drift|frozen raw hash/);
const commitDrift = clone(manifest);
commitDrift.producer_pins.healthcare_toolkit = '1'.repeat(40);
assert.match(validateSafetyNetPatientMixUpstream(commitDrift, objects, artifactHashes, evidenceArtifacts).join('; '), /self-hash|Toolkit producer pin drift/);
for (const [field, expected] of [
  ['toolkit_feature', /Toolkit feature\/tracker provenance drift/],
  ['toolkit_tracker', /Toolkit feature\/tracker provenance drift/],
  ['data_feature', /Data feature\/tracker provenance drift/],
  ['data_tracker', /Data feature\/tracker provenance drift/]
]) {
  const driftedProvenance = clone(manifest);
  driftedProvenance.producer_provenance[field] = '6'.repeat(40);
  driftedProvenance.manifest_sha256 = sha256(Object.fromEntries(Object.entries(driftedProvenance).filter(([key]) => key !== 'manifest_sha256')));
  assert.match(validateSafetyNetPatientMixUpstream(driftedProvenance, objects, artifactHashes, evidenceArtifacts).join('; '), expected);
}
const semanticRepin = clone(manifest);
semanticRepin.objects.cumulative_packet.semantic_hash = 'sha256:' + '2'.repeat(64);
semanticRepin.manifest_sha256 = sha256(Object.fromEntries(Object.entries(semanticRepin).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateSafetyNetPatientMixUpstream(semanticRepin, objects, artifactHashes, evidenceArtifacts).join('; '), /semantic hash drift|exact Toolkit handoff pin/);
const normalizedHandoffRepin = mutateAndValidate(value => { value.toolkit_handoff.producer_pins.toolkit_runtime = value.toolkit_handoff.producer_pins.healthcare_data_mcp; });
assert.match(normalizedHandoffRepin, /normalized Toolkit handoff must preserve the zero runtime placeholder|deterministic substitution hash drift/);
for (const role of Object.keys(objectPaths)) {
  for (const locator of ['upstream/does-not-exist.json', undefined]) {
    const locatorDrift = clone(manifest);
    if (locator === undefined) delete locatorDrift.objects[role].artifact_ref;
    else locatorDrift.objects[role].artifact_ref = locator;
    locatorDrift.manifest_sha256 = sha256(Object.fromEntries(Object.entries(locatorDrift).filter(([key]) => key !== 'manifest_sha256')));
    assert.match(validateSafetyNetPatientMixUpstream(locatorDrift, objects, artifactHashes, evidenceArtifacts).join('; '), /exact artifact locator and hashes/);
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
assert.match(mutateAndValidate(value => value.prior_review_record.current_discrepancies.pop()), /three service-line discrepancies|35 prior review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_methods_preserved_concerns.pop()), /216-item methods ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_governance_preserved_concerns.pop()), /218-item governance ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.open_conflict_refs.pop()), /twenty-nine open conflicts/);
assert.match(mutateAndValidate(value => value.cumulative_packet.unresolved_conflict_refs.pop()), /thirty-five cumulative open conflicts/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'safety_net_patient_mix_pct').state = 'populated'; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'safety_net_patient_mix_pct').source_backed_zero = true; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'safety_net_patient_mix_pct').approved_value = 0; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].approved_value = 1; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_candidate_value = 0; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_basis = 'facility-aggregated DPP'; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_period = '2026'; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.comparability_gates.find(gate => gate.dimension === 'safety_net_denominator').status = 'passed'; }), /all ten comparability gates must remain unresolved|safety-net denominator gate must remain blocked|eight blocked/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'not_yet_researched').state = 'blocked_source_conflict'; }), /exactly 0 populated, 30 blocked_source_conflict, 12 unavailable_public, and 12 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'unavailable_public').state = 'populated'; }), /exactly 0 populated, 30 blocked_source_conflict, 12 unavailable_public, and 12 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.output_inventory.scale_scores = 1; }), /inventory zero/);
assert.match(mutateAndValidate(value => { value.no_execution_result.sensitivity_results.push({ fabricated: true }); }), /sensitivity_results must remain empty/);
assert.match(mutateAndValidate(value => { value.cumulative_packet = null; }), /canonical safety-net-patient-mix derivation failed closed/);

const weakened = clone(methodsRequest);
weakened.candidate_review.overall_disposition = 'pass';
assert.match(validateSafetyNetPatientMixReviewRequest(weakened, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /must remain block/);
const missingCounts = clone(methodsRequest);
missingCounts.candidate_review.preserved_reviewer_concerns = [];
assert.match(validateSafetyNetPatientMixReviewRequest(missingCounts, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 216\/218-item prior lane ancestry/);
const replacedConcern = clone(methodsRequest);
replacedConcern.candidate_review.preserved_reviewer_concerns[1] = replacedConcern.candidate_review.preserved_reviewer_concerns[0];
assert.match(validateSafetyNetPatientMixReviewRequest(replacedConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 216\/218-item prior lane ancestry/);
const reorderedConcern = clone(populationRequest);
[reorderedConcern.candidate_review.preserved_reviewer_concerns[0], reorderedConcern.candidate_review.preserved_reviewer_concerns[1]] = [reorderedConcern.candidate_review.preserved_reviewer_concerns[1], reorderedConcern.candidate_review.preserved_reviewer_concerns[0]];
assert.match(validateSafetyNetPatientMixReviewRequest(reorderedConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 216\/218-item prior lane ancestry/);
const fabricatedEvidence = clone(methodsRequest);
fabricatedEvidence.candidate_review.claim_dispositions[0].evidence_refs[0] = 'fabricated:evidence';
assert.match(validateSafetyNetPatientMixReviewRequest(fabricatedEvidence, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /evidence reference absent from frozen manifest/);

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
const dependentReviewer = clone(methodsRequest);
dependentReviewer.reviewer.independence.prior_exposure = population.review_id;
assert.match(validateReviewRequest(dependentReviewer).join('; '), /prior_exposure must be equal to one of the allowed values|prior exposure must be none/);
const averaged = clone(handoff);
averaged.positions_averaged = true;
assert.match(validateSafetyNetPatientMixReviewHandoff(averaged, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cannot fabricate authority, adjudicate, or average/);
const authority = clone(handoff);
authority.human_authority_conveyed = true;
assert.match(validateSafetyNetPatientMixReviewHandoff(authority, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cannot fabricate authority/);
const promoted = clone(handoff);
promoted.output_inventory.promotion_attempts = 1;
assert.match(validateSafetyNetPatientMixReviewHandoff(promoted, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /inventory zero/);
for (const prohibitedUses of [[], handoff.prohibited_uses.slice(1), [...handoff.prohibited_uses].reverse()]) {
  const weakenedUses = clone(handoff);
  weakenedUses.prohibited_uses = prohibitedUses;
  weakenedUses.handoff_sha256 = sha256(Object.fromEntries(Object.entries(weakenedUses).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateSafetyNetPatientMixReviewHandoff(weakenedUses, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered prohibited-use set/);
}
const wrongActiveFamily = clone(handoff);
wrongActiveFamily.active_family = 'annual_discharges';
wrongActiveFamily.handoff_sha256 = sha256(Object.fromEntries(Object.entries(wrongActiveFamily).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(wrongActiveFamily, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /active_family must remain safety_net_patient_mix_pct/);
const extraHandoffField = clone(handoff);
extraHandoffField.fabricated_release_authority = true;
extraHandoffField.handoff_sha256 = sha256(Object.fromEntries(Object.entries(extraHandoffField).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(extraHandoffField, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /closed review-handoff field set/);
const incompleteOutputInventory = clone(handoff);
delete incompleteOutputInventory.output_inventory.recommendations;
incompleteOutputInventory.handoff_sha256 = sha256(Object.fromEntries(Object.entries(incompleteOutputInventory).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(incompleteOutputInventory, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact closed zero-output inventory|inventory zero/);
const lostSliceConflictCount = clone(handoff);
lostSliceConflictCount.safety_net_patient_mix_pct_open_conflict_count = 0;
lostSliceConflictCount.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostSliceConflictCount).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(lostSliceConflictCount, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /six unavailable_public safety-net-patient-mix cells/);
const lostUnavailableCount = clone(handoff);
lostUnavailableCount.safety_net_patient_mix_pct_unavailable_cell_count = 0;
lostUnavailableCount.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostUnavailableCount).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(lostUnavailableCount, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /six unavailable_public safety-net-patient-mix cells/);
const lostSliceConflictRef = clone(handoff);
lostSliceConflictRef.safety_net_patient_mix_pct_open_conflict_refs.pop();
lostSliceConflictRef.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostSliceConflictRef).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(lostSliceConflictRef, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact six safety-net-patient-mix conflict refs/);
const lostPriorDiscrepancy = clone(handoff);
lostPriorDiscrepancy.prior_discrepancy_ids.pop();
lostPriorDiscrepancy.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostPriorDiscrepancy).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(lostPriorDiscrepancy, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /all 35 prior discrepancy IDs/);
const reorderedPriorDiscrepancy = clone(handoff);
[reorderedPriorDiscrepancy.prior_discrepancy_ids[0], reorderedPriorDiscrepancy.prior_discrepancy_ids[1]] = [reorderedPriorDiscrepancy.prior_discrepancy_ids[1], reorderedPriorDiscrepancy.prior_discrepancy_ids[0]];
reorderedPriorDiscrepancy.handoff_sha256 = sha256(Object.fromEntries(Object.entries(reorderedPriorDiscrepancy).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(reorderedPriorDiscrepancy, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /all 35 prior discrepancy IDs/);
const rehashedMethods = clone(methods);
rehashedMethods.reviewer.reviewer_id = 'scale-safety-net-patient-mix:methods:substituted';
rehashedMethods.output_sha256 = sha256(Object.fromEntries(Object.entries(rehashedMethods).filter(([key]) => key !== 'output_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(handoff, [rehashedMethods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /mutually link the exact specialist review IDs and hashes|review hashes must match exact specialist outputs/);
const substitutedConcernRequest = clone(methodsRequest);
substitutedConcernRequest.candidate_review.preserved_reviewer_concerns[1] = substitutedConcernRequest.candidate_review.preserved_reviewer_concerns[0];
const rehashedConcernReview = evaluateStrategicReview(substitutedConcernRequest);
assert.deepStrictEqual(validateStrategicReview(rehashedConcernReview), []);
assert.match(validateSafetyNetPatientMixReviewHandoff(handoff, [rehashedConcernReview, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /specialist reviews must exactly equal canonical evaluation/);
const rehashedConflict = clone(conflict);
rehashedConflict.review_refs[0].output_sha256 = 'sha256:' + '9'.repeat(64);
rehashedConflict.output_sha256 = sha256(Object.fromEntries(Object.entries(rehashedConflict).filter(([key]) => key !== 'output_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(handoff, [methods, population], rehashedConflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /conflict review_refs must mutually link|conflict output hash must match/);
const deletedConflictDiscrepancy = clone(conflict);
deletedConflictDiscrepancy.discrepancies.pop();
deletedConflictDiscrepancy.output_sha256 = sha256(Object.fromEntries(Object.entries(deletedConflictDiscrepancy).filter(([key]) => key !== 'output_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(handoff, [methods, population], deletedConflictDiscrepancy, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exactly equal deterministic recomputation/);
const deletedConflictConcern = clone(conflict);
deletedConflictConcern.preserved_reviewer_concerns.pop();
deletedConflictConcern.output_sha256 = sha256(Object.fromEntries(Object.entries(deletedConflictConcern).filter(([key]) => key !== 'output_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(handoff, [methods, population], deletedConflictConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exactly equal deterministic recomputation/);
const wrongPopulationRole = clone(population);
wrongPopulationRole.protocol.protocol_id = 'cso.evidence-methods-measurement.v1';
wrongPopulationRole.output_sha256 = sha256(Object.fromEntries(Object.entries(wrongPopulationRole).filter(([key]) => key !== 'output_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(handoff, [methods, wrongPopulationRole], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact safety-net population-health\/health-services review role/);
for (const [field, value, expected] of [
  ['upstream_manifest_hash', 'sha256:' + '3'.repeat(64), /upstream manifest hash must match/],
  ['toolkit_producer_commit', '4'.repeat(40), /producer commits must match/],
  ['data_producer_commit', '5'.repeat(40), /producer commits must match/],
  ['toolkit_handoff_file_hash', 'sha256:' + '6'.repeat(64), /frozen Toolkit handoff raw hash/]
]) {
  const changed = clone(handoff);
  changed[field] = value;
  changed.handoff_sha256 = sha256(Object.fromEntries(Object.entries(changed).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateSafetyNetPatientMixReviewHandoff(changed, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), expected);
}
const runtimeHandoffDrift = clone(handoff);
runtimeHandoffDrift.toolkit_runtime_handoff_file_hash = 'sha256:' + '8'.repeat(64);
runtimeHandoffDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(runtimeHandoffDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(runtimeHandoffDrift, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /runtime handoff raw hash/);
const firstAssessmentDrift = clone(handoff);
firstAssessmentDrift.first_assessment_hashes.methods = 'sha256:' + '7'.repeat(64);
firstAssessmentDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(firstAssessmentDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(firstAssessmentDrift, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /first-assessment hashes must (?:exactly )?match/);
const handoffCountDrift = clone(handoff);
handoffCountDrift.cumulative_cell_counts.unavailable_public = 0;
handoffCountDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(handoffCountDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateSafetyNetPatientMixReviewHandoff(handoffCountDrift, [methods, population], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cumulative cell counts must equal/);

const populationText = JSON.stringify(population).toLowerCase();
for (const term of ['ahrq', 'cms fy 2024 dpp', 'different denominators', 'ipps', 'population', 'attribution', 'selection', 'ecological', 'transportability', 'unavailable', 'not zero']) assert(populationText.includes(term), `population-health review must preserve ${term}`);
console.log('Scale safety-net-patient-mix independent-first review, lineage, adversarial gates, and downstream handoff validated.');
