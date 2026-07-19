const crypto = require('crypto');

const { analyzeReviewConflicts, validateConflictAnalysis } = require('./conflict-analysis');
const { findReviewProtocol, sha256 } = require('./review-protocols');
const {
  evaluateStrategicReview,
  validateReviewRequest: validateStrategicReviewRequest,
  validateStrategicReview
} = require('./strategic-review');

const ZERO_OUTPUT_KEYS = Object.freeze([
  'adjudications', 'component_scores', 'deployments', 'formula_executions', 'projections',
  'promotion_attempts', 'recommendations', 'scale_scores', 'sensitivity_runs'
]);
const REQUIRED_PROHIBITED_USES = Object.freeze([
  'calculation', 'scoring', 'ranking', 'sensitivity_analysis', 'projection',
  'adjudication', 'strategic_recommendation', 'promotion', 'deployment'
]);

function createScaleInputFitnessKernel(config) {
  validateKernelConfig(config);
  const expectedZeroInventory = Object.fromEntries(ZERO_OUTPUT_KEYS.map(key => [key, 0]));
  const familyCellState = config.familyCellState;
  const familyCellMessage = config.familyCellMessage;
  const handoffFamilyCellCountField = config.handoffFamilyCellCountField;
  const expectedUnavailableCells = config.expected.unavailableCells || 0;

  function buildObjectEntries(objects, artifactHashes) {
    return buildObjectEntriesForRefs(config.objectArtifactRefs, objects, artifactHashes);
  }

  function validateUpstream(manifest, objects, artifactHashes = {}, evidenceArtifacts = {}) {
    const messages = [];
    if (!manifest || manifest.schema_version !== 'ushso.scale-input-fitness-upstream-manifest.v1') {
      return ['unexpected Scale packet upstream manifest schema_version'];
    }
    if (config.manifestKeys && canonicalText(Object.keys(manifest).sort()) !== canonicalText([...config.manifestKeys].sort())) messages.push('upstream manifest must contain exactly the closed family manifest field set');
    if (config.deriveCanonicalManifest) {
      try {
        const expected = config.deriveCanonicalManifest(objects, artifactHashes);
        if (canonicalText(manifest) !== canonicalText(expected)) messages.push('upstream manifest must exactly equal canonical derivation from immutable objects and constants');
      } catch (error) {
        messages.push(`canonical ${config.familyLabel} derivation failed closed: ${error.message}`);
      }
    }
    const body = { ...manifest };
    delete body.manifest_sha256;
    if (manifest.manifest_sha256 !== sha256(body)) messages.push('upstream manifest self-hash does not match canonical content');
    if (manifest.active_family !== config.activeFamily) messages.push(`active family must remain ${config.activeFamily}`);
    if (manifest.producer_pins?.healthcare_toolkit !== config.toolkitProducer) messages.push('Toolkit producer pin drift');
    if (manifest.producer_pins?.healthcare_data_mcp !== config.dataProducer) messages.push('Data MCP producer pin drift');
    if (manifest.toolkit_handoff_file_hash !== config.toolkitHandoffFileHash) messages.push('Toolkit handoff file hash drift');
    if (artifactHashes.toolkit_handoff !== config.toolkitHandoffFileHash) messages.push('Toolkit handoff exact bytes must match the frozen raw hash');
    if (config.expectedManifestCounts && canonicalText(manifest.expected_counts) !== canonicalText(config.expectedManifestCounts)) messages.push('manifest expected counts must remain the exact family cumulative counts');
    const expectedReviewInputHashes = [
      config.evidence.bundleSemanticHash,
      objects?.identity_binding?.binding_sha256,
      objects?.cumulative_packet?.packet_sha256,
      objects?.no_execution_result?.result_sha256,
      objects?.process_claim?.claim_sha256,
      objects?.decision_scenario?.scenario_sha256
    ];
    if (canonicalText(manifest.review_input_hashes) !== canonicalText(expectedReviewInputHashes)) messages.push('manifest review input hashes must exactly pin the complete immutable packet');
    try {
      if (canonicalText(manifest.evidence_identifiers) !== canonicalText(config.expectedEvidenceIdentifiers(objects, artifactHashes))) messages.push('manifest evidence identifiers must exactly equal the family evidence closure');
    } catch (error) {
      messages.push(`family evidence closure derivation failed closed: ${error.message}`);
    }
    validateEvidenceLineage(manifest, evidenceArtifacts, messages);
    for (const role of Object.keys(config.objectArtifactRefs)) {
      const entry = manifest.objects?.[role];
      if (!entry || !objects?.[role]) {
        messages.push(`missing exact upstream object: ${role}`);
        continue;
      }
      const expectedEntry = { artifact_ref: config.objectArtifactRefs[role], artifact_hash: artifactHashes[role] };
      const expectedSemantic = semanticHash(objects[role]);
      if (expectedSemantic) expectedEntry.semantic_hash = expectedSemantic;
      if (canonicalText(entry) !== canonicalText(expectedEntry)) messages.push(`${role} object manifest entry must preserve the exact artifact locator and hashes`);
      if (entry.semantic_hash && semanticHash(objects[role]) !== entry.semantic_hash) messages.push(`${role} semantic hash drift`);
      if (entry.artifact_hash && artifactHashes[role] !== entry.artifact_hash) messages.push(`${role} exact artifact bytes drift`);
    }
    for (const pinned of objects?.toolkit_handoff?.objects || []) {
      const role = config.handoffRoleMap[pinned.role];
      if (!role) continue;
      if (manifest.objects?.[role]?.semantic_hash !== pinned.content_hash) messages.push(`${role} semantic hash must match exact Toolkit handoff pin`);
      if (pinned.artifact_hash && manifest.objects?.[role]?.artifact_hash !== pinned.artifact_hash) messages.push(`${role} artifact hash must match exact Toolkit handoff pin`);
    }
    const packet = objects?.cumulative_packet || {};
    const familyCells = (packet.cells || []).filter(cell => cell.input_family === config.activeFamily);
    const stateCounts = countCellStates(packet.cells || []);
    if ((packet.cells || []).length !== config.expected.totalCells) messages.push(`cumulative packet must preserve all ${config.expected.totalCells} cells`);
    if (stateCounts.populated !== config.expected.populatedCells || stateCounts.blocked_source_conflict !== config.expected.blockedCells || stateCounts.unavailable_public !== expectedUnavailableCells || stateCounts.not_yet_researched !== config.expected.notResearchedCells) {
      const unavailableClause = Object.hasOwn(config.expected, 'unavailableCells') ? `, ${expectedUnavailableCells} unavailable_public` : '';
      messages.push(`cumulative packet must preserve exactly ${config.expected.populatedCells} populated, ${config.expected.blockedCells} blocked_source_conflict${unavailableClause}, and ${config.expected.notResearchedCells} not_yet_researched cells`);
    }
    if (familyCells.length !== config.expected.familyCells) messages.push(`cumulative packet must preserve ${config.expected.familyCells} ${config.familyLabel} cells`);
    for (const cell of familyCells) {
      if (cell.state !== familyCellState || cell.approved_value !== null || cell.source_backed !== false || cell.source_backed_zero !== false || cell.imputed !== false) messages.push(`${config.familyLabel} cell must remain ${familyCellMessage}: ${cell.product_system_slug}`);
      if (!Array.isArray(cell.conflict_refs) || cell.conflict_refs.length !== 1) messages.push(`${config.familyLabel} cell must preserve one open conflict: ${cell.product_system_slug}`);
    }
    const familyConflicts = (packet.unresolved_conflict_refs || []).filter(ref => ref.includes(config.conflictRefToken));
    if (familyConflicts.length !== config.expected.familyConflicts) messages.push(`packet must preserve ${config.expected.familyConflicts} ${config.familyLabel} conflicts`);
    if ((packet.unresolved_conflict_refs || []).length !== config.expected.cumulativeConflicts) messages.push(`packet must preserve ${config.expected.cumulativeConflictsLabel} cumulative open conflicts`);
    config.validatePrior(objects?.prior_review_record, objects?.prior_assurance_case, messages);
    if (config.validateAdditionalUpstream) config.validateAdditionalUpstream(manifest, objects, evidenceArtifacts, messages);
    validateNoOutputs(objects, messages);
    for (const role of config.zeroInventoryObjectRoles || []) validateZeroInventory(objects?.[role]?.output_inventory, role.replaceAll('_', ' '), messages);
    if (objects?.process_claim?.human_authority_conveyed !== false) messages.push('process claim must not convey human authority');
    if (objects?.no_execution_result?.execution_state !== 'not_executed_packet_ineligible') messages.push('Scale execution must remain blocked');
    return [...new Set(messages)];
  }

  function validateReviewRequest(request, manifest, objects, artifactHashes, evidenceArtifacts) {
    const messages = validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
    messages.push(...validateStrategicReviewRequest(request));
    if (config.requestKeys && canonicalText(Object.keys(request || {}).sort()) !== canonicalText([...config.requestKeys].sort())) messages.push('review request must contain exactly the closed request field set');
    const requestLane = config.reviewerRoles.find(role => role.protocolId === request?.protocol?.protocol_id && role.protocolVersion === request?.protocol?.version);
    if (!requestLane) messages.push('review request protocol must match one exact family specialist lane');
    else {
      if (request?.reviewer?.agent_slug !== requestLane.agentSlug) messages.push('review request reviewer must match the exact family specialist lane');
      if (request?.candidate_review?.competence_role !== requestLane.competenceRole) messages.push('review request competence must match the exact family specialist lane');
    }
    if (config.canonicalRequestHashes) {
      const canonicalRequestHash = config.canonicalRequestHashes[request?.protocol?.protocol_id];
      if (!canonicalRequestHash) messages.push('review request protocol is absent from the frozen canonical request allowlist');
      else if (sha256(request) !== canonicalRequestHash) messages.push('review request must exactly match the frozen canonical specialist request');
    }
    if (config.deriveCanonicalRequest) {
      try {
        const expected = config.deriveCanonicalRequest(request, objects, artifactHashes);
        if (canonicalText(request) !== canonicalText(expected)) messages.push('review request must exactly equal the canonical family and specialist derivation');
      } catch (error) {
        messages.push(`canonical ${config.familyLabel} request derivation failed closed: ${error.message}`);
      }
    }
    const expectedHashes = manifest.review_input_hashes || [];
    const frozen = request?.frozen_inputs || {};
    if (frozen.evidence_bundle_ref !== config.evidence.bundleRef) messages.push('evidence bundle ref must use the truthful deterministic rebuild URI');
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
    if (!textIncludesAll(candidate, config.requestRequiredTerms)) messages.push('review must preserve cumulative blocker counts');
    if (config.expectedConcerns) {
      if (canonicalText(candidate.preserved_reviewer_concerns) !== canonicalText(config.expectedConcerns(objects, request, artifactHashes))) messages.push(config.concernErrorMessage || `review must preserve the exact ordered prior and ${config.concernLineageLabel || config.familyLabel} concern lineage`);
    }
    const validEvidenceRefs = new Set(manifest.evidence_identifiers || []);
    for (const ref of collectEvidenceRefs(candidate)) if (!validEvidenceRefs.has(ref)) messages.push(`review evidence reference absent from frozen manifest: ${ref}`);
    if (!textIncludesAll(candidate, config.boundaryRequiredTerms)) messages.push('review must preserve disagreement and human-authority boundaries');
    return [...new Set(messages)];
  }

  function validateReviewHandoff(handoff, reviews, conflict, manifest, objects, artifactHashes, evidenceArtifacts) {
    const messages = validateUpstream(manifest, objects, artifactHashes, evidenceArtifacts);
    let expectedReviews = null;
    if (config.deriveCanonicalRequests) {
      try {
        expectedReviews = config.deriveCanonicalRequests(objects, artifactHashes).map(evaluateStrategicReview);
      } catch (error) {
        messages.push(`canonical ${config.familyLabel} review derivation failed closed: ${error.message}`);
      }
    }
    if (!handoff || handoff.schema_version !== 'ushso.scale-input-fitness-review-handoff.v1') return [...messages, 'unexpected Scale packet review handoff schema_version'];
    if (config.handoffKeys && canonicalText(Object.keys(handoff).sort()) !== canonicalText([...config.handoffKeys].sort())) messages.push('handoff must contain exactly the closed review-handoff field set');
    if (handoff.active_family !== config.activeFamily) messages.push(`handoff active_family must remain ${config.activeFamily}`);
    const body = { ...handoff };
    delete body.handoff_sha256;
    if (handoff.handoff_sha256 !== sha256(body)) messages.push('handoff self-hash does not match canonical content');
    if (handoff.handoff_sha256 !== config.expectedHandoffHash) messages.push('handoff must preserve the frozen final family handoff hash');
    if (handoff.downstream_bead !== config.downstreamBead) messages.push(`handoff must route to the ${config.familyLabel} Toolkit admission bead`);
    if (handoff.upstream_manifest_hash !== manifest.manifest_sha256) messages.push('handoff upstream manifest hash must match');
    if (handoff.toolkit_producer_commit !== config.toolkitProducer || handoff.data_producer_commit !== config.dataProducer) messages.push('handoff producer commits must match frozen pins');
    if (handoff.toolkit_handoff_file_hash !== config.toolkitHandoffFileHash) messages.push('handoff must preserve the frozen Toolkit handoff raw hash');
    if (handoff.evidence_bundle_ref !== config.evidence.bundleRef || canonicalText(handoff.evidence_lineage) !== canonicalText(manifest.evidence_lineage)) messages.push('handoff must preserve exact evidence rebuild and committed-input lineage');
    if (handoff.final_disposition !== 'block' || handoff.route !== 'human_competence_matched_adjudication' || handoff.automatic_resolution !== 'prohibited') messages.push('handoff must remain blocked and human-routed');
    if (handoff.human_authority_conveyed !== false || handoff.adjudication_performed !== false || handoff.positions_averaged !== false) messages.push('handoff cannot fabricate authority, adjudicate, or average reviewers');
    if (config.prohibitedUses && canonicalText(handoff.prohibited_uses) !== canonicalText(config.prohibitedUses)) messages.push('handoff must preserve the exact ordered prohibited-use set');
    if (!Array.isArray(reviews) || reviews.length !== 2) messages.push('handoff requires exactly two specialist review artifacts');
    for (const review of reviews || []) messages.push(...validateStrategicReview(review));
    if (expectedReviews && canonicalText(reviews) !== canonicalText(expectedReviews)) messages.push('specialist reviews must exactly equal canonical evaluation of both immutable review requests');
    messages.push(...validateConflictAnalysis(conflict));
    if (conflict?.request_id !== config.expectedConflictRequestId) messages.push('conflict request identity must preserve the frozen family request ID');
    if (conflict?.output_sha256 !== config.expectedConflictOutputHash) messages.push('conflict output must preserve the frozen family conflict hash');
    for (const [index, role] of config.reviewerRoles.entries()) {
      if (reviews?.[index]?.protocol?.protocol_id !== role.protocolId || reviews?.[index]?.protocol?.version !== role.protocolVersion || reviews?.[index]?.protocol?.competence_role !== role.competenceRole || reviews?.[index]?.reviewer?.agent_slug !== role.agentSlug) messages.push(`${index === 0 ? 'first' : 'second'} specialist artifact must be the exact ${role.label} review role`);
    }
    const expectedReviewRefs = (reviews || []).map(review => ({ review_id: review.review_id, output_sha256: review.output_sha256 }));
    if (canonicalText(conflict?.review_refs) !== canonicalText(expectedReviewRefs)) messages.push('conflict review_refs must mutually link the exact specialist review IDs and hashes');
    if (reviews?.length === 2 && conflict?.request_id && conflict?.review_tier) {
      try {
        const expectedConflict = analyzeReviewConflicts({ schema_version: 'ushso.ai-conflict-analysis-request.v1', request_id: conflict.request_id, review_tier: conflict.review_tier, reviews });
        if (canonicalText(conflict) !== canonicalText(expectedConflict)) messages.push('conflict artifact must exactly equal deterministic recomputation from both linked reviews');
      } catch (error) {
        messages.push(`conflict deterministic recomputation rejected linked reviews: ${error.message}`);
      }
    }
    if (JSON.stringify(handoff.prior_counts) !== JSON.stringify(config.priorCounts)) messages.push('handoff must preserve prior discrepancy, concern, conflict, and overturn-gate counts');
    const familyConflictRefs = (objects?.cumulative_packet?.unresolved_conflict_refs || []).filter(ref => ref.includes(config.conflictRefToken));
    const familyCellStateLabel = familyCellState === 'blocked_source_conflict' ? 'blocked' : familyCellState;
    if (handoff.cumulative_open_conflict_count !== config.expected.cumulativeConflicts || handoff[handoffFamilyCellCountField] !== config.expected.familyCells || (config.handoffFamilyConflictCountField && handoff[config.handoffFamilyConflictCountField] !== config.expected.familyConflicts)) messages.push(`handoff must preserve all cumulative conflicts and ${config.expected.familyCellsLabel || config.expected.familyCells} ${familyCellStateLabel} ${config.familyLabel} cells`);
    if (config.handoffFamilyConflictRefsField && canonicalText(handoff[config.handoffFamilyConflictRefsField]) !== canonicalText(familyConflictRefs)) messages.push(`handoff must preserve the exact ${config.expected.familyConflictsLabel || config.expected.familyConflicts} ${config.familyLabel} conflict refs`);
    const expectedReviewHashes = Object.fromEntries(config.reviewHashKeys.map((key, index) => [key, reviews?.[index]?.output_sha256]));
    const expectedAssessmentHashes = Object.fromEntries(config.reviewHashKeys.map((key, index) => [key, reviews?.[index]?.first_assessment_hash]));
    if (canonicalText(handoff.review_hashes) !== canonicalText(expectedReviewHashes)) messages.push('handoff review hashes must match exact specialist outputs');
    if (canonicalText(handoff.first_assessment_hashes) !== canonicalText(expectedAssessmentHashes)) messages.push('handoff first-assessment hashes must match exact specialist assessments');
    if (config.expectedReviewHashes && canonicalText(handoff.review_hashes) !== canonicalText(config.expectedReviewHashes)) messages.push('handoff review hashes must preserve the frozen family specialist outputs');
    if (config.expectedAssessmentHashes && canonicalText(handoff.first_assessment_hashes) !== canonicalText(config.expectedAssessmentHashes)) messages.push('handoff first-assessment hashes must preserve the frozen family specialist assessments');
    if (handoff.conflict_output_hash !== conflict?.output_sha256) messages.push('handoff conflict output hash must match');
    const packetCounts = countCellStates(objects?.cumulative_packet?.cells || []);
    const expectedCounts = { total: (objects?.cumulative_packet?.cells || []).length, populated: packetCounts.populated, blocked_source_conflict: packetCounts.blocked_source_conflict };
    if (Object.hasOwn(config.expected, 'unavailableCells')) expectedCounts.unavailable_public = packetCounts.unavailable_public;
    expectedCounts.not_yet_researched = packetCounts.not_yet_researched;
    if (JSON.stringify(handoff.cumulative_cell_counts) !== JSON.stringify(expectedCounts)) messages.push('handoff cumulative cell counts must equal the exact upstream packet');
    validateZeroInventory(handoff.output_inventory, 'handoff', messages);
    if (config.closedOutputInventory && canonicalText(handoff.output_inventory) !== canonicalText(expectedZeroInventory)) messages.push('handoff must preserve the exact closed zero-output inventory');
    return [...new Set(messages)];
  }

  function validateEvidenceLineage(manifest, artifacts, messages) {
    const lineage = manifest?.evidence_lineage || {};
    if (manifest?.evidence_bundle_ref !== config.evidence.bundleRef) messages.push('manifest evidence bundle ref must use the exact deterministic rebuild URI');
    if (manifest?.evidence_bundle_hash !== config.evidence.bundleSemanticHash) messages.push('manifest evidence bundle semantic hash drift');
    if (lineage.committed_input_ref !== config.evidence.committedInputRef) messages.push('committed evidence input Git path drift');
    for (const [field, expected] of Object.entries(config.evidence.artifactRefs)) if (lineage[field] !== expected) messages.push(`${field} must resolve to the exact packaged evidence artifact`);
    if (lineage.normalized_input_raw_hash !== config.evidence.normalizedRawHash) messages.push('normalized evidence input hash drift');
    if (lineage.producer_bound_input_raw_hash !== config.evidence.producerBoundRawHash) messages.push('producer-bound evidence input hash drift');
    if (lineage.bundle_raw_hash !== config.evidence.bundleRawHash) messages.push('evidence bundle raw hash drift');
    if (lineage.bundle_semantic_hash !== config.evidence.bundleSemanticHash) messages.push('evidence bundle lineage semantic hash drift');
    const normalized = artifacts.normalized_input;
    const bound = artifacts.producer_bound_input;
    const bundle = artifacts.public_evidence_bundle;
    if (!normalized || !bound || !bundle) {
      messages.push('exact normalized, producer-bound, and bundle evidence artifacts are required');
      return;
    }
    if (normalized.raw_hash !== config.evidence.normalizedRawHash) messages.push('normalized evidence input exact bytes drift');
    if (bound.raw_hash !== config.evidence.producerBoundRawHash) messages.push('producer-bound evidence input exact bytes drift');
    if (bundle.raw_hash !== config.evidence.bundleRawHash) messages.push('public evidence bundle exact bytes drift');
    if (normalized.value?.producer?.commit !== '0'.repeat(40)) messages.push('normalized evidence input must retain the zero producer placeholder');
    const expectedBound = clone(normalized.value);
    if (!expectedBound.producer || typeof expectedBound.producer !== 'object') {
      messages.push('normalized evidence input producer is malformed');
      return;
    }
    expectedBound.producer.commit = config.dataProducer;
    if (canonicalText(expectedBound) !== canonicalText(bound.value)) messages.push('producer-bound evidence input must differ only by exact producer-commit substitution');
    if (rawSha256(stablePrettyJson(expectedBound)) !== config.evidence.producerBoundRawHash) messages.push('normalized-to-producer-bound deterministic rebuild hash mismatch');
    if (bound.value?.producer?.commit !== config.dataProducer) messages.push('producer-bound evidence input commit drift');
    const bundleBody = clone(bundle.value);
    const bundleSemantic = bundleBody.bundle_sha256;
    delete bundleBody.bundle_sha256;
    if (bundleSemantic !== config.evidence.bundleSemanticHash || sha256(bundleBody) !== config.evidence.bundleSemanticHash) messages.push('public evidence bundle semantic self-hash drift');
    if (bundleBody.schema_version !== 'ushso.public-evidence-bundle.v1') messages.push('public evidence bundle schema drift');
    delete bundleBody.schema_version;
    if (canonicalText(bundleBody) !== canonicalText(bound.value)) messages.push('public evidence bundle must be derived from the exact producer-bound input');
  }

  return { buildObjectEntries, validateReviewHandoff, validateReviewRequest, validateUpstream };
}

