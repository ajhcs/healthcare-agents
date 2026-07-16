#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  evaluateStrategicReview,
  evaluateStrategicReviewFile,
  validateReviewRequest,
  validateStrategicReview
} = require('../lib/strategic-review');
const {
  analyzeReviewConflicts,
  validateConflictAnalysis
} = require('../lib/conflict-analysis');
const { findReviewProtocol, sha256 } = require('../lib/review-protocols');
const {
  validateReviewRequestShape,
  validateStrategicReviewShape
} = require('../lib/review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const FIXTURE_PATH = path.join(ROOT, 'review-protocols', 'fixtures', 'evidence-methods-review-request.json');

function fixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
}

const first = evaluateStrategicReview(fixture());
const second = evaluateStrategicReview(fixture());
assert.deepStrictEqual(first, second);
assert.deepStrictEqual(validateStrategicReview(first), []);
assert.strictEqual(first.posture_assessments.length, 6);
assert.strictEqual(first.professional_disposition_authority, 'human_required');
assert.deepStrictEqual(validateReviewRequestShape(fixture()), []);
assert.deepStrictEqual(validateStrategicReviewShape(first), []);

const unrouted = fixture();
unrouted.reviewer.agent_slug = 'revenue-finance-manager';
assert.match(validateReviewRequest(unrouted).join('; '), /not routed by the selected protocol/);

const conflicted = fixture();
conflicted.reviewer.independence.direct_material_conflict = true;
assert.match(validateReviewRequest(conflicted).join('; '), /direct material conflict/);

const exposed = fixture();
exposed.reviewer.independence.prior_exposure = 'unavoidable_recorded';
assert.match(validateReviewRequest(exposed).join('; '), /cannot have prior exposure/);

const missingCriterion = fixture();
missingCriterion.candidate_review.criterion_results.pop();
assert.match(validateReviewRequest(missingCriterion).join('; '), /cover every protocol criterion/);

const unsupportedCriterion = fixture();
unsupportedCriterion.candidate_review.criterion_results[0].evidence_refs = [];
assert.match(validateReviewRequest(unsupportedCriterion).join('; '), /criterion evidence must contain non-empty strings/);

const mutated = fixture();
mutated.candidate_review.evidence_mutated = true;
assert.match(validateReviewRequest(mutated).join('; '), /evidence_mutated=false/);

const collapsed = fixture();
collapsed.candidate_review.posture_score = 0.8;
assert.match(validateReviewRequest(collapsed).join('; '), /prohibited field posture_score/);

const omitted = fixture();
omitted.candidate_review.posture_assessments.pop();
assert.match(validateReviewRequest(omitted).join('; '), /exactly six entries/);

const unknownEvidence = fixture();
unknownEvidence.candidate_review.claim_dispositions[0].evidence_refs = ['receipt:fabricated'];
assert.match(validateReviewRequest(unknownEvidence).join('; '), /unknown id receipt:fabricated/);

const protocolDrift = fixture();
protocolDrift.protocol.protocol_hash = 'sha256:' + '0'.repeat(64);
assert.match(validateReviewRequest(protocolDrift).join('; '), /protocol_hash does not match/);

const recommendationLeak = fixture();
recommendationLeak.candidate_review.recommended_posture = 'defer';
assert.match(validateReviewRequest(recommendationLeak).join('; '), /prohibited field recommended_posture/);

const fabricatedAuthority = fixture();
fabricatedAuthority.candidate_review.human_approval = 'approved';
assert.match(validateReviewRequest(fabricatedAuthority).join('; '), /prohibited field human_approval/);

const missingCitation = fixture();
missingCitation.candidate_review.posture_assessments[0].evidence_refs = [];
assert.match(validateReviewRequest(missingCitation).join('; '), /must contain non-empty strings/);

const malformedOutput = { ...first };
malformedOutput.claim_dispositions = [{}];
const malformedBody = { ...malformedOutput };
delete malformedBody.output_sha256;
malformedOutput.output_sha256 = sha256(malformedBody);
assert.match(validateStrategicReview(malformedOutput).join('; '), /schema/);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-agents-review-'));
const outputPath = path.join(tempDir, 'review.json');
evaluateStrategicReviewFile(FIXTURE_PATH, outputPath);
assert.deepStrictEqual(JSON.parse(fs.readFileSync(outputPath, 'utf8')), first);

const disagreeingRequest = fixture();
disagreeingRequest.request_id = 'review-request:fixture:licensed-beds:second';
disagreeingRequest.protocol = (() => {
  const protocol = findReviewProtocol('cso.operations-access-capacity.v1', '1.0.0');
  return { protocol_id: protocol.protocol_id, version: protocol.version, protocol_hash: protocol.protocol_hash };
})();
disagreeingRequest.reviewer.reviewer_id = 'fixture:operations-reviewer-1';
disagreeingRequest.reviewer.agent_slug = 'operations-hospital-administrator';
disagreeingRequest.candidate_review.competence_role = 'operations_access_capacity_workforce';
disagreeingRequest.candidate_review.criterion_results = disagreeingRequest.candidate_review.criterion_results.map((item, index) => ({
  ...item,
  criterion_id: 'cso.operations-access-capacity.v1:criterion:' + String(index + 1)
}));
disagreeingRequest.candidate_review.posture_assessments[4].effect = 'supports';
disagreeingRequest.candidate_review.posture_assessments[4].rationale = 'A deliberately divergent fixture position for conflict mapping.';
disagreeingRequest.candidate_review.claim_dispositions[0].overturn_condition = 'Comparable staffed-capacity and workforce evidence resolves the limitation.';
disagreeingRequest.candidate_review.method_challenges[0].description = 'Test whether licensed capacity is operationally available under workforce constraints.';
disagreeingRequest.candidate_review.overall_disposition = 'pass_with_caveats';
const disagreeing = evaluateStrategicReview(disagreeingRequest);
const conflict = analyzeReviewConflicts({
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:fixture',
  review_tier: 'ordinary_material_claim',
  reviews: [first, disagreeing]
});
assert.deepStrictEqual(validateConflictAnalysis(conflict), []);
assert.strictEqual(conflict.advisory_only, true);
assert.strictEqual(conflict.resolution_authority, 'human_required');
assert.ok(conflict.discrepancies.some(item => item.field_path === 'posture_assessments.build_capacity.effect'));
assert.ok(conflict.discrepancies.some(item => item.field_path.endsWith('.overturn_condition')));
assert.ok(conflict.discrepancies.some(item => item.field_path === 'method_challenges'));

assert.throws(() => analyzeReviewConflicts({
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:duplicate-reviewer',
  review_tier: 'ordinary_material_claim',
  reviews: [first, first]
}), /unique independent reviewer identities/);

assert.throws(() => analyzeReviewConflicts({
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:high-consequence-incomplete',
  review_tier: 'high_consequence_claim',
  reviews: [
    { ...first, review_tier: 'high_consequence_claim' },
    { ...disagreeing, review_tier: 'high_consequence_claim' }
  ]
}), /two independent competence-matched subject reviewers/);

console.log('strategic review contract ok');
