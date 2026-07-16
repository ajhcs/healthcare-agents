#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { fail } = require('./_release-utils');
const {
  loadReviewProtocolRegistry,
  reviewProtocolIndex,
  sha256,
  validateReviewProtocolRegistry
} = require('../lib/review-protocols');
const {
  evaluateStrategicReview,
  validateReviewRequest,
  validateStrategicReview
} = require('../lib/strategic-review');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'review-protocols', 'registry.json');
const INDEX_PATH = path.join(ROOT, 'review-protocols', 'index.json');
const FIXTURE_PATH = path.join(ROOT, 'review-protocols', 'fixtures', 'evidence-methods-review-request.json');
const AGENT_REGISTRY_PATH = path.join(ROOT, 'agents', 'registry.json');
const SCHEMA_EXPECTATIONS = [
  ['schema.json', 'ushso.review-protocol-registry.v1'],
  ['contracts/review-request.v1.schema.json', 'ushso.review-request.v1'],
  ['contracts/strategic-review.v1.schema.json', 'ushso.strategic-review.v1'],
  ['contracts/ai-conflict-analysis-request.v1.schema.json', 'ushso.ai-conflict-analysis-request.v1'],
  ['contracts/ai-conflict-analysis.v1.schema.json', 'ushso.ai-conflict-analysis.v1']
];

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
const agentSlugs = new Set(JSON.parse(fs.readFileSync(AGENT_REGISTRY_PATH, 'utf8')).agents.map(agent => agent.slug));
const messages = [
  ...validateReviewProtocolRegistry(registry),
  ...validateReviewRequest(fixture)
];
for (const protocol of registry.protocols || []) {
  for (const slug of protocol.candidate_agent_slugs || []) if (!agentSlugs.has(slug)) messages.push(protocol.protocol_id + ': unknown candidate agent slug ' + slug);
}
for (const [relativePath, version] of SCHEMA_EXPECTATIONS) {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'review-protocols', relativePath), 'utf8'));
  if (!schema.properties || !schema.properties.schema_version || schema.properties.schema_version.const !== version) messages.push(relativePath + ': schema_version const must be ' + version);
}
if (!messages.length) messages.push(...validateStrategicReview(evaluateStrategicReview(fixture)));
const expectedIndex = JSON.stringify(reviewProtocolIndex(), null, 2) + '\n';
if (!fs.existsSync(INDEX_PATH) || fs.readFileSync(INDEX_PATH, 'utf8') !== expectedIndex) messages.push('review-protocols/index.json is stale; run node scripts/generate-review-protocol-index.js');

fail(messages);
const loaded = loadReviewProtocolRegistry();
console.log('review protocols ok: ' + loaded.protocols.length + ' protocol(s), registry ' + sha256(loaded));
