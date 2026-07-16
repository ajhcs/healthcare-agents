const fs = require('fs');

const {
  POSTURES,
  canonicalJson,
  findReviewProtocol,
  sha256
} = require('./review-protocols');

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
  const body = {
    schema_version: REVIEW_SCHEMA_VERSION,
    review_id: 'review:' + sha256({ request_id: request.request_id, first_assessment_hash: firstAssessmentHash }).slice(7, 39),
    request_id: request.request_id,
    protocol: {
      protocol_id: protocol.protocol_id,
      version: protocol.version,
      protocol_hash: protocol.protocol_hash,
      registry_hash: protocol.registry_hash,
      competence_role: protocol.competence_role
    },
    reviewer: request.reviewer,
    input_hashes: collectInputHashes(request.frozen_inputs),
    evidence_bundle_ref: request.frozen_inputs.evidence_bundle_ref,
    identity_binding_ref: request.frozen_inputs.identity_binding_ref,
    decision_scenario_ref: request.decision_scenario.ref,
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
      criteria_results: protocol.criteria.map((criterion, index) => ({
        criterion_id: protocol.protocol_id + ':criterion:' + String(index + 1),
        criterion,
        result: 'addressed_by_structured_review'
      })),
      advisory_only: true
    }
  };
  return { ...body, output_sha256: sha256(body) };
}

function validateReviewRequest(request) {
  const messages = [];
  if (!request || typeof request !== 'object' || Array.isArray(request)) return ['review request must be an object'];
  rejectUnknownKeys(request, ['schema_version', 'request_id', 'protocol', 'reviewer', 'frozen_inputs', 'decision_scenario', 'posture_taxonomy', 'evidence_boundary', 'candidate_review'], 'review request', messages);
  if (request.schema_version !== REQUEST_SCHEMA_VERSION) messages.push('unexpected review request schema_version');
  requireText(request.request_id, 'request_id', messages);
  const protocolRef = request.protocol || {};
  rejectUnknownKeys(protocolRef, ['protocol_id', 'version', 'protocol_hash'], 'protocol', messages);
  const protocol = findReviewProtocol(protocolRef.protocol_id, protocolRef.version);
  if (!protocol) messages.push('unknown active review protocol/version');
  if (protocol && protocolRef.protocol_hash !== protocol.protocol_hash) messages.push('protocol_hash does not match registry protocol');
  const reviewer = request.reviewer || {};
  rejectUnknownKeys(reviewer, ['agent_slug', 'prompt_version', 'repo_commit', 'model', 'runtime'], 'reviewer', messages);
  for (const field of ['agent_slug', 'prompt_version', 'repo_commit', 'model', 'runtime']) requireText(reviewer[field], 'reviewer.' + field, messages);
  if (reviewer.repo_commit && !/^[0-9a-f]{7,64}$/.test(reviewer.repo_commit)) messages.push('reviewer.repo_commit must be a git commit');
  const frozen = request.frozen_inputs || {};
  rejectUnknownKeys(frozen, ['evidence_bundle_ref', 'evidence_bundle_hash', 'identity_binding_ref', 'identity_binding_hash', 'computations', 'claim_candidates'], 'frozen_inputs', messages);
  requireRefHash(frozen, 'evidence_bundle', messages);
  requireRefHash(frozen, 'identity_binding', messages);
  if (!Array.isArray(frozen.computations) || !frozen.computations.length) messages.push('frozen_inputs.computations must not be empty');
  for (const computation of frozen.computations || []) requireRefHash(computation, 'computation', messages, true);
  if (!Array.isArray(frozen.claim_candidates) || !frozen.claim_candidates.length) messages.push('frozen_inputs.claim_candidates must not be empty');
  const claimIds = new Set();
  const allowedEvidenceRefs = new Set();
  for (const claim of frozen.claim_candidates || []) {
    rejectUnknownKeys(claim, ['claim_id', 'claim_hash', 'evidence_refs'], 'claim_candidate', messages);
    requireText(claim.claim_id, 'claim_candidate.claim_id', messages);
    requireHash(claim.claim_hash, 'claim_candidate.claim_hash', messages);
    if (claimIds.has(claim.claim_id)) messages.push('claim_candidate.claim_id must be unique');
    claimIds.add(claim.claim_id);
    requireStringArray(claim.evidence_refs, 'claim_candidate.evidence_refs', messages);
    for (const ref of claim.evidence_refs || []) allowedEvidenceRefs.add(ref);
  }
  requireRefHash(request.decision_scenario || {}, 'decision_scenario', messages, true);
  rejectUnknownKeys(request.decision_scenario || {}, ['ref', 'hash'], 'decision_scenario', messages);
  if (JSON.stringify(request.posture_taxonomy) !== JSON.stringify(POSTURES)) messages.push('posture_taxonomy must contain the frozen six postures in order');
  requireText(request.evidence_boundary, 'evidence_boundary', messages);
  const candidate = request.candidate_review || {};
  rejectUnknownKeys(candidate, ['competence_role', 'exposure_status', 'evidence_mutated', 'claim_dispositions', 'posture_assessments', 'missing_evidence_requests', 'method_challenges', 'prohibited_claims', 'preserved_reviewer_concerns', 'overall_disposition'], 'candidate_review', messages);
  if (candidate.exposure_status !== 'independent_first') messages.push('candidate review must be independent_first');
  if (candidate.evidence_mutated !== false) messages.push('candidate review must attest evidence_mutated=false');
  if (!protocol || candidate.competence_role !== protocol.competence_role) messages.push('candidate competence_role must match protocol');
  validateClaimDispositions(candidate.claim_dispositions, claimIds, allowedEvidenceRefs, messages);
  validatePostureAssessments(candidate.posture_assessments, claimIds, allowedEvidenceRefs, messages);
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
  if (review.professional_disposition_authority !== 'human_required') messages.push('professional disposition authority must remain human_required');
  if (review.exposure_status !== 'independent_first' || review.evidence_mutated !== false) messages.push('review must preserve independent-first frozen evidence');
  if (!Array.isArray(review.posture_assessments) || review.posture_assessments.map(item => item.posture).join('|') !== POSTURES.join('|')) messages.push('review must preserve all six postures');
  const body = { ...review };
  delete body.output_sha256;
  if (review.output_sha256 !== sha256(body)) messages.push('output_sha256 does not match canonical review content');
  scanForbidden(review, 'review', messages);
  return messages;
}

