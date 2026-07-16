const fs = require('fs');

const {
  POSTURES,
  findReviewProtocol,
  sha256
} = require('./review-protocols');
const {
  validateReviewRequestShape,
  validateStrategicReviewShape
} = require('./review-contract-schemas');

const REQUEST_SCHEMA_VERSION = 'ushso.review-request.v1';
const REVIEW_SCHEMA_VERSION = 'ushso.strategic-review.v1';
const EFFECTS = new Set(['supports', 'weakens', 'unresolved', 'not_applicable', 'outside_scope']);
const EVIDENCE_ASSESSMENTS = new Set([
  'supported_by_available_evidence',
  'not_supported_by_available_evidence',
  'uncertain_due_to_evidence_limits',
  'not_assessed_under_protocol'
]);
const REVIEW_DISPOSITIONS = new Set([
  'accept_for_use',
  'reject_for_use',
  'revise_and_resubmit',
  'split_and_resubmit',
  'request_additional_evidence',
  'unresolved'
]);
const OVERALL_DISPOSITIONS = new Set(['pass', 'pass_with_caveats', 'block']);
const FORBIDDEN_KEYS = new Set([
  'recommended_posture',
  'posture_score',
  'posture_ranking',
  'winner',
  'confidence_score',
  'approved_by_model',
  'human_approval'
]);

function evaluateStrategicReview(request) {
  const messages = validateReviewRequest(request);
  if (messages.length) throw new Error(messages.join('; '));
  const protocol = findReviewProtocol(request.protocol.protocol_id, request.protocol.version);
  const firstAssessmentHash = sha256(request.candidate_review);
  const reviewRequestHash = sha256(request);
  const reviewContextHash = deriveReviewContextHash(request.review_tier, request.frozen_inputs, request.decision_scenario, request.evidence_boundary);
  const body = {
    schema_version: REVIEW_SCHEMA_VERSION,
    review_id: deriveReviewId(reviewRequestHash, request.reviewer.reviewer_id, protocol.protocol_hash, firstAssessmentHash),
    request_id: request.request_id,
    review_tier: request.review_tier,
    protocol: {
      protocol_id: protocol.protocol_id,
      version: protocol.version,
      protocol_hash: protocol.protocol_hash,
      registry_hash: protocol.registry_hash,
      competence_role: protocol.competence_role
    },
    reviewer: request.reviewer,
    review_request_hash: reviewRequestHash,
    review_context_hash: reviewContextHash,
    input_hashes: collectInputHashes(request.frozen_inputs),
    frozen_inputs: request.frozen_inputs,
    frozen_inputs_hash: sha256(request.frozen_inputs),
    evidence_bundle_ref: request.frozen_inputs.evidence_bundle_ref,
    identity_binding_ref: request.frozen_inputs.identity_binding_ref,
    decision_scenario: request.decision_scenario,
    decision_scenario_ref: request.decision_scenario.ref,
    evidence_boundary: request.evidence_boundary,
    first_assessment_hash: firstAssessmentHash,
    exposure_status: 'independent_first',
    evidence_mutated: false,
    posture_assessments: request.candidate_review.posture_assessments,
    claim_dispositions: request.candidate_review.claim_dispositions,
    missing_evidence_requests: request.candidate_review.missing_evidence_requests,
    method_challenges: request.candidate_review.method_challenges,
    prohibited_claims: request.candidate_review.prohibited_claims,
    preserved_reviewer_concerns: request.candidate_review.preserved_reviewer_concerns,
    overall_disposition: request.candidate_review.overall_disposition,
    professional_disposition_authority: 'human_required',
    evaluation: {
      valid: true,
      criteria_results: request.candidate_review.criterion_results,
      advisory_only: true
    }
  };
  return { ...body, output_sha256: sha256(body) };
}

