#!/usr/bin/env node
const { fail } = require('./_release-utils');
const { loadWorkflows } = require('../lib/workflows');
const {
  loadEvidencePackRegistry,
  validateEvidencePackFiles,
  validateEvidencePackRegistry
} = require('../lib/evidence-packs');

const registry = loadEvidencePackRegistry();
const messages = [
  ...validateEvidencePackFiles(),
  ...validateEvidencePackRegistry(registry, loadWorkflows())
];

fail(messages);
console.log('evidence packs ok: ' + registry.packs.length + ' pack(s)');
