const {
  DATA_MODES,
  DEFAULT_DATA_MODE,
  normalizeDataMode
} = require('./data-modes');
const {
  summarizeProvenance
} = require('./case-provenance');
const { buildSyntheticDenialSpikeCase } = require('./denial-spike-synthetic');
const {
  buildCleanClaimRateFixture,
  buildUnderpaymentVarianceFixture,
  buildPriorAuthorizationAppealFixture
} = require('./fixtures/revenue-cycle');
const {
  buildHipaaEvidenceBinderFixture
} = require('./fixtures/compliance-quality');
const {
  buildInterfaceIncidentFixture,
  buildDashboardMetricFixture
} = require('./fixtures/operations-it');
const { getEvidencePackForWorkflow, summarizeEvidencePack } = require('../evidence-packs');

const SYNTHETIC_FIXTURE_BUILDERS = {
  'denial-spike-workup': {
    build: buildSyntheticDenialSpikeCase,
    summary: 'Deterministic synthetic Denial Spike case data attached.'
  },
  'clean-claim-rate-decline': {
    build: buildCleanClaimRateFixture,
    summary: 'Deterministic synthetic clean-claim trend fixture attached.'
  },
  'payer-contract-underpayment-review': {
    build: buildUnderpaymentVarianceFixture,
    summary: 'Deterministic synthetic underpayment variance fixture attached.'
  },
  'prior-authorization-appeal-workup': {
    build: buildPriorAuthorizationAppealFixture,
    summary: 'Deterministic synthetic prior-authorization appeal fixture attached.'
  },
  'hipaa-security-evidence-checklist': {
    build: buildHipaaEvidenceBinderFixture,
    summary: 'Deterministic synthetic HIPAA evidence-binder gap fixture attached.'
  },
  'hl7-fhir-interface-incident': {
    build: buildInterfaceIncidentFixture,
    summary: 'Deterministic synthetic interface incident fixture attached.'
  },
  'clinical-dashboard-specification': {
    build: buildDashboardMetricFixture,
    summary: 'Deterministic synthetic dashboard metric-definition fixture attached.'
  }
};

function unsupported(mode, reason) {
  return {
    mode,
    status: 'unsupported',
    case_data: null,
    summary: reason
  };
}

function createCaseDataProvider(options = {}) {
  const mode = normalizeDataMode(options.dataMode || options.mode || DEFAULT_DATA_MODE);
  const allowNetwork = Boolean(options.allowNetwork);
  const hasLocalInput = Boolean(options.localInput);

  return {
    mode,
    getCaseData(workflowId, prompt) {
      if (mode === DATA_MODES.PROMPT_ONLY) {
        return { mode, status: 'not_requested', case_data: null, summary: 'No case-data enrichment requested.' };
      }
      if (mode === DATA_MODES.PUBLIC_EVIDENCE) {
        const pack = getEvidencePackForWorkflow(workflowId);
        return {
          mode,
          status: pack ? 'ok' : 'not_available',
          case_data: null,
          evidence_pack: pack ? summarizeEvidencePack(pack) : null,
          summary: pack ? 'Offline evidence-pack metadata attached.' : 'No evidence pack is available for this workflow.'
        };
      }
      if (mode === DATA_MODES.SYNTHETIC_ONLY || mode === DATA_MODES.HYBRID_SYNTHETIC_PUBLIC) {
        const fixture = SYNTHETIC_FIXTURE_BUILDERS[workflowId];
        if (!fixture) {
          return unsupported(mode, 'Synthetic case data is not available for workflow: ' + workflowId);
        }
        const caseData = fixture.build({ prompt });
        const result = {
          mode,
          status: 'ok',
          case_data: caseData,
          provenance_summary: summarizeProvenance(caseData),
          summary: fixture.summary
        };
        if (mode === DATA_MODES.HYBRID_SYNTHETIC_PUBLIC) {
          const pack = getEvidencePackForWorkflow(workflowId);
          result.evidence_pack = pack ? summarizeEvidencePack(pack) : null;
        }
        return result;
      }
      if (mode === DATA_MODES.PUBLIC_SEARCH) {
        return allowNetwork
          ? unsupported(mode, 'public_search adapter is reserved for a future explicit refresh/search implementation.')
          : unsupported(mode, 'public_search is disabled by default and no network access is performed.');
      }
      if (mode === DATA_MODES.INTERNAL_PRIVATE) {
        return hasLocalInput
          ? unsupported(mode, 'internal_private local upload parsing is not implemented in this release.')
          : unsupported(mode, 'internal_private requires explicit local input and is disabled without it.');
      }
      return unsupported(mode, 'Unsupported data mode.');
    }
  };
}

function getCaseDataForWorkflow(workflowId, prompt, options = {}) {
  return createCaseDataProvider(options).getCaseData(workflowId, prompt);
}

function listSyntheticFixtureWorkflowIds() {
  return Object.keys(SYNTHETIC_FIXTURE_BUILDERS).sort();
}

function formatCaseDataMarkdown(caseData) {
  if (!caseData || !caseData.status || caseData.status === 'not_requested') return '';
  const lines = [];
  lines.push('## Case Data');
  lines.push('- Mode: ' + caseData.mode);
  lines.push('- Status: ' + caseData.status);
  lines.push('- Summary: ' + caseData.summary);
  if (caseData.case_data) {
    for (const [field, item] of Object.entries(caseData.case_data)) {
      const value = item && Object.prototype.hasOwnProperty.call(item, 'value') ? item.value : item;
      const provenance = item && item.provenance ? item.provenance : { type: 'missing', source: 'missing' };
      lines.push('- ' + field + ': ' + (Array.isArray(value) ? value.join('; ') : value) + ' [provenance: ' + provenance.type + '; source: ' + provenance.source + ']');
    }
    if (caseData.provenance_summary) {
      lines.push('- Provenance: ' + Object.entries(caseData.provenance_summary.counts).map(([type, count]) => type + '=' + count).join(', '));
    }
  }
  if (caseData.evidence_pack) {
    lines.push('- Evidence pack: ' + caseData.evidence_pack.title + ' v' + caseData.evidence_pack.version);
  }
  return lines.join('\n');
}

module.exports = {
  createCaseDataProvider,
  getCaseDataForWorkflow,
  formatCaseDataMarkdown,
  listSyntheticFixtureWorkflowIds
};
