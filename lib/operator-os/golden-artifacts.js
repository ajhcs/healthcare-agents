const { stripProvenance } = require('./case-provenance');

const DENIAL_SPIKE_DIMENSIONS = [
  {
    id: 'spike_definition_normalization',
    label: 'Spike definition and normalization',
    patterns: [/timeframe/i, /baseline/i, /denial rate/i, /volume|denominator/i, /remit lag|submission timing/i]
  },
  {
    id: 'carc_rarc_specificity',
    label: 'CARC/RARC specificity or missing-data callout',
    patterns: [/CARC|RARC/i, /missing|verify/i]
  },
  {
    id: 'ar_exposure_appeal_timing',
    label: 'AR exposure and appeal timing',
    patterns: [/gross charges|expected allowed|patient responsibility|write-off|recovery/i, /appeal deadline|deadline basis/i]
  },
  {
    id: 'root_cause_hypotheses',
    label: 'Root-cause hypotheses',
    patterns: [/root-cause|root cause/i, /authorization|eligibility|coding|payer processing|contract/i]
  },
  {
    id: 'evidence_pull_list',
    label: 'Evidence pull list',
    patterns: [/evidence pull/i, /835|837|remit/i, /authorization|eligibility|coding notes|contract/i]
  },
  {
    id: 'citation_support',
    label: 'Citation-card/source-family support',
    patterns: [/citation card|source family|evidence pack/i, /source-family-not-pinpoint|local-policy-required|verified-pinpoint/i]
  },
  {
    id: 'owner_matrix',
    label: 'Owner matrix',
    patterns: [/owner matrix/i, /Revenue Cycle|Denials/i, /Patient Access|Coding|Payer Relations|Compliance/i]
  },
  {
    id: 'monitoring_prevention',
    label: 'Monitoring/prevention plan',
    patterns: [/monitoring/i, /new denials stopped|prevention proof|leading indicator/i, /daily|weekly|cadence/i]
  },
  {
    id: 'compliance_phi_guardrails',
    label: 'Compliance and PHI guardrails',
    patterns: [/PHI|minimum necessary/i, /human review|compliance/i]
  },
  {
    id: 'unsupported_advice_avoidance',
    label: 'Avoidance of unsupported billing/legal advice',
    patterns: [/do not|must not|requires review/i, /coding|legal|medical necessity|waiver|cost-share/i]
  }
];

function linesForCards(evidencePack) {
  const cards = evidencePack && evidencePack.citation_cards ? evidencePack.citation_cards : [];
  return cards.slice(0, 10).map(card => '- Citation card: ' + card.title + ' [' + card.verification_status + '] source family: ' + card.source_family);
}

function formatCitationCardLine(card) {
  const parts = [
    'source family: ' + (card.source_family || card.source_category || 'missing'),
    'authority: ' + (card.authority_level || 'missing'),
    'offline locator: ' + (card.offline_locator || 'missing'),
    'effective/review: ' + (card.effective_date || 'missing') + ' / ' + (card.last_verified || 'missing'),
    'owner: ' + (card.human_owner || 'missing')
  ];
  if (Array.isArray(card.required_fields)) parts.push('required fields: ' + card.required_fields.join(', '));
  if (Array.isArray(card.red_flags)) parts.push('red flags: ' + card.red_flags.join(', '));
  return '- Citation card: ' + card.title + ' [' + card.verification_status + '] ' + parts.join('; ');
}

