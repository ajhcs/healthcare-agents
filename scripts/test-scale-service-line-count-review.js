#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { analyzeReviewConflicts, validateConflictAnalysis, validateConflictRequest } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const {
  SERVICE_LINE_COUNT_CANONICAL_CONTEXT,
  deriveServiceLineCountCanonical
} = require('../lib/scale-service-line-count-canonical');
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
  validateServiceLineCountReviewHandoff,
  validateServiceLineCountReviewRequest,
  validateServiceLineCountUpstream
} = require('../lib/scale-service-line-count-review');
const { evaluateStrategicReview, validateReviewRequest, validateStrategicReview } = require('../lib/strategic-review');
const {
  validateConflictAnalysisShape,
  validateConflictRequestShape,
  validateReviewRequestShape,
  validateStrategicReviewShape
} = require('../lib/review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'service-line-count');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const generatedNames = ['upstream/data-mcp/producer-bound-input.json', 'upstream/data-mcp/public-evidence-bundle.json', 'upstream-manifest.json', 'methods-review-request.json', 'service_portfolio_governance-review-request.json', 'methods-review.json', 'service_portfolio_governance-review.json', 'conflict-analysis-request.json', 'conflict-analysis.json', 'handoff.json'];
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
  return validateServiceLineCountUpstream(manifest, mutated, artifactHashes, evidenceArtifacts).join('; ');
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
  const mutatedWorkforceRequest = clone(governanceRequest);
  requestMutator(mutatedMethodsRequest);
  requestMutator(mutatedWorkforceRequest);
  const mutatedMethods = evaluateStrategicReview(mutatedMethodsRequest);
  const mutatedWorkforce = evaluateStrategicReview(mutatedWorkforceRequest);
  const mutatedConflict = analyzeReviewConflicts({
    schema_version: 'ushso.ai-conflict-analysis-request.v1',
    request_id: conflictRequest.request_id,
    review_tier: conflictRequest.review_tier,
    reviews: [mutatedMethods, mutatedWorkforce]
  });
  let mutatedHandoff = clone(handoff);
  mutatedHandoff.upstream_manifest_hash = mutatedManifest.manifest_sha256;
  mutatedHandoff.review_hashes = {
    methods: mutatedMethods.output_sha256,
    service_portfolio_governance: mutatedWorkforce.output_sha256
  };
  mutatedHandoff.first_assessment_hashes = {
    methods: mutatedMethods.first_assessment_hash,
    service_portfolio_governance: mutatedWorkforce.first_assessment_hash
  };
  mutatedHandoff.conflict_output_hash = mutatedConflict.output_sha256;
  mutatedHandoff = withSelfHash(mutatedHandoff, 'handoff_sha256');
  return [
    ...validateServiceLineCountUpstream(mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateServiceLineCountReviewRequest(mutatedMethodsRequest, mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateServiceLineCountReviewRequest(mutatedWorkforceRequest, mutatedManifest, objects, artifactHashes, evidenceArtifacts),
    ...validateServiceLineCountReviewHandoff(mutatedHandoff, [mutatedMethods, mutatedWorkforce], mutatedConflict, mutatedManifest, objects, artifactHashes, evidenceArtifacts)
  ].join('; ');
}

const before = new Map(generatedNames.map(name => [name, fs.readFileSync(path.join(FIXTURES, name))]));
for (let build = 0; build < 2; build += 1) {
  const generation = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'generate-scale-service-line-count-review.js')], { cwd: ROOT, encoding: 'utf8' });
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
const governanceRequest = load('service_portfolio_governance-review-request.json');
const methods = load('methods-review.json');
const workforce = load('service_portfolio_governance-review.json');
const conflictRequest = load('conflict-analysis-request.json');
const conflict = load('conflict-analysis.json');
const handoff = load('handoff.json');