function collectInputHashes(frozen) {
  return [
    frozen.evidence_bundle_hash,
    frozen.identity_binding_hash,
    ...frozen.computations.map(item => item.hash),
    ...frozen.claim_candidates.map(item => item.claim_hash)
  ];
}

function validateClaimDispositions(dispositions, claimIds, allowedEvidenceRefs, messages) {
  if (!Array.isArray(dispositions) || !dispositions.length) {
    messages.push('claim_dispositions must not be empty');
    return;
  }
  const seen = new Set();
  for (const item of dispositions) {
    rejectUnknownKeys(item, ['claim_id', 'evidence_assessment', 'review_disposition', 'evidence_refs', 'limitation', 'overturn_condition'], 'claim disposition', messages);
    if (!claimIds.has(item.claim_id)) messages.push('claim disposition references unknown claim ' + item.claim_id);
    seen.add(item.claim_id);
    if (!EVIDENCE_ASSESSMENTS.has(item.evidence_assessment)) messages.push('invalid evidence_assessment for ' + item.claim_id);
    if (!REVIEW_DISPOSITIONS.has(item.review_disposition)) messages.push('invalid review_disposition for ' + item.claim_id);
    requireKnownRefs(item.evidence_refs, allowedEvidenceRefs, 'claim disposition evidence', messages);
    requireText(item.limitation, 'claim disposition limitation', messages);
    requireText(item.overturn_condition, 'claim disposition overturn_condition', messages);
  }
  for (const claimId of claimIds) if (!seen.has(claimId)) messages.push('missing claim disposition for ' + claimId);
}

function validatePostureAssessments(assessments, claimIds, allowedEvidenceRefs, messages) {
  if (!Array.isArray(assessments) || assessments.length !== POSTURES.length) {
    messages.push('posture_assessments must contain exactly six entries');
    return;
  }
  if (assessments.map(item => item.posture).join('|') !== POSTURES.join('|')) messages.push('posture assessments must use frozen order');
  for (const item of assessments) {
    rejectUnknownKeys(item, ['posture', 'effect', 'claim_refs', 'evidence_refs', 'rationale', 'limitation'], 'posture assessment', messages);
    if (!EFFECTS.has(item.effect)) messages.push('invalid posture effect for ' + item.posture);
    requireKnownRefs(item.claim_refs, claimIds, 'posture claim', messages);
    requireKnownRefs(item.evidence_refs, allowedEvidenceRefs, 'posture evidence', messages);
    requireText(item.rationale, 'posture rationale', messages);
    requireText(item.limitation, 'posture limitation', messages);
  }
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
