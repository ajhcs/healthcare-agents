#!/usr/bin/env node
const assert = require('assert');
const { run, runRequired } = require('./_release-utils');

function cli(args) {
  return runRequired('node', ['bin/cli.js', ...args]).stdout;
}

function cliJson(args) {
  return JSON.parse(cli([...args, '--json']));
}

function expectFail(args, pattern) {
  const result = run('node', ['bin/cli.js', ...args]);
  assert.notStrictEqual(result.status, 0, `expected failure for: ${args.join(' ')}`);
  assert.match((result.stderr || '') + (result.stdout || ''), pattern);
}

const list = cliJson(['list']);
assert.strictEqual(list.count, 51);
assert.ok(Array.isArray(list.agents));
assert.ok(list.agents.every(agent => agent.slug && agent.domain && agent.description));

const revenue = cliJson(['list', '--domain', 'revenue']);
assert.strictEqual(revenue.count, 6);

const shown = cliJson(['show', 'revenue-cycle-specialist']);
assert.strictEqual(shown.slug, 'revenue-cycle-specialist');
assert.ok(shown.role_boundaries.includes('does not'));
assert.ok(shown.required_human_owner);

const chooseCases = [
  ['clean claim rate dropped after EHR update for Medicare denials', 'revenue-cycle-specialist', 'Revenue Cycle & Finance'],
  ['HEDIS gap closure and Stars quality rate campaign is off target', 'quality-improvement-specialist', 'Quality, Safety & Compliance'],
  ['HL7 ADT interface ACK failures and FHIR patient matching errors', 'healthit-interoperability-engineer', 'Health IT & Informatics'],
  ['SNF MDS PDPM Five-Star PBJ survey readiness issue', 'operations-long-term-care-administrator', 'Operations & Administration'],
  ['CHNA community benefit Schedule H implementation plan', 'pophealth-community-health-coordinator', 'Population Health & Community Health'],
  ['PBM rebate formulary specialty pharmacy contract scorecard', 'pharmacy-benefits-specialist', 'Pharmacy Programs'],
  ['HVA emergency operations plan HICS evacuation exercise', 'emergency-preparedness-coordinator', 'Emergency Preparedness'],
  ['credentialing CAQH PECOS enrollment roster revalidation', 'payer-credentialing-enrollment-coordinator', 'Payer & Managed Care'],
  ['service line market strategy CON physician alignment plan', 'strategy-healthcare-consultant', 'Strategy & Advisory'],
  ['prior authorization appeal delay with payer criteria and deadline', 'clinical-prior-authorization-specialist', 'Clinical Operations']
];
for (const [problem, expected] of chooseCases) {
  const result = cliJson(['choose', problem]);
  assert.strictEqual(result.primary_agent, expected, `choose mismatch for ${problem}`);
  assert.ok(['high', 'medium', 'low'].includes(result.confidence));
  assert.ok(Array.isArray(result.missing_inputs));
  assert.ok(result.starter_prompt.includes('approved environment'));
  assert.ok(result.starter_prompt.includes('minimum necessary'));
}

const low = cliJson(['choose', 'unstructured miscellaneous help']);
assert.strictEqual(low.confidence, 'low');
assert.ok(low.missing_inputs.length > 0);

const prompt = cli(['prompt', 'quality-compliance-officer', '--mode', 'audit/checklist']);
assert.match(prompt, /approved environment/);
assert.match(prompt, /minimum necessary/);
assert.match(prompt, /Do not make final clinical/);

const doctor = cliJson(['doctor']);
assert.strictEqual(doctor.agent_count, 51);
assert.ok(doctor.tools.some(tool => tool.tool === 'codex'));
assert.ok(doctor.recommended_next_command.includes('healthcare-agents install'));

expectFail(['show', 'revenue-cycle'], /did you mean:.*revenue-cycle-specialist/);
expectFail(['prompt', 'revenue-cycle-specialist', '--mode', 'memo'], /invalid mode/);
expectFail(['choose'], /choose requires a problem description/);

console.log('cli regression ok: list/show/choose/prompt/doctor/error paths');
