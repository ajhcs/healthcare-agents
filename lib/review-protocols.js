const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { validateReviewProtocolRegistryShape } = require('./review-contract-schemas');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'review-protocols', 'registry.json');
const REGISTRY_SCHEMA_VERSION = 'ushso.review-protocol-registry.v1';
const POSTURES = ['acquire', 'merge_affiliate', 'partner', 'compete', 'build_capacity', 'defer'];
const COMPETENCE_ROLES = [
  'cardiovascular_clinical_quality',
  'population_health_services_research',
  'operations_access_capacity_workforce',
  'healthcare_finance_capital',
  'health_economics_payer_competition',
  'transaction_regulatory_governance',
  'evidence_methods_measurement_biostatistics'
];

function canonicalJson(value) {
  if (value === null) return 'null';
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('canonical JSON rejects non-finite numbers');
  if (!['object', 'string', 'number', 'boolean'].includes(typeof value)) throw new Error('canonical JSON requires JSON values');
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return 'sha256:' + crypto.createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

function loadReviewProtocolRegistry() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const messages = validateReviewProtocolRegistry(registry);
  if (messages.length) throw new Error(messages.join('; '));
  return registry;
}

function validateReviewProtocolRegistry(registry) {
  const messages = [];
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) return ['registry must be an object'];
  messages.push(...validateReviewProtocolRegistryShape(registry));
  if (registry.schema_version !== REGISTRY_SCHEMA_VERSION) messages.push('unexpected registry schema_version');
  if (!/^\d+\.\d+\.\d+$/.test(registry.registry_version || '')) messages.push('registry_version must be semantic');
  if (!isCalendarDate(registry.effective_date)) messages.push('effective_date must be a valid calendar date');
  if (JSON.stringify(registry.posture_taxonomy) !== JSON.stringify(POSTURES)) messages.push('posture taxonomy must use the frozen six-posture order');
  if (!registry.shared_rules || registry.shared_rules.required_first_exposure !== 'independent_first') messages.push('independent-first exposure is required');
  if (!Array.isArray(registry.protocols) || registry.protocols.length !== COMPETENCE_ROLES.length) messages.push('registry must contain exactly seven competence protocols');
  const protocolIds = new Set();
  const roles = new Set();
  for (const protocol of registry.protocols || []) {
    if (!protocol.protocol_id || protocolIds.has(protocol.protocol_id)) messages.push('protocol_id must be present and unique');
    protocolIds.add(protocol.protocol_id);
    if (!COMPETENCE_ROLES.includes(protocol.competence_role) || roles.has(protocol.competence_role)) messages.push('competence_role must be one of seven unique roles');
    roles.add(protocol.competence_role);
    for (const field of ['criteria', 'falsification_habits', 'permitted_tools', 'prohibited_inferences', 'escalation_rules', 'candidate_agent_slugs']) {
      if (!Array.isArray(protocol[field]) || !protocol[field].length || protocol[field].some(item => typeof item !== 'string' || !item.trim())) messages.push(protocol.protocol_id + ': ' + field + ' must contain non-empty strings');
    }
    if (!protocol.required_human_competence) messages.push(protocol.protocol_id + ': required_human_competence is required');
  }
  for (const role of COMPETENCE_ROLES) if (!roles.has(role)) messages.push('missing competence role ' + role);
  return messages;
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function findReviewProtocol(protocolId, version) {
  const registry = loadReviewProtocolRegistry();
  const registryHash = sha256(registry);
  const protocol = registry.protocols.find(item => item.protocol_id === protocolId && item.version === version && item.status === 'active');
  if (!protocol) return null;
  return { ...protocol, protocol_hash: sha256(protocol), registry_hash: registryHash };
}

function reviewProtocolIndex() {
  const registry = loadReviewProtocolRegistry();
  return {
    schema_version: 'ushso.review-protocol-index.v1',
    registry_version: registry.registry_version,
    registry_hash: sha256(registry),
    posture_taxonomy: registry.posture_taxonomy,
    protocols: registry.protocols.map(protocol => ({
      protocol_id: protocol.protocol_id,
      version: protocol.version,
      status: protocol.status,
      competence_role: protocol.competence_role,
      title: protocol.title,
      protocol_hash: sha256(protocol),
      required_human_competence: protocol.required_human_competence,
      candidate_agent_slugs: protocol.candidate_agent_slugs
    }))
  };
}

module.exports = {
  COMPETENCE_ROLES,
  POSTURES,
  REGISTRY_PATH,
  REGISTRY_SCHEMA_VERSION,
  canonicalJson,
  findReviewProtocol,
  loadReviewProtocolRegistry,
  reviewProtocolIndex,
  sha256,
  validateReviewProtocolRegistry
};
