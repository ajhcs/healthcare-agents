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

function buildInterfaceIncidentFixture(options = {}) {
  const prompt = String(options.prompt || '');
  const interfaceType = /fhir/i.test(prompt) ? 'FHIR API workflow' : 'HL7v2 interface';
  const values = {
    interface_type: interfaceType,
    incident_window: 'current 4-hour monitoring window compared with prior 7-day baseline',
    affected_messages: ['ADT A08 updates', 'ORM order messages'],
    error_pattern: 'ACK delay and mapping validation failures in synthetic log summary',
    no_secret_policy: 'fixture contains no endpoints, credentials, tokens, IPs, or patient identifiers',
    evidence_available: ['interface engine error summary', 'change ticket', 'message-count dashboard', 'rollback owner map'],
    change_control_status: 'production change requires approved change ticket and rollback owner',
    recommended_owners: ['Interface Engineer', 'Application Owner', 'IT Change Manager', 'Privacy/Security Officer']
  };
  return labelFixture(values, 'operator-os.synthetic.interface-incident.v1', /fhir|hl7/i.test(prompt) ? ['interface_type'] : []);
}

function buildDashboardMetricFixture(options = {}) {
  const prompt = String(options.prompt || '');
  const dashboardDomain = /quality/i.test(prompt) ? 'quality dashboard' : 'clinical operations dashboard';
  const values = {
    dashboard_domain: dashboardDomain,
    metric_definition_status: 'metric definitions drafted; validation owner required',
    candidate_metrics: ['denominator population', 'numerator event count', 'refresh latency', 'data completeness'],
    data_sources: ['EHR reporting view', 'claims extract', 'manual validation sample'],
    lineage_requirements: ['source table/view', 'transformation owner', 'refresh cadence', 'validation sign-off'],
    privacy_boundary: 'use aggregate metrics and governed access for any patient-level drilldown',
    recommended_owners: ['Clinical Data Analyst', 'Operational Owner', 'Quality or Finance Owner', 'Privacy Officer']
  };
  return labelFixture(values, 'operator-os.synthetic.dashboard-metric.v1', /quality/i.test(prompt) ? ['dashboard_domain'] : []);
}

module.exports = {
  buildInterfaceIncidentFixture,
  buildDashboardMetricFixture
};
