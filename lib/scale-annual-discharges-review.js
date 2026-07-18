const crypto = require('crypto');

const { analyzeReviewConflicts, validateConflictAnalysis } = require('./conflict-analysis');
const { sha256 } = require('./review-protocols');
const { evaluateStrategicReview, validateStrategicReview } = require('./strategic-review');
const {
  ANNUAL_DISCHARGES_CANONICAL_CONTEXT,
  deriveAnnualDischargesCanonical
} = require('./scale-annual-discharges-canonical');
const {
  ACQUISITION_RAW_HASH, ACQUISITION_REF, ACQUISITION_SEMANTIC_HASH,
  COMMITTED_INPUT_REF, DATA_FEATURE, DATA_PRODUCER, DATA_TRACKER,
  EVIDENCE_BUNDLE_RAW_HASH, EVIDENCE_BUNDLE_REF, EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH, PRIOR_COUNTS, PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_FEATURE, TOOLKIT_HANDOFF_FILE_HASH, TOOLKIT_PRODUCER, TOOLKIT_TRACKER
} = ANNUAL_DISCHARGES_CANONICAL_CONTEXT.constants;
const OBJECT_ARTIFACT_REFS = ANNUAL_DISCHARGES_CANONICAL_CONTEXT.objectArtifactRefs;
const EVIDENCE_ARTIFACT_REFS = Object.freeze({
  normalized_input_artifact_ref: `upstream/${ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths.normalized_input}`,
  producer_bound_input_artifact_ref: `upstream/${ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths.producer_bound_input}`,
  bundle_artifact_ref: `upstream/${ANNUAL_DISCHARGES_CANONICAL_CONTEXT.evidencePaths.public_evidence_bundle}`
});
const ZERO_OUTPUT_KEYS = Object.freeze([
  'adjudications', 'component_scores', 'deployments', 'formula_executions', 'projections',
  'promotion_attempts', 'recommendations', 'scale_scores', 'sensitivity_runs'
]);
const PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment'
]);
const HANDOFF_KEYS = Object.freeze([
  'active_family', 'adjudication_performed', 'annual_discharges_blocked_cell_count',
  'annual_discharges_open_conflict_count', 'annual_discharges_open_conflict_refs',
  'automatic_resolution', 'conflict_output_hash', 'cumulative_cell_counts',
  'cumulative_open_conflict_count', 'data_producer_commit', 'downstream_bead',
  'evidence_bundle_ref', 'evidence_lineage', 'final_disposition',
  'first_assessment_hashes', 'handoff_sha256', 'human_authority_conveyed',
  'output_inventory', 'positions_averaged', 'prior_counts', 'prohibited_uses',
  'review_hashes', 'route', 'schema_version', 'toolkit_handoff_file_hash',
  'toolkit_producer_commit', 'upstream_manifest_hash'
]);
function validateAnnualDischargesUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
  const messages = [];
  if (!manifest || manifest.schema_version !== 'ushso.scale-input-fitness-upstream-manifest.v1') return ['unexpected Scale packet upstream manifest schema_version'];
  const canonical = tryDeriveCanonical(objects, artifactHashes, messages);
  if (canonical && canonicalText(manifest) !== canonicalText(canonical.upstreamManifest)) messages.push('upstream manifest must exactly equal canonical derivation from immutable objects and constants');
  const body = { ...manifest };
  delete body.manifest_sha256;
  if (manifest.manifest_sha256 !== sha256(body)) messages.push('upstream manifest self-hash does not match canonical content');
  if (manifest.active_family !== 'annual_discharges') messages.push('active family must remain annual_discharges');
  if (manifest.producer_pins?.healthcare_toolkit !== TOOLKIT_PRODUCER) messages.push('Toolkit producer pin drift');
  if (manifest.producer_pins?.healthcare_data_mcp !== DATA_PRODUCER) messages.push('Data MCP producer pin drift');
  const provenance = manifest.producer_provenance || {};
  if (provenance.toolkit_feature !== TOOLKIT_FEATURE || provenance.toolkit_tracker !== TOOLKIT_TRACKER) messages.push('Toolkit feature/tracker provenance drift');
  if (provenance.data_feature !== DATA_FEATURE || provenance.data_tracker !== DATA_TRACKER) messages.push('Data feature/tracker provenance drift');
  if (manifest.toolkit_handoff_file_hash !== TOOLKIT_HANDOFF_FILE_HASH) messages.push('Toolkit handoff file hash drift');
  if (artifactHashes.toolkit_handoff !== TOOLKIT_HANDOFF_FILE_HASH) messages.push('Toolkit handoff exact bytes must match the frozen raw hash');
  validateEvidenceLineage(manifest, evidenceArtifacts, messages);
  const required = ['prior_cumulative_packet', 'cumulative_packet', 'decision_scenario', 'identity_binding', 'no_execution_result', 'process_claim', 'prior_review_record', 'prior_assurance_case', 'toolkit_handoff'];
  for (const role of required) {
    const entry = manifest.objects?.[role];
    if (!entry || !objects?.[role]) {
      messages.push(`missing exact upstream object: ${role}`);
      continue;
    }
    const expectedEntry = { artifact_ref: OBJECT_ARTIFACT_REFS[role], artifact_hash: artifactHashes[role] };
    const expectedSemantic = semanticHash(objects[role]);
    if (expectedSemantic) expectedEntry.semantic_hash = expectedSemantic;
    if (canonicalText(entry) !== canonicalText(expectedEntry)) messages.push(`${role} object manifest entry must preserve the exact artifact locator and hashes`);
    if (entry.semantic_hash && semanticHash(objects[role]) !== entry.semantic_hash) messages.push(`${role} semantic hash drift`);
    if (entry.artifact_hash && artifactHashes[role] !== entry.artifact_hash) messages.push(`${role} exact artifact bytes drift`);
  }
  const handoffRoleMap = {
    prior_cumulative_packet: 'prior_cumulative_packet',
    prior_cumulative_review_record: 'prior_review_record',
    prior_cumulative_module_assurance_case: 'prior_assurance_case',
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
  if (objects?.toolkit_handoff?.producer_pins?.toolkit_runtime !== '0'.repeat(40)) messages.push('checked-in Toolkit handoff must preserve the normalized zero runtime placeholder');
  if (objects?.toolkit_handoff?.downstream_bead !== 'beads-aw6') messages.push('Toolkit handoff must route to beads-aw6');
  const packet = objects?.cumulative_packet || {};
  const annualCells = (packet.cells || []).filter(cell => cell.input_family === 'annual_discharges');
  const stateCounts = countCellStates(packet.cells || []);
  if ((packet.cells || []).length !== 54) messages.push('cumulative packet must preserve all 54 cells');
  if (stateCounts.populated !== 0 || stateCounts.blocked_source_conflict !== 24 || stateCounts.not_yet_researched !== 30) messages.push('cumulative packet must preserve exactly 0 populated, 24 blocked_source_conflict, and 30 not_yet_researched cells');
  if (annualCells.length !== 6) messages.push('cumulative packet must preserve six annual-discharges cells');
  for (const cell of annualCells) {
    if (cell.state !== 'blocked_source_conflict' || cell.approved_value !== null || cell.source_backed !== false || cell.source_backed_zero !== false || cell.imputed !== false) messages.push(`annual-discharges cell must remain blocked and unapproved: ${cell.product_system_slug}`);
    if (!Array.isArray(cell.conflict_refs) || cell.conflict_refs.length !== 1) messages.push(`annual-discharges cell must preserve one open conflict: ${cell.product_system_slug}`);
  }
  const annualConflicts = (packet.unresolved_conflict_refs || []).filter(ref => ref.includes(':annual-discharges:'));
  if (annualConflicts.length !== 6) messages.push('packet must preserve six annual-discharges conflicts');
  if ((packet.unresolved_conflict_refs || []).length !== 17) messages.push('packet must preserve seventeen cumulative open conflicts');
  const gates = packet.comparability_gates || [];
  if (gates.length !== 10 || gates.some(gate => gate.status === 'passed')) messages.push('all ten comparability gates must remain unresolved');
  if (gates.find(gate => gate.dimension === 'utilization_denominator')?.status !== 'blocked') messages.push('utilization denominator gate must remain blocked');
  validatePrior(objects?.prior_review_record, objects?.prior_assurance_case, messages);
  validateNoOutputs(objects, messages);
  if (objects?.process_claim?.human_authority_conveyed !== false) messages.push('process claim must not convey human authority');
  if (objects?.no_execution_result?.execution_state !== 'not_executed_packet_ineligible') messages.push('Scale execution must remain blocked');
  return [...new Set(messages)];
}

function validateAnnualDischargesReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = validateAnnualDischargesUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
  const canonical = tryDeriveCanonical(objects, artifactHashes, messages);
  if (canonical) {
    const expectedRequest = request?.protocol?.protocol_id === 'cso.operations-access-capacity.v1'
      ? canonical.operationsRequest : canonical.methodsRequest;
    if (canonicalText(request) !== canonicalText(expectedRequest)) messages.push('review request must exactly equal the canonical family and specialist derivation');
  }
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
  if (!textIncludesAll(candidate, ['six annual-discharges', '17 cumulative', '26 prior material discrepancies', '24 prior reviewer concerns', 'ten prior overturn gates', '56 revenue-review concerns'])) messages.push('review must preserve cumulative blocker counts');
  if (canonicalText(candidate.preserved_reviewer_concerns) !== canonicalText(expectedAnnualConcerns(objects))) messages.push('review must preserve the exact ordered prior and annual-slice concern lineage');
  const validEvidenceRefs = new Set(manifest.evidence_identifiers || []);
  for (const ref of collectEvidenceRefs(candidate)) if (!validEvidenceRefs.has(ref)) messages.push(`review evidence reference absent from frozen manifest: ${ref}`);
  if (!textIncludesAll(candidate, ['no averaging', 'no adjudication', 'human'])) messages.push('review must preserve disagreement and human-authority boundaries');
  return [...new Set(messages)];
}

function validateAnnualDischargesReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
  const messages = validateAnnualDischargesUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
  const canonical = tryDeriveCanonical(objects, artifactHashes, messages);
  const expectedReviews = canonical ? [
    evaluateStrategicReview(canonical.methodsRequest),
    evaluateStrategicReview(canonical.operationsRequest)
  ] : null;
  if (!handoff || handoff.schema_version !== 'ushso.scale-input-fitness-review-handoff.v1') return [...messages, 'unexpected Scale packet review handoff schema_version'];
  if (canonicalText(Object.keys(handoff).sort()) !== canonicalText([...HANDOFF_KEYS].sort())) messages.push('handoff must contain exactly the closed review-handoff field set');
  if (handoff.active_family !== 'annual_discharges') messages.push('handoff active_family must remain annual_discharges');
  const body = { ...handoff };
  delete body.handoff_sha256;
  if (handoff.handoff_sha256 !== sha256(body)) messages.push('handoff self-hash does not match canonical content');
  if (handoff.downstream_bead !== 'healthcare-toolkit-2rr9.6.3.4') messages.push('handoff must route to the annual-discharges Toolkit admission bead');
  if (handoff.upstream_manifest_hash !== manifest.manifest_sha256) messages.push('handoff upstream manifest hash must match');
  if (handoff.toolkit_producer_commit !== TOOLKIT_PRODUCER || handoff.data_producer_commit !== DATA_PRODUCER) messages.push('handoff producer commits must match frozen pins');
  if (handoff.toolkit_handoff_file_hash !== TOOLKIT_HANDOFF_FILE_HASH) messages.push('handoff must preserve the frozen Toolkit handoff raw hash');
  if (handoff.evidence_bundle_ref !== EVIDENCE_BUNDLE_REF || canonicalText(handoff.evidence_lineage) !== canonicalText(manifest.evidence_lineage)) messages.push('handoff must preserve exact evidence rebuild and committed-input lineage');
  if (handoff.final_disposition !== 'block' || handoff.route !== 'human_competence_matched_adjudication' || handoff.automatic_resolution !== 'prohibited') messages.push('handoff must remain blocked and human-routed');
  if (handoff.human_authority_conveyed !== false || handoff.adjudication_performed !== false || handoff.positions_averaged !== false) messages.push('handoff cannot fabricate authority, adjudicate, or average reviewers');
  if (canonicalText(handoff.prohibited_uses) !== canonicalText(PROHIBITED_USES)) messages.push('handoff must preserve the exact ordered prohibited-use set');
  if (!Array.isArray(reviews) || reviews.length !== 2) messages.push('handoff requires exactly two specialist review artifacts');
  for (const review of reviews || []) {
    messages.push(...validateStrategicReview(review));
  }
  if (expectedReviews && canonicalText(reviews) !== canonicalText(expectedReviews)) messages.push('specialist reviews must exactly equal canonical evaluation of both immutable review requests');
  messages.push(...validateConflictAnalysis(conflict));
  const methods = reviews?.[0];
  const operations = reviews?.[1];
  if (methods?.protocol?.protocol_id !== 'cso.evidence-methods-measurement.v1' || methods?.reviewer?.agent_slug !== 'healthit-clinical-data-analyst') messages.push('first specialist artifact must be the exact evidence/methods review role');
  if (operations?.protocol?.protocol_id !== 'cso.operations-access-capacity.v1' || operations?.reviewer?.agent_slug !== 'operations-hospital-administrator') messages.push('second specialist artifact must be the exact utilization-operations review role');
  const expectedReviewRefs = (reviews || []).map(review => ({ review_id: review.review_id, output_sha256: review.output_sha256 }));
  if (canonicalText(conflict?.review_refs) !== canonicalText(expectedReviewRefs)) messages.push('conflict review_refs must mutually link the exact specialist review IDs and hashes');
  if (reviews?.length === 2 && conflict?.request_id && conflict?.review_tier) {
    try {
      const expectedConflict = analyzeReviewConflicts({
        schema_version: 'ushso.ai-conflict-analysis-request.v1',
        request_id: conflict.request_id,
        review_tier: conflict.review_tier,
        reviews
      });
      if (canonicalText(conflict) !== canonicalText(expectedConflict)) messages.push('conflict artifact must exactly equal deterministic recomputation from both linked reviews');
    } catch (error) {
      messages.push(`conflict deterministic recomputation rejected linked reviews: ${error.message}`);
    }
  }
  if (JSON.stringify(handoff.prior_counts) !== JSON.stringify(PRIOR_COUNTS)) messages.push('handoff must preserve prior discrepancy, concern, conflict, and overturn-gate counts');
  const annualConflictRefs = (objects?.cumulative_packet?.unresolved_conflict_refs || []).filter(ref => ref.includes(':annual-discharges:'));
  if (handoff.cumulative_open_conflict_count !== 17 || handoff.annual_discharges_blocked_cell_count !== 6 || handoff.annual_discharges_open_conflict_count !== 6) messages.push('handoff must preserve all cumulative conflicts and six blocked annual-discharges cells');
  if (canonicalText(handoff.annual_discharges_open_conflict_refs) !== canonicalText(annualConflictRefs)) messages.push('handoff must preserve the exact six annual-discharges conflict refs');
  const expectedReviewHashes = { methods: reviews?.[0]?.output_sha256, utilization_operations: reviews?.[1]?.output_sha256 };
  const expectedAssessmentHashes = { methods: reviews?.[0]?.first_assessment_hash, utilization_operations: reviews?.[1]?.first_assessment_hash };
  if (canonicalText(handoff.review_hashes) !== canonicalText(expectedReviewHashes)) messages.push('handoff review hashes must exactly match the two specialist outputs');
  if (canonicalText(handoff.first_assessment_hashes) !== canonicalText(expectedAssessmentHashes)) messages.push('handoff first-assessment hashes must exactly match the two specialist assessments');
  if (handoff.conflict_output_hash !== conflict?.output_sha256) messages.push('handoff conflict output hash must match');
  const packetCounts = countCellStates(objects?.cumulative_packet?.cells || []);
  const expectedCounts = { total: (objects?.cumulative_packet?.cells || []).length, populated: packetCounts.populated, blocked_source_conflict: packetCounts.blocked_source_conflict, not_yet_researched: packetCounts.not_yet_researched };
  if (JSON.stringify(handoff.cumulative_cell_counts) !== JSON.stringify(expectedCounts)) messages.push('handoff cumulative cell counts must equal the exact upstream packet');
  validateZeroInventory(handoff.output_inventory, 'handoff', messages);
  if (canonicalText(handoff.output_inventory) !== canonicalText(Object.fromEntries(ZERO_OUTPUT_KEYS.map(key => [key, 0])))) messages.push('handoff must preserve the exact closed zero-output inventory');
  return [...new Set(messages)];
}

