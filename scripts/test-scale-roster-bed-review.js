#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { validateConflictAnalysis, validateConflictRequest } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const { validateScaleReviewHandoff, validateScaleReviewRequest, validateUpstreamManifest } = require('../lib/scale-roster-bed-review');
const { validateReviewRequest, validateStrategicReview } = require('../lib/strategic-review');
const { validateConflictAnalysisShape, validateConflictRequestShape, validateReviewRequestShape, validateStrategicReviewShape } = require('../lib/review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-roster-bed-basis');
const generatedNames = ['methods-review-request.json', 'operations-review-request.json', 'methods-review.json', 'operations-review.json', 'conflict-analysis-request.json', 'conflict-analysis.json', 'handoff.json', 'adversarial-cases.json'];

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function allReviewText(review) {
  return JSON.stringify(review).toLowerCase();
}

const before = new Map(generatedNames.map(name => [name, fs.readFileSync(path.join(FIXTURES, name))]));
const rebuild = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'generate-scale-roster-bed-review.js')], { cwd: ROOT, encoding: 'utf8' });
assert.strictEqual(rebuild.status, 0, rebuild.stderr);
for (const name of generatedNames) assert(before.get(name).equals(fs.readFileSync(path.join(FIXTURES, name))), `${name} rebuild must be byte-identical`);

const methodsRequest = load('methods-review-request.json');
const operationsRequest = load('operations-review-request.json');
const methods = load('methods-review.json');
const operations = load('operations-review.json');
const conflictRequest = load('conflict-analysis-request.json');
const conflict = load('conflict-analysis.json');
const handoff = load('handoff.json');
const adversarialCases = load('adversarial-cases.json');
const upstreamManifest = load('upstream-manifest.json');

assert.deepStrictEqual(validateUpstreamManifest(upstreamManifest), []);

for (const request of [methodsRequest, operationsRequest]) {
  assert.deepStrictEqual(validateReviewRequestShape(request), []);
  assert.deepStrictEqual(validateReviewRequest(request), []);
  assert.strictEqual(request.review_tier, 'ordinary_material_claim');
  assert.strictEqual(request.candidate_review.exposure_status, 'independent_first');
  assert.strictEqual(request.candidate_review.evidence_mutated, false);
  assert.strictEqual(request.candidate_review.criterion_results.length, 3);
  assert.strictEqual(request.candidate_review.posture_assessments.length, 6);
  assert.strictEqual(request.candidate_review.overall_disposition, 'block');
  assert.deepStrictEqual(validateScaleReviewRequest(request, upstreamManifest), []);
}
for (const review of [methods, operations]) {
  assert.deepStrictEqual(validateStrategicReviewShape(review), []);
  assert.deepStrictEqual(validateStrategicReview(review), []);
  assert.strictEqual(review.professional_disposition_authority, 'human_required');
  assert.strictEqual(review.evaluation.advisory_only, true);
  assert.strictEqual(review.output_sha256, sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'output_sha256'))));
}
assert.deepStrictEqual(validateConflictRequestShape(conflictRequest), []);
assert.deepStrictEqual(validateConflictRequest(conflictRequest), []);
assert.deepStrictEqual(validateConflictAnalysisShape(conflict), []);
assert.deepStrictEqual(validateConflictAnalysis(conflict), []);

