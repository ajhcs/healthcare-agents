const { canonicalJson, sha256 } = require('./review-protocols');
const { validateStrategicReview } = require('./strategic-review');
const {
  validateConflictAnalysisShape,
  validateConflictRequestShape
} = require('./review-contract-schemas');

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
    compareReviewCollections(first, review, discrepancies);
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
    review_tier: request.review_tier,
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
  messages.push(...validateConflictRequestShape(request));
  if (!request || request.schema_version !== CONFLICT_REQUEST_SCHEMA_VERSION) messages.push('unexpected conflict request schema_version');
  if (!request || typeof request.request_id !== 'string' || !request.request_id.trim()) messages.push('request_id is required');
  if (!request || !Array.isArray(request.reviews) || request.reviews.length < 2) return [...messages, 'at least two reviews are required'];
  for (const review of request.reviews) messages.push(...validateStrategicReview(review).map(message => review.review_id + ': ' + message));
  const reviewerIds = request.reviews.map(review => review.reviewer && review.reviewer.reviewer_id);
  if (new Set(reviewerIds).size !== reviewerIds.length) messages.push('conflict analysis requires unique independent reviewer identities');
  const inputSets = request.reviews.map(review => JSON.stringify(review.input_hashes));
  if (new Set(inputSets).size !== 1) messages.push('conflict analysis requires reviews of identical frozen input hashes');
  const claimSets = request.reviews.map(review => canonicalJson(review.claim_candidates));
  if (new Set(claimSets).size !== 1) messages.push('conflict analysis requires identical frozen claim candidates');
  if (request.reviews.some(review => review.review_tier !== request.review_tier)) messages.push('all reviews must match the conflict request review_tier');
  const methodsRole = 'evidence_methods_measurement_biostatistics';
  const methodsReviews = request.reviews.filter(review => review.protocol.competence_role === methodsRole);
  const subjectReviews = request.reviews.filter(review => review.protocol.competence_role !== methodsRole);
  if (methodsReviews.length < 1) messages.push('review cohort requires an evidence methods reviewer');
  if (request.review_tier === 'ordinary_material_claim' && subjectReviews.length < 1) messages.push('ordinary material claim requires a competence-matched subject reviewer');
  if (request.review_tier === 'high_consequence_claim' && subjectReviews.length < 2) messages.push('high consequence claim requires two independent competence-matched subject reviewers');
  return messages;
}

function validateConflictAnalysis(analysis) {
  const messages = [];
  if (!analysis || analysis.schema_version !== CONFLICT_SCHEMA_VERSION) return ['unexpected conflict analysis schema_version'];
  messages.push(...validateConflictAnalysisShape(analysis));
  for (const field of ['analysis_id', 'request_id', 'proposed_route']) {
    if (typeof analysis[field] !== 'string' || !analysis[field].trim()) messages.push(field + ' is required');
  }
  if (!Array.isArray(analysis.review_refs) || analysis.review_refs.length < 2) messages.push('conflict analysis requires at least two review refs');
  const reviewIds = new Set();
  for (const item of analysis.review_refs || []) {
    requireText(item && item.review_id, 'review ref review_id', messages);
    requireHash(item && item.output_sha256, 'review ref output_sha256', messages);
    if (item && reviewIds.has(item.review_id)) messages.push('review refs require unique review_id values');
    if (item) reviewIds.add(item.review_id);
  }
  if (!Array.isArray(analysis.discrepancies) || !Array.isArray(analysis.preserved_reviewer_concerns)) messages.push('conflict analysis arrays are required');
  for (const item of analysis.discrepancies || []) {
    for (const field of ['discrepancy_id', 'type', 'field_path']) requireText(item && item[field], 'discrepancy ' + field, messages);
    if (!item || item.material !== true) messages.push('conflict discrepancies must be material');
    if (!item || !Array.isArray(item.positions) || item.positions.length < 2) messages.push('conflict discrepancy requires at least two positions');
    const positionReviewIds = new Set();
    for (const position of (item && item.positions) || []) {
      requireText(position && position.review_id, 'discrepancy position review_id', messages);
      if (!position || !Object.prototype.hasOwnProperty.call(position, 'value')) messages.push('discrepancy position must preserve reviewer value');
      if (position && !reviewIds.has(position.review_id)) messages.push('discrepancy position references unknown review_id');
      if (position && positionReviewIds.has(position.review_id)) messages.push('discrepancy positions require unique review_id values');
      if (position) positionReviewIds.add(position.review_id);
    }
    if (item.human_route_required !== true || item.deterministic_resolution !== null) messages.push('material discrepancies must remain human-routed and unresolved');
  }
  for (const item of analysis.preserved_reviewer_concerns || []) {
    requireText(item && item.review_id, 'preserved concern review_id', messages);
    requireText(item && item.concern, 'preserved concern', messages);
    if (item && !reviewIds.has(item.review_id)) messages.push('preserved concern references unknown review_id');
  }
  const expectedRoute = (analysis.discrepancies || []).length
    ? 'human_competence_matched_adjudication'
    : 'no_material_discrepancy_detected';
  if (analysis.proposed_route !== expectedRoute) messages.push('proposed_route must match discrepancy presence');
  if (analysis.advisory_only !== true || analysis.resolution_authority !== 'human_required' || analysis.automatic_resolution !== 'prohibited') messages.push('AI conflict analysis must remain advisory and human-resolved');
  const body = { ...analysis };
  delete body.output_sha256;
  if (analysis.output_sha256 !== sha256(body)) messages.push('output_sha256 does not match conflict analysis');
  return messages;
}

function requireHash(value, label, messages) {
  if (typeof value !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(value)) messages.push(label + ' must be a sha256 hash');
}

function requireText(value, label, messages) {
  if (typeof value !== 'string' || !value.trim()) messages.push(label + ' must be a non-empty string');
}

function comparePostures(first, second, discrepancies) {
  for (let index = 0; index < first.posture_assessments.length; index += 1) {
    const left = first.posture_assessments[index];
    const right = second.posture_assessments[index];
    for (const field of ['effect', 'claim_refs', 'evidence_refs', 'rationale', 'limitation']) {
      compareField('warrant_or_posture_mapping', 'posture_assessments.' + left.posture + '.' + field, first, second, left[field], right[field], discrepancies);
    }
  }
}

function compareClaims(first, second, discrepancies) {
  const rightByClaim = new Map(second.claim_dispositions.map(item => [item.claim_id, item]));
  for (const left of first.claim_dispositions) {
    const right = rightByClaim.get(left.claim_id);
    if (!right) {
      discrepancies.push(discrepancy('evidence_assessment', 'claim_dispositions.' + left.claim_id, first, second, left, null));
      continue;
    }
    for (const field of ['evidence_assessment', 'review_disposition', 'evidence_refs', 'limitation', 'overturn_condition']) {
      compareField('evidence_assessment', 'claim_dispositions.' + left.claim_id + '.' + field, first, second, left[field], right[field], discrepancies);
    }
  }
}

function compareField(type, fieldPath, first, second, left, right, discrepancies) {
  if (canonicalJson(left) !== canonicalJson(right)) discrepancies.push(discrepancy(type, fieldPath, first, second, left, right));
}

function compareReviewCollections(first, second, discrepancies) {
  for (const field of ['missing_evidence_requests', 'method_challenges', 'prohibited_claims', 'preserved_reviewer_concerns']) {
    compareField('review_concern_or_challenge', field, first, second, first[field], second[field], discrepancies);
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
