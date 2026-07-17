#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { analyzeReviewConflicts } = require('../lib/conflict-analysis');
const { sha256 } = require('../lib/review-protocols');
const { validateScaleReviewHandoff, validateScaleReviewRequest, validateUpstreamManifest } = require('../lib/scale-roster-bed-review');
const { evaluateStrategicReview } = require('../lib/strategic-review');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'review-protocols', 'fixtures', 'scale-roster-bed-basis');
const UPSTREAM_MANIFEST_PATH = path.join(OUT, 'upstream-manifest.json');
const upstreamManifest = JSON.parse(fs.readFileSync(UPSTREAM_MANIFEST_PATH, 'utf8'));
const manifestMessages = validateUpstreamManifest(upstreamManifest);
if (manifestMessages.length) throw new Error(manifestMessages.join('; '));
const CLAIM_ID = upstreamManifest.claim_id;
const POSTURES = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
const TOOLKIT_COMMIT = upstreamManifest.toolkit.merge_commit;
const AGENTS_REVIEW_BASE = 'e5292b470843f4526d0d1c53161cb44630e30318';

const HASHES = {
  evidence: upstreamManifest.data_mcp.bundle_hash,
  scenario: upstreamManifest.toolkit.objects.decision_scenario.hash,
  identity: upstreamManifest.toolkit.objects.identity_binding.hash,
  computation: upstreamManifest.toolkit.objects.computation_result.hash,
  claim: upstreamManifest.toolkit.objects.claim_candidate.hash
};

const CONFLICTS = upstreamManifest.conflict_ids;
const EVIDENCE_REFS = upstreamManifest.evidence_identifiers;

const frozenInputs = {
  evidence_bundle_ref: upstreamManifest.data_mcp.bundle_ref,
  evidence_bundle_hash: HASHES.evidence,
  identity_binding_ref: `git:${TOOLKIT_COMMIT}:${upstreamManifest.toolkit.objects.identity_binding.path}`,
  identity_binding_hash: HASHES.identity,
  computations: [{
    ref: `git:${TOOLKIT_COMMIT}:${upstreamManifest.toolkit.objects.computation_result.path}`,
    hash: HASHES.computation
  }],
  claim_candidates: [{ claim_id: CLAIM_ID, claim_hash: HASHES.claim, evidence_refs: EVIDENCE_REFS }]
};

const decisionScenario = {
  ref: `git:${TOOLKIT_COMMIT}:${upstreamManifest.toolkit.objects.decision_scenario.path}`,
  hash: HASHES.scenario
};

const evidenceBoundary = 'Frozen source-local public aggregate evidence only. The packet preserves 63 roster candidates (54 included, six unresolved, three excluded), five open identity/bed conflicts, heterogeneous 2023 through Q1/FY2026 periods, and incompatible licensed, staffed, POS, HCRIS, AHRQ, and official bed bases. No evidence acquisition, allocation, imputation, formula execution, score, strategic conclusion, professional adjudication, projection, admission, deployment, or public promotion is authorized.';

function reviewer(reviewerId, agentSlug, promptVersion) {
  return {
    reviewer_id: reviewerId,
    agent_slug: agentSlug,
    prompt_version: promptVersion,
    repo_commit: AGENTS_REVIEW_BASE,
    model: 'gpt-5.6-sol',
    runtime: 'codex-desktop-2026-07-17',
    independence: {
      prior_exposure: 'none',
      conflict_disclosures: [],
      direct_material_conflict: false,
      attestation: true
    }
  };
}

function posture(postureName, refs, rationale, limitation) {
  return {
    posture: postureName,
    effect: 'unresolved',
    claim_refs: [CLAIM_ID],
    evidence_refs: refs,
    rationale,
    limitation: `${limitation} This assessment does not recommend a posture.`
  };
}

