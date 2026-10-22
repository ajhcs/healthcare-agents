#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, readJson } = require('./_release-utils');

const HISTORY_PATH = 'docs/eval/historical-prompt-evaluation.md';

// Ignore Markdown code and comments when deciding whether readers can navigate
// to evidence. Fence delimiters may use backticks or tildes and vary in length.
function visibleMarkdown(document) {
  let fence = null;
  return document.replace(/<!--[\s\S]*?-->/g, '').split('\n').map(line => {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (delimiter && delimiter[1][0] === fence.character && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = null;
      return '';
    }
    if (delimiter) {
      fence = { character: delimiter[1][0], length: delimiter[1].length };
      return '';
    }
    if (/^(?: {4}|\t)/.test(line)) return '';
    return line;
  }).join('\n').replace(/(`+)[\s\S]*?\1/g, '');
}

function headingAnchors(document) {
  const anchors = new Set();
  const counts = new Map();
  for (const match of visibleMarkdown(document).matchAll(/^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const slug = match[1].toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
    const duplicate = counts.get(slug) || 0;
    anchors.add(slug + (duplicate ? '-' + duplicate : ''));
    counts.set(slug, duplicate + 1);
  }
  return anchors;
}

// The evidence destination remains mandatory. Moving prose must not erase a gate
// or allow a misleading README claim beside an otherwise accurate history page.
function validateClaims({ readme, history, scorecard }) {
  const failures = [];
  const count = scorecard.agent_count || scorecard.agents.length;
  const evaluated = scorecard.evaluated_agent_count ?? scorecard.agents.filter(agent => agent.latest_score != null).length;
  const improved = scorecard.improved_agent_count ?? scorecard.agents.filter(agent => agent.status === 'improved').length;
  const average = Number(scorecard.average_latest_score).toFixed(2);
  if (typeof history !== 'string' || !history.trim()) {
    failures.push('Missing or empty historical evaluation destination: ' + HISTORY_PATH);
    return failures;
  }
  const anchors = headingAnchors(history);
  const links = visibleMarkdown(readme).matchAll(/(?<!!)\[[^\]\n]+\]\(docs\/eval\/historical-prompt-evaluation\.md(?:#([a-z0-9-]+))?\)/g);
  if (![...links].some(match => !match[1] || anchors.has(match[1]))) {
    failures.push('README must visibly link to ' + HISTORY_PATH + ' with an existing destination anchor');
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
