#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, fail, readJson } = require('./_release-utils');

const manifest = readJson(path.join(ROOT, 'docs', 'release-manifest.json'));
const canaries = readJson(path.join(ROOT, 'docs', 'eval', 'canary-suite.json'));
const registry = readJson(path.join(ROOT, 'agents', 'registry.json'));
const messages = [];
const requiredClaimIds = [
  'agent-inventory',
  'runtime-installs',
  'cli-discovery-routing',
  'eval-status',
  'safety-boundaries',
  'source-freshness',
  'packaging',
  'canary-suite',
  'release-readiness',
  'public-artifacts',
  'tracker-coverage'
];
const claimIds = new Set((manifest.claims || []).map(claim => claim.id));
for (const id of requiredClaimIds) if (!claimIds.has(id)) messages.push(`release manifest missing claim: ${id}`);

for (const claim of manifest.claims || []) {
  for (const field of ['claim', 'evidence', 'commands', 'artifacts', 'beads']) {
    if (!claim[field] || (Array.isArray(claim[field]) && claim[field].length === 0)) messages.push(`${claim.id} missing ${field}`);
  }
  for (const artifact of claim.artifacts || []) {
    if (artifact.includes('*') || artifact.includes('#')) continue;
    if (!fs.existsSync(path.join(ROOT, artifact))) messages.push(`${claim.id} artifact does not exist: ${artifact}`);
  }
  for (const bead of claim.beads || []) {
    if (!/^beads-(?:i70(?:\.\d+)?|aw6|5y2)$/.test(bead)) messages.push(`${claim.id} has unexpected bead id: ${bead}`);
  }
}

const domains = new Set(registry.agents.map(agent => agent.domain));
const modes = new Set(Object.keys(registry.output_modes));
const canaryDomains = new Set((canaries.scenarios || []).map(scenario => scenario.domain));
const canaryModes = new Set((canaries.scenarios || []).map(scenario => scenario.output_mode));
for (const domain of domains) {
  if (!canaryDomains.has(domain)) messages.push(`canary suite missing domain: ${domain}`);
}
for (const mode of modes) {
  if (!canaryModes.has(mode)) messages.push(`canary suite missing output mode: ${mode}`);
}
for (const scenario of canaries.scenarios || []) {
  for (const field of ['id', 'domain', 'primary_agent', 'output_mode', 'prompt', 'expected_deliverable_elements', 'forbidden_overreach', 'required_handoffs', 'human_owner_safety_criteria']) {
    if (!scenario[field] || (Array.isArray(scenario[field]) && scenario[field].length === 0)) messages.push(`${scenario.id || 'canary'} missing ${field}`);
  }
}

fail(messages);
console.log(`release manifest ok: ${manifest.claims.length} claims, ${canaries.scenarios.length} canaries`);
