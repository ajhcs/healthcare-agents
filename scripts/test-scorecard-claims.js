#!/usr/bin/env node
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { validateClaims } = require('./validate-scorecard-claims');

// Independently specified claim examples. No production history is rewritten.
const scorecard = { agent_count: 51, evaluated_agent_count: 51, improved_agent_count: 51, average_latest_score: 94.18 };
const readme = '51 specialists. [Historical evaluation](docs/eval/historical-prompt-evaluation.md).';
const history = `## Eval Status
Historical records: 51/51 evaluated, average 94.18, 51/51 tracked improved.
These are internal prompt-rubric results, not certification.
The remaining eval backlog is recorded with eval/results.tsv.
## Self-Improvement Kit
Historical instructions remain available.`;
const check = overrides => validateClaims({ readme, history, scorecard, ...overrides });
const rejected = overrides => assert.ok(check(overrides).length > 0, 'misleading or inaccessible evidence must fail');

test('accurate linked historical evidence passes without front-door numeric scores', () => assert.deepEqual(check(), []));
test('README claim with current counts and average passes', () => assert.deepEqual(check({ readme: readme + ' 51/51 evaluated; 51/51 tracked improved; average 94.18.' }), []));
test('missing destination is rejected', () => rejected({ history: undefined }));
test('empty destination is rejected', () => rejected({ history: '' }));
test('missing README evidence link is rejected', () => rejected({ readme: '51 specialists.' }));
test('broken destination link is rejected', () => rejected({ readme: readme.replace('historical-prompt-evaluation.md', 'absent.md') }));
test('a code-only mention does not substitute for a reachable evidence link', () => rejected({ readme: '`docs/eval/historical-prompt-evaluation.md`' }));
for (const label of ['readme', 'history']) {
  for (const claim of ['51/51 improved', '51%2F51%20improved', 'average 95.50', 'average score 99.99', 'avg score: 91.00', '49/51 evaluated', '50/51 tracked improved', 'These results are certified.', 'These scores establish certification.']) {
    test(`${label} rejects ${claim} even when other evidence is correct`, () => rejected({ [label]: ({ readme, history })[label] + '\n' + claim }));
  }
}
for (const required of ['51/51 evaluated', '51/51 tracked improved', '94.18', 'internal prompt-rubric results', 'not certification', 'remaining eval backlog', 'eval/results.tsv']) {
  test('historical evidence cannot lose ' + required, () => rejected({ history: history.replace(required, 'removed') }));
}
test('history section order remains part of the evidence contract', () => rejected({ history: history.replace('## Eval Status', '## Other heading') }));
test('dynamic scorecard values govern both required and rejected claims', () => {
  const smaller = { agent_count: 3, evaluated_agent_count: 2, improved_agent_count: 1, average_latest_score: 72.5 };
  const adapted = history.replace('51/51 evaluated', '2/3 evaluated').replace('51/51 tracked improved', '1/3 tracked improved').replace('94.18', '72.50');
  assert.deepEqual(check({ history: adapted, scorecard: smaller }), []);
  rejected({ history: adapted, scorecard: smaller, readme: readme + ' 3/3 evaluated' });
  rejected({ history: adapted, scorecard: smaller, readme: readme + ' average 94.18' });
});

test('inline-code link cannot substitute for a visible evidence link', () => rejected({ readme: '`' + readme + '`' }));
test('fenced-code link cannot substitute for a visible evidence link', () => rejected({ readme: '```markdown\n' + readme + '\n```' }));

test('commented-out link cannot substitute for a visible evidence link', () => rejected({ readme: '<!-- ' + readme + ' -->' }));
test('nonexistent history anchor is rejected', () => rejected({ readme: readme.replace('.md)', '.md#absent)') }));
test('existing history anchor is accepted', () => assert.deepEqual(check({ readme: readme.replace('.md)', '.md#eval-status)') }), []));