assert.deepStrictEqual(SERVICE_LINE_COUNT_CANONICAL_CONTEXT.evidencePaths, evidencePaths);
assert.deepStrictEqual(
  deriveServiceLineCountCanonical({ objects, artifactHashes }).upstreamManifest,
  manifest
);
assert.deepStrictEqual(validateServiceLineCountUpstream(manifest, objects, artifactHashes, evidenceArtifacts), []);
for (const request of [methodsRequest, governanceRequest]) {
  assert.deepStrictEqual(validateReviewRequestShape(request), []);
  assert.deepStrictEqual(validateReviewRequest(request), []);
  assert.deepStrictEqual(validateServiceLineCountReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts), []);
  assert.strictEqual(request.candidate_review.exposure_status, 'independent_first');
  assert.strictEqual(request.candidate_review.overall_disposition, 'block');
}
for (const review of [methods, workforce]) {
  assert.deepStrictEqual(validateStrategicReviewShape(review), []);
  assert.deepStrictEqual(validateStrategicReview(review), []);
  assert.strictEqual(review.professional_disposition_authority, 'human_required');
  assert.strictEqual(review.evaluation.advisory_only, true);
  assert.strictEqual(review.output_sha256, sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'output_sha256'))));
}
assert.deepStrictEqual(methodsRequest.frozen_inputs, governanceRequest.frozen_inputs);
assert.deepStrictEqual(methodsRequest.decision_scenario, governanceRequest.decision_scenario);
assert.strictEqual(methods.review_context_hash, workforce.review_context_hash);
assert.notStrictEqual(methods.reviewer.reviewer_id, workforce.reviewer.reviewer_id);
assert.strictEqual(methods.reviewer.independence.prior_exposure, 'none');
assert.strictEqual(workforce.reviewer.independence.prior_exposure, 'none');
assert.strictEqual(methods.protocol.protocol_id, 'cso.evidence-methods-measurement.v1');
assert.strictEqual(methods.reviewer.agent_slug, 'healthit-clinical-data-analyst');
assert.strictEqual(workforce.protocol.protocol_id, 'cso.transaction-regulatory-governance.v1');
assert.strictEqual(workforce.reviewer.agent_slug, 'strategy-healthcare-consultant');

