#!/usr/bin/env node
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { validateConflictAnalysis, validateConflictRequest } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const {
  validateScalePacketReviewHandoff,
  validateScalePacketReviewRequest,
  validateScalePacketUpstream
} = require('../lib/scale-input-fitness-review');
const { validateReviewRequest, validateStrategicReview } = require('../lib/strategic-review');
const {
  validateConflictAnalysisShape,
  validateConflictRequestShape,
  validateReviewRequestShape,
  validateStrategicReviewShape
} = require('../lib/review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-input-packets', 'operating-revenue');
const UPSTREAM = path.join(FIXTURES, 'upstream');
const generatedNames = ['upstream-manifest.json', 'methods-review-request.json', 'finance-review-request.json', 'methods-review.json', 'finance-review.json', 'conflict-analysis-request.json', 'conflict-analysis.json', 'handoff.json'];
const objectPaths = {
  baseline_packet: 'baseline-packet.json', cumulative_packet: 'cumulative-packet.json', decision_scenario: 'decision-scenario.json',
  identity_binding: 'identity-binding.json', no_execution_result: 'no-execution-result.json', process_claim: 'process-claim.json',
  prior_review_record: 'prior/claim-review-record.json', prior_assurance_case: 'prior/module-assurance-case.json', toolkit_handoff: 'handoff.json'
};

function load(relativePath, base = FIXTURES) { return JSON.parse(fs.readFileSync(path.join(base, relativePath), 'utf8')); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rawHash(relativePath) { return 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(path.join(UPSTREAM, relativePath))).digest('hex'); }
function mutateAndValidate(mutator) {
  const mutated = clone(objects);
  mutator(mutated);
  return validateScalePacketUpstream(manifest, mutated, artifactHashes).join('; ');
}

const before = new Map(generatedNames.map(name => [name, fs.readFileSync(path.join(FIXTURES, name))]));
const generation = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'generate-scale-input-fitness-review.js')], { cwd: ROOT, encoding: 'utf8' });
assert.strictEqual(generation.status, 0, generation.stderr);
for (const name of generatedNames) assert(before.get(name).equals(fs.readFileSync(path.join(FIXTURES, name))), `${name} rebuild must be byte-identical`);

const objects = Object.fromEntries(Object.entries(objectPaths).map(([role, relativePath]) => [role, load(relativePath, UPSTREAM)]));
const artifactHashes = Object.fromEntries(Object.entries(objectPaths).map(([role, relativePath]) => [role, rawHash(relativePath)]));
const manifest = load('upstream-manifest.json');
const methodsRequest = load('methods-review-request.json');
const financeRequest = load('finance-review-request.json');
const methods = load('methods-review.json');
const finance = load('finance-review.json');
const conflictRequest = load('conflict-analysis-request.json');
const conflict = load('conflict-analysis.json');
const handoff = load('handoff.json');

assert.deepStrictEqual(validateScalePacketUpstream(manifest, objects, artifactHashes), []);
for (const request of [methodsRequest, financeRequest]) {
  assert.deepStrictEqual(validateReviewRequestShape(request), []);
  assert.deepStrictEqual(validateReviewRequest(request), []);
  assert.deepStrictEqual(validateScalePacketReviewRequest(request, manifest, objects, artifactHashes), []);
  assert.strictEqual(request.candidate_review.exposure_status, 'independent_first');
  assert.strictEqual(request.candidate_review.overall_disposition, 'block');
}
for (const review of [methods, finance]) {
  assert.deepStrictEqual(validateStrategicReviewShape(review), []);
  assert.deepStrictEqual(validateStrategicReview(review), []);
  assert.strictEqual(review.professional_disposition_authority, 'human_required');
  assert.strictEqual(review.evaluation.advisory_only, true);
  assert.strictEqual(review.output_sha256, sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'output_sha256'))));
}
assert.deepStrictEqual(methodsRequest.frozen_inputs, financeRequest.frozen_inputs);
assert.deepStrictEqual(methodsRequest.decision_scenario, financeRequest.decision_scenario);
assert.strictEqual(methods.review_context_hash, finance.review_context_hash);
assert.notStrictEqual(methods.reviewer.reviewer_id, finance.reviewer.reviewer_id);
assert.strictEqual(methods.protocol.protocol_id, 'cso.evidence-methods-measurement.v1');
assert.strictEqual(methods.reviewer.agent_slug, 'healthit-clinical-data-analyst');
assert.strictEqual(finance.protocol.protocol_id, 'cso.healthcare-finance-capital.v1');
assert.strictEqual(finance.reviewer.agent_slug, 'revenue-finance-manager');