function validateEvidenceLineage(manifest, artifacts, messages) {
  const lineage = manifest?.evidence_lineage || {};
  if (manifest?.evidence_bundle_ref !== EVIDENCE_BUNDLE_REF) messages.push('manifest evidence bundle ref must use the exact deterministic rebuild URI');
  if (manifest?.evidence_bundle_hash !== EVIDENCE_BUNDLE_SEMANTIC_HASH) messages.push('manifest evidence bundle semantic hash drift');
  if (lineage.committed_input_ref !== COMMITTED_INPUT_REF) messages.push('committed evidence input Git path drift');
  if (lineage.acquisition_ref !== ACQUISITION_REF) messages.push('committed acquisition Git path drift');
  if (lineage.acquisition_raw_hash !== ACQUISITION_RAW_HASH) messages.push('acquisition raw hash drift');
  if (lineage.acquisition_semantic_hash !== ACQUISITION_SEMANTIC_HASH) messages.push('acquisition semantic hash drift');
  for (const [field, expected] of Object.entries(EVIDENCE_ARTIFACT_REFS)) if (lineage[field] !== expected) messages.push(`${field} must resolve to the exact packaged evidence artifact`);
  if (lineage.normalized_input_raw_hash !== NORMALIZED_INPUT_RAW_HASH) messages.push('normalized evidence input hash drift');
  if (lineage.producer_bound_input_raw_hash !== PRODUCER_BOUND_INPUT_RAW_HASH) messages.push('producer-bound evidence input hash drift');
  if (lineage.bundle_raw_hash !== EVIDENCE_BUNDLE_RAW_HASH) messages.push('evidence bundle raw hash drift');
  if (lineage.bundle_semantic_hash !== EVIDENCE_BUNDLE_SEMANTIC_HASH) messages.push('evidence bundle lineage semantic hash drift');
  const acquisition = artifacts.acquisition;
  const normalized = artifacts.normalized_input;
  const bound = artifacts.producer_bound_input;
  const bundle = artifacts.public_evidence_bundle;
  if (!acquisition || !normalized || !bound || !bundle) {
    messages.push('exact acquisition, normalized, producer-bound, and bundle evidence artifacts are required');
    return;
  }
  if (acquisition.raw_hash !== ACQUISITION_RAW_HASH) messages.push('acquisition exact bytes drift');
  if (semanticHash(acquisition.value) !== ACQUISITION_SEMANTIC_HASH) messages.push('acquisition semantic self-hash drift');
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
  if ((record?.prior_material_discrepancies || []).length !== PRIOR_COUNTS.material_discrepancies) messages.push('prior record must preserve 26 material discrepancies');
  if ((record?.prior_preserved_concerns || []).length !== PRIOR_COUNTS.reviewer_concerns) messages.push('prior record must preserve 24 reviewer concerns');
  if ((record?.prior_concern_overturns || []).length !== PRIOR_COUNTS.overturn_gates) messages.push('prior record must preserve ten overturn gates');
  if ((record?.current_discrepancies || []).length !== PRIOR_COUNTS.revenue_discrepancies) messages.push('prior record must preserve two revenue-review discrepancies');
  if ((record?.current_preserved_concerns || []).length !== PRIOR_COUNTS.revenue_preserved_concerns) messages.push('prior record must preserve 56 revenue-review concerns');
  if ((record?.open_conflict_refs || []).length !== PRIOR_COUNTS.revenue_open_conflicts) messages.push('prior record must preserve eleven open conflicts');
  if ((record?.current_discrepancies || []).some(item => item.material !== true || item.human_route_required !== true || item.deterministic_resolution !== null)) messages.push('revenue-review discrepancies must remain material and unresolved');
  if ((assurance?.open_conflict_refs || []).length !== PRIOR_COUNTS.revenue_open_conflicts) messages.push('prior assurance must preserve eleven open conflicts');
  if (assurance?.professional_judgment_status !== 'human_required' || assurance?.human_review_route !== 'human_competence_matched_adjudication') messages.push('prior assurance must retain human-required competence-matched review');
}