assert.deepStrictEqual(validateConflictRequestShape(conflictRequest), []);
assert.deepStrictEqual(validateConflictRequest(conflictRequest), []);
assert.deepStrictEqual(validateConflictAnalysisShape(conflict), []);
assert.deepStrictEqual(validateConflictAnalysis(conflict), []);
assert(conflict.discrepancies.length > 0);
assert(conflict.discrepancies.every(item => item.material && item.human_route_required && item.deterministic_resolution === null));
assert.strictEqual(conflict.automatic_resolution, 'prohibited');
assert.strictEqual(methodsRequest.candidate_review.preserved_reviewer_concerns.length, 216);
assert.strictEqual(governanceRequest.candidate_review.preserved_reviewer_concerns.length, 218);
assert.deepStrictEqual(methodsRequest.candidate_review.preserved_reviewer_concerns.slice(0, 202), objects.prior_review_record.current_methods_preserved_concerns);
assert.deepStrictEqual(governanceRequest.candidate_review.preserved_reviewer_concerns.slice(0, 202), objects.prior_review_record.current_workforce_preserved_concerns);
assert.strictEqual(conflict.preserved_reviewer_concerns.length, 434);
assert.deepStrictEqual(validateServiceLineCountReviewHandoff(handoff, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts), []);
assert.strictEqual(handoff.downstream_bead, 'healthcare-toolkit-2rr9.6.3.8');
assert.deepStrictEqual(handoff.cumulative_cell_counts, { total: 54, populated: 0, blocked_source_conflict: 30, unavailable_public: 6, not_yet_researched: 18 });
assert.deepStrictEqual(handoff.prior_counts, {
  material_discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10,
  revenue_discrepancies: 2, revenue_preserved_concerns: 56,
  annual_discrepancies: 2, annual_preserved_concerns: 172,
  physician_discrepancies: 2, current_methods_preserved_concerns: 202,
  current_workforce_preserved_concerns: 202, prior_review_open_conflicts: 23
});
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
  `git:${manifest.producer_pins.healthcare_data_mcp}:contracts/scale-inputs/v1/fixtures/service-line-count/public-evidence-bundle.json`,
  'https://example.invalid/public-evidence-bundle.json'
]) {
  const badRef = clone(methodsRequest);
  badRef.frozen_inputs.evidence_bundle_ref = ref;
  assert.match(validateServiceLineCountReviewRequest(badRef, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /truthful deterministic rebuild URI/);
}
const wrongPath = clone(manifest);
wrongPath.evidence_lineage.committed_input_ref = `git:${manifest.producer_pins.healthcare_data_mcp}:contracts/v1/fixtures/does-not-exist.json`;
wrongPath.manifest_sha256 = sha256(Object.fromEntries(Object.entries(wrongPath).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateServiceLineCountUpstream(wrongPath, objects, artifactHashes, evidenceArtifacts).join('; '), /committed evidence input Git path drift/);
for (const field of ['normalized_input_artifact_ref', 'producer_bound_input_artifact_ref', 'bundle_artifact_ref']) {
  const wrongArtifactRef = clone(manifest);
  wrongArtifactRef.evidence_lineage[field] = 'upstream/data-mcp/does-not-exist.json';
  wrongArtifactRef.manifest_sha256 = sha256(Object.fromEntries(Object.entries(wrongArtifactRef).filter(([key]) => key !== 'manifest_sha256')));
  assert.match(validateServiceLineCountUpstream(wrongArtifactRef, objects, artifactHashes, evidenceArtifacts).join('; '), /must resolve to the exact packaged evidence artifact/);
}
for (const [role, expected] of [
  ['acquisition', /acquisition exact bytes drift/],
  ['normalized_input', /normalized evidence input exact bytes drift/],
  ['producer_bound_input', /producer-bound evidence input exact bytes drift/],
  ['public_evidence_bundle', /public evidence bundle exact bytes drift/]
]) {
  const driftedArtifacts = clone(evidenceArtifacts);
  driftedArtifacts[role].raw_hash = 'sha256:' + '8'.repeat(64);
  assert.match(validateServiceLineCountUpstream(manifest, objects, artifactHashes, driftedArtifacts).join('; '), expected);
}
const normalizedContentDrift = clone(evidenceArtifacts);
normalizedContentDrift.normalized_input.value.producer.version = 'fabricated';
assert.match(validateServiceLineCountUpstream(manifest, objects, artifactHashes, normalizedContentDrift).join('; '), /producer-bound evidence input must differ only|deterministic rebuild hash mismatch/);
const boundContentDrift = clone(evidenceArtifacts);
boundContentDrift.producer_bound_input.value.producer.commit = '9'.repeat(40);
assert.match(validateServiceLineCountUpstream(manifest, objects, artifactHashes, boundContentDrift).join('; '), /producer-bound evidence input must differ only|commit drift/);
const bundleSemanticDrift = clone(evidenceArtifacts);
bundleSemanticDrift.public_evidence_bundle.value.bundle_sha256 = 'sha256:' + 'a'.repeat(64);
assert.match(validateServiceLineCountUpstream(manifest, objects, artifactHashes, bundleSemanticDrift).join('; '), /semantic self-hash drift/);

// Raw and semantic upstream drift are rejected independently.
const artifactDrift = { ...artifactHashes, toolkit_handoff: 'sha256:' + '0'.repeat(64) };
assert.match(validateServiceLineCountUpstream(manifest, objects, artifactDrift, evidenceArtifacts).join('; '), /exact artifact bytes drift|frozen raw hash/);
const commitDrift = clone(manifest);
commitDrift.producer_pins.healthcare_toolkit = '1'.repeat(40);
assert.match(validateServiceLineCountUpstream(commitDrift, objects, artifactHashes, evidenceArtifacts).join('; '), /self-hash|Toolkit producer pin drift/);
for (const [field, expected] of [
  ['toolkit_feature', /Toolkit feature\/tracker provenance drift/],
  ['toolkit_tracker', /Toolkit feature\/tracker provenance drift/],
  ['data_feature', /Data feature\/tracker provenance drift/],
  ['data_tracker', /Data feature\/tracker provenance drift/]
]) {
  const driftedProvenance = clone(manifest);
  driftedProvenance.producer_provenance[field] = '6'.repeat(40);
  driftedProvenance.manifest_sha256 = sha256(Object.fromEntries(Object.entries(driftedProvenance).filter(([key]) => key !== 'manifest_sha256')));
  assert.match(validateServiceLineCountUpstream(driftedProvenance, objects, artifactHashes, evidenceArtifacts).join('; '), expected);
}
const semanticRepin = clone(manifest);
semanticRepin.objects.cumulative_packet.semantic_hash = 'sha256:' + '2'.repeat(64);
semanticRepin.manifest_sha256 = sha256(Object.fromEntries(Object.entries(semanticRepin).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateServiceLineCountUpstream(semanticRepin, objects, artifactHashes, evidenceArtifacts).join('; '), /semantic hash drift|exact Toolkit handoff pin/);
const normalizedHandoffRepin = mutateAndValidate(value => { value.toolkit_handoff.producer_pins.toolkit_runtime = value.toolkit_handoff.producer_pins.healthcare_data_mcp; });
assert.match(normalizedHandoffRepin, /normalized Toolkit handoff must preserve the zero runtime placeholder|deterministic substitution hash drift/);
for (const role of Object.keys(objectPaths)) {
  for (const locator of ['upstream/does-not-exist.json', undefined]) {
    const locatorDrift = clone(manifest);
    if (locator === undefined) delete locatorDrift.objects[role].artifact_ref;
    else locatorDrift.objects[role].artifact_ref = locator;
    locatorDrift.manifest_sha256 = sha256(Object.fromEntries(Object.entries(locatorDrift).filter(([key]) => key !== 'manifest_sha256')));
    assert.match(validateServiceLineCountUpstream(locatorDrift, objects, artifactHashes, evidenceArtifacts).join('; '), /exact artifact locator and hashes/);
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
assert.match(mutateAndValidate(value => value.prior_review_record.current_discrepancies.pop()), /two physician-review discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_methods_preserved_concerns.pop()), /202-item methods ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.current_workforce_preserved_concerns.pop()), /202-item workforce ancestry/);
assert.match(mutateAndValidate(value => value.prior_review_record.open_conflict_refs.pop()), /twenty-three open conflicts/);
assert.match(mutateAndValidate(value => value.cumulative_packet.unresolved_conflict_refs.pop()), /twenty-nine cumulative open conflicts/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'service_line_count').state = 'populated'; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'service_line_count').source_backed_zero = true; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'service_line_count').approved_value = 0; }), /unavailable, unapproved, and unpopulated/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].approved_value = 1; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_candidate_value = 0; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_basis = 'hand-counted marketing services'; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.identity_binding.observation_bindings[0].source_period = '2026'; }), /upstream manifest must exactly equal canonical derivation|semantic hash drift/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.comparability_gates.find(gate => gate.dimension === 'service_taxonomy').status = 'passed'; }), /all ten comparability gates must remain unresolved|service taxonomy gate must remain blocked/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'not_yet_researched').state = 'blocked_source_conflict'; }), /exactly 0 populated, 30 blocked_source_conflict, 6 unavailable_public, and 18 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'unavailable_public').state = 'populated'; }), /exactly 0 populated, 30 blocked_source_conflict, 6 unavailable_public, and 18 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.output_inventory.scale_scores = 1; }), /inventory zero/);
assert.match(mutateAndValidate(value => { value.no_execution_result.sensitivity_results.push({ fabricated: true }); }), /sensitivity_results must remain empty/);
assert.match(mutateAndValidate(value => { value.cumulative_packet = null; }), /canonical service-line-count derivation failed closed/);