function validateReviewRequest(request) {
  const messages = [];
  if (!request || typeof request !== 'object' || Array.isArray(request)) return ['review request must be an object'];
  const shapeMessages = validateReviewRequestShape(request);
  if (shapeMessages.length) return shapeMessages;
  rejectUnknownKeys(request, ['schema_version', 'request_id', 'review_tier', 'protocol', 'reviewer', 'frozen_inputs', 'decision_scenario', 'posture_taxonomy', 'evidence_boundary', 'candidate_review'], 'review request', messages);
  if (request.schema_version !== REQUEST_SCHEMA_VERSION) messages.push('unexpected review request schema_version');
  requireText(request.request_id, 'request_id', messages);
  const protocolRef = request.protocol || {};
  rejectUnknownKeys(protocolRef, ['protocol_id', 'version', 'protocol_hash'], 'protocol', messages);
  const protocol = findReviewProtocol(protocolRef.protocol_id, protocolRef.version);
  if (!protocol) messages.push('unknown active review protocol/version');
  if (protocol && protocolRef.protocol_hash !== protocol.protocol_hash) messages.push('protocol_hash does not match registry protocol');
  const reviewer = request.reviewer || {};
  rejectUnknownKeys(reviewer, ['reviewer_id', 'agent_slug', 'prompt_version', 'repo_commit', 'model', 'runtime', 'independence'], 'reviewer', messages);
  for (const field of ['reviewer_id', 'agent_slug', 'prompt_version', 'repo_commit', 'model', 'runtime']) requireText(reviewer[field], 'reviewer.' + field, messages);
  if (reviewer.repo_commit && !/^[0-9a-f]{7,64}$/.test(reviewer.repo_commit)) messages.push('reviewer.repo_commit must be a git commit');
  if (protocol && !protocol.candidate_agent_slugs.includes(reviewer.agent_slug)) messages.push('reviewer.agent_slug is not routed by the selected protocol');
  validateIndependence(reviewer.independence, messages);
  const frozen = request.frozen_inputs || {};
  rejectUnknownKeys(frozen, ['evidence_bundle_ref', 'evidence_bundle_hash', 'identity_binding_ref', 'identity_binding_hash', 'computations', 'claim_candidates'], 'frozen_inputs', messages);
  requireRefHash(frozen, 'evidence_bundle', messages);
  requireRefHash(frozen, 'identity_binding', messages);
  if (!Array.isArray(frozen.computations) || !frozen.computations.length) messages.push('frozen_inputs.computations must not be empty');
  for (const computation of frozen.computations || []) requireRefHash(computation, 'computation', messages, true);
  if (!Array.isArray(frozen.claim_candidates) || !frozen.claim_candidates.length) messages.push('frozen_inputs.claim_candidates must not be empty');
  const claimIds = new Set();
  const evidenceRefsByClaim = new Map();
  for (const claim of frozen.claim_candidates || []) {
    rejectUnknownKeys(claim, ['claim_id', 'claim_hash', 'evidence_refs'], 'claim_candidate', messages);
    requireText(claim.claim_id, 'claim_candidate.claim_id', messages);
    requireHash(claim.claim_hash, 'claim_candidate.claim_hash', messages);
    if (claimIds.has(claim.claim_id)) messages.push('claim_candidate.claim_id must be unique');
    claimIds.add(claim.claim_id);
    requireStringArray(claim.evidence_refs, 'claim_candidate.evidence_refs', messages);
    evidenceRefsByClaim.set(claim.claim_id, new Set(claim.evidence_refs || []));
  }
  requireRefHash(request.decision_scenario || {}, 'decision_scenario', messages, true);
  rejectUnknownKeys(request.decision_scenario || {}, ['ref', 'hash'], 'decision_scenario', messages);
  if (JSON.stringify(request.posture_taxonomy) !== JSON.stringify(POSTURES)) messages.push('posture_taxonomy must contain the frozen six postures in order');
  requireText(request.evidence_boundary, 'evidence_boundary', messages);
  const candidate = request.candidate_review || {};
  rejectUnknownKeys(candidate, ['competence_role', 'exposure_status', 'evidence_mutated', 'claim_dispositions', 'posture_assessments', 'criterion_results', 'missing_evidence_requests', 'method_challenges', 'prohibited_claims', 'preserved_reviewer_concerns', 'overall_disposition'], 'candidate_review', messages);
  if (candidate.exposure_status !== 'independent_first') messages.push('candidate review must be independent_first');
  if (candidate.evidence_mutated !== false) messages.push('candidate review must attest evidence_mutated=false');
  if (!protocol || candidate.competence_role !== protocol.competence_role) messages.push('candidate competence_role must match protocol');
  validateClaimDispositions(candidate.claim_dispositions, claimIds, evidenceRefsByClaim, messages);
  validatePostureAssessments(candidate.posture_assessments, claimIds, evidenceRefsByClaim, messages);
  if (protocol) validateCriterionResults(candidate.criterion_results, protocol, claimIds, evidenceRefsByClaim, messages);
  for (const field of ['missing_evidence_requests', 'method_challenges', 'prohibited_claims', 'preserved_reviewer_concerns']) {
    if (!Array.isArray(candidate[field])) messages.push('candidate_review.' + field + ' must be an array');
  }
  if (!OVERALL_DISPOSITIONS.has(candidate.overall_disposition)) messages.push('invalid overall_disposition');
  scanForbidden(candidate, 'candidate_review', messages);
  return messages;
}

