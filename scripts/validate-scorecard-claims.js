#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson } = require('./_release-utils');

const HISTORY_PATH = 'docs/eval/historical-prompt-evaluation.md';

// The evidence destination remains mandatory. Moving prose must not erase a gate
// or allow a misleading README claim beside an otherwise accurate history page.
function validateClaims({ readme, history, scorecard }) {
  const failures = [];
  const count = scorecard.agent_count || scorecard.agents.length;
  const evaluated = scorecard.evaluated_agent_count ?? scorecard.agents.filter(agent => agent.latest_score != null).length;
  const improved = scorecard.improved_agent_count ?? scorecard.agents.filter(agent => agent.status === 'improved').length;
  const average = Number(scorecard.average_latest_score).toFixed(2);
  const link = /\[[^\]\n]+\]\(docs\/eval\/historical-prompt-evaluation\.md(?:#(?:historical-prompt-evaluation|eval-status|self-improvement-kit))?\)/;
  const visibleReadme = readme.replace(/<!--[\s\S]*?-->/g, '').replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
  if (!link.test(visibleReadme)) failures.push('README must link to ' + HISTORY_PATH);
  if (typeof history !== 'string' || !history.trim()) {
    failures.push('Missing or empty historical evaluation destination: ' + HISTORY_PATH);
    return failures;
  }
  for (const [label, value] of [
    ['agent count', String(count)],
    ['evaluated count', `${evaluated}/${count} evaluated`],
    ['improved count', `${improved}/${count} tracked improved`],
    ['average latest score', average]
  ]) {
    if (!history.includes(value)) failures.push(`History is missing ${label}: ${value}`);
  }
  for (const [label, document] of [['README', readme], ['History', history]]) {
    if (/51\s*\/\s*51\s+improved/i.test(document) || /51%2F51%20improved/i.test(document)) {
      failures.push(label + ' still claims 51/51 improved without tracked universal eval evidence');
    }
    if (/95\.50/.test(document)) failures.push(label + ' still contains stale 95.50 average score claim');
    const plain = document.replace(/[*_`]/g, '');
    if (/\b(?:results?|scores?|agents?|workflows?)\s+(?:are|is)\s+(?:clinically\s+)?certified\b/i.test(plain) || /\b(?:results?|scores?)\s+(?:provide|prove|establish|demonstrate)\s+(?:clinical\s+)?certification\b/i.test(plain)) {
      failures.push(label + ' contains an unsupported certification claim');
    }
    for (const match of plain.matchAll(/\b(\d+)\s*\/\s*(\d+)\s+(evaluated|tracked improved)\b/gi)) {
      const expected = match[3].toLowerCase() === 'evaluated' ? evaluated : improved;
      if (Number(match[1]) !== expected || Number(match[2]) !== count) failures.push(label + ' contains an inconsistent ' + match[3] + ' count');
    }
    for (const match of plain.matchAll(/\b(?:average(?:\s+(?:latest|prompt-rubric|rubric|score))*|avg(?:\s+score)?)\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)/gi)) {
      if (Number(match[1]).toFixed(2) !== average) failures.push(label + ' contains an inconsistent average score');
    }
  }
  const status = history.match(/## Eval Status[\s\S]*?## Self-Improvement Kit/);
  if (!status) failures.push('History is missing an Eval Status section before Self-Improvement Kit');
  else {
    for (const phrase of ['internal prompt-rubric results', 'not certification', 'remaining eval backlog', 'eval/results.tsv']) {
      if (!status[0].toLowerCase().includes(phrase.toLowerCase())) failures.push('History Eval Status section is missing required scope phrase: ' + phrase);
    }
  }
  return failures;
}

if (require.main === module) {
  try {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    const destination = path.join(ROOT, HISTORY_PATH);
    // Read the fixed local destination, never a README-controlled arbitrary path.
    const history = fs.readFileSync(destination, 'utf8');
    const scorecard = readJson(path.join(ROOT, 'docs', 'eval', 'scorecard.json'));
    const failures = validateClaims({ readme, history, scorecard });
    if (failures.length) {
      failures.forEach(message => console.error('scorecard claims: ' + message));
      process.exitCode = 1;
    } else console.log('scorecard claims ok: README and linked historical evaluation match tracked evidence');
  } catch (error) {
    console.error('scorecard claims: cannot read required claim evidence: ' + error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateClaims, HISTORY_PATH };