function expectedAnnualConcerns(objects) {
  return [
    ...(objects?.prior_review_record?.prior_preserved_concerns || []).map(item => item.concern),
    ...(objects?.prior_review_record?.current_preserved_concerns || []).map(item => item.concern),
    'All six annual-discharges cells remain blocked_source_conflict and unpopulated.',
    'Six annual-discharges conflicts remain open in addition to six revenue and five roster/bed conflicts: 17 cumulative.',
    'The 26 prior material discrepancies, 24 prior reviewer concerns, ten prior overturn gates, two revenue-review discrepancies, and 56 revenue-review concerns remain active.',
    'The official sys_dsch technical definition, governed raw HTTP receipt, and source license are not present.',
    'Candidate annual totals cannot establish utilization denominator, throughput, access, occupancy, staffed capacity, demand, or achievable capacity.',
    'No averaging, no adjudication, and no model-generated human authority are permitted.'
  ];
}

function deriveCanonical(objects, artifactHashes) {
  return deriveAnnualDischargesCanonical({ objects, artifactHashes });
}

function tryDeriveCanonical(objects, artifactHashes, messages) {
  try {
    return deriveCanonical(objects, artifactHashes);
  } catch (error) {
    messages.push(`canonical annual-discharges derivation failed closed: ${error.message}`);
    return null;
  }
}