assert.deepStrictEqual(validateConflictRequestShape(conflictRequest), []);
assert.deepStrictEqual(validateConflictRequest(conflictRequest), []);
assert.deepStrictEqual(validateConflictAnalysisShape(conflict), []);
assert.deepStrictEqual(validateConflictAnalysis(conflict), []);
assert(conflict.discrepancies.length > 0);
assert(conflict.discrepancies.every(item => item.material && item.human_route_required && item.deterministic_resolution === null));
assert.strictEqual(conflict.automatic_resolution, 'prohibited');
assert.deepStrictEqual(validateScalePacketReviewHandoff(handoff, [methods, finance], conflict, manifest, objects, artifactHashes), []);
assert.strictEqual(handoff.downstream_bead, 'healthcare-toolkit-2rr9.6.3.2');
assert.deepStrictEqual(handoff.cumulative_cell_counts, { total: 54, populated: 0, blocked_source_conflict: 18, not_yet_researched: 36 });
assert.deepStrictEqual(handoff.prior_counts, { discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10 });
assert(Object.values(handoff.output_inventory).every(value => value === 0));

// Raw and semantic upstream drift are rejected independently.
const artifactDrift = { ...artifactHashes, toolkit_handoff: 'sha256:' + '0'.repeat(64) };
assert.match(validateScalePacketUpstream(manifest, objects, artifactDrift).join('; '), /exact artifact bytes drift|frozen raw hash/);
const commitDrift = clone(manifest);
commitDrift.producer_pins.healthcare_toolkit = '1'.repeat(40);
assert.match(validateScalePacketUpstream(commitDrift, objects, artifactHashes).join('; '), /self-hash|Toolkit producer pin drift/);
const semanticRepin = clone(manifest);
semanticRepin.objects.cumulative_packet.semantic_hash = 'sha256:' + '2'.repeat(64);
semanticRepin.manifest_sha256 = sha256(Object.fromEntries(Object.entries(semanticRepin).filter(([key]) => key !== 'manifest_sha256')));
assert.match(validateScalePacketUpstream(semanticRepin, objects, artifactHashes).join('; '), /semantic hash drift|exact Toolkit handoff pin/);

// Missing prior evidence, closed conflicts, fabricated values/zeroes, and output leakage are rejected.
assert.match(mutateAndValidate(value => value.prior_review_record.preserved_concerns.pop()), /24 reviewer concerns/);
assert.match(mutateAndValidate(value => value.prior_review_record.discrepancies.pop()), /26 material discrepancies/);
assert.match(mutateAndValidate(value => value.prior_review_record.concern_overturns.pop()), /ten overturn gates/);
assert.match(mutateAndValidate(value => value.prior_review_record.open_conflict_refs.pop()), /five open roster\/bed conflicts/);
assert.match(mutateAndValidate(value => value.cumulative_packet.unresolved_conflict_refs.pop()), /eleven cumulative open conflicts/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'operating_revenue_usd').state = 'populated'; }), /blocked and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'operating_revenue_usd').source_backed_zero = true; }), /blocked and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.input_family === 'operating_revenue_usd').approved_value = 0; }), /blocked and unpopulated/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'not_yet_researched').state = 'blocked_source_conflict'; }), /exactly 0 populated, 18 blocked_source_conflict, and 36 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.cells.find(cell => cell.state === 'blocked_source_conflict').state = 'populated'; }), /exactly 0 populated, 18 blocked_source_conflict, and 36 not_yet_researched/);
assert.match(mutateAndValidate(value => { value.cumulative_packet.output_inventory.scale_scores = 1; }), /inventory zero/);
assert.match(mutateAndValidate(value => { value.no_execution_result.sensitivity_results.push({ fabricated: true }); }), /sensitivity_results must remain empty/);