const methodsReview = {
  competence_role: 'evidence_methods_measurement_biostatistics',
  exposure_status: 'independent_first',
  evidence_mutated: false,
  claim_dispositions: [{
    claim_id: CLAIM_ID,
    evidence_assessment: 'supported_by_available_evidence',
    review_disposition: 'request_additional_evidence',
    evidence_refs: ['computation:scale-v1:all-six:no-score:2026-07-16', 'identity-binding:scale-v1:all-six-roster-bed:2026-07-16', ...CONFLICTS, 'bed-missing:jefferson-health:jefferson-abington-hospital', 'bed-missing:jefferson-health:lehigh-valley-hospital-1503-n-cedar-crest', 'bed-missing:penn-medicine:hup-cedar'],
    limitation: 'The descriptive process claim that calculation is blocked is supported: seven Scale input families remain not yet researched, the approved-roster and common-bed-basis gates remain unresolved, and open ownership, shared-reporting, period, and bed-definition conflicts prevent a common all-six denominator. This validates no system total, comparison, score, ranking, posture, or causal inference.',
    overturn_condition: 'Overturn only with a newly frozen packet containing all nine inputs for every system; one date-aligned and geography-bounded 63-candidate roster with every included, excluded, inactive, specialty, child, campus, joint-venture, alias, and ownership-change disposition adjudicated; one prespecified bed definition, period, denominator, and aggregation rule applied without silent shared-entity allocation; and evidence-specific resolution of all five preserved conflicts, Jefferson crosswalk missingness, and Penn HUP-Cedar ambiguity.'
  }],
  posture_assessments: [
    posture('acquire', ['computation:scale-v1:all-six:no-score:2026-07-16', 'conflict:chestnut-hill-ownership-and-bases'], 'An incomplete packet and unresolved ownership/basis questions do not establish transaction suitability.', 'Transaction, valuation, governance, control, integration, and forecast evidence are absent.'),
    posture('merge_affiliate', ['computation:scale-v1:all-six:no-score:2026-07-16', 'conflict:christianacare-shared-cms-reporting-entity'], 'Shared reporting entities demonstrate a measurement problem, not affiliation feasibility or benefit.', 'Governance, control, affiliation, finance, capability, and implementation evidence are absent.'),
    posture('partner', ['computation:scale-v1:all-six:no-score:2026-07-16', 'bed-missing:jefferson-health:jefferson-abington-hospital'], 'Missing facility crosswalks and Scale inputs cannot establish complementary capacity, demand, access, or partnership value.', 'Service-line, referral, utilization, workforce, access, and partnership evidence are absent.'),
    posture('compete', ['computation:scale-v1:all-six:no-score:2026-07-16', 'conflict:union-bed-bases', 'conflict:temple-shared-cms-reporting-entity'], 'Noncomparable bed definitions, periods, and reporting entities cannot support relative scale or competitive position.', 'No valid denominator, market definition, utilization, quality, access, or competitive-effect evidence exists.'),
    posture('build_capacity', ['computation:scale-v1:all-six:no-score:2026-07-16', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:licensed-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed'], 'Distinct licensed and set-up-and-staffed measures do not identify an operational capacity gap.', 'Need, occupancy, staffed capacity, workforce, throughput, capital, site feasibility, and implementation evidence are absent.'),
    posture('defer', ['computation:scale-v1:all-six:no-score:2026-07-16', 'identity-binding:scale-v1:all-six-roster-bed:2026-07-16'], 'The evidence blocks the present calculation, but a process no-go is not evidence for a strategic posture.', 'Timing and strategic consequences of additional diligence are outside this methods review.')
  ],
  criterion_results: [
    {
      criterion_id: 'cso.evidence-methods-measurement.v1:criterion:1', result: 'addressed', claim_refs: [CLAIM_ID],
      evidence_refs: ['computation:scale-v1:all-six:no-score:2026-07-16', 'identity-binding:scale-v1:all-six-roster-bed:2026-07-16', ...['christianacare', 'jefferson-health', 'temple-health', 'penn-medicine', 'cooper-university-health-care', 'main-line-health'].map(slug => `system-identity:${slug}`), 'roster:temple-health:chestnut-hill', 'roster:penn-medicine:good-shepherd', 'roster:penn-medicine:hup-cedar', 'roster:penn-medicine:lancaster-behavioral', 'roster:penn-medicine:princeton-house', 'roster:cooper-university-health-care:childrens-regional', 'conflict:cooper-childrens-separate-hospital'],
      rationale: 'The observation-claim-warrant chain supports only descriptive_process. The six source-local identities do not automatically merge children or aliases. The 63 candidates resolve to 54 included, six unresolved, and three excluded; unresolved ownership, child/co-located hospital, remote-campus, behavioral, rehabilitation, inactive-site, joint-venture, alias, and specialty-facility rules can create omissions or double counting. Seven Scale families are also absent.'
    },
    {
      criterion_id: 'cso.evidence-methods-measurement.v1:criterion:2', result: 'addressed', claim_refs: [CLAIM_ID],
      evidence_refs: ['conflict:union-bed-bases', 'christiana-cecil-licensed-109', 'union-official-103', 'md-bed:union:licensed-fy2026', 'cms-pos:210032:bed_cnt', 'cms-pos:210032:crtfd_bed_cnt', 'cms-hcris:210032:number-of-beds', 'conflict:christianacare-shared-cms-reporting-entity', 'conflict:temple-shared-cms-reporting-entity', 'conflict:chestnut-hill-ownership-and-bases', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:licensed-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', 'bed-missing:jefferson-health:jefferson-abington-hospital', 'bed-missing:jefferson-health:lehigh-valley-hospital-1503-n-cedar-crest', 'bed-missing:penn-medicine:hup-cedar', 'bed-missing:cooper-university-health-care:childrens-regional', 'bed-missing:main-line-health:mirmont'],
      rationale: 'Definition, denominator, vintage, comparability, uncertainty, and sensitivity fail. Periods span 2023 HCRIS/AHRQ, 2024 state reports, March 2025 rosters, FY2026 Maryland licensing, Q1 2026 POS, and current pages. Licensed, set-up-and-staffed, POS, certified-POS, HCRIS, AHRQ, and official-unspecified beds are incompatible. Structured missingness and unresolved roster coverage prevent a common all-six denominator without prohibited imputation or explicit roster narrowing.'
    },
    {
      criterion_id: 'cso.evidence-methods-measurement.v1:criterion:3', result: 'addressed', claim_refs: [CLAIM_ID],
      evidence_refs: ['conflict:union-bed-bases', 'cms-pos:210032:bed_cnt', 'cms-pos:210032:crtfd_bed_cnt', 'cms-hcris:210032:number-of-beds', 'conflict:christianacare-shared-cms-reporting-entity', 'conflict:temple-shared-cms-reporting-entity', 'conflict:chestnut-hill-ownership-and-bases', 'conflict:cooper-childrens-separate-hospital'],
      rationale: 'Rows are not independent corroboration when they measure different constructs, periods, shared reporting entities, or reuse provider identifiers. Source repetition, model agreement, and citation count cannot replace an adjudicated identity crosswalk and common estimand; conflicts cannot be averaged or silently selected away.'
    }
  ],
  missing_evidence_requests: [
    { request_id: 'missing:all-six-effective-date-roster', description: 'Provide an authoritative effective-date roster for all 63 candidates, including ownership/control, active state, aliases, children, campuses, joint ventures, rehabilitation, behavioral, children’s, specialty-only, co-located, inactive, and included/excluded dispositions.' },
    { request_id: 'missing:shared-reporting-allocation-or-exclusion-rule', description: 'Resolve ChristianaCare and Temple shared reporting entities with authoritative campus crosswalks and a prespecified allocation-or-exclusion rule.' },
    { request_id: 'missing:union-common-bed-estimand', description: 'Resolve Union using the same bed construct and period, explaining the official, state, POS, certified-POS, and HCRIS differences.' },
    { request_id: 'missing:temple-and-chestnut-hill-basis', description: 'Resolve Temple and Chestnut Hill ownership, campus status, separable reporting, and a common licensed-or-staffed basis.' },
    { request_id: 'missing:jefferson-facility-crosswalk', description: 'Complete current state/CMS identity and bed-basis crosswalks for all 33 Jefferson candidates, including specialty and children’s facilities.' },
    { request_id: 'missing:penn-and-cooper-special-entities', description: 'Adjudicate Penn unresolved entities and Cooper Children’s with ownership, CCN/license linkage, facility class, and separable bed bases.' },
    { request_id: 'missing:complete-nine-input-packet', description: 'Provide comparable all-six values for the seven missing Scale input families in addition to approved roster and common bed basis.' },
    { request_id: 'missing:prespecified-aggregation-and-sensitivity', description: 'Publish aggregation, duplicate detection, specialty handling, period alignment, uncertainty, and sensitivity rules before executing Scale v1.' }
  ],
  method_challenges: [
    { challenge_id: 'method:scope-perturbation-roster', description: 'Perturb every unresolved child, joint-venture, specialty, behavioral, rehabilitation, remote-campus, co-located, and inactive candidate; any total that changes without an adjudicated rule is invalid.' },
    { challenge_id: 'method:bed-basis-negative-control', description: 'Keep licensed, staffed, POS, certified-POS, HCRIS, AHRQ, and official-unspecified beds deliberately nonequivalent.' },
    { challenge_id: 'method:dependency-audit', description: 'Map dependencies across official, state, POS, HCRIS, HGI, and AHRQ sources so repeated providers are not independent corroboration.' },
    { challenge_id: 'method:shared-entity-double-count', description: 'Test Newark/Wilmington, Temple Main/Episcopal, HUP/HUP-Cedar, and Camden/Cooper Children’s for campus-plus-combined-entity double counting.' },
    { challenge_id: 'method:omission-audit', description: 'Test aliases, ownership changes, recent facilities, name-only matches, and specialty or child entities for omission when no one-to-one CCN exists.' },
    { challenge_id: 'method:source-withholding', description: 'Remove each source family in turn; the no-calculation conclusion must persist while source-dependent concerns remain explicit.' }
  ],
  prohibited_claims: [
    'Do not calculate, estimate, impute, normalize, rank, or publish a full or partial Scale v1 score.',
    'Do not assert comparable all-six rosters, system bed totals, operational capacity, or enterprise scale.',
    'Do not select, average, sum, or silently reconcile incompatible bed bases.',
    'Do not allocate shared reporting entities without authoritative evidence and a prespecified rule.',
    'Do not count unresolved joint ventures, children, specialty, behavioral, rehabilitation, remote-campus, or co-located facilities independently, or omit them because a separate CCN is absent.',
    'Do not infer ownership, control, active status, or membership from branding, aliases, proximity, name-only matching, or source repetition.',
    'Do not treat dependent sources, model agreement, or citation counts as independent corroboration.',
    'Do not infer quality, capability, access, demand, market power, advantage, financial strength, or strategic posture from beds.',
    'Do not treat missing evidence as zero, neutral, not applicable, or evidence of absence.',
    'Do not represent this review as professional adjudication, human approval, projection approval, release authorization, or affected-community input.'
  ],
  preserved_reviewer_concerns: [
    'The six identities are source-local matches, not proof that every child and alias is consistently bounded at one effective date.',
    'The roster is asymmetric: Jefferson has 33 included candidates while the other systems have two to six, making facility-class rules consequential.',
    'Six unresolved and three excluded candidates prevent an approved all-six denominator.',
    'ChristianaCare and Temple shared CMS entities create direct double-counting or allocation risk.',
    'Chestnut Hill joint-ownership language leaves attribution and bed-basis treatment unresolved.',
    'Cooper Children’s is officially described as a third hospital but remains co-location/reporting-entity ambiguous.',
    'Penn HUP-Cedar may be a remote HUP location without a separate allocable bed basis.',
    'Jefferson specialty, rehabilitation, children’s, surgical, orthopaedic, and integrated Lehigh Valley crosswalks remain incomplete.',
    'Evidence periods span 2023 through Q1/FY2026; no common period is asserted.',
    'Licensed, staffed, POS, certified-POS, HCRIS, AHRQ, and official-unspecified beds are not interchangeable.',
    'The source-local bundle contains no governed system rollup; nonexecution does not validate a future method.',
    'Seven Scale families remain not yet researched, so resolving roster and bed gates alone is insufficient.',
    'All conclusions require named human competence-matched adjudication and release authority.'
  ],
  overall_disposition: 'block'
};

const operationsReview = {
  competence_role: 'operations_access_capacity_workforce',
  exposure_status: 'independent_first',
  evidence_mutated: false,
  claim_dispositions: [{
    claim_id: CLAIM_ID,
    evidence_assessment: 'supported_by_available_evidence',
    review_disposition: 'request_additional_evidence',
    evidence_refs: ['scenario:scale-v1:all-six-roster-bed-readiness:2026-07-16', 'identity-binding:scale-v1:all-six-roster-bed:2026-07-16', 'computation:scale-v1:all-six:no-score:2026-07-16', ...CONFLICTS, 'union-official-103', 'md-bed:union:licensed-fy2026', 'cms-hcris:210032:number-of-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:licensed-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', 'bed-missing:jefferson-health:rothman-orthopaedic-specialty-hospital', 'bed-missing:jefferson-health:lehigh-valley-reilly-children-s-hospital', 'bed-missing:penn-medicine:hup-cedar', 'bed-missing:cooper-university-health-care:childrens-regional'],
    limitation: 'The bounded no-calculation conclusion is supported, but the packet establishes no operationally comparable all-six capacity denominator. It mixes licensed, official-unspecified, POS, certified, HCRIS period-end available, AHRQ, and set-up-and-staffed bases and lacks comparable workforce, occupancy, throughput, scheduling, transfer, referral, and temporary-closure constraints.',
    overturn_condition: 'Require one-date identity and control crosswalks for all 63 candidates; explicit alias, child, campus, joint-venture, specialty, inactive, and shared-CCN treatment; a no-double-count/no-omission audit; one consistent bed basis for every included facility; and, for any operational-capacity claim, comparable staffed and in-service beds, closures, occupancy, throughput, workforce, scheduling, transfer, and referral constraints. Complete the seven other Scale families and rerun the deterministic computation.'
  }],
  posture_assessments: [
    posture('acquire', ['computation:scale-v1:all-six:no-score:2026-07-16', 'conflict:christianacare-shared-cms-reporting-entity', 'conflict:chestnut-hill-ownership-and-bases'], 'The no-score result and unresolved ownership boundaries create diligence questions, not acquisition evidence.', 'Transaction scope, control, workforce, achievable capacity, integration, finance, regulation, and demand are absent.'),
    posture('merge_affiliate', ['computation:scale-v1:all-six:no-score:2026-07-16', 'conflict:temple-shared-cms-reporting-entity', 'conflict:chestnut-hill-ownership-and-bases'], 'Shared reporting and joint ownership prevent a clean comparison and do not establish affiliation feasibility.', 'Governance, operating model, workforce, referral, transfer, and integration constraints are absent.'),
    posture('partner', ['computation:scale-v1:all-six:no-score:2026-07-16', 'bed-missing:penn-medicine:hup-cedar', 'conflict:cooper-childrens-separate-hospital'], 'Campus and specialty ambiguity does not show complementary operational capacity or executable access pathways.', 'Demand, staffed capacity, scheduling, transfer, referral, and workforce evidence are absent.'),
    posture('compete', ['computation:scale-v1:all-six:no-score:2026-07-16', 'union-official-103', 'md-bed:union:licensed-fy2026', 'cms-hcris:210032:number-of-beds'], 'Different bed bases and periods cannot establish operational scale, access, throughput, or competitive capacity.', 'No common market, service, utilization, staffed-capacity, throughput, access-friction, or achievable-capacity evidence exists.'),
    posture('build_capacity', ['computation:scale-v1:all-six:no-score:2026-07-16', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:licensed-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', 'cms-hcris:390027:number-of-beds'], 'Licensed, set-up-and-staffed, and available measures do not identify a gap, bottleneck, or feasible increment.', 'Installed and in-service capacity, occupancy, demand, workforce, scheduling, capital, transfer, referral, and implementation constraints are absent.'),
    posture('defer', ['scenario:scale-v1:all-six-roster-bed-readiness:2026-07-16', 'identity-binding:scale-v1:all-six-roster-bed:2026-07-16', 'computation:scale-v1:all-six:no-score:2026-07-16'], 'The objects authorize governed research and establish a calculation block, not selection of a strategic posture.', 'A process block does not establish that deferral is strategically preferable.')
  ],
  criterion_results: [
    {
      criterion_id: 'cso.operations-access-capacity.v1:criterion:1', result: 'addressed', claim_refs: [CLAIM_ID],
      evidence_refs: ['union-official-103', 'md-bed:union:licensed-fy2026', 'cms-hcris:210032:number-of-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:licensed-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', 'cms-pos:390027:bed_cnt', 'cms-hcris:390027:number-of-beds'],
      rationale: 'Official-unspecified, licensed, POS, certified, set-up-and-staffed, HCRIS, and AHRQ beds are distinct. None is interchangeable with installed, staffed, in-service, throughput, access-friction, or achievable capacity. Missing comparable throughput and availability evidence blocks an operational comparison.'
    },
    {
      criterion_id: 'cso.operations-access-capacity.v1:criterion:2', result: 'addressed', claim_refs: [CLAIM_ID],
      evidence_refs: ['computation:scale-v1:all-six:no-score:2026-07-16', ...CONFLICTS],
      rationale: 'The computation records roster and bed-basis gates, and the five conflicts identify boundary and measurement bottlenecks. No operating assumptions define closures, shared-entity allocation, specialty treatment, occupancy, peak demand, staffing ratios, or translation from licensed beds to achievable capacity.'
    },
    {
      criterion_id: 'cso.operations-access-capacity.v1:criterion:3', result: 'addressed', claim_refs: [CLAIM_ID],
      evidence_refs: [...['christianacare', 'jefferson-health', 'temple-health', 'penn-medicine', 'cooper-university-health-care', 'main-line-health'].map(slug => `system-identity:${slug}`), 'bed-missing:jefferson-health:rothman-orthopaedic-specialty-hospital', 'bed-missing:jefferson-health:lehigh-valley-reilly-children-s-hospital', 'bed-missing:penn-medicine:hup-cedar', 'bed-missing:cooper-university-health-care:childrens-regional', 'conflict:chestnut-hill-ownership-and-bases'],
      rationale: 'All six source-local identities exist, but specialty, children’s, remote-campus, joint-ownership, and inactive-site boundaries create omission or double-count risk. No workforce, facility availability, scheduling, transfer, or referral evidence shows nominal capacity is usable or achievable.'
    }
  ],
  missing_evidence_requests: [
    { request_id: 'missing:all-six-common-date-roster-adjudication', description: 'Provide a source-receipted one-date roster for all 63 candidates, with control, status, aliases, child/campus and joint-venture relationships, specialty and inactive status, CCN relationships, and no-double-count/no-omission audit.' },
    { request_id: 'missing:all-six-common-bed-basis-crosswalk', description: 'Provide every included facility under one period and aggregation rule while preserving licensed, installed, certified, in-service, staffed, and available bases separately.' },
    { request_id: 'missing:operational-capacity-and-bottlenecks', description: 'Provide staffed and in-service beds, closures, occupancy, peak census, discharges, length of stay, throughput, scheduling delays, transfers, referrals, and service bottlenecks.' },
    { request_id: 'missing:workforce-feasibility', description: 'Provide filled FTEs, vacancies, agency dependence, skill mix, shift coverage, recruitment lead time, and assumptions translating physical beds into achievable capacity.' },
    { request_id: 'missing:remaining-scale-input-families', description: 'Complete the seven other Scale families under identical identity, roster, period, and aggregation boundaries, then rerun the formula.' }
  ],
  method_challenges: [
    { challenge_id: 'method:bed-basis-substitution', description: 'Keep licensed, POS, certified, HCRIS, AHRQ, and staffed measures separate; any required substitution falsifies comparability.' },
    { challenge_id: 'method:shared-reporting-entity-allocation', description: 'Reconcile shared CCNs 080001 and 390027 to campuses; preserve the block if separation requires assumptions.' },
    { challenge_id: 'method:roster-double-count-omission', description: 'Audit aliases, campuses, children, joint ventures, specialty, rehabilitation, behavioral, excluded, and inactive sites against legal ownership and reporting.' },
    { challenge_id: 'method:licensed-to-achievable-capacity', description: 'Test any licensed-bed inference against staffed/in-service beds, occupancy, throughput, workforce, scheduling, transfer, and referral constraints.' },
    { challenge_id: 'method:period-alignment', description: 'Repeat on one as-of date or overlapping period; material ownership, status, or basis change invalidates transport from the heterogeneous snapshot.' }
  ],
  prohibited_claims: [
    'Do not calculate, estimate, interpolate, rank, or publish a full or partial Scale score.',
    'Do not represent licensed, certified, POS, HCRIS, AHRQ, official, or staffed beds as interchangeable.',
    'Do not describe nominal beds as installed, operationally available, staffed, in-service, throughput-producing, or achievable capacity.',
    'Do not allocate shared entities or count child, specialty, remote, co-located, or joint-venture facilities separately without adjudication.',
    'Do not infer access, feasibility, advantage, shortage, expansion need, or workforce sufficiency from beds.',
    'Do not claim contemporaneous or complete rosters while ownership, status, aliases, and unresolved candidates remain.',
    'Do not use the bounded process conclusion as a strategic recommendation or projection approval.',
    'Do not represent this review as professional adjudication, human approval, release authority, or public-promotion authority.'
  ],
  preserved_reviewer_concerns: [
    'The six labels are source-local identities; consistent enterprise boundaries at one date require adjudication.',
    'The Jefferson roster includes specialty, rehabilitation, children’s, surgical, and integrated Lehigh Valley facilities with incomplete bed crosswalks.',
    'ChristianaCare Newark and Wilmington share CMS 080001, creating allocation and double-count risk.',
    'Temple University Hospital and Episcopal share CMS 390027; Chestnut Hill has joint-ownership and bed-basis ambiguity.',
    'Cooper Children’s is described as a third hospital but remains co-location/reporting-entity ambiguous.',
    'Penn HUP-Cedar is named as a campus but may be a remote HUP location.',
    'Periods range from 2023 through Q1/FY2026, so ownership, operation, roster, and bed status are noncontemporaneous.',
    'No common all-six distinction exists among licensed, installed, available, staffed, and in-service beds.',
    'No workforce, occupancy, throughput, scheduling, transfer, or referral evidence supports achievable-capacity inference.',
    'The no-score result is an appropriate block but resolves no underlying conflict or strategic question.',
    'A qualified human operations reviewer must adjudicate any professional disposition; this review is advisory.'
  ],
  overall_disposition: 'block'
};

function canonicalizeEvidenceRefs(value) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (typeof value[index] === 'string' && value[index].startsWith('bed-missing:')) value[index] = `coverage:${value[index]}`;
      else canonicalizeEvidenceRefs(value[index]);
    }
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) canonicalizeEvidenceRefs(child);
  }
}

// Independent reviewers used the source-local missingness suffix; publish the
// exact upstream coverage identifiers without altering any assessment prose.
canonicalizeEvidenceRefs(methodsReview);
canonicalizeEvidenceRefs(operationsReview);

function request({ requestId, protocolId, protocolHash, reviewerMetadata, candidateReview }) {
  return {
    schema_version: 'ushso.review-request.v1',
    request_id: requestId,
    review_tier: 'ordinary_material_claim',
    protocol: { protocol_id: protocolId, version: '1.0.0', protocol_hash: protocolHash },
    reviewer: reviewerMetadata,
    frozen_inputs: frozenInputs,
    decision_scenario: decisionScenario,
    posture_taxonomy: POSTURES,
    evidence_boundary: evidenceBoundary,
    candidate_review: candidateReview
  };
}

function writeJson(fileName, value) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, fileName), JSON.stringify(value, null, 2) + '\n');
}