function buildDenialSpikeGoldenArtifact(workup, options = {}) {
  const caseData = workup.case_data && workup.case_data.case_data ? stripProvenance(workup.case_data.case_data) : {};
  const evidencePack = options.evidencePack || workup.evidence_pack || {};
  const cards = evidencePack.citation_cards || [];
  const cardLines = cards.length
    ? cards.map(formatCitationCardLine)
    : linesForCards(evidencePack);
  const lines = [];

  lines.push('# Denial Spike Golden Artifact');
  lines.push('');
  lines.push('## Executive summary');
  lines.push('Denial rate increased from ' + (caseData.baseline_denial_rate || 'baseline missing') + ' to ' + (caseData.current_denial_rate || 'current rate missing') + ' for ' + (caseData.payer || 'payer missing') + '. Exposure is ' + (caseData.gross_charges_at_risk || 'gross charges missing') + '; expected allowed, patient responsibility, write-off, and recovery splits require local finance data before executive action.');
  lines.push('');
  lines.push('## Spike definition and normalization');
  lines.push('Timeframe: ' + (caseData.timeframe || 'missing timeframe') + '. Normalize by volume denominator, payer mix, case mix, remit lag, submission timing, claim count, and service-line mix before labeling the change as a true spike.');
  lines.push('');
  lines.push('## Exposure analysis');
  lines.push('Claim count: ' + (caseData.claim_count || 'missing claim count') + '. Gross charges at risk: ' + (caseData.gross_charges_at_risk || 'missing gross charges') + '. Separate gross charges, expected allowed, patient responsibility, contractual write-off, final write-off, and likely recovery where data supports it. Appeal deadline basis: ' + (caseData.appeal_deadline_basis || 'missing deadline basis') + '.');
  lines.push('');
  lines.push('## Segmentation');
  lines.push('Segment payer/product, CARC/RARC, service line, location, provider group, claim type, date of service, submission date, and remit date. Current synthetic service lines: ' + ((caseData.service_lines || []).join(', ') || 'missing service lines') + '.');
  lines.push('');
  lines.push('## Root-cause hypotheses');
  lines.push('CARC/RARC status: ' + (caseData.dominant_carc_rarc || 'missing; verify remit before appeal drafting') + '. Test authorization, eligibility/COB, coding/modifier, medical necessity, claim edit/build, timely filing, payer processing, and contract/policy dispute hypotheses.');
  lines.push('');
  lines.push('## Evidence pull list');
  lines.push('Pull 835/remit, 837 claim, claim status, clearinghouse edits, authorization logs, eligibility responses, coding notes, payer policies, contracts, and recent workflow/system changes. Available fixture evidence: ' + ((caseData.evidence_available || []).join(', ') || 'none') + '.');
  lines.push('');
  lines.push('## Citation and source support');
  lines.push('Evidence pack: ' + (evidencePack.title || 'Operator OS Denial Spike Evidence Pack') + '. Source-family-not-pinpoint and local-policy-required cards are lookup controls, not invented pinpoint citations.');
  lines.push(...cardLines);
  lines.push('');
  lines.push('## Appeal and escalation strategy');
  lines.push('Do not draft payer-specific appeal claims until the rule basis is verified from a citation card, payer policy, contract, denial letter, or local policy. Calculate appeal deadlines only from verified denial/remit/letter dates. Escalate coding, medical necessity, legal, waiver, cost-share, or kickback concerns to the assigned human owner.');
  lines.push('');
  lines.push('## Owner matrix');
  lines.push('Revenue Cycle Denials owns queue triage; Patient Access/Auth owns authorization and eligibility evidence; Coding/CDI owns coding and documentation review; Contracting/Payer Relations owns payer policy and contract disputes; Health IT/Data owns transaction extracts; Compliance/legal reviews regulated or high-risk issues.');
  lines.push('');
  lines.push('## Monitoring plan');
  lines.push('Track leading indicators daily, review cohort-normalized denial rate weekly, hold/release affected workflows when thresholds are met, and require prevention proof that new denials stopped rather than only a cleanup queue reduction.');
  lines.push('');
  lines.push('## Compliance guardrails');
  lines.push('Use no PHI by default, apply minimum necessary handling in approved environments, and require human review for payer-specific contracts, policy interpretation, appeals, legal/compliance, coding, billing, waiver, cost-share, and medical-necessity decisions.');

  return lines.join('\n');
}

function artifactText(markdownOrObject) {
  if (typeof markdownOrObject === 'string') return markdownOrObject;
  if (markdownOrObject && typeof markdownOrObject.markdown === 'string') return markdownOrObject.markdown;
  return JSON.stringify(markdownOrObject || {});
}

function containsPhiLikeText(text) {
  return [
    /\bMRN\s*[:#]?\s*\d{4,}\b/i,
    /\bDOB\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i,
    /\bSSN\s*[:#]?\s*\d{3}-\d{2}-\d{4}\b/i,
    /\bPatient\s+(Name|ID)\s*[:#]/i
  ].some(pattern => pattern.test(text));
}

function scoreDenialSpikeArtifact(markdownOrObject) {
  const text = artifactText(markdownOrObject);
  const dimensions = DENIAL_SPIKE_DIMENSIONS.map(dimension => {
    const missing = dimension.patterns.filter(pattern => !pattern.test(text));
    return {
      id: dimension.id,
      label: dimension.label,
      pass: missing.length === 0,
      missing: missing.map(pattern => String(pattern))
    };
  });
  const phiFailure = containsPhiLikeText(text);
  if (phiFailure) {
    dimensions.push({
      id: 'phi_like_content',
      label: 'No PHI-like sample content',
      pass: false,
      missing: ['PHI-like sample content detected']
    });
  }
  const passed = dimensions.filter(item => item.pass).length;
  return {
    pass: dimensions.every(item => item.pass),
    score: passed + '/' + dimensions.length,
    dimensions
  };
}

function assertDenialSpikeGoldenArtifact(markdownOrObject) {
  const result = scoreDenialSpikeArtifact(markdownOrObject);
  if (!result.pass) {
    const missing = result.dimensions.filter(item => !item.pass).map(item => item.id + ': ' + item.missing.join(', '));
    throw new Error('Denial Spike artifact failed golden checks: ' + missing.join('; '));
  }
  return true;
}

module.exports = {
  buildDenialSpikeGoldenArtifact,
  scoreDenialSpikeArtifact,
  assertDenialSpikeGoldenArtifact
};