const weakened = clone(methodsRequest);
weakened.candidate_review.overall_disposition = 'pass';
assert.match(validateScalePacketReviewRequest(weakened, manifest, objects, artifactHashes).join('; '), /must remain block/);
const missingCounts = clone(methodsRequest);
missingCounts.candidate_review.preserved_reviewer_concerns = [];
assert.match(validateScalePacketReviewRequest(missingCounts, manifest, objects, artifactHashes).join('; '), /preserve all 24 prior reviewer concerns/);
const fabricatedEvidence = clone(methodsRequest);
fabricatedEvidence.candidate_review.claim_dispositions[0].evidence_refs[0] = 'fabricated:evidence';
assert.match(validateScalePacketReviewRequest(fabricatedEvidence, manifest, objects, artifactHashes).join('; '), /evidence reference absent from frozen manifest/);

const duplicate = clone(conflictRequest);
duplicate.reviews[1].reviewer.reviewer_id = duplicate.reviews[0].reviewer.reviewer_id;
assert.match(validateConflictRequest(duplicate).join('; '), /unique independent reviewer identities/);
const averaged = clone(handoff);
averaged.positions_averaged = true;
assert.match(validateScalePacketReviewHandoff(averaged, [methods, finance], conflict, manifest, objects, artifactHashes).join('; '), /cannot fabricate authority, adjudicate, or average/);
const authority = clone(handoff);
authority.human_authority_conveyed = true;
assert.match(validateScalePacketReviewHandoff(authority, [methods, finance], conflict, manifest, objects, artifactHashes).join('; '), /cannot fabricate authority/);
const promoted = clone(handoff);
promoted.output_inventory.promotion_attempts = 1;
assert.match(validateScalePacketReviewHandoff(promoted, [methods, finance], conflict, manifest, objects, artifactHashes).join('; '), /inventory zero/);
for (const [field, value, expected] of [
  ['upstream_manifest_hash', 'sha256:' + '3'.repeat(64), /upstream manifest hash must match/],
  ['toolkit_producer_commit', '4'.repeat(40), /producer commits must match/],
  ['data_producer_commit', '5'.repeat(40), /producer commits must match/],
  ['toolkit_handoff_file_hash', 'sha256:' + '6'.repeat(64), /frozen Toolkit handoff raw hash/]
]) {
  const changed = clone(handoff);
  changed[field] = value;
  changed.handoff_sha256 = sha256(Object.fromEntries(Object.entries(changed).filter(([key]) => key !== 'handoff_sha256')));
  assert.match(validateScalePacketReviewHandoff(changed, [methods, finance], conflict, manifest, objects, artifactHashes).join('; '), expected);
}
const firstAssessmentDrift = clone(handoff);
firstAssessmentDrift.first_assessment_hashes.methods = 'sha256:' + '7'.repeat(64);
firstAssessmentDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(firstAssessmentDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateScalePacketReviewHandoff(firstAssessmentDrift, [methods, finance], conflict, manifest, objects, artifactHashes).join('; '), /first-assessment hashes must match/);
const handoffCountDrift = clone(handoff);
handoffCountDrift.cumulative_cell_counts.blocked_source_conflict = 17;
handoffCountDrift.handoff_sha256 = sha256(Object.fromEntries(Object.entries(handoffCountDrift).filter(([key]) => key !== 'handoff_sha256')));
assert.match(validateScalePacketReviewHandoff(handoffCountDrift, [methods, finance], conflict, manifest, objects, artifactHashes).join('; '), /cumulative cell counts must equal/);

const financeText = JSON.stringify(finance).toLowerCase();
for (const term of ['fiscal period', 'consolidation', 'audited', 'one-time', 'capital capacity', 'temple', 'cooper', 'http 403', 'not zero']) assert(financeText.includes(term), `finance review must preserve ${term}`);
console.log('Scale operating-revenue independent-first review, lineage, adversarial gates, and downstream handoff validated.');
