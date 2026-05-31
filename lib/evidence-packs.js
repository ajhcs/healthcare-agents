const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EVIDENCE_PACKS_DIR = path.join(ROOT, 'workflows', 'evidence-packs');
const SCHEMA_VERSION = 'operator-os.evidence-packs.v1';
const VALID_CARD_STATUSES = new Set([
  'verified-pinpoint',
  'source-family-not-pinpoint',
  'local-policy-required',
  'expired-review'
]);
const VALID_PACK_STATUSES = new Set(['active', 'draft', 'retired']);
const PACK_FIELDS = [
  'id', 'workflow_id', 'exemplar', 'version', 'status', 'title', 'last_reviewed',
  'offline_first', 'phi_policy', 'source_categories', 'citation_cards',
  'required_evidence', 'failure_modes', 'test_prompts'
];
const CARD_FIELDS = [
  'id', 'title', 'source_category', 'source_family', 'authority_level', 'citation_text',
  'last_verified', 'effective_date', 'offline_locator', 'required_fields',
  'applies_to_sections', 'human_owner', 'verification_status', 'red_flags'
];
const REQUIRED_DENIAL_SPIKE_COVERAGE = [
  /carc|rarc|reason-code/i,
  /payer policy|contract lookup/i,
  /appeal deadline/i,
  /ar exposure|denial kpi/i,
  /phi|minimum necessary/i,
  /835|837|remit/i,
  /authorization|eligibility/i,
  /coding|cdi/i,
  /contracting|payer-relations/i,
  /monitoring|prevention/i
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeTitle(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function slugLike(value) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(value || ''));
}

function dateLike(value) {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(value || ''));
}