function validateStrategicReview(review) {
  const messages = [];
  if (!review || review.schema_version !== REVIEW_SCHEMA_VERSION) return ['unexpected strategic review schema_version'];
  const shapeMessages = validateStrategicReviewShape(review);
  if (shapeMessages.length) return shapeMessages;
  rejectUnknownKeys(review, ['schema_version', 'review_id', 'request_id', 'review_tier', 'protocol', 'reviewer', 'review_request_hash', 'review_context_hash', 'input_hashes', 'frozen_inputs', 'frozen_inputs_hash', 'evidence_bundle_ref', 'identity_binding_ref', 'decision_scenario', 'decision_scenario_ref', 'evidence_boundary', 'first_assessment_hash', 'exposure_status', 'evidence_mutated', 'posture_assessments', 'claim_dispositions', 'missing_evidence_requests', 'method_challenges', 'prohibited_claims', 'preserved_reviewer_concerns', 'overall_disposition', 'professional_disposition_authority', 'evaluation', 'output_sha256'], 'review', messages);
  for (const field of ['review_id', 'request_id', 'evidence_bundle_ref', 'identity_binding_ref', 'decision_scenario_ref', 'evidence_boundary']) requireText(review[field], field, messages);
  for (const field of ['review_request_hash', 'review_context_hash', 'frozen_inputs_hash', 'first_assessment_hash', 'output_sha256']) requireHash(review[field], field, messages);
  requireStringArray(review.input_hashes, 'input_hashes', messages);
  for (const hash of review.input_hashes || []) requireHash(hash, 'input_hashes entry', messages);
  if (review.professional_disposition_authority !== 'human_required') messages.push('professional disposition authority must remain human_required');
  if (review.exposure_status !== 'independent_first' || review.evidence_mutated !== false) messages.push('review must preserve independent-first frozen evidence');
  const protocolRef = review.protocol || {};
  const protocol = findReviewProtocol(protocolRef.protocol_id, protocolRef.version);
  if (!protocol) messages.push('review references unknown active protocol/version');
  if (protocol && protocolRef.protocol_hash !== protocol.protocol_hash) messages.push('review protocol_hash does not match registry protocol');
  if (protocol && protocolRef.registry_hash !== protocol.registry_hash) messages.push('review registry_hash does not match active registry');
  if (protocol && protocolRef.competence_role !== protocol.competence_role) messages.push('review competence_role does not match protocol');
  if (protocol && !protocol.candidate_agent_slugs.includes((review.reviewer || {}).agent_slug)) messages.push('reviewer.agent_slug is not routed by the selected protocol');
  validateIndependence((review.reviewer || {}).independence, messages);
  const frozen = review.frozen_inputs || {};
  if (review.frozen_inputs_hash !== safeSha256(frozen)) messages.push('frozen_inputs_hash does not match frozen_inputs');
  const expectedInputHashes = collectInputHashesSafe(frozen);
  if (JSON.stringify(review.input_hashes) !== JSON.stringify(expectedInputHashes)) messages.push('input_hashes must exactly match labeled frozen inputs');
  if (review.evidence_bundle_ref !== frozen.evidence_bundle_ref) messages.push('evidence_bundle_ref must match frozen_inputs');
  if (review.identity_binding_ref !== frozen.identity_binding_ref) messages.push('identity_binding_ref must match frozen_inputs');
  if (review.decision_scenario_ref !== (review.decision_scenario || {}).ref) messages.push('decision_scenario_ref must match decision_scenario');
  const expectedContextHash = deriveReviewContextHash(review.review_tier, frozen, review.decision_scenario, review.evidence_boundary);
  if (review.review_context_hash !== expectedContextHash) messages.push('review_context_hash does not match frozen review context');
  const claimIds = new Set();
  const evidenceRefsByClaim = new Map();
  for (const claim of frozen.claim_candidates || []) {
    requireText(claim && claim.claim_id, 'claim_candidate.claim_id', messages);
    requireHash(claim && claim.claim_hash, 'claim_candidate.claim_hash', messages);
    if (claim && claimIds.has(claim.claim_id)) messages.push('claim_candidate.claim_id must be unique');
    if (claim) claimIds.add(claim.claim_id);
    requireStringArray(claim && claim.evidence_refs, 'claim_candidate.evidence_refs', messages);
    if (claim) evidenceRefsByClaim.set(claim.claim_id, new Set(claim.evidence_refs || []));
    if (claim && (!Array.isArray(review.input_hashes) || !review.input_hashes.includes(claim.claim_hash))) messages.push('claim_candidate.claim_hash must be preserved in input_hashes');
  }
  validatePostureAssessments(review.posture_assessments, claimIds, evidenceRefsByClaim, messages);
  validateClaimDispositions(review.claim_dispositions, claimIds, evidenceRefsByClaim, messages);
  for (const field of ['missing_evidence_requests', 'method_challenges', 'prohibited_claims', 'preserved_reviewer_concerns']) if (!Array.isArray(review[field])) messages.push(field + ' must be an array');
  if (!OVERALL_DISPOSITIONS.has(review.overall_disposition)) messages.push('invalid overall_disposition');
  const evaluation = review.evaluation || {};
  if (evaluation.valid !== true || evaluation.advisory_only !== true || !Array.isArray(evaluation.criteria_results) || !evaluation.criteria_results.length) messages.push('review evaluation must be valid, advisory, and criterion-complete');
  if (protocol) {
    validateCriterionResults(evaluation.criteria_results, protocol, claimIds, evidenceRefsByClaim, messages);
  }
  const firstAssessment = {
    competence_role: protocolRef.competence_role,
    exposure_status: review.exposure_status,
    evidence_mutated: review.evidence_mutated,
    claim_dispositions: review.claim_dispositions,
    posture_assessments: review.posture_assessments,
    criterion_results: evaluation.criteria_results,
    missing_evidence_requests: review.missing_evidence_requests,
    method_challenges: review.method_challenges,
    prohibited_claims: review.prohibited_claims,
    preserved_reviewer_concerns: review.preserved_reviewer_concerns,
    overall_disposition: review.overall_disposition
  };
  if (review.first_assessment_hash !== safeSha256(firstAssessment)) messages.push('first_assessment_hash does not match published assessment fields');
  const reconstructedRequest = {
    schema_version: REQUEST_SCHEMA_VERSION,
    request_id: review.request_id,
    review_tier: review.review_tier,
    protocol: {
      protocol_id: protocolRef.protocol_id,
      version: protocolRef.version,
      protocol_hash: protocolRef.protocol_hash
    },
    reviewer: review.reviewer,
    frozen_inputs: review.frozen_inputs,
    decision_scenario: review.decision_scenario,
    posture_taxonomy: POSTURES,
    evidence_boundary: review.evidence_boundary,
    candidate_review: firstAssessment
  };
  if (review.review_request_hash !== safeSha256(reconstructedRequest)) messages.push('review_request_hash does not match published request lineage');
  const reviewIdentityFields = [review.review_request_hash, (review.reviewer || {}).reviewer_id, protocolRef.protocol_hash, review.first_assessment_hash];
  if (reviewIdentityFields.every(value => typeof value === 'string')) {
    const expectedReviewId = deriveReviewId(...reviewIdentityFields);
    if (review.review_id !== expectedReviewId) messages.push('review_id does not match reviewer, protocol, request, and assessment');
  }
  const body = { ...review };
  delete body.output_sha256;
  if (review.output_sha256 !== safeSha256(body)) messages.push('output_sha256 does not match canonical review content');
  scanForbidden(review, 'review', messages);
  return messages;
}

