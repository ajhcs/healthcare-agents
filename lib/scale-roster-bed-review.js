const { sha256 } = require('./review-protocols');

const REQUIRED_CONCERN_IDS = [
  'identity-boundary-and-stale-ownership',
  'roster-boundaries-and-coverage',
  'shared-reporting-double-count',
  'specialty-campus-omission',
  'reporting-period-alignment',
  'bed-basis-comparability',
  'aggregation-and-system-rollup',
  'missing-scale-input-families',
  'staffed-and-achievable-capacity',
  'human-authority-boundary'
];
const REQUIRED_DOMAIN_EVIDENCE_IDS = [
  'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed',
  'conflict:chestnut-hill-ownership-and-bases',
  'conflict:christianacare-shared-cms-reporting-entity',
  'coverage:bed-missing:penn-medicine:hup-cedar',
  'computation:scale-v1:all-six:no-score:2026-07-16'
];

function validateUpstreamManifest(manifest) {
  const messages = [];
  if (!manifest || manifest.schema_version !== 'ushso.scale-roster-bed-upstream-manifest.v1') return ['unexpected upstream manifest schema_version'];
  const body = { ...manifest };
  delete body.manifest_sha256;
  if (manifest.manifest_sha256 !== sha256(body)) messages.push('upstream manifest_sha256 does not match canonical content');
  for (const [label, value] of Object.entries({
    'data_mcp.bundle_hash': manifest.data_mcp && manifest.data_mcp.bundle_hash,
    ...Object.fromEntries(Object.entries((manifest.toolkit && manifest.toolkit.objects) || {}).map(([key, value]) => [`toolkit.objects.${key}.hash`, value.hash]))
  })) if (!/^sha256:[0-9a-f]{64}$/.test(value || '')) messages.push(`${label} must be a sha256 hash`);
  if (!Array.isArray(manifest.evidence_identifiers) || new Set(manifest.evidence_identifiers).size !== manifest.evidence_identifiers.length) messages.push('upstream evidence identifiers must be a unique array');
  if (!Array.isArray(manifest.conflict_ids) || manifest.conflict_ids.length !== 5 || manifest.conflict_ids.some(id => !manifest.evidence_identifiers.includes(id))) messages.push('upstream manifest must preserve exactly five valid conflict ids');
  return messages;
}

function validateScaleReviewRequest(request, manifest) {
  const messages = validateUpstreamManifest(manifest);
  const expected = {
    evidence_bundle_hash: manifest.data_mcp.bundle_hash,
    identity_binding_hash: manifest.toolkit.objects.identity_binding.hash
  };
  for (const [field, hash] of Object.entries(expected)) if (!request || !request.frozen_inputs || request.frozen_inputs[field] !== hash) messages.push(`${field} must match upstream manifest`);
  if (!request || request.decision_scenario.hash !== manifest.toolkit.objects.decision_scenario.hash) messages.push('decision scenario hash must match upstream manifest');
  if (!request || request.frozen_inputs.computations[0].hash !== manifest.toolkit.objects.computation_result.hash) messages.push('computation hash must match upstream manifest');
  if (!request || request.frozen_inputs.claim_candidates[0].claim_hash !== manifest.toolkit.objects.claim_candidate.hash) messages.push('claim hash must match upstream manifest');
  const candidate = (request && request.candidate_review) || {};
  if (candidate.overall_disposition !== 'block') messages.push('Scale roster/bed review must remain block');
  if ((candidate.claim_dispositions || []).some(item => item.review_disposition !== 'request_additional_evidence')) messages.push('claim disposition must request additional evidence');
  if ((candidate.posture_assessments || []).some(item => item.effect !== 'unresolved')) messages.push('all strategic posture effects must remain unresolved');
  const usedRefs = collectEvidenceRefs(candidate);
  for (const ref of usedRefs) if (!manifest.evidence_identifiers.includes(ref)) messages.push(`evidence reference absent from upstream manifest: ${ref}`);
  for (const id of manifest.conflict_ids) if (!usedRefs.includes(id)) messages.push(`review must preserve conflict evidence: ${id}`);
  for (const id of REQUIRED_DOMAIN_EVIDENCE_IDS) if (!usedRefs.includes(id)) messages.push(`review must preserve required domain evidence: ${id}`);
  return messages;
}

function validateScaleReviewHandoff(handoff, reviews, conflict, manifest) {
  const messages = validateUpstreamManifest(manifest);
  const concerns = (handoff && handoff.concern_overturns) || [];
  const actualIds = concerns.map(item => item.concern_id);
  if (JSON.stringify(actualIds) !== JSON.stringify(REQUIRED_CONCERN_IDS)) messages.push('handoff concern_overturns must cover every required concern id in order');
  const validRefs = new Set(manifest.evidence_identifiers);
  for (const concern of concerns) {
    if (!Array.isArray(concern.evidence_refs) || !concern.evidence_refs.length || concern.evidence_refs.some(ref => !validRefs.has(ref))) messages.push(`concern ${concern.concern_id} must bind valid upstream evidence refs`);
    if (typeof concern.overturn_condition !== 'string' || concern.overturn_condition.length < 80) messages.push(`concern ${concern.concern_id} requires an evidence-specific overturn condition`);
    if (!Array.isArray(concern.review_concern_refs) || !concern.review_concern_refs.length) messages.push(`concern ${concern.concern_id} must map preserved reviewer concerns`);
  }
  const expectedConcernRefs = reviews.flatMap(review => review.preserved_reviewer_concerns.map((_, index) => `${review.review_id}:${index}`)).sort();
  const actualConcernRefs = concerns.flatMap(item => item.review_concern_refs || []).sort();
  if (JSON.stringify(actualConcernRefs) !== JSON.stringify(expectedConcernRefs)) messages.push('every preserved reviewer concern must map exactly once to an overturn condition');
  if (handoff.review_hashes.methods_output !== reviews[0].output_sha256 || handoff.review_hashes.operations_output !== reviews[1].output_sha256) messages.push('handoff review hashes must match outputs');
  if (handoff.conflict_output_hash !== conflict.output_sha256) messages.push('handoff conflict hash must match output');
  if (handoff.route !== 'human_competence_matched_adjudication' || handoff.automatic_resolution !== 'prohibited') messages.push('handoff must remain human-routed without automatic resolution');
  return messages;
}

function collectEvidenceRefs(value) {
  const refs = [];
  function visit(node, key) {
    if (Array.isArray(node)) {
      if (key === 'evidence_refs') refs.push(...node);
      else node.forEach(item => visit(item));
    } else if (node && typeof node === 'object') {
      for (const [childKey, child] of Object.entries(node)) visit(child, childKey);
    }
  }
  visit(value);
  return [...new Set(refs)];
}

module.exports = {
  REQUIRED_CONCERN_IDS,
  REQUIRED_DOMAIN_EVIDENCE_IDS,
  collectEvidenceRefs,
  validateScaleReviewHandoff,
  validateScaleReviewRequest,
  validateUpstreamManifest
};