assert.deepStrictEqual(methodsRequest.frozen_inputs, operationsRequest.frozen_inputs, 'both reviewers must receive identical frozen inputs');
assert.deepStrictEqual(methodsRequest.decision_scenario, operationsRequest.decision_scenario);
assert.strictEqual(methods.review_context_hash, operations.review_context_hash);
assert.notStrictEqual(methods.reviewer.reviewer_id, operations.reviewer.reviewer_id);
assert.notStrictEqual(methods.first_assessment_hash, operations.first_assessment_hash);
assert.deepStrictEqual(methods.input_hashes, [
  'sha256:241a6a909613df116802a2d96965ce9678b76e2887c0f1af9f146186ddd75568',
  'sha256:64e4322e7561ede8b0b50129ed40b278987392480eb215f33e84336bffc7ebc3',
  'sha256:871b966f09219d6cfa9764b43fcf77bf735308c9958cf8db3c94485926f524f7',
  'sha256:358a45c36f781cf62b32d0f025a1b86cfe190acdd5d5fad2b49c2650d6d5e8c1'
]);
assert.strictEqual(methods.decision_scenario.hash, 'sha256:8dbc16d8fb4c970a2b8514996e8f5f52ae3cfc0c219a12c6d6472494a7e00f15');
assert.strictEqual(conflict.review_refs.length, 2);
assert.strictEqual(conflict.proposed_route, 'human_competence_matched_adjudication');
assert.strictEqual(conflict.automatic_resolution, 'prohibited');
assert(conflict.discrepancies.length > 0);
assert(conflict.discrepancies.every(item => item.material && item.human_route_required && item.deterministic_resolution === null));
assert.strictEqual(conflict.preserved_reviewer_concerns.length, methods.preserved_reviewer_concerns.length + operations.preserved_reviewer_concerns.length);
assert.deepStrictEqual(validateScaleReviewHandoff(handoff, [methods, operations], conflict, upstreamManifest), []);

const combined = `${allReviewText(methods)} ${allReviewText(operations)} ${JSON.stringify(handoff).toLowerCase()}`;
for (const required of [
  '63 roster candidates', '54 included', 'six unresolved', 'three excluded',
  'shared reporting', 'alias', 'joint-venture', 'specialty', 'inactive', 'double-count', 'omission',
  '2023 through q1/fy2026', 'licensed', 'set-up-and-staffed', 'pos', 'hcris', 'ahrq',
  'common all-six denominator', 'imputation', 'roster narrowing', 'staffed', 'achievable capacity'
]) assert(combined.includes(required), `review must preserve concern: ${required}`);
for (const conflictId of [
  'conflict:chestnut-hill-ownership-and-bases',
  'conflict:christianacare-shared-cms-reporting-entity',
  'conflict:cooper-childrens-separate-hospital',
  'conflict:temple-shared-cms-reporting-entity',
  'conflict:union-bed-bases'
]) assert(combined.includes(conflictId), `review must preserve ${conflictId}`);
for (const prohibited of ['system bed totals', 'comparable all-six bed claims', 'staffed-capacity inference', 'partial or complete scale scores', 'rankings', 'strategic recommendations', 'professional adjudication', 'projection approval', 'public promotion']) {
  assert(handoff.prohibited_until_adjudicated.map(item => item.toLowerCase()).includes(prohibited), `handoff must prohibit ${prohibited}`);
}
for (const disposition of [...methods.claim_dispositions, ...operations.claim_dispositions]) assert(disposition.overturn_condition.length > 300, 'each material claim concern needs an evidence-specific overturn condition');
assert.strictEqual(handoff.concern_overturns.length, 10);
assert(handoff.concern_overturns.every(item => item.evidence_refs.length && item.overturn_condition.length >= 80));

// Adversarial: duplicate reviewers, context/input drift, incomplete evidence, and fabricated authority.
const duplicateReviewer = clone(conflictRequest);
duplicateReviewer.reviews[1].reviewer.reviewer_id = duplicateReviewer.reviews[0].reviewer.reviewer_id;
assert.match(validateConflictRequest(duplicateReviewer).join('; '), /unique independent reviewer identities/);

const inputDrift = clone(conflictRequest);
inputDrift.reviews[1].input_hashes[0] = 'sha256:' + '0'.repeat(64);
assert.match(validateConflictRequest(inputDrift).join('; '), /identical frozen input hashes|input_hashes must exactly match/);

const contextDrift = clone(conflictRequest);
contextDrift.reviews[1].review_context_hash = 'sha256:' + '1'.repeat(64);
assert.match(validateConflictRequest(contextDrift).join('; '), /identical frozen review context|review_context_hash does not match/);

const incompleteCriterion = clone(methodsRequest);
incompleteCriterion.candidate_review.criterion_results.pop();
assert.match(validateReviewRequest(incompleteCriterion).join('; '), /cover every protocol criterion/);

