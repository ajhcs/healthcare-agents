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

const workflows = cliJson(['workflows']);
assert.strictEqual(workflows.count, 16);
assert.ok(workflows.workflows.some(workflow => workflow.id === 'denial-spike-workup'));

const workflow = cliJson(['workflow', 'denial-spike-workup']);
assert.strictEqual(workflow.primary_agent, 'revenue-cycle-specialist');
assert.ok(workflow.required_inputs.includes('payer or product'));

const coverage = cliJson(['operator-os', 'coverage']);
assert.strictEqual(coverage.schema_version, 'operator-os.coverage.v1');
assert.strictEqual(coverage.workflows.length, 16);
assert.ok(coverage.workflows.every(item => item.operator_os_status));

const coverageText = cli(['operator-os', 'coverage']);
assert.match(coverageText, /denial-spike-workup/);
assert.match(coverageText, /standard_pack/);

const evidencePackList = cliJson(['evidence-pack', 'list']);
assert.strictEqual(evidencePackList.count, 16);
assert.ok(evidencePackList.packs.some(pack => pack.workflow_id === 'denial-spike-workup'));

const evidencePackShow = cli(['evidence-pack', 'show', 'denial-spike-workup']);
assert.match(evidencePackShow, /Operator OS Denial Spike Evidence Pack/);
assert.match(evidencePackShow, /Citation Cards/);

const evidencePackJson = cliJson(['evidence-pack', 'show', 'denial-spike-workup']);
assert.strictEqual(evidencePackJson.workflow_id, 'denial-spike-workup');
assert.ok(evidencePackJson.citation_cards.length >= 10);

const scaffold = JSON.parse(cli(['evidence-pack', 'scaffold', 'clean-claim-rate-decline']));
assert.strictEqual(scaffold.packs[0].workflow_id, 'clean-claim-rate-decline');
assert.ok(scaffold.packs[0].citation_cards.length >= 8);

const workup = cliJson(['workup', 'Commercial payer denial rate jumped 18 percent after a policy change and our AR days are climbing.', '--target', 'codex']);
assert.strictEqual(workup.workflow.id, 'denial-spike-workup');
assert.strictEqual(workup.roles.primary, 'revenue-cycle-specialist');
assert.ok(workup.platform_prompts.codex.includes('denial spike'));
assert.ok(workup.safety.phi.includes('PHI'));
assert.strictEqual(workup.evidence_pack.workflow_id, 'denial-spike-workup');

const workupText = cli(['workup', 'denials spiked for payer X']);
assert.match(workupText, /Evidence Pack/);
assert.match(workupText, /Operator OS Denial Spike Evidence Pack/);

const syntheticWorkup = cliJson(['workup', 'denial spike for payer X', '--data-mode', 'synthetic_only']);
assert.strictEqual(syntheticWorkup.case_data.mode, 'synthetic_only');
assert.strictEqual(syntheticWorkup.case_data.status, 'ok');
assert.ok(syntheticWorkup.case_data.case_data.payer.provenance);

const hybridWorkupText = cli(['workup', 'denial spike for payer X', '--data-mode', 'hybrid_synthetic_public']);
assert.match(hybridWorkupText, /## Case Data/);
assert.match(hybridWorkupText, /payer: .* \[provenance: synthetic; source: operator-os\.synthetic\.denial-spike\.v1\]/);
assert.match(hybridWorkupText, /Provenance: synthetic=/);

const cleanClaimFixture = cliJson(['workup', 'Medicare Advantage clean claim rate dropped', '--data-mode', 'synthetic_only']);
assert.strictEqual(cleanClaimFixture.workflow.id, 'clean-claim-rate-decline');
assert.strictEqual(cleanClaimFixture.case_data.status, 'ok');
assert.ok(cleanClaimFixture.case_data.case_data.payer.provenance);

const publicSearchWorkup = cliJson(['workup', 'denial spike for payer X', '--data-mode', 'public_search']);
assert.strictEqual(publicSearchWorkup.case_data.status, 'unsupported');
assert.match(publicSearchWorkup.case_data.summary, /disabled by default/);

const hipaaWorkup = cliJson(['workup', 'Prepare a HIPAA evidence checklist for a vendor security review.', '--target', 'm365-copilot']);
assert.strictEqual(hipaaWorkup.workflow.id, 'hipaa-security-evidence-checklist');
assert.ok(hipaaWorkup.selected_platform_prompt.includes('SharePoint'));

const exportText = cli(['export', 'm365-declarative-agent', 'denial-spike-workup']);
assert.match(exportText, /Declarative Agent Export/);
assert.match(exportText, /Admin Review Checklist/);

const prompt = cli(['prompt', 'quality-compliance-officer', '--mode', 'audit/checklist']);
assert.match(prompt, /approved environment/);
assert.match(prompt, /minimum necessary/);
assert.match(prompt, /Do not make final clinical/);

const doctor = cliJson(['doctor']);
assert.strictEqual(doctor.agent_count, 51);
assert.ok(doctor.tools.some(tool => tool.tool === 'codex'));
assert.ok(doctor.recommended_next_command.includes('healthcare-agents install'));

expectFail(['show', 'revenue-cycle'], /did you mean:.*revenue-cycle-specialist/);
expectFail(['evidence-pack', 'show', 'not-a-pack'], /available workflow ids:.*denial-spike-workup/);
expectFail(['workup', 'denial spike for payer X', '--data-mode', 'bad_mode'], /unsupported data mode/);
expectFail(['prompt', 'revenue-cycle-specialist', '--mode', 'memo'], /invalid mode/);
expectFail(['choose'], /choose requires a problem description/);

console.log('cli regression ok: list/show/choose/prompt/doctor/error paths');
