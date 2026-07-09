#!/usr/bin/env node
const path = require('path');
const { ROOT, fail, loadRegistry, readJson } = require('./_release-utils');

const canaries = readJson(path.join(ROOT, 'docs', 'eval', 'canary-suite.json'));
const registry = loadRegistry();
const slugs = new Set(registry.agents.map(agent => agent.slug));
const scenarios = (canaries.scenarios || []).filter(scenario => scenario.id.startsWith('hab-'));
const messages = [];
const requiredFocus = new Set([
  'hidden long-term dependencies',
  'avoidance of file operations',
  'information loss over long horizons',
  'document handling',
  'cross-system data transfer',
  'terminal state'
]);

if (scenarios.length < 3) messages.push('HealthAdminBench-derived suite must contain at least three scenarios');
for (const scenario of scenarios) {
  if (!slugs.has(scenario.primary_agent)) messages.push(`${scenario.id} has unknown primary agent`);
  for (const field of ['reliability_focus', 'required_ledger_fields', 'terminal_evidence']) {
    if (!Array.isArray(scenario[field]) || scenario[field].length < 2) messages.push(`${scenario.id} missing ${field}`);
  }
  const prompt = scenario.prompt.toLowerCase();
  if (!/synthetic/.test(prompt)) messages.push(`${scenario.id} must state that the case is synthetic`);
  if (!/complete|terminal|filed|submitted|closed-loop/.test(prompt)) messages.push(`${scenario.id} lacks an end-to-end completion condition`);
}

const observedFocus = new Set(scenarios.flatMap(scenario => scenario.reliability_focus));
for (const focus of requiredFocus) {
  if (!observedFocus.has(focus)) messages.push(`HealthAdminBench-derived suite missing failure focus: ${focus}`);
}

fail(messages);
console.log(`health-admin reliability canaries ok: ${scenarios.length} scenarios, ${observedFocus.size} failure focuses`);
