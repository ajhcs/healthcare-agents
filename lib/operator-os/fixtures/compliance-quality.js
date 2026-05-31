const {
  PROVENANCE_TYPES,
  makeProvenance,
  labelObjectFields,
  assertAllFieldsProvenanced
} = require('../case-provenance');

function labelFixture(values, source, userSuppliedFields = []) {
  const synthetic = makeProvenance(PROVENANCE_TYPES.SYNTHETIC, source);
  const user = makeProvenance(PROVENANCE_TYPES.USER_SUPPLIED, 'cli.problem');
  const provenanceByField = Object.fromEntries(Object.keys(values).map(field => [field, synthetic]));
  for (const field of userSuppliedFields) provenanceByField[field] = user;
  const labeled = labelObjectFields(values, provenanceByField);
  assertAllFieldsProvenanced(labeled);
  return labeled;
}

function buildHipaaEvidenceBinderFixture(options = {}) {
  const prompt = String(options.prompt || '');
  const systemScope = /vendor|third party/i.test(prompt) ? 'vendor security review' : 'internal system review';
  const values = {
    system_scope: systemScope,
    review_window: 'current policy year',
    evidence_binder_status: 'partial binder assembled; owner sign-off missing',
    missing_controls: ['access review evidence', 'risk analysis update', 'BAA status confirmation'],
    no_secret_policy: 'fixture contains no credentials, endpoints, keys, screenshots, or PHI',
    source_documents_needed: ['policy repository index', 'risk register', 'vendor inventory', 'security training attestation'],
    escalation_owners: ['Compliance Officer', 'Privacy Officer', 'Security Owner', 'Vendor Manager'],
    corrective_action_tracking: 'local corrective-action tracker required for gaps'
  };
  return labelFixture(values, 'operator-os.synthetic.hipaa-evidence-binder.v1', /vendor|third party/i.test(prompt) ? ['system_scope'] : []);
}

module.exports = {
  buildHipaaEvidenceBinderFixture
};