function validateIndependence(independence, messages) {
  if (!independence || typeof independence !== 'object' || Array.isArray(independence)) {
    messages.push('reviewer.independence is required');
    return;
  }
  if (independence.prior_exposure !== 'none') messages.push('independent-first review cannot have prior exposure');
  if (independence.direct_material_conflict !== false) messages.push('independent-first reviewer cannot have a direct material conflict');
  if (independence.attestation !== true) messages.push('reviewer independence attestation is required');
  if (!Array.isArray(independence.conflict_disclosures)) messages.push('reviewer conflict_disclosures must be an array');
}

function validateCriterionResults(results, protocol, claimIds, evidenceRefsByClaim, messages) {
  if (!Array.isArray(results)) {
    messages.push('criterion_results must be an array');
    return;
  }
  const expected = protocol.criteria.map((_, index) => protocol.protocol_id + ':criterion:' + String(index + 1));
  const actual = results.map(item => item && item.criterion_id);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) messages.push('criterion_results must cover every protocol criterion in order');
  for (const item of results) {
    if (!item || typeof item !== 'object') continue;
    requireKnownRefs(item.claim_refs, claimIds, 'criterion claim', messages);
    const allowedEvidenceRefs = evidenceForClaims(item.claim_refs, evidenceRefsByClaim);
    if (item.result === 'addressed') requireKnownRefs(item.evidence_refs, allowedEvidenceRefs, 'criterion evidence', messages);
    else validateKnownRefsAllowEmpty(item.evidence_refs, allowedEvidenceRefs, 'criterion evidence', messages);
    requireText(item.rationale, 'criterion rationale', messages);
  }
}