const missingCriterionEvidence = clone(methodsRequest);
missingCriterionEvidence.candidate_review.criterion_results[0].evidence_refs = [];
assert.match(validateReviewRequest(missingCriterionEvidence).join('; '), /criterion evidence must contain non-empty strings/);

for (const field of ['posture_score', 'recommended_posture', 'human_approval']) {
  const prohibitedField = clone(methodsRequest);
  prohibitedField.candidate_review[field] = field === 'posture_score' ? 0.5 : 'fabricated';
  assert.match(validateReviewRequest(prohibitedField).join('; '), /schema|prohibited field/);
}

// Concrete adversarial domain fixtures remove a required concern or attempt a prohibited pass.
for (const adversarialCase of adversarialCases) {
  if (adversarialCase.target === 'request_evidence') {
    const mutatedRequest = clone(methodsRequest);
    (function removeEvidenceRef(value) {
      if (Array.isArray(value)) {
        for (let index = value.length - 1; index >= 0; index -= 1) {
          if (value[index] === adversarialCase.remove_evidence_ref) value.splice(index, 1);
          else removeEvidenceRef(value[index]);
        }
      } else if (value && typeof value === 'object') {
        for (const child of Object.values(value)) removeEvidenceRef(child);
      }
    })(mutatedRequest.candidate_review);
    const messages = validateScaleReviewRequest(mutatedRequest, upstreamManifest).join('; ');
    assert(messages.includes(adversarialCase.expected_error), `${adversarialCase.case_id} must reject its concrete evidence mutation: ${messages}`);
  } else {
    const mutatedRequest = clone(methodsRequest);
    mutatedRequest.candidate_review.overall_disposition = adversarialCase.set_overall_disposition;
    assert(validateScaleReviewRequest(mutatedRequest, upstreamManifest).join('; ').includes(adversarialCase.expected_error));
  }
}

// Every review evidence reference must resolve through the immutable upstream manifest.
const manifestIds = new Set(upstreamManifest.evidence_identifiers);
for (const review of [methods, operations]) {
  for (const item of [...review.claim_dispositions, ...review.posture_assessments, ...review.evaluation.criteria_results]) {
    assert(item.evidence_refs.every(ref => manifestIds.has(ref)), `unmanifested evidence ref in ${review.review_id}`);
  }
}

// Each named failure mode also has a falsification challenge in the first assessments.
const methodsChallenges = methods.method_challenges.map(item => `${item.challenge_id} ${item.description}`).join(' ').toLowerCase();
const operationsChallenges = operations.method_challenges.map(item => `${item.challenge_id} ${item.description}`).join(' ').toLowerCase();
assert.match(methodsChallenges, /bed-basis-negative-control/);
assert.match(methodsChallenges, /shared-entity-double-count/);
assert.match(methodsChallenges, /omission-audit/);
assert.match(methodsChallenges, /scope-perturbation-roster/);
assert.match(operationsChallenges, /period-alignment/);
assert.match(operationsChallenges, /licensed-to-achievable-capacity/);

assert.strictEqual(handoff.request_hashes.methods, methods.review_request_hash);
assert.strictEqual(handoff.request_hashes.operations, operations.review_request_hash);
assert.strictEqual(handoff.request_hashes.conflict, sha256(conflictRequest));
assert.strictEqual(handoff.review_hashes.methods_first_assessment, methods.first_assessment_hash);
assert.strictEqual(handoff.review_hashes.methods_output, methods.output_sha256);
assert.strictEqual(handoff.review_hashes.operations_first_assessment, operations.first_assessment_hash);
assert.strictEqual(handoff.review_hashes.operations_output, operations.output_sha256);
assert.strictEqual(handoff.conflict_output_hash, conflict.output_sha256);
assert.strictEqual(handoff.upstream_manifest_hash, upstreamManifest.manifest_sha256);
assert.strictEqual(handoff.downstream_bead, 'healthcare-toolkit-2rr9.6.1');

console.log('Scale roster/bed review fixtures, lineage, adversarial gates, and handoff validated.');