function semverLike(value) {
  return /^[0-9]+\.[0-9]+\.[0-9]+$/.test(String(value || ''));
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateStringArray(value, label, messages) {
  if (!Array.isArray(value)) {
    messages.push(label + ' must be an array');
    return;
  }
  if (!value.length) messages.push(label + ' must not be empty');
  for (const item of value) {
    if (!nonEmptyString(item)) messages.push(label + ' must contain only non-empty strings');
  }
}

function evidencePackFiles() {
  if (!fs.existsSync(EVIDENCE_PACKS_DIR)) return [];
  return fs.readdirSync(EVIDENCE_PACKS_DIR)
    .filter(file => file.endsWith('.json') && file !== 'schema.json')
    .sort()
    .map(file => path.join(EVIDENCE_PACKS_DIR, file));
}

function loadEvidencePackFiles() {
  return evidencePackFiles().map(file => ({ file, registry: readJson(file) }));
}

function loadEvidencePackRegistry() {
  const registry = { schema_version: SCHEMA_VERSION, packs: [] };
  for (const { registry: parsed } of loadEvidencePackFiles()) {
    if (Array.isArray(parsed.packs)) registry.packs.push(...parsed.packs);
  }
  return registry;
}

function listEvidencePacks(options = {}) {
  const packs = loadEvidencePackRegistry().packs.slice();
  const includeRetired = Boolean(options.includeRetired);
  return packs
    .filter(pack => includeRetired || pack.status !== 'retired')
    .sort((a, b) => a.workflow_id.localeCompare(b.workflow_id) || a.id.localeCompare(b.id));
}

function getEvidencePackForWorkflow(workflowId, options = {}) {
  const includeDraft = Boolean(options.includeDraft);
  const packs = listEvidencePacks({ includeRetired: options.includeRetired });
  return packs.find(pack => {
    if (pack.workflow_id !== workflowId && pack.id !== workflowId) return false;
    if (pack.status === 'active') return true;
    return includeDraft && pack.status === 'draft';
  }) || null;
}

function summarizeEvidencePack(pack) {
  if (!pack) return null;
  const cardsByCategory = {};
  for (const card of pack.citation_cards || []) {
    if (!cardsByCategory[card.source_category]) cardsByCategory[card.source_category] = [];
    cardsByCategory[card.source_category].push({
      id: card.id,
      title: card.title,
      verification_status: card.verification_status,
      source_family: card.source_family,
      human_owner: card.human_owner
    });
  }
  return {
    id: pack.id,
    workflow_id: pack.workflow_id,
    title: pack.title,
    version: pack.version,
    status: pack.status,
    last_reviewed: pack.last_reviewed,
    offline_first: pack.offline_first,
    phi_policy: pack.phi_policy,
    source_categories: pack.source_categories,
    citation_cards: pack.citation_cards.map(card => ({
      id: card.id,
      title: card.title,
      source_category: card.source_category,
      source_family: card.source_family,
      authority_level: card.authority_level,
      verification_status: card.verification_status,
      effective_date: card.effective_date,
      last_verified: card.last_verified,
      offline_locator: card.offline_locator,
      required_fields: card.required_fields,
      human_owner: card.human_owner,
      red_flags: card.red_flags
    })),
    cards_by_category: cardsByCategory,
    limitations: pack.citation_cards
      .filter(card => card.verification_status !== 'verified-pinpoint')
      .map(card => card.title + ': ' + card.verification_status)
  };
}

function formatEvidencePackMarkdown(pack) {
  const summary = summarizeEvidencePack(pack);
  if (!summary) return '';
  const lines = [];
  lines.push('# ' + summary.title);
  lines.push('');
  lines.push('Workflow: ' + summary.workflow_id);
  lines.push('Version: ' + summary.version);
  lines.push('Status: ' + summary.status);
  lines.push('Last reviewed: ' + summary.last_reviewed);
  lines.push('Offline-first: ' + (summary.offline_first ? 'yes' : 'no'));
  lines.push('');
  lines.push('## Citation Cards');
  for (const category of summary.source_categories) {
    const cards = summary.cards_by_category[category] || [];
    if (!cards.length) continue;
    lines.push('### ' + category);
    for (const card of cards) {
      lines.push('- ' + card.title + ' (' + card.verification_status + '; owner: ' + card.human_owner + ')');
      lines.push('  Source family: ' + card.source_family);
    }
  }
  if (summary.limitations.length) {
    lines.push('');
    lines.push('## Source Limitations');
    lines.push('Cards marked source-family-not-pinpoint or local-policy-required identify lookup paths and required owners, not verified pinpoint citations.');
    for (const item of summary.limitations) lines.push('- ' + item);
  }
  lines.push('');
  lines.push('## PHI Policy');
  lines.push(summary.phi_policy);
  return lines.join('\n');
}

function flattenText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(flattenText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flattenText).join(' ');
  return String(value);
}