function collectInputHashes(frozen) {
  return [
    frozen.evidence_bundle_hash,
    frozen.identity_binding_hash,
    ...frozen.computations.map(item => item.hash),
    ...frozen.claim_candidates.map(item => item.claim_hash)
  ];
}

function collectInputHashesSafe(frozen) {
  if (!frozen || !Array.isArray(frozen.computations) || !Array.isArray(frozen.claim_candidates)) return [];
  return collectInputHashes(frozen);
}

function deriveReviewId(reviewRequestHash, reviewerId, protocolHash, firstAssessmentHash) {
  return 'review:' + sha256({ review_request_hash: reviewRequestHash, reviewer_id: reviewerId, protocol_hash: protocolHash, first_assessment_hash: firstAssessmentHash }).slice(7, 39);
}

function deriveReviewContextHash(reviewTier, frozenInputs, decisionScenario, evidenceBoundary) {
  return sha256({
    review_tier: reviewTier,
    frozen_inputs: frozenInputs,
    decision_scenario: decisionScenario,
    posture_taxonomy: POSTURES,
    evidence_boundary: evidenceBoundary
  });
}

function safeSha256(value) {
  try {
    return sha256(value);
  } catch {
    return null;
  }
}

function validateClaimDispositions(dispositions, claimIds, evidenceRefsByClaim, messages) {
  if (!Array.isArray(dispositions) || !dispositions.length) {
    messages.push('claim_dispositions must not be empty');
    return;
  }
  const seen = new Set();
  for (const item of dispositions) {
    rejectUnknownKeys(item, ['claim_id', 'evidence_assessment', 'review_disposition', 'evidence_refs', 'limitation', 'overturn_condition'], 'claim disposition', messages);
    if (!claimIds.has(item.claim_id)) messages.push('claim disposition references unknown claim ' + item.claim_id);
    if (seen.has(item.claim_id)) messages.push('claim disposition claim_id must be unique');
    seen.add(item.claim_id);
    if (!EVIDENCE_ASSESSMENTS.has(item.evidence_assessment)) messages.push('invalid evidence_assessment for ' + item.claim_id);
    if (!REVIEW_DISPOSITIONS.has(item.review_disposition)) messages.push('invalid review_disposition for ' + item.claim_id);
    requireKnownRefs(item.evidence_refs, evidenceRefsByClaim.get(item.claim_id) || new Set(), 'claim disposition evidence', messages);
    requireText(item.limitation, 'claim disposition limitation', messages);
    requireText(item.overturn_condition, 'claim disposition overturn_condition', messages);
  }
  for (const claimId of claimIds) if (!seen.has(claimId)) messages.push('missing claim disposition for ' + claimId);
}

