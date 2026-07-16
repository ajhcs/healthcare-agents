const { sha256 } = require('./review-protocols');
const { validateStrategicReview } = require('./strategic-review');

const CONFLICT_REQUEST_SCHEMA_VERSION = 'ushso.ai-conflict-analysis-request.v1';
const CONFLICT_SCHEMA_VERSION = 'ushso.ai-conflict-analysis.v1';

function analyzeReviewConflicts(request) {
  const messages = validateConflictRequest(request);
  if (messages.length) throw new Error(messages.join('; '));
  const discrepancies = [];
  const [first, ...others] = request.reviews;
  for (const review of others) {
    comparePostures(first, review, discrepancies);
    compareClaims(first, review, discrepancies);
    if (first.overall_disposition !== review.overall_disposition) {
      discrepancies.push(discrepancy(
        'review_disposition',
        'overall_disposition',
        first,
        review,
        first.overall_disposition,
        review.overall_disposition
      ));
    }
  }
  const body = {
    schema_version: CONFLICT_SCHEMA_VERSION,
    analysis_id: 'conflict:' + sha256(request.reviews.map(review => review.output_sha256)).slice(7, 39),
    request_id: request.request_id,
    review_refs: request.reviews.map(review => ({ review_id: review.review_id, output_sha256: review.output_sha256 })),
    discrepancies,
    preserved_reviewer_concerns: request.reviews.flatMap(review => review.preserved_reviewer_concerns.map(concern => ({ review_id: review.review_id, concern }))),
    proposed_route: discrepancies.length ? 'human_competence_matched_adjudication' : 'no_material_discrepancy_detected',
    advisory_only: true,
    resolution_authority: 'human_required',
    automatic_resolution: 'prohibited'
  };
  return { ...body, output_sha256: sha256(body) };
}

function validateConflictRequest(request) {
  const messages = [];
  if (!request || request.schema_version !== CONFLICT_REQUEST_SCHEMA_VERSION) messages.push('unexpected conflict request schema_version');
  if (!request || typeof request.request_id !== 'string' || !request.request_id.trim()) messages.push('request_id is required');
  if (!request || !Array.isArray(request.reviews) || request.reviews.length < 2) return [...messages, 'at least two reviews are required'];
  for (const review of request.reviews) messages.push(...validateStrategicReview(review).map(message => review.review_id + ': ' + message));
  const inputSets = request.reviews.map(review => JSON.stringify(review.input_hashes));
  if (new Set(inputSets).size !== 1) messages.push('conflict analysis requires reviews of identical frozen input hashes');
  return messages;
}

function validateConflictAnalysis(analysis) {
  const messages = [];
  if (!analysis || analysis.schema_version !== CONFLICT_SCHEMA_VERSION) return ['unexpected conflict analysis schema_version'];
  if (analysis.advisory_only !== true || analysis.resolution_authority !== 'human_required' || analysis.automatic_resolution !== 'prohibited') messages.push('AI conflict analysis must remain advisory and human-resolved');
  const body = { ...analysis };
  delete body.output_sha256;
  if (analysis.output_sha256 !== sha256(body)) messages.push('output_sha256 does not match conflict analysis');
  return messages;
}

function comparePostures(first, second, discrepancies) {
  for (let index = 0; index < first.posture_assessments.length; index += 1) {
    const left = first.posture_assessments[index];
    const right = second.posture_assessments[index];
    if (left.effect !== right.effect) {
      discrepancies.push(discrepancy(
        'warrant_or_posture_mapping',
        'posture_assessments.' + left.posture + '.effect',
        first,
        second,
        left.effect,
        right.effect
      ));
    }
  }
}

function compareClaims(first, second, discrepancies) {
  const rightByClaim = new Map(second.claim_dispositions.map(item => [item.claim_id, item]));
  for (const left of first.claim_dispositions) {
    const right = rightByClaim.get(left.claim_id);
    if (!right) continue;
    for (const field of ['evidence_assessment', 'review_disposition']) {
      if (left[field] !== right[field]) discrepancies.push(discrepancy('evidence_assessment', 'claim_dispositions.' + left.claim_id + '.' + field, first, second, left[field], right[field]));
    }
  }
}

function discrepancy(type, fieldPath, first, second, left, right) {
  return {
    discrepancy_id: 'discrepancy:' + sha256({ type, fieldPath, left: first.review_id, right: second.review_id }).slice(7, 31),
    type,
    field_path: fieldPath,
    material: true,
    positions: [
      { review_id: first.review_id, value: left },
      { review_id: second.review_id, value: right }
    ],
    deterministic_resolution: null,
    human_route_required: true
  };
}

module.exports = {
  CONFLICT_REQUEST_SCHEMA_VERSION,
  CONFLICT_SCHEMA_VERSION,
  analyzeReviewConflicts,
  validateConflictAnalysis,
  validateConflictRequest
};