function hasPhiLikeSample(value) {
  const text = flattenText(value);
  return [
    /\bMRN\s*[:#]?\s*\d{4,}\b/i,
    /\bDOB\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i,
    /\bSSN\s*[:#]?\s*\d{3}-\d{2}-\d{4}\b/i,
    /\bPatient\s+(Name|ID)\s*[:#]/i,
    /\bpatient[._-]?[a-z0-9]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/,
    /\b\d{3,6}\s+[A-Z][A-Za-z0-9 .'-]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/,
    /\b(?:MBI|Medicare Beneficiary Identifier)\s*[:#]?\s*[A-Z0-9-]{8,}\b/i,
    /\b(?:account|acct)\s*(?:number|no\.?|#|id)\s*[:#]?\s*[A-Z0-9-]{5,}\b/i,
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+MRN\b/
  ].some(pattern => pattern.test(text));
}

function validateEvidencePackFileEnvelope(parsed, file = '<memory>') {
  const messages = [];
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return [file + ': evidence pack file must be a JSON object'];
  }
  const allowed = new Set(['schema_version', 'packs']);
  for (const key of Object.keys(parsed)) {
    if (!allowed.has(key)) messages.push(file + ': unexpected top-level property ' + key);
  }
  if (parsed.schema_version !== SCHEMA_VERSION) {
    messages.push(file + ': schema_version must be ' + SCHEMA_VERSION);
  }
  if (!Array.isArray(parsed.packs)) {
    messages.push(file + ': packs must be an array');
  }
  return messages;
}

function validateEvidencePackFiles(files = loadEvidencePackFiles()) {
  return files.flatMap(item => validateEvidencePackFileEnvelope(item.registry, item.file));
}

function validateRequiredFields(pack, messages) {
  for (const field of PACK_FIELDS) {
    if (pack[field] == null || (Array.isArray(pack[field]) && pack[field].length === 0)) {
      messages.push((pack.id || '<unknown>') + ': missing required pack field ' + field);
    }
  }
  for (const field of ['id', 'workflow_id', 'version', 'status', 'title', 'last_reviewed', 'phi_policy']) {
    if (pack[field] != null && !nonEmptyString(pack[field])) messages.push((pack.id || '<unknown>') + ': ' + field + ' must be a non-empty string');
  }
  for (const card of pack.citation_cards || []) {
    for (const field of CARD_FIELDS) {
      if (card[field] == null || (Array.isArray(card[field]) && card[field].length === 0)) {
        messages.push((pack.id || '<unknown>') + '/' + (card.id || '<unknown>') + ': missing required card field ' + field);
      }
    }
    for (const field of ['id', 'title', 'source_category', 'source_family', 'authority_level', 'citation_text', 'last_verified', 'effective_date', 'offline_locator', 'human_owner', 'verification_status']) {
      if (card[field] != null && !nonEmptyString(card[field])) {
        messages.push((pack.id || '<unknown>') + '/' + (card.id || '<unknown>') + ': ' + field + ' must be a non-empty string');
      }
    }
  }
}

function validateEvidencePackRegistry(registry = loadEvidencePackRegistry(), workflows = []) {
  const messages = [];
  const workflowById = new Map(workflows.map(workflow => [workflow.id, workflow]));
  const packIds = new Set();

  if (registry.schema_version !== SCHEMA_VERSION) {
    messages.push('evidence pack registry schema_version must be ' + SCHEMA_VERSION);
  }
  if (!Array.isArray(registry.packs)) {
    messages.push('evidence pack registry must include packs array');
    return messages;
  }

  for (const pack of registry.packs) {
    if (!pack || typeof pack !== 'object' || Array.isArray(pack)) {
      messages.push('evidence pack entries must be objects');
      continue;
    }
    for (const key of Object.keys(pack)) {
      if (!PACK_FIELDS.includes(key)) messages.push((pack.id || '<unknown>') + ': unexpected pack property ' + key);
    }
    validateRequiredFields(pack, messages);
    if (!slugLike(pack.id)) messages.push((pack.id || '<unknown>') + ': pack id must be slug-like');
    if (packIds.has(pack.id)) messages.push(pack.id + ': duplicate pack id');
    packIds.add(pack.id);
    if (!workflowById.has(pack.workflow_id)) messages.push(pack.id + ': unknown workflow_id ' + pack.workflow_id);
    if (!semverLike(pack.version)) messages.push(pack.id + ': version must be semver');
    if (!dateLike(pack.last_reviewed)) messages.push(pack.id + ': last_reviewed must be YYYY-MM-DD');
    if (!VALID_PACK_STATUSES.has(pack.status)) messages.push(pack.id + ': invalid status');
    if (typeof pack.exemplar !== 'boolean') messages.push(pack.id + ': exemplar must be boolean');
    if (typeof pack.offline_first !== 'boolean') messages.push(pack.id + ': offline_first must be boolean');
    if (pack.status === 'active' && pack.offline_first !== true) messages.push(pack.id + ': active packs must be offline_first');
    if (hasPhiLikeSample(pack)) messages.push(pack.id + ': PHI-like sample value detected');
    validateStringArray(pack.source_categories, pack.id + ': source_categories', messages);
    if (!Array.isArray(pack.citation_cards)) messages.push(pack.id + ': citation_cards must be an array');
    validateStringArray(pack.required_evidence, pack.id + ': required_evidence', messages);
    validateStringArray(pack.failure_modes, pack.id + ': failure_modes', messages);
    validateStringArray(pack.test_prompts, pack.id + ': test_prompts', messages);

    const categories = new Set(Array.isArray(pack.source_categories) ? pack.source_categories : []);
    const cardIds = new Set();
    const usedCategories = new Set();
    const workflow = workflowById.get(pack.workflow_id);
    const validSections = new Set((workflow ? workflow.artifact_sections : []).flatMap(section => [section, normalizeTitle(section)]));

    for (const card of Array.isArray(pack.citation_cards) ? pack.citation_cards : []) {
      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        messages.push(pack.id + ': citation_cards entries must be objects');
        continue;
      }
      for (const key of Object.keys(card)) {
        if (!CARD_FIELDS.includes(key)) messages.push(pack.id + '/' + (card.id || '<unknown>') + ': unexpected card property ' + key);
      }
      if (!slugLike(card.id)) messages.push(pack.id + '/' + (card.id || '<unknown>') + ': card id must be slug-like');
      if (cardIds.has(card.id)) messages.push(pack.id + '/' + card.id + ': duplicate card id');
      cardIds.add(card.id);
      if (!categories.has(card.source_category)) messages.push(pack.id + '/' + card.id + ': source_category not declared in source_categories');
      usedCategories.add(card.source_category);
      if (!dateLike(card.last_verified)) messages.push(pack.id + '/' + card.id + ': last_verified must be YYYY-MM-DD');
      if (!dateLike(card.effective_date) && !['local-policy-required', 'varies-by-payer', 'varies-by-contract'].includes(card.effective_date)) {
        messages.push(pack.id + '/' + card.id + ': effective_date must be YYYY-MM-DD or an approved variable marker');
      }
      if (!VALID_CARD_STATUSES.has(card.verification_status)) messages.push(pack.id + '/' + card.id + ': invalid verification_status');
      if (pack.status === 'active' && card.verification_status === 'expired-review') {
        messages.push(pack.id + '/' + card.id + ': active packs cannot include expired-review cards');
      }
      if (pack.offline_first && /^https?:\/\//i.test(String(card.offline_locator || ''))) {
        messages.push(pack.id + '/' + card.id + ': offline_first packs cannot use live URLs as offline_locator');
      }
      validateStringArray(card.required_fields, pack.id + '/' + card.id + ': required_fields', messages);
      validateStringArray(card.applies_to_sections, pack.id + '/' + card.id + ': applies_to_sections', messages);
      validateStringArray(card.red_flags, pack.id + '/' + card.id + ': red_flags', messages);
      for (const section of Array.isArray(card.applies_to_sections) ? card.applies_to_sections : []) {
        if (!validSections.has(section) && !validSections.has(normalizeTitle(section))) {
          messages.push(pack.id + '/' + card.id + ': applies_to_sections entry does not match workflow artifact section: ' + section);
        }
      }
    }
    for (const category of categories) {
      if (!usedCategories.has(category)) messages.push(pack.id + ': source category has no citation cards: ' + category);
    }

    if (pack.workflow_id === 'denial-spike-workup') {
      const coverageText = (Array.isArray(pack.citation_cards) ? pack.citation_cards : []).map(card => card.id + ' ' + card.title).join('\n');
      for (const pattern of REQUIRED_DENIAL_SPIKE_COVERAGE) {
        if (!pattern.test(coverageText)) messages.push(pack.id + ': missing required Denial Spike card coverage matching ' + pattern);
      }
    }
  }
  return messages;
}

module.exports = {
  EVIDENCE_PACKS_DIR,
  SCHEMA_VERSION,
  loadEvidencePackRegistry,
  loadEvidencePackFiles,
  listEvidencePacks,
  getEvidencePackForWorkflow,
  summarizeEvidencePack,
  formatEvidencePackMarkdown,
  validateEvidencePackFileEnvelope,
  validateEvidencePackFiles,
  validateEvidencePackRegistry
};
