#!/usr/bin/env node
const assert = require('assert');
const {
  loadEvidencePackRegistry,
  getEvidencePackForWorkflow,
  formatEvidencePackMarkdown,
  validateEvidencePackFileEnvelope,
  validateEvidencePackRegistry
} = require('../lib/evidence-packs');
const { loadWorkflows } = require('../lib/workflows');

const registry = loadEvidencePackRegistry();
assert.strictEqual(registry.schema_version, 'operator-os.evidence-packs.v1');
assert.ok(registry.packs.length >= 1);

const messages = validateEvidencePackRegistry(registry, loadWorkflows());
assert.deepStrictEqual(messages, []);

const denialSpike = getEvidencePackForWorkflow('denial-spike-workup');
assert.ok(denialSpike);
assert.strictEqual(denialSpike.status, 'active');
assert.strictEqual(denialSpike.offline_first, true);
assert.ok(denialSpike.citation_cards.some(card => /CARC\/RARC/.test(card.title)));

const markdown = formatEvidencePackMarkdown(denialSpike);
assert.match(markdown, /Operator OS Denial Spike Evidence Pack/);
assert.match(markdown, /Citation Cards/);
assert.match(markdown, /Source Limitations/);
assert.match(markdown, /835\/837\/remit evidence mapping/);

assert.strictEqual(getEvidencePackForWorkflow('unknown-workflow'), null);

const workflows = loadWorkflows();
function invalidMessages(mutator) {
  const cloned = JSON.parse(JSON.stringify(registry));
  mutator(cloned);
  return validateEvidencePackRegistry(cloned, workflows).join('\n');
}

assert.match(validateEvidencePackFileEnvelope({ schema_version: 'bad', packs: [] }, 'bad.json').join('\n'), /schema_version/);
assert.match(validateEvidencePackFileEnvelope({ schema_version: 'operator-os.evidence-packs.v1', packs: [], extra: true }, 'bad.json').join('\n'), /unexpected top-level property/);
assert.match(invalidMessages(cloned => { cloned.packs[0].status = 'experimental'; }), /invalid status/);
assert.match(invalidMessages(cloned => { cloned.packs[0].source_categories.push('unused_category'); }), /source category has no citation cards/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards[0].source_category = 'wrong_category'; }), /source_category not declared/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards[0].offline_locator = 'https://example.com/source'; }), /offline_locator/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards[0].citation_text = 'Patient email patient.test@example.com'; }), /PHI-like/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards = 'bad'; }), /citation_cards must be an array/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_url = 'https://example.com'; }), /unexpected pack property/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards[0].online_locator = 'https://example.com'; }), /unexpected card property/);
assert.match(invalidMessages(cloned => { cloned.packs[0].phi_policy = ' '; }), /phi_policy must be a non-empty string/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards[0].offline_locator = ' '; }), /offline_locator must be a non-empty string/);
assert.match(invalidMessages(cloned => { cloned.packs[0].citation_cards[0].required_fields = ['']; }), /required_fields must contain only non-empty strings/);

console.log('evidence pack regression ok: registry, lookup, markdown, unknown workflow');
