const crypto = require('crypto');

const { sha256 } = require('./review-protocols');

const TOOLKIT_PRODUCER = '370dd2da1cb233eea8f89cb4773ed669a8c37b58';
const DATA_PRODUCER = 'b1fdfad94e65239fa73928990c086a63423b7c94';
const TOOLKIT_HANDOFF_FILE_HASH = 'sha256:c448ed24b8737df3ec4e934d801aaae1bff40cdb3d31d142e3e354071d045a3b';
const EVIDENCE_BUNDLE_REF = 'ushso-rebuild://scale-inputs/operating-revenue/public-evidence-bundle';
const COMMITTED_INPUT_REF = `git:${DATA_PRODUCER}:contracts/v1/fixtures/scale-operating-revenue-input.json`;
const NORMALIZED_INPUT_RAW_HASH = 'sha256:04fadae952898bc6dac87d0aaf4a3b04711cc9acc387ec751612f4b937b5b89f';
const PRODUCER_BOUND_INPUT_RAW_HASH = 'sha256:78bca41b71402ec8e4c7b64b73ab1cb722b28e527039caeb515590aa7693554b';
const EVIDENCE_BUNDLE_RAW_HASH = 'sha256:a2eee1faa34275b852a5976bd321cc3cc13ae6020d1d749da229dcc2f0577543';
const EVIDENCE_BUNDLE_SEMANTIC_HASH = 'sha256:e3b908d6dbe6036b167d9d79acc0165dd796230bb4793451a463f4fdc844f726';
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: 'upstream/data-mcp/normalized-input.json',
  producer_bound_input_artifact_ref: 'upstream/data-mcp/producer-bound-input.json',
  bundle_artifact_ref: 'upstream/data-mcp/public-evidence-bundle.json'
});
const PRIOR_COUNTS = Object.freeze({ discrepancies: 26, reviewer_concerns: 24, open_conflicts: 5, overturn_gates: 10 });
const ZERO_OUTPUT_KEYS = Object.freeze([
  'adjudications', 'component_scores', 'deployments', 'formula_executions', 'projections',
  'promotion_attempts', 'recommendations', 'scale_scores', 'sensitivity_runs'
]);

function validateScalePacketUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  const messages = [];
  if (!manifest || manifest.schema_version !== 'ushso.scale-input-fitness-upstream-manifest.v1') return ['unexpected Scale packet upstream manifest schema_version'];
  const body = { ...manifest };
  delete body.manifest_sha256;
  if (manifest.manifest_sha256 !== sha256(body)) messages.push('upstream manifest self-hash does not match canonical content');
  if (manifest.active_family !== 'operating_revenue_usd') messages.push('active family must remain operating_revenue_usd');
  if (manifest.producer_pins?.healthcare_toolkit !== TOOLKIT_PRODUCER) messages.push('Toolkit producer pin drift');
  if (manifest.producer_pins?.healthcare_data_mcp !== DATA_PRODUCER) messages.push('Data MCP producer pin drift');
  if (manifest.toolkit_handoff_file_hash !== TOOLKIT_HANDOFF_FILE_HASH) messages.push('Toolkit handoff file hash drift');
  if (artifactHashes.toolkit_handoff !== TOOLKIT_HANDOFF_FILE_HASH) messages.push('Toolkit handoff exact bytes must match the frozen raw hash');
  validateEvidenceLineage(manifest, evidenceArtifacts, messages);
  const required = ['baseline_packet', 'cumulative_packet', 'decision_scenario', 'identity_binding', 'no_execution_result', 'process_claim', 'prior_review_record', 'prior_assurance_case', 'toolkit_handoff'];
  for (const role of required) {
    const entry = manifest.objects?.[role];
    if (!entry || !objects?.[role]) {
      messages.push(`missing exact upstream object: ${role}`);
      continue;
    }
    if (entry.semantic_hash && semanticHash(objects[role]) !== entry.semantic_hash) messages.push(`${role} semantic hash drift`);
    if (entry.artifact_hash && artifactHashes[role] !== entry.artifact_hash) messages.push(`${role} exact artifact bytes drift`);
  }
  const handoffRoleMap = {
    prior_claim_review_record: 'prior_review_record',
    prior_module_assurance_case: 'prior_assurance_case',
    baseline_packet: 'baseline_packet',
    decision_scenario: 'decision_scenario',
    identity_binding: 'identity_binding',
    cumulative_packet: 'cumulative_packet',
    no_execution_result: 'no_execution_result',
    process_claim: 'process_claim'
  };
  for (const pinned of objects?.toolkit_handoff?.objects || []) {
    const role = handoffRoleMap[pinned.role];
    if (!role) continue;
    if (manifest.objects?.[role]?.semantic_hash !== pinned.content_hash) messages.push(`${role} semantic hash must match exact Toolkit handoff pin`);
    if (pinned.artifact_hash && manifest.objects?.[role]?.artifact_hash !== pinned.artifact_hash) messages.push(`${role} artifact hash must match exact Toolkit handoff pin`);
  }
  const packet = objects?.cumulative_packet || {};
  const revenueCells = (packet.cells || []).filter(cell => cell.input_family === 'operating_revenue_usd');
  const stateCounts = countCellStates(packet.cells || []);
  if ((packet.cells || []).length !== 54) messages.push('cumulative packet must preserve all 54 cells');
  if (stateCounts.populated !== 0 || stateCounts.blocked_source_conflict !== 18 || stateCounts.not_yet_researched !== 36) messages.push('cumulative packet must preserve exactly 0 populated, 18 blocked_source_conflict, and 36 not_yet_researched cells');
  if (revenueCells.length !== 6) messages.push('cumulative packet must preserve six operating-revenue cells');
  for (const cell of revenueCells) {
    if (cell.state !== 'blocked_source_conflict' || cell.approved_value !== null || cell.source_backed !== false || cell.source_backed_zero !== false || cell.imputed !== false) messages.push(`operating-revenue cell must remain blocked and unpopulated: ${cell.product_system_slug}`);
    if (!Array.isArray(cell.conflict_refs) || cell.conflict_refs.length !== 1) messages.push(`operating-revenue cell must preserve one open conflict: ${cell.product_system_slug}`);
  }
  const revenueConflicts = (packet.unresolved_conflict_refs || []).filter(ref => ref.includes(':operating_revenue_usd:'));
  if (revenueConflicts.length !== 6) messages.push('packet must preserve six operating-revenue conflicts');
  if ((packet.unresolved_conflict_refs || []).length !== 11) messages.push('packet must preserve eleven cumulative open conflicts');
  validatePrior(objects?.prior_review_record, objects?.prior_assurance_case, messages);
  validateNoOutputs(objects, messages);
  if (objects?.process_claim?.human_authority_conveyed !== false) messages.push('process claim must not convey human authority');
  if (objects?.no_execution_result?.execution_state !== 'not_executed_packet_ineligible') messages.push('Scale execution must remain blocked');
  return [...new Set(messages)];
}

function validateScalePacketReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = validateScalePacketUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
  const expectedHashes = manifest.review_input_hashes || [];
  const frozen = request?.frozen_inputs || {};
  if (frozen.evidence_bundle_ref !== EVIDENCE_BUNDLE_REF) messages.push('evidence bundle ref must use the truthful deterministic rebuild URI');
  if (frozen.evidence_bundle_hash !== manifest.evidence_bundle_hash) messages.push('evidence bundle hash must match exact upstream lineage');
  if (frozen.identity_binding_hash !== objects?.identity_binding?.binding_sha256) messages.push('identity binding hash must match exact upstream object');
  if (frozen.computations?.[0]?.hash !== objects?.cumulative_packet?.packet_sha256) messages.push('cumulative packet hash must match exact upstream object');
  if (frozen.computations?.[1]?.hash !== objects?.no_execution_result?.result_sha256) messages.push('no-execution result hash must match exact upstream object');
  if (frozen.claim_candidates?.[0]?.claim_hash !== objects?.process_claim?.claim_sha256) messages.push('process claim hash must match exact upstream object');
  if (request?.decision_scenario?.hash !== objects?.decision_scenario?.scenario_sha256) messages.push('decision scenario hash must match exact upstream object');
  const actualHashes = [frozen.evidence_bundle_hash, frozen.identity_binding_hash, ...(frozen.computations || []).map(item => item.hash), ...(frozen.claim_candidates || []).map(item => item.claim_hash), request?.decision_scenario?.hash];
  if (JSON.stringify(actualHashes) !== JSON.stringify(expectedHashes)) messages.push('review input hashes must preserve the complete frozen packet in order');
  const candidate = request?.candidate_review || {};
  if (candidate.overall_disposition !== 'block') messages.push('Scale packet fitness review must remain block');
  if ((candidate.claim_dispositions || []).some(item => item.review_disposition !== 'request_additional_evidence')) messages.push('claim disposition must request additional evidence');
  if ((candidate.posture_assessments || []).some(item => item.effect !== 'unresolved')) messages.push('strategic posture positions must remain unresolved');
  if (!textIncludesAll(candidate, ['six operating-revenue', 'five prior roster/bed', '26 prior material discrepancies', '24 prior reviewer concerns', 'ten prior overturn gates'])) messages.push('review must preserve cumulative blocker counts');
  if (!Array.isArray(candidate.preserved_reviewer_concerns) || candidate.preserved_reviewer_concerns.length < 28) messages.push('review must preserve all 24 prior reviewer concerns and slice concerns');
  const validEvidenceRefs = new Set(manifest.evidence_identifiers || []);
  for (const ref of collectEvidenceRefs(candidate)) if (!validEvidenceRefs.has(ref)) messages.push(`review evidence reference absent from frozen manifest: ${ref}`);
  if (!textIncludesAll(candidate, ['no averaging', 'no adjudication', 'human'])) messages.push('review must preserve disagreement and human-authority boundaries');
  return [...new Set(messages)];
}

function validateScalePacketReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = validateScalePacketUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
  if (!handoff || handoff.schema_version !== 'ushso.scale-input-fitness-review-handoff.v1') return [...messages, 'unexpected Scale packet review handoff schema_version'];
  const body = { ...handoff };
  delete body.handoff_sha256;
  if (handoff.handoff_sha256 !== sha256(body)) messages.push('handoff self-hash does not match canonical content');
  if (handoff.downstream_bead !== 'healthcare-toolkit-2rr9.6.3.2') messages.push('handoff must route to the operating-revenue Toolkit admission bead');
  if (handoff.upstream_manifest_hash !== manifest.manifest_sha256) messages.push('handoff upstream manifest hash must match');
  if (handoff.toolkit_producer_commit !== TOOLKIT_PRODUCER || handoff.data_producer_commit !== DATA_PRODUCER) messages.push('handoff producer commits must match frozen pins');
  if (handoff.toolkit_handoff_file_hash !== TOOLKIT_HANDOFF_FILE_HASH) messages.push('handoff must preserve the frozen Toolkit handoff raw hash');
  if (handoff.evidence_bundle_ref !== EVIDENCE_BUNDLE_REF || canonicalText(handoff.evidence_lineage) !== canonicalText(manifest.evidence_lineage)) messages.push('handoff must preserve exact evidence rebuild and committed-input lineage');
  if (handoff.final_disposition !== 'block' || handoff.route !== 'human_competence_matched_adjudication' || handoff.automatic_resolution !== 'prohibited') messages.push('handoff must remain blocked and human-routed');
  if (handoff.human_authority_conveyed !== false || handoff.adjudication_performed !== false || handoff.positions_averaged !== false) messages.push('handoff cannot fabricate authority, adjudicate, or average reviewers');
  if (JSON.stringify(handoff.prior_counts) !== JSON.stringify(PRIOR_COUNTS)) messages.push('handoff must preserve prior discrepancy, concern, conflict, and overturn-gate counts');
  if (handoff.cumulative_open_conflict_count !== 11 || handoff.operating_revenue_blocked_cell_count !== 6) messages.push('handoff must preserve all cumulative conflicts and six blocked revenue cells');
  if (handoff.review_hashes?.methods !== reviews?.[0]?.output_sha256 || handoff.review_hashes?.finance !== reviews?.[1]?.output_sha256) messages.push('handoff review hashes must match exact specialist outputs');
  if (handoff.first_assessment_hashes?.methods !== reviews?.[0]?.first_assessment_hash || handoff.first_assessment_hashes?.finance !== reviews?.[1]?.first_assessment_hash) messages.push('handoff first-assessment hashes must match exact specialist assessments');
  if (handoff.conflict_output_hash !== conflict?.output_sha256) messages.push('handoff conflict output hash must match');
  const packetCounts = countCellStates(objects?.cumulative_packet?.cells || []);
  const expectedCounts = { total: (objects?.cumulative_packet?.cells || []).length, populated: packetCounts.populated, blocked_source_conflict: packetCounts.blocked_source_conflict, not_yet_researched: packetCounts.not_yet_researched };
  if (JSON.stringify(handoff.cumulative_cell_counts) !== JSON.stringify(expectedCounts)) messages.push('handoff cumulative cell counts must equal the exact upstream packet');
  validateZeroInventory(handoff.output_inventory, 'handoff', messages);
  return [...new Set(messages)];
}

