const {
  PROVENANCE_TYPES,
  makeProvenance,
  labelObjectFields,
  assertAllFieldsProvenanced
} = require('../case-provenance');

function promptIncludes(prompt, pattern) {
  return pattern.test(String(prompt || ''));
}

function labelFixture(values, syntheticSource, userSuppliedFields = []) {
  const synthetic = makeProvenance(PROVENANCE_TYPES.SYNTHETIC, syntheticSource);
  const user = makeProvenance(PROVENANCE_TYPES.USER_SUPPLIED, 'cli.problem');
  const provenanceByField = Object.fromEntries(Object.keys(values).map(field => [field, synthetic]));
  for (const field of userSuppliedFields) provenanceByField[field] = user;
  const labeled = labelObjectFields(values, provenanceByField);
  assertAllFieldsProvenanced(labeled);
  return labeled;
}

function buildCleanClaimRateFixture(options = {}) {
  const prompt = String(options.prompt || '');
  const payer = promptIncludes(prompt, /medicare advantage/i) ? 'Medicare Advantage payer' : 'Commercial payer mix';
  const values = {
    payer,
    timeframe: 'current 10 business days compared with prior 6-week baseline',
    baseline_clean_claim_rate: '94.1%',
    current_clean_claim_rate: '86.7%',
    affected_claim_types: ['professional claims', 'outpatient facility claims'],
    clearinghouse_edit_themes: ['subscriber identifier mismatch', 'missing modifier', 'diagnosis pointer edit'],
    volume_denominator: 'submitted claims by payer/product and claim type',
    gross_charges_delayed: '$310,000 gross charges delayed from first-pass acceptance',
    expected_allowed_amount_status: 'expected allowed and net reimbursement estimate required before recoverability or cash impact claims',
    cash_timing_caveat: 'gross charges are not collectible recovery; quantify allowed amount, payer liability, patient responsibility, and AR aging before finance action',
    evidence_available: ['claim scrubber edit report', '837 submission batch log', 'billing-system rejection workqueue', 'coding edit notes'],
    recommended_owners: ['Revenue Cycle Billing', 'Coding Compliance', 'Patient Access', 'Health IT/Data']
  };
  return labelFixture(values, 'operator-os.synthetic.clean-claim-rate.v1', promptIncludes(prompt, /medicare advantage|commercial/i) ? ['payer'] : []);
}

function buildUnderpaymentVarianceFixture(options = {}) {
  const prompt = String(options.prompt || '');
  const payer = promptIncludes(prompt, /medicare advantage/i) ? 'Medicare Advantage payer' : 'Commercial payer';
  const values = {
    payer,
    contract_reference_status: 'local contract exhibit lookup required',
    variance_window: 'last closed accounting month compared with contract model',
    expected_allowed_amount: '$184,500',
    actual_allowed_amount: '$151,200',
    variance_amount: '$33,300',
    affected_services: ['imaging', 'outpatient surgery'],
    dispute_deadline_basis: 'contract dispute window or payer correspondence date required',
    evidence_available: ['835 remit sample', 'contract exhibit lookup path', 'expected payment model', 'payer correspondence tracker'],
    recommended_owners: ['Revenue Contracting', 'Revenue Finance', 'Payer Relations', 'Legal/Compliance']
  };
  return labelFixture(values, 'operator-os.synthetic.underpayment-variance.v1', promptIncludes(prompt, /medicare advantage|commercial/i) ? ['payer'] : []);
}

function buildPriorAuthorizationAppealFixture(options = {}) {
  const prompt = String(options.prompt || '');
  const payer = promptIncludes(prompt, /medicare advantage/i) ? 'Medicare Advantage payer' : 'Commercial payer';
  const values = {
    payer,
    product_or_plan: promptIncludes(prompt, /medicare advantage/i) ? 'MA plan' : 'commercial plan',
    service_or_item: promptIncludes(prompt, /imaging/i) ? 'imaging service' : 'requested service or item from prompt context',
    denial_notice_status: 'local denial notice or payer correspondence date required',
    policy_lookup_path: 'payer policy, provider manual, or coverage criteria lookup required',
    appeal_deadline_basis: 'calculate only from verified denial notice, remit, contract, or provider-manual date fields',
    authorization_evidence: ['authorization tracker', 'eligibility response', 'payer portal decision artifact lookup path'],
    documentation_checklist: ['order or referral support', 'clinical documentation owner review', 'non-clinical appeal packet checklist'],
    licensed_review_owner: 'clinical reviewer or ordering-provider owner required for medical-necessity content',
    recommended_owners: ['Prior Authorization Lead', 'Appeals Manager', 'Clinical Reviewer', 'Compliance Officer']
  };
  return labelFixture(values, 'operator-os.synthetic.prior-authorization-appeal.v1', promptIncludes(prompt, /medicare advantage|commercial|imaging/i) ? ['payer', 'product_or_plan', 'service_or_item'] : []);
}

module.exports = {
  buildCleanClaimRateFixture,
  buildUnderpaymentVarianceFixture,
  buildPriorAuthorizationAppealFixture
};
