#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, fail, readJson } = require('./_release-utils');

const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const scorecard = readJson(path.join(ROOT, 'docs', 'eval', 'scorecard.json'));
const messages = [];

const agentCount = scorecard.agent_count || scorecard.agents.length;
const evaluated = scorecard.evaluated_agent_count ?? scorecard.agents.filter(agent => agent.latest_score != null).length;
const improved = scorecard.improved_agent_count ?? scorecard.agents.filter(agent => agent.status === 'improved').length;
const average = Number(scorecard.average_latest_score).toFixed(2);

function mustInclude(label, value) {
  if (!readme.includes(value)) messages.push(`README is missing ${label}: ${value}`);
}

mustInclude('agent count', String(agentCount));
mustInclude('evaluated count', `${evaluated}/${agentCount} evaluated`);
mustInclude('improved count', `${improved}/${agentCount} tracked improved`);
mustInclude('average latest score', average);

if (/51\s*\/\s*51\s+improved/i.test(readme) || /51%2F51%20improved/i.test(readme)) {
  messages.push('README still claims 51/51 improved without tracked universal eval evidence');
}
if (/95\.50/.test(readme)) {
  messages.push('README still contains stale 95.50 average score claim');
}

const statusSection = readme.match(/## Eval Status[\s\S]*?## Self-Improvement Kit/);
if (!statusSection) {
  messages.push('README is missing an Eval Status section before Self-Improvement Kit');
} else {
  for (const phrase of [
    'internal prompt-rubric results',
    'not certification',
    'remaining eval backlog',
    'eval/results.tsv'
  ]) {
    if (!statusSection[0].toLowerCase().includes(phrase.toLowerCase())) {
      messages.push(`README Eval Status section is missing required scope phrase: ${phrase}`);
    }
  }
}

fail(messages);
console.log(`scorecard claims ok: ${evaluated}/${agentCount} evaluated, ${improved} improved, avg ${average}`);