function validateEvidenceLineage(manifest, artifacts, messages) {
  const lineage = manifest?.evidence_lineage || {};
  if (manifest?.evidence_bundle_ref !== EVIDENCE_BUNDLE_REF) messages.push('manifest evidence bundle ref must use the exact deterministic rebuild URI');
  if (manifest?.evidence_bundle_hash !== EVIDENCE_BUNDLE_SEMANTIC_HASH) messages.push('manifest evidence bundle semantic hash drift');
  if (lineage.committed_input_ref !== COMMITTED_INPUT_REF) messages.push('committed evidence input Git path drift');
  for (const [field, expected] of Object.entries(EVIDENCE_ARTIFACT_REFS)) if (lineage[field] !== expected) messages.push(`${field} must resolve to the exact packaged evidence artifact`);
  if (lineage.normalized_input_raw_hash !== NORMALIZED_INPUT_RAW_HASH) messages.push('normalized evidence input hash drift');
  if (lineage.producer_bound_input_raw_hash !== PRODUCER_BOUND_INPUT_RAW_HASH) messages.push('producer-bound evidence input hash drift');
  if (lineage.bundle_raw_hash !== EVIDENCE_BUNDLE_RAW_HASH) messages.push('evidence bundle raw hash drift');
  if (lineage.bundle_semantic_hash !== EVIDENCE_BUNDLE_SEMANTIC_HASH) messages.push('evidence bundle lineage semantic hash drift');
  const normalized = artifacts.normalized_input;
  const bound = artifacts.producer_bound_input;
  const bundle = artifacts.public_evidence_bundle;
  if (!normalized || !bound || !bundle) {
    messages.push('exact normalized, producer-bound, and bundle evidence artifacts are required');
    return;
  }
  if (normalized.raw_hash !== NORMALIZED_INPUT_RAW_HASH) messages.push('normalized evidence input exact bytes drift');
  if (bound.raw_hash !== PRODUCER_BOUND_INPUT_RAW_HASH) messages.push('producer-bound evidence input exact bytes drift');
  if (bundle.raw_hash !== EVIDENCE_BUNDLE_RAW_HASH) messages.push('public evidence bundle exact bytes drift');
  if (normalized.value?.producer?.commit !== '0'.repeat(40)) messages.push('normalized evidence input must retain the zero producer placeholder');
  const expectedBound = clone(normalized.value);
  if (!expectedBound.producer || typeof expectedBound.producer !== 'object') {
    messages.push('normalized evidence input producer is malformed');
    return;
  }
  expectedBound.producer.commit = DATA_PRODUCER;
  if (canonicalText(expectedBound) !== canonicalText(bound.value)) messages.push('producer-bound evidence input must differ only by exact producer-commit substitution');
  if (rawSha256(stablePrettyJson(expectedBound)) !== PRODUCER_BOUND_INPUT_RAW_HASH) messages.push('normalized-to-producer-bound deterministic rebuild hash mismatch');
  if (bound.value?.producer?.commit !== DATA_PRODUCER) messages.push('producer-bound evidence input commit drift');
  const bundleBody = clone(bundle.value);
  const bundleSemantic = bundleBody.bundle_sha256;
  delete bundleBody.bundle_sha256;
  if (bundleSemantic !== EVIDENCE_BUNDLE_SEMANTIC_HASH || sha256(bundleBody) !== EVIDENCE_BUNDLE_SEMANTIC_HASH) messages.push('public evidence bundle semantic self-hash drift');
  if (bundleBody.schema_version !== 'ushso.public-evidence-bundle.v1') messages.push('public evidence bundle schema drift');
  delete bundleBody.schema_version;
  if (canonicalText(bundleBody) !== canonicalText(bound.value)) messages.push('public evidence bundle must be derived from the exact producer-bound input');
}