function validateNoOutputs(objects, messages) {
  validateZeroInventory(objects?.cumulative_packet?.output_inventory, 'cumulative packet', messages);
  validateZeroInventory(objects?.no_execution_result?.output_inventory, 'no-execution result', messages);
  validateZeroInventory(objects?.prior_review_record?.output_inventory, 'prior review record', messages);
  validateZeroInventory(objects?.prior_assurance_case?.output_inventory, 'prior assurance case', messages);
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
  ACQUISITION_RAW_HASH,
  ACQUISITION_REF,
  ACQUISITION_SEMANTIC_HASH,
  DATA_FEATURE,
  DATA_PRODUCER,
  DATA_TRACKER,
  COMMITTED_INPUT_REF,
  EVIDENCE_BUNDLE_RAW_HASH,
  EVIDENCE_BUNDLE_REF,
  EVIDENCE_BUNDLE_SEMANTIC_HASH,
  NORMALIZED_INPUT_RAW_HASH,
  PRIOR_COUNTS,
  PROHIBITED_USES,
  PRODUCER_BOUND_INPUT_RAW_HASH,
  TOOLKIT_HANDOFF_FILE_HASH,
  TOOLKIT_FEATURE,
  TOOLKIT_PRODUCER,
  TOOLKIT_TRACKER,
  ZERO_OUTPUT_KEYS,
  semanticHash,
  stablePrettyJson,
  validateAnnualDischargesReviewHandoff,
  validateAnnualDischargesReviewRequest,
  validateAnnualDischargesUpstream
};