function validatePostureAssessments(assessments, claimIds, evidenceRefsByClaim, messages) {
  if (!Array.isArray(assessments) || assessments.length !== POSTURES.length) {
    messages.push('posture_assessments must contain exactly six entries');
    return;
  }
  if (assessments.map(item => item.posture).join('|') !== POSTURES.join('|')) messages.push('posture assessments must use frozen order');
  for (const item of assessments) {
    rejectUnknownKeys(item, ['posture', 'effect', 'claim_refs', 'evidence_refs', 'rationale', 'limitation'], 'posture assessment', messages);
    if (!EFFECTS.has(item.effect)) messages.push('invalid posture effect for ' + item.posture);
    requireKnownRefs(item.claim_refs, claimIds, 'posture claim', messages);
    const allowedEvidenceRefs = evidenceForClaims(item.claim_refs, evidenceRefsByClaim);
    requireKnownRefs(item.evidence_refs, allowedEvidenceRefs, 'posture evidence', messages);
    requireText(item.rationale, 'posture rationale', messages);
    requireText(item.limitation, 'posture limitation', messages);
  }
}

function evidenceForClaims(claimRefs, evidenceRefsByClaim) {
  const allowed = new Set();
  for (const claimId of claimRefs || []) {
    for (const evidenceRef of evidenceRefsByClaim.get(claimId) || []) allowed.add(evidenceRef);
  }
  return allowed;
}

function requireRefHash(value, label, messages, simple = false) {
  const refKey = simple ? 'ref' : label + '_ref';
  const hashKey = simple ? 'hash' : label + '_hash';
  requireText(value[refKey], label + ' ref', messages);
  requireHash(value[hashKey], label + ' hash', messages);
}

function requireHash(value, label, messages) {
  if (typeof value !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(value)) messages.push(label + ' must be a sha256 hash');
}

function requireText(value, label, messages) {
  if (typeof value !== 'string' || !value.trim()) messages.push(label + ' must be a non-empty string');
}

function requireStringArray(value, label, messages) {
  if (!Array.isArray(value) || !value.length || value.some(item => typeof item !== 'string' || !item.trim())) messages.push(label + ' must contain non-empty strings');
}

function requireKnownRefs(value, allowed, label, messages) {
  requireStringArray(value, label, messages);
  for (const ref of value || []) if (!allowed.has(ref)) messages.push(label + ' references unknown id ' + ref);
}

function validateKnownRefsAllowEmpty(value, allowed, label, messages) {
  if (!Array.isArray(value)) {
    messages.push(label + ' must be an array');
    return;
  }
  for (const ref of value) {
    if (typeof ref !== 'string' || !ref.trim()) messages.push(label + ' entries must be non-empty strings');
    else if (!allowed.has(ref)) messages.push(label + ' references unknown id ' + ref);
  }
}

function scanForbidden(value, path, messages) {
  if (Array.isArray(value)) return value.forEach((item, index) => scanForbidden(item, path + '[' + index + ']', messages));
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) messages.push(path + ' contains prohibited field ' + key);
    scanForbidden(nested, path + '.' + key, messages);
  }
}

function rejectUnknownKeys(value, allowedKeys, label, messages) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) if (!allowed.has(key)) messages.push(label + ' contains unexpected field ' + key);
}

function evaluateStrategicReviewFile(inputPath, outputPath) {
  const request = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const review = evaluateStrategicReview(request);
  const payload = JSON.stringify(review, null, 2) + '\n';
  if (outputPath) fs.writeFileSync(outputPath, payload);
  return payload;
}

module.exports = {
  EFFECTS,
  OVERALL_DISPOSITIONS,
  REQUEST_SCHEMA_VERSION,
  REVIEW_SCHEMA_VERSION,
  evaluateStrategicReview,
  evaluateStrategicReviewFile,
  validateReviewRequest,
  validateStrategicReview
};