function validatePrior(record, assurance, messages) {
  if ((record?.discrepancies || []).length !== PRIOR_COUNTS.discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.open_conflicts) messages.push('prior record must preserve five open roster/bed conflicts');
  if ((record?.concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.discrepancies || []).some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('prior discrepancies must remain material and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.open_conflicts) messages.push('prior assurance must preserve five open roster/bed conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function validateNoOutputs(objects, messages) {
  validateZeroInventory(objects?.cumulative_packet?.output_inventory, 'cumulative packet', messages);
  validateZeroInventory(objects?.no_execution_result?.output_inventory, 'no-execution result', messages);
  for (const field of ['component_scores', 'intermediate_values', 'outputs', 'sensitivity_results']) if ((objects?.no_execution_result?.[field] || []).length) messages.push(`no-execution result ${field} must remain empty`);
}

function validateZeroInventory(inventory, label, messages) {
  if (!inventory || ZERO_OUTPUT_KEYS.some(key => inventory[key] !== 0)) messages.push(`${label} must inventory zero calculation, sensitivity, projection, recommendation, adjudication, promotion, and deployment outputs`);
}

function semanticHash(value) {
  const hashKey = Object.keys(value || {}).find(key => key.endsWith('_sha256'));
  if (!hashKey) return null;
  const body = { ...value };
  delete body[hashKey];
  return sha256(body);
}

function textIncludesAll(value, terms) {
  const text = JSON.stringify(value || {}).toLowerCase();
  return terms.every(term => text.includes(term.toLowerCase()));
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

function countCellStates(cells) {
  const counts = { populated: 0, blocked_source_conflict: 0, not_yet_researched: 0 };
  for (const cell of cells) if (Object.prototype.hasOwnProperty.call(counts, cell.state)) counts[cell.state] += 1;
  return counts;
}

function stablePrettyJson(value) {
  return JSON.stringify(sortObject(value), null, 2) + '\n';
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
  return value;
}

function canonicalText(value) {
  return JSON.stringify(sortObject(value));
}

function rawSha256(value) {
  return 'sha256:' + crypto.createHash('sha256').update(value).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  DATA_PRODUCER,
  COMMITTED_INPUT_REF,
  EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF,
  EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH,
  PRIOR_COUNTS,
  PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_PRODUCER,
  ZERO_OUTPUT_KEYS,
  semanticHash,
  stablePrettyJson,
  validateScalePacketReviewHandoff,
  validateScalePacketReviewRequest,
  validateScalePacketUpstream
};