function buildObjectEntriesForRefs(objectArtifactRefs, objects, artifactHashes) {
  const entries = {};
  for (const [role, artifactRef] of Object.entries(objectArtifactRefs)) {
    entries[role] = { artifact_ref: artifactRef, artifact_hash: artifactHashes[role] };
    const hash = semanticHash(objects[role]);
    if (hash) entries[role].semantic_hash = hash;
  }
  return entries;
}

function rebuildEvidenceChain(normalizedInput, dataProducer) {
  const producerBoundInput = clone(normalizedInput);
  if (!producerBoundInput.producer || typeof producerBoundInput.producer !== 'object') throw new Error('normalized evidence producer is malformed');
  producerBoundInput.producer.commit = dataProducer;
  const bundleBody = { ...producerBoundInput, schema_version: 'ushso.public-evidence-bundle.v1' };
  return { producerBoundInput, publicEvidenceBundle: { ...bundleBody, bundle_sha256: sha256(bundleBody) } };
}

function validateKernelConfig(config) {
  const errors = [];
  if (!isPlainObject(config)) throw new Error('Scale input-fitness kernel config invalid: config must be an object');
  const allowedKeys = new Set([
    'activeFamily', 'boundaryRequiredTerms', 'canonicalRequestHashes',
    'closedOutputInventory', 'concernErrorMessage', 'concernLineageLabel', 'conflictRefToken',
    'dataProducer', 'deriveCanonicalManifest', 'deriveCanonicalRequest', 'deriveCanonicalRequests',
    'downstreamBead', 'evidence', 'expected', 'expectedAssessmentHashes', 'expectedConcerns',
    'expectedConflictOutputHash', 'expectedConflictRequestId', 'expectedHandoffHash',
    'expectedEvidenceIdentifiers', 'expectedManifestCounts', 'expectedReviewHashes', 'familyCellMessage',
    'familyCellState', 'familyLabel', 'handoffFamilyCellCountField',
    'handoffFamilyConflictCountField', 'handoffFamilyConflictRefsField',
    'handoffKeys', 'handoffRoleMap', 'manifestKeys', 'objectArtifactRefs',
    'priorCounts', 'prohibitedUses', 'requestKeys', 'requestRequiredTerms', 'reviewHashKeys',
    'reviewerRoles', 'toolkitHandoffFileHash', 'toolkitProducer', 'validateAdditionalUpstream',
    'validatePrior', 'zeroInventoryObjectRoles'
  ]);
  for (const key of Object.keys(config)) if (!allowedKeys.has(key)) errors.push(`unknown field ${key}`);
  for (const field of ['activeFamily', 'familyLabel', 'concernLineageLabel', 'conflictRefToken', 'downstreamBead', 'handoffFamilyConflictCountField']) requireConfigText(config[field], field, errors);
  const familyCellState = config.familyCellState;
  if (!['blocked_source_conflict', 'unavailable_public'].includes(familyCellState)) errors.push('familyCellState must be blocked_source_conflict or unavailable_public');
  requireConfigText(config.handoffFamilyCellCountField, 'handoffFamilyCellCountField', errors);
  requireConfigText(config.familyCellMessage, 'familyCellMessage', errors);
  requireConfigCommit(config.toolkitProducer, 'toolkitProducer', errors);
  requireConfigCommit(config.dataProducer, 'dataProducer', errors);
  requireConfigHash(config.toolkitHandoffFileHash, 'toolkitHandoffFileHash', errors);
  requireStringMap(config.objectArtifactRefs, 'objectArtifactRefs', errors);
  requireStringMap(config.handoffRoleMap, 'handoffRoleMap', errors);
  const requiredRoles = ['cumulative_packet', 'decision_scenario', 'identity_binding', 'no_execution_result', 'process_claim', 'prior_review_record', 'prior_assurance_case', 'toolkit_handoff'];
  for (const role of requiredRoles) if (!Object.hasOwn(config.objectArtifactRefs || {}, role)) errors.push(`objectArtifactRefs missing ${role}`);
  for (const role of requiredRoles.slice(0, -1)) if (!Object.values(config.handoffRoleMap || {}).includes(role)) errors.push(`handoffRoleMap missing ${role}`);

  if (!isPlainObject(config.evidence)) errors.push('evidence must be an object');
  else {
    const evidenceKeys = ['artifactRefs', 'bundleRawHash', 'bundleRef', 'bundleSemanticHash', 'committedInputRef', 'normalizedRawHash', 'producerBoundRawHash'];
    rejectConfigUnknown(config.evidence, evidenceKeys, 'evidence', errors);
    for (const field of ['bundleRef', 'committedInputRef']) requireConfigText(config.evidence[field], `evidence.${field}`, errors);
    for (const field of ['bundleRawHash', 'bundleSemanticHash', 'normalizedRawHash', 'producerBoundRawHash']) requireConfigHash(config.evidence[field], `evidence.${field}`, errors);
    requireStringMap(config.evidence.artifactRefs, 'evidence.artifactRefs', errors);
    const artifactRefFields = ['normalized_input_artifact_ref', 'producer_bound_input_artifact_ref', 'bundle_artifact_ref'];
    rejectConfigUnknown(config.evidence.artifactRefs, artifactRefFields, 'evidence.artifactRefs', errors);
    for (const field of artifactRefFields) if (!Object.hasOwn(config.evidence.artifactRefs || {}, field)) errors.push(`evidence.artifactRefs missing ${field}`);
  }

  const expectedNumberFields = ['totalCells', 'populatedCells', 'blockedCells', 'notResearchedCells', 'familyCells', 'familyConflicts', 'cumulativeConflicts'];
  const expectedLabelFields = ['familyCellsLabel', 'familyConflictsLabel', 'cumulativeConflictsLabel'];
  requireCountObject(config.expected, 'expected', expectedNumberFields, expectedLabelFields, errors, ['unavailableCells']);
  if (isPlainObject(config.expected)) {
    const unavailableCells = config.expected.unavailableCells || 0;
    if (config.expected.totalCells !== config.expected.populatedCells + config.expected.blockedCells + unavailableCells + config.expected.notResearchedCells) errors.push('expected cell-state counts must sum to totalCells');
    const familyStateCount = familyCellState === 'unavailable_public' ? unavailableCells : config.expected.blockedCells;
    if (config.expected.familyCells > familyStateCount) errors.push(`expected familyCells cannot exceed ${familyCellState}`);
    if (config.expected.familyConflicts > config.expected.cumulativeConflicts) errors.push('expected familyConflicts cannot exceed cumulativeConflicts');
  }
  requireCountObject(config.priorCounts, 'priorCounts', null, [], errors);
  requireCountObject(config.expectedManifestCounts, 'expectedManifestCounts', null, [], errors);
  if (isPlainObject(config.expected) && isPlainObject(config.expectedManifestCounts)) {
    const countMappings = {
      totalCells: 'total_cells', populatedCells: 'populated_cells', blockedCells: 'blocked_cells',
      notResearchedCells: 'not_yet_researched_cells', cumulativeConflicts: 'cumulative_open_conflicts'
    };
    for (const [expectedKey, manifestKey] of Object.entries(countMappings)) if (config.expectedManifestCounts[manifestKey] !== config.expected[expectedKey]) errors.push(`expectedManifestCounts.${manifestKey} must match expected.${expectedKey}`);
    if (Object.hasOwn(config.expected, 'unavailableCells') && config.expectedManifestCounts.unavailable_public_cells !== config.expected.unavailableCells) errors.push('expectedManifestCounts.unavailable_public_cells must match expected.unavailableCells');
  }
  if (isPlainObject(config.priorCounts) && isPlainObject(config.expectedManifestCounts)) for (const [key, value] of Object.entries(config.priorCounts)) if (config.expectedManifestCounts[key] !== value) errors.push(`expectedManifestCounts.${key} must match priorCounts.${key}`);
  if (typeof config.validatePrior !== 'function') errors.push('validatePrior must be a function');
  if (typeof config.expectedConcerns !== 'function') errors.push('expectedConcerns must be a function');
  if (typeof config.expectedEvidenceIdentifiers !== 'function') errors.push('expectedEvidenceIdentifiers must be a function');
  for (const field of ['validateAdditionalUpstream', 'deriveCanonicalManifest', 'deriveCanonicalRequest', 'deriveCanonicalRequests']) if (config[field] !== undefined && typeof config[field] !== 'function') errors.push(`${field} must be a function`);
  if (typeof config.validateAdditionalUpstream !== 'function') errors.push('validateAdditionalUpstream must be a function');
  if ((config.deriveCanonicalRequest && !config.deriveCanonicalRequests) || (!config.deriveCanonicalRequest && config.deriveCanonicalRequests)) errors.push('canonical request derivation requires both deriveCanonicalRequest and deriveCanonicalRequests');

  for (const field of ['manifestKeys', 'requestKeys', 'handoffKeys', 'requestRequiredTerms', 'boundaryRequiredTerms', 'prohibitedUses']) requireStringArrayConfig(config[field], field, errors);
  requireArrayMembers(config.manifestKeys, ['schema_version', 'active_family', 'producer_pins', 'objects', 'review_input_hashes', 'evidence_lineage', 'manifest_sha256'], 'manifestKeys', errors);
  requireArrayMembers(config.requestKeys, ['schema_version', 'protocol', 'reviewer', 'frozen_inputs', 'decision_scenario', 'candidate_review'], 'requestKeys', errors);
  requireArrayMembers(config.handoffKeys, ['schema_version', 'active_family', 'review_hashes', 'first_assessment_hashes', 'conflict_output_hash', 'output_inventory', 'handoff_sha256'], 'handoffKeys', errors);
  requireArrayMembers(config.boundaryRequiredTerms, ['no averaging', 'no adjudication', 'human'], 'boundaryRequiredTerms', errors);
  requireArrayMembers(config.prohibitedUses, REQUIRED_PROHIBITED_USES, 'prohibitedUses', errors);
  if (config.closedOutputInventory !== true) errors.push('closedOutputInventory must be true');
  requireStringArrayConfig(config.zeroInventoryObjectRoles, 'zeroInventoryObjectRoles', errors, true);
  if (!Object.hasOwn(config, 'handoffFamilyConflictRefsField') || (config.handoffFamilyConflictRefsField !== null && (typeof config.handoffFamilyConflictRefsField !== 'string' || !config.handoffFamilyConflictRefsField))) errors.push('handoffFamilyConflictRefsField must be an explicit string or null');
  requireConfigText(config.concernErrorMessage, 'concernErrorMessage', errors);

  if (!Array.isArray(config.reviewHashKeys) || config.reviewHashKeys.length !== 2 || new Set(config.reviewHashKeys).size !== 2 || config.reviewHashKeys.some(value => typeof value !== 'string' || !value)) errors.push('reviewHashKeys must contain exactly two unique names');
  if (!Array.isArray(config.reviewerRoles) || config.reviewerRoles.length !== 2) errors.push('reviewerRoles must contain exactly two lanes');
  else {
    const protocols = new Set();
    const agents = new Set();
    for (const [index, role] of config.reviewerRoles.entries()) {
      if (!isPlainObject(role)) {
        errors.push(`reviewerRoles[${index}] must be an object`);
        continue;
      }
      rejectConfigUnknown(role, ['agentSlug', 'competenceRole', 'label', 'protocolId', 'protocolVersion'], `reviewerRoles[${index}]`, errors);
      for (const field of ['agentSlug', 'competenceRole', 'label', 'protocolId', 'protocolVersion']) requireConfigText(role[field], `reviewerRoles[${index}].${field}`, errors);
      const protocol = findReviewProtocol(role.protocolId, role.protocolVersion);
      if (!protocol) errors.push(`reviewerRoles[${index}] protocol must be active`);
      else {
        if (!protocol.candidate_agent_slugs.includes(role.agentSlug)) errors.push(`reviewerRoles[${index}] agent is not routed by protocol`);
        if (protocol.competence_role !== role.competenceRole) errors.push(`reviewerRoles[${index}] competence does not match protocol`);
      }
      if (protocols.has(role.protocolId)) errors.push('reviewerRoles protocol IDs must be unique');
      if (agents.has(role.agentSlug)) errors.push('reviewerRoles agent slugs must be unique');
      protocols.add(role.protocolId);
      agents.add(role.agentSlug);
    }
  }
  requireHashMap(config.canonicalRequestHashes, 'canonicalRequestHashes', config.reviewerRoles?.map(role => role.protocolId), errors);
  requireHashMap(config.expectedReviewHashes, 'expectedReviewHashes', config.reviewHashKeys, errors);
  requireHashMap(config.expectedAssessmentHashes, 'expectedAssessmentHashes', config.reviewHashKeys, errors);
  requireConfigText(config.expectedConflictRequestId, 'expectedConflictRequestId', errors);
  requireConfigHash(config.expectedConflictOutputHash, 'expectedConflictOutputHash', errors);
  requireConfigHash(config.expectedHandoffHash, 'expectedHandoffHash', errors);
  if (errors.length) throw new Error(`Scale input-fitness kernel config invalid: ${[...new Set(errors)].join('; ')}`);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function rejectConfigUnknown(value, allowed, label, errors) {
  for (const key of Object.keys(value || {})) if (!allowed.includes(key)) errors.push(`${label} has unknown field ${key}`);
}

function requireConfigText(value, label, errors) {
  if (typeof value !== 'string' || !value) errors.push(`${label} must be a non-empty string`);
}

function requireConfigCommit(value, label, errors) {
  if (typeof value !== 'string' || !/^[0-9a-f]{40}$/.test(value)) errors.push(`${label} must be a full git commit`);
}

function requireConfigHash(value, label, errors) {
  if (typeof value !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(value)) errors.push(`${label} must be a sha256 hash`);
}

function requireStringMap(value, label, errors) {
  if (!isPlainObject(value) || !Object.keys(value).length) {
    errors.push(`${label} must be a non-empty object`);
    return;
  }
  for (const [key, entry] of Object.entries(value)) if (!key || typeof entry !== 'string' || !entry) errors.push(`${label} must map non-empty strings to non-empty strings`);
}

function requireCountObject(value, label, requiredFields, labelFields, errors, optionalNumericFields = []) {
  if (!isPlainObject(value) || !Object.keys(value).length) {
    errors.push(`${label} must be a non-empty count object`);
    return;
  }
  const numericFields = requiredFields || Object.keys(value);
  for (const field of numericFields) if (!Number.isInteger(value[field]) || value[field] < 0) errors.push(`${label}.${field} must be a non-negative integer`);
  for (const field of optionalNumericFields) if (Object.hasOwn(value, field) && (!Number.isInteger(value[field]) || value[field] < 0)) errors.push(`${label}.${field} must be a non-negative integer`);
  for (const field of labelFields) requireConfigText(value[field], `${label}.${field}`, errors);
  const allowed = new Set([...numericFields, ...optionalNumericFields, ...labelFields]);
  if (requiredFields) for (const field of Object.keys(value)) if (!allowed.has(field)) errors.push(`${label} has unknown field ${field}`);
}

function requireStringArrayConfig(value, label, errors, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && !value.length) || value.some(entry => typeof entry !== 'string' || !entry) || new Set(value).size !== value.length) errors.push(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array of unique strings`);
}

function requireArrayMembers(value, required, label, errors) {
  if (!Array.isArray(value)) return;
  for (const entry of required) if (!value.includes(entry)) errors.push(`${label} missing ${entry}`);
}

function requireHashMap(value, label, expectedKeys, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const keys = Object.keys(value).sort();
  const expected = [...(expectedKeys || [])].sort();
  if (canonicalText(keys) !== canonicalText(expected)) errors.push(`${label} keys must exactly match configured lanes`);
  for (const [key, hash] of Object.entries(value)) requireConfigHash(hash, `${label}.${key}`, errors);
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
  const counts = { populated: 0, blocked_source_conflict: 0, unavailable_public: 0, not_yet_researched: 0 };
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
  ZERO_OUTPUT_KEYS,
  buildObjectEntriesForRefs,
  canonicalText,
  clone,
  collectEvidenceRefs,
  countCellStates,
  createScaleInputFitnessKernel,
  rawSha256,
  rebuildEvidenceChain,
  semanticHash,
  stablePrettyJson,
  textIncludesAll,
  validateZeroInventory
};