const weakened = clone(methodsRequest);
weakened.candidate_review.overall_disposition = 'pass';
assert.match(validateServiceLineCountReviewRequest(weakened, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /must remain block/);
const missingCounts = clone(methodsRequest);
missingCounts.candidate_review.preserved_reviewer_concerns = [];
assert.match(validateServiceLineCountReviewRequest(missingCounts, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 202-item lane ancestry/);
const replacedConcern = clone(methodsRequest);
replacedConcern.candidate_review.preserved_reviewer_concerns[1] = replacedConcern.candidate_review.preserved_reviewer_concerns[0];
assert.match(validateServiceLineCountReviewRequest(replacedConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered 202-item lane ancestry/);
const fabricatedEvidence = clone(methodsRequest);
fabricatedEvidence.candidate_review.claim_dispositions[0].evidence_refs[0] = 'fabricated:evidence';
assert.match(validateServiceLineCountReviewRequest(fabricatedEvidence, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /evidence reference absent from frozen manifest/);

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
dependentReviewer.reviewer.independence.prior_exposure = workforce.review_id;
assert.match(validateReviewRequest(dependentReviewer).join('; '), /prior_exposure must be equal to one of the allowed values|prior exposure must be none/);
const averaged = clone(handoff);
averaged.positions_averaged = true;
assert.match(validateServiceLineCountReviewHandoff(averaged, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cannot fabricate authority, adjudicate, or average/);
const authority = clone(handoff);
authority.human_authority_conveyed = true;
assert.match(validateServiceLineCountReviewHandoff(authority, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cannot fabricate authority/);
const promoted = clone(handoff);
promoted.output_inventory.promotion_attempts = 1;
assert.match(validateServiceLineCountReviewHandoff(promoted, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /inventory zero/);
for (const prohibitedUses of [[], handoff.prohibited_uses.slice(1), [...handoff.prohibited_uses].reverse()]) {
  const weakenedUses = clone(handoff);
  weakenedUses.prohibited_uses = prohibitedUses;
  weakenedUses.handoff_sha256 = sha256(Object.fromEntries(Object.entries(weakenedUses).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateServiceLineCountReviewHandoff(weakenedUses, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact ordered prohibited-use set/);
}
const wrongActiveFamily = clone(handoff);
wrongActiveFamily.active_family = 'annual_discharges';
wrongActiveFamily.handoff_sha256 = sha256(Object.fromEntries(Object.entries(wrongActiveFamily).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(wrongActiveFamily, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /active_family must remain service_line_count/);
const extraHandoffField = clone(handoff);
extraHandoffField.fabricated_release_authority = true;
extraHandoffField.handoff_sha256 = sha256(Object.fromEntries(Object.entries(extraHandoffField).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(extraHandoffField, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /closed review-handoff field set/);
const incompleteOutputInventory = clone(handoff);
delete incompleteOutputInventory.output_inventory.recommendations;
incompleteOutputInventory.handoff_sha256 = sha256(Object.fromEntries(Object.entries(incompleteOutputInventory).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(incompleteOutputInventory, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact closed zero-output inventory|inventory zero/);
const lostSliceConflictCount = clone(handoff);
lostSliceConflictCount.service_line_count_open_conflict_count = 0;
lostSliceConflictCount.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostSliceConflictCount).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(lostSliceConflictCount, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /six unavailable_public service-line-count cells/);
const lostUnavailableCount = clone(handoff);
lostUnavailableCount.service_line_count_unavailable_cell_count = 0;
lostUnavailableCount.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostUnavailableCount).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(lostUnavailableCount, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /six unavailable_public service-line-count cells/);
const lostSliceConflictRef = clone(handoff);
lostSliceConflictRef.service_line_count_open_conflict_refs.pop();
lostSliceConflictRef.handoff_sha256 = sha256(Object.fromEntries(Object.entries(lostSliceConflictRef).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(lostSliceConflictRef, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact six service-line-count conflict refs/);
const rehashedMethods = clone(methods);
rehashedMethods.reviewer.reviewer_id = 'scale-service-line-count:methods:substituted';
rehashedMethods.output_sha256 = sha256(Object.fromEntries(Object.entries(rehashedMethods).filter(([key]) => key !== 'output_sha256')));
assert.match(validateServiceLineCountReviewHandoff(handoff, [rehashedMethods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /mutually link the exact specialist review IDs and hashes|review hashes must match exact specialist outputs/);
const substitutedConcernRequest = clone(methodsRequest);
substitutedConcernRequest.candidate_review.preserved_reviewer_concerns[1] = substitutedConcernRequest.candidate_review.preserved_reviewer_concerns[0];
const rehashedConcernReview = evaluateStrategicReview(substitutedConcernRequest);
assert.deepStrictEqual(validateStrategicReview(rehashedConcernReview), []);
assert.match(validateServiceLineCountReviewHandoff(handoff, [rehashedConcernReview, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /specialist reviews must exactly equal canonical evaluation/);
const rehashedConflict = clone(conflict);
rehashedConflict.review_refs[0].output_sha256 = 'sha256:' + '9'.repeat(64);
rehashedConflict.output_sha256 = sha256(Object.fromEntries(Object.entries(rehashedConflict).filter(([key]) => key !== 'output_sha256')));
assert.match(validateServiceLineCountReviewHandoff(handoff, [methods, workforce], rehashedConflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /conflict review_refs must mutually link|conflict output hash must match/);
const deletedConflictDiscrepancy = clone(conflict);
deletedConflictDiscrepancy.discrepancies.pop();
deletedConflictDiscrepancy.output_sha256 = sha256(Object.fromEntries(Object.entries(deletedConflictDiscrepancy).filter(([key]) => key !== 'output_sha256')));
assert.match(validateServiceLineCountReviewHandoff(handoff, [methods, workforce], deletedConflictDiscrepancy, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exactly equal deterministic recomputation/);
const deletedConflictConcern = clone(conflict);
deletedConflictConcern.preserved_reviewer_concerns.pop();
deletedConflictConcern.output_sha256 = sha256(Object.fromEntries(Object.entries(deletedConflictConcern).filter(([key]) => key !== 'output_sha256')));
assert.match(validateServiceLineCountReviewHandoff(handoff, [methods, workforce], deletedConflictConcern, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exactly equal deterministic recomputation/);
const wrongWorkforceRole = clone(workforce);
wrongWorkforceRole.protocol.protocol_id = 'cso.evidence-methods-measurement.v1';
wrongWorkforceRole.output_sha256 = sha256(Object.fromEntries(Object.entries(wrongWorkforceRole).filter(([key]) => key !== 'output_sha256')));
assert.match(validateServiceLineCountReviewHandoff(handoff, [methods, wrongWorkforceRole], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /exact limited service-portfolio\/rights governance review role/);
for (const [field, value, expected] of [
  ['upstream_manifest_hash', 'sha256:' + '3'.repeat(64), /upstream manifest hash must match/],
  ['toolkit_producer_commit', '4'.repeat(40), /producer commits must match/],
  ['data_producer_commit', '5'.repeat(40), /producer commits must match/],
  ['toolkit_handoff_file_hash', 'sha256:' + '6'.repeat(64), /frozen Toolkit handoff raw hash/]
]) {
  const changed = clone(handoff);
  changed[field] = value;
  changed.handoff_sha256 = sha256(Object.fromEntries(Object.entries(changed).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateServiceLineCountReviewHandoff(changed, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), expected);
}
const runtimeHandoffDrift = clone(handoff);
runtimeHandoffDrift.toolkit_runtime_handoff_file_hash = 'sha256:' + '8'.repeat(64);
runtimeHandoffDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(runtimeHandoffDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(runtimeHandoffDrift, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /runtime handoff raw hash/);
const firstAssessmentDrift = clone(handoff);
firstAssessmentDrift.first_assessment_hashes.methods = 'sha256:' + '7'.repeat(64);
firstAssessmentDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(firstAssessmentDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(firstAssessmentDrift, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /first-assessment hashes must (?:exactly )?match/);
const handoffCountDrift = clone(handoff);
handoffCountDrift.cumulative_cell_counts.unavailable_public = 0;
handoffCountDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(handoffCountDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateServiceLineCountReviewHandoff(handoffCountDrift, [methods, workforce], conflict, manifest, objects, artifactHashes, evidenceArtifacts).join('; '), /cumulative cell counts must equal/);

const workforceText = JSON.stringify(workforce).toLowerCase();
for (const term of ['ahrq', 'cms rbcs', 'paid medicare part b', 'offered-service', 'rights', 'registry', 'no taxonomy authority', 'unavailable', 'not zero']) assert(workforceText.includes(term), `limited governance review must preserve ${term}`);
console.log('Scale service-line-count independent-first review, lineage, adversarial gates, and downstream handoff validated.');