const methodsRequest = request({
  requestId: 'review-request:scale-roster-bed:methods:2026-07-17',
  protocolId: 'cso.evidence-methods-measurement.v1',
  protocolHash: 'sha256:37f245f9fadffda8e2faaeb67612eb3280859ae2e8f84b74e68df9a1dcfbbb72',
  reviewerMetadata: reviewer('scale-roster-bed:methods:1', 'healthit-clinical-data-analyst', 'cso.evidence-methods-measurement.v1@1.0.0'),
  candidateReview: methodsReview
});
const operationsRequest = request({
  requestId: 'review-request:scale-roster-bed:operations:2026-07-17',
  protocolId: 'cso.operations-access-capacity.v1',
  protocolHash: 'sha256:be86fda678ceb94f0a7b4b85d3c7b52259af15e27fb7d31da88247db6449a6d3',
  reviewerMetadata: reviewer('scale-roster-bed:operations:1', 'operations-hospital-administrator', 'cso.operations-access-capacity.v1@1.0.0'),
  candidateReview: operationsReview
});
const methodsOutput = evaluateStrategicReview(methodsRequest);
const operationsOutput = evaluateStrategicReview(operationsRequest);
const conflictRequest = {
  schema_version: 'ushso.ai-conflict-analysis-request.v1',
  request_id: 'conflict-request:scale-roster-bed:2026-07-17',
  review_tier: 'ordinary_material_claim',
  reviews: [methodsOutput, operationsOutput]
};
const conflictOutput = analyzeReviewConflicts(conflictRequest);
const methodsConcern = index => `${methodsOutput.review_id}:${index}`;
const operationsConcern = index => `${operationsOutput.review_id}:${index}`;
const handoff = {
  schema_version: 'ushso.scale-roster-bed-review-handoff.v1',
  downstream_bead: 'healthcare-toolkit-2rr9.6.1',
  status: 'blocked_pending_human_adjudication',
  request_hashes: {
    methods: methodsOutput.review_request_hash,
    operations: operationsOutput.review_request_hash,
    conflict: sha256(conflictRequest)
  },
  review_hashes: {
    methods_first_assessment: methodsOutput.first_assessment_hash,
    methods_output: methodsOutput.output_sha256,
    operations_first_assessment: operationsOutput.first_assessment_hash,
    operations_output: operationsOutput.output_sha256
  },
  conflict_output_hash: conflictOutput.output_sha256,
  upstream_manifest_hash: upstreamManifest.manifest_sha256,
  frozen_input_hashes: HASHES,
  unresolved_concerns: [
    '63 roster candidates remain bounded as 54 included, six unresolved, and three excluded; no narrower roster is authorized.',
    'All five identity and bed conflicts remain open and require competence-matched human adjudication.',
    'Shared reporting entities, aliases, ownership timing, joint ventures, specialty/children’s/behavioral/rehabilitation facilities, inactive sites, and remote campuses create double-count and omission risk.',
    'Heterogeneous 2023 through Q1/FY2026 periods and incompatible bed bases prevent a common all-six denominator without prohibited imputation or explicit roster narrowing.',
    'Seven additional Scale input families remain not yet researched.',
    'No staffed or achievable capacity inference is supported.'
  ],
  concern_overturns: [
    {
      concern_id: 'identity-boundary-and-stale-ownership',
      evidence_refs: ['identity-binding:scale-v1:all-six-roster-bed:2026-07-16', 'conflict:chestnut-hill-ownership-and-bases'],
      overturn_condition: 'Provide authoritative, source-receipted legal ownership and control effective on one comparison date for every system and candidate, including aliases and ownership changes, then publish a human-adjudicated identity binding.',
      review_concern_refs: [methodsConcern(0), operationsConcern(0)]
    },
    {
      concern_id: 'roster-boundaries-and-coverage',
      evidence_refs: ['identity-binding:scale-v1:all-six-roster-bed:2026-07-16', 'roster:temple-health:chestnut-hill', 'roster:penn-medicine:hup-cedar'],
      overturn_condition: 'Adjudicate all 63 candidates at one effective date, retaining evidence-backed included, excluded, unresolved, and inactive states; demonstrate that the resulting all-six roster contains no silent narrowing, omission, or duplicate.',
      review_concern_refs: [methodsConcern(1), methodsConcern(2), methodsConcern(7), operationsConcern(1)]
    },
    {
      concern_id: 'shared-reporting-double-count',
      evidence_refs: ['conflict:christianacare-shared-cms-reporting-entity', 'conflict:temple-shared-cms-reporting-entity', 'cms-pos:390027:bed_cnt'],
      overturn_condition: 'Supply authoritative campus-to-reporting-entity crosswalks and a prespecified, human-approved allocation or exclusion rule for CMS 080001 and 390027, followed by a reproducible no-double-count audit.',
      review_concern_refs: [methodsConcern(3), operationsConcern(2), operationsConcern(3)]
    },
    {
      concern_id: 'specialty-campus-omission',
      evidence_refs: ['conflict:cooper-childrens-separate-hospital', 'bed-missing:penn-medicine:hup-cedar', 'bed-missing:jefferson-health:rothman-orthopaedic-specialty-hospital', 'conflict:chestnut-hill-ownership-and-bases'],
      overturn_condition: 'For every child, specialty, behavioral, rehabilitation, remote-campus, co-located, and joint-venture candidate, provide current facility class, ownership, active status, CCN or license linkage, separable bed basis, and an adjudicated inclusion rule.',
      review_concern_refs: [methodsConcern(4), methodsConcern(5), methodsConcern(6), operationsConcern(4), operationsConcern(5)]
    },
    {
      concern_id: 'reporting-period-alignment',
      evidence_refs: ['scenario:scale-v1:all-six-roster-bed-readiness:2026-07-16', 'cms-hcris:210032:number-of-beds', 'md-bed:union:licensed-fy2026'],
      overturn_condition: 'Reacquire every roster and bed observation for one common as-of date or overlapping reporting period, and demonstrate that intervening ownership, operating-status, facility, and bed-status changes do not alter the comparison.',
      review_concern_refs: [methodsConcern(8), operationsConcern(6)]
    },
    {
      concern_id: 'bed-basis-comparability',
      evidence_refs: ['conflict:union-bed-bases', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:licensed-beds', 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', 'cms-pos:210032:bed_cnt', 'cms-hcris:210032:number-of-beds'],
      overturn_condition: 'Obtain the same explicitly defined licensed, installed, staffed, in-service, or available-bed construct for every included facility and period; preserve other constructs separately and document why no conversion, averaging, or substitution is required.',
      review_concern_refs: [methodsConcern(9), operationsConcern(7)]
    },
    {
      concern_id: 'aggregation-and-system-rollup',
      evidence_refs: ['computation:scale-v1:all-six:no-score:2026-07-16', 'identity-binding:scale-v1:all-six-roster-bed:2026-07-16'],
      overturn_condition: 'Publish and independently verify a governed facility-to-system aggregation rule, duplicate-detection ledger, omission audit, shared-entity treatment, uncertainty policy, and sensitivity results before producing any system rollup.',
      review_concern_refs: [methodsConcern(10), operationsConcern(9)]
    },
    {
      concern_id: 'missing-scale-input-families',
      evidence_refs: ['computation:scale-v1:all-six:no-score:2026-07-16'],
      overturn_condition: 'Populate all seven not-yet-researched Scale input families for every system under the same identity, roster, period, denominator, and aggregation boundaries, then rerun the frozen deterministic formula without imputation.',
      review_concern_refs: [methodsConcern(11)]
    },
    {
      concern_id: 'staffed-and-achievable-capacity',
      evidence_refs: ['state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', 'bed-missing:cooper-university-health-care:childrens-regional'],
      overturn_condition: 'Provide comparable staffed and in-service beds, closures, occupancy, throughput, workforce coverage, scheduling delay, transfer acceptance, referral leakage, capital, and implementation constraints before inferring operational or achievable capacity.',
      review_concern_refs: [operationsConcern(8)]
    },
    {
      concern_id: 'human-authority-boundary',
      evidence_refs: ['computation:scale-v1:all-six:no-score:2026-07-16', ...CONFLICTS],
      overturn_condition: 'Obtain named, competence-matched human adjudication for every material discrepancy and preserved concern, followed by the separate accountable release authority required for calculation, projection, recommendation, admission, or promotion.',
      review_concern_refs: [methodsConcern(12), operationsConcern(10)]
    }
  ],
  prohibited_until_adjudicated: [
    'system bed totals', 'comparable all-six bed claims', 'staffed-capacity inference', 'partial or complete Scale scores', 'rankings', 'strategic recommendations', 'professional adjudication', 'projection approval', 'public promotion'
  ],
  route: conflictOutput.proposed_route,
  automatic_resolution: conflictOutput.automatic_resolution
};
const adversarialCases = [
  { case_id: 'mismatched-bed-bases', target: 'request_evidence', remove_evidence_ref: 'state-bed:pa-hospital-report-2024-1a:temple-university-hospital:beds-set-up-and-staffed', expected_error: 'review must preserve required domain evidence' },
  { case_id: 'stale-ownership', target: 'request_evidence', remove_evidence_ref: 'conflict:chestnut-hill-ownership-and-bases', expected_error: 'review must preserve conflict evidence' },
  { case_id: 'shared-entity-double-counting', target: 'request_evidence', remove_evidence_ref: 'conflict:christianacare-shared-cms-reporting-entity', expected_error: 'review must preserve conflict evidence' },
  { case_id: 'omitted-or-unresolved-facilities', target: 'request_evidence', remove_evidence_ref: 'coverage:bed-missing:penn-medicine:hup-cedar', expected_error: 'review must preserve required domain evidence' },
  { case_id: 'missing-all-six-coverage', target: 'request_evidence', remove_evidence_ref: 'computation:scale-v1:all-six:no-score:2026-07-16', expected_error: 'review must preserve required domain evidence' },
  { case_id: 'prohibited-partial-score', target: 'request', set_overall_disposition: 'pass', expected_error: 'must remain block' }
];

canonicalizeEvidenceRefs(handoff);

for (const requestValue of [methodsRequest, operationsRequest]) {
  const messages = validateScaleReviewRequest(requestValue, upstreamManifest);
  if (messages.length) throw new Error(messages.join('; '));
}
const handoffMessages = validateScaleReviewHandoff(handoff, [methodsOutput, operationsOutput], conflictOutput, upstreamManifest);
if (handoffMessages.length) throw new Error(handoffMessages.join('; '));

writeJson('methods-review-request.json', methodsRequest);
writeJson('operations-review-request.json', operationsRequest);
writeJson('methods-review.json', methodsOutput);
writeJson('operations-review.json', operationsOutput);
writeJson('conflict-analysis-request.json', conflictRequest);
writeJson('conflict-analysis.json', conflictOutput);
writeJson('handoff.json', handoff);
writeJson('adversarial-cases.json', adversarialCases);

console.log(JSON.stringify(handoff.review_hashes, null, 2));
console.log(`conflict_output=${handoff.conflict_output_hash}`);
