#!/usr/bin/env node
const crypto = require('crypto');
const { loadWorkflows } = require('../lib/workflows');
const renderers = require('../lib/renderers');

const workflows = loadWorkflows();
const selected = [
  workflows.find(workflow => workflow.id === 'denial-spike-workup'),
  workflows.find(workflow => workflow.id === 'hipaa-security-evidence-checklist'),
  workflows.find(workflow => workflow.id === 'hedis-stars-gap-closure-sprint')
];

const snapshots = {};
for (const workflow of selected) {
  snapshots['claude:' + workflow.id] = renderers.renderClaudeWorkflowSkill(workflow);
  snapshots['codex:' + workflow.id] = renderers.renderCodexWorkflowSkill(workflow);
  snapshots['copilot:' + workflow.id] = renderers.renderCopilotPrompt(workflow);
  snapshots['m365:' + workflow.id] = renderers.renderM365DeclarativeAgent(workflow);
  snapshots['studio:' + workflow.id] = renderers.renderCopilotStudioGuide(workflow);
  snapshots['foundry:' + workflow.id] = renderers.renderAzureFoundrySpec(workflow);
}
snapshots['copilot-repo'] = renderers.renderCopilotRepoInstructions(workflows);

const actual = Object.fromEntries(Object.entries(snapshots).map(([key, value]) => [
  key,
  crypto.createHash('sha256').update(value).digest('hex')
]));

const expected = {
  "claude:denial-spike-workup": "fba3b30581ed3cb97f407a395c405fd7f6b3eab343ca3149c6a61f26634a0531",
  "codex:denial-spike-workup": "19e71c8557cbd6f0b8cf6a0a5a6d202a2ccad68e42019454bb1644ca95b7ba69",
  "copilot:denial-spike-workup": "adc683248722f443dd6eb26a3c20e049e971ff1133505bf1d8217841f0b573e2",
  "m365:denial-spike-workup": "8db94cdb00bbf77639fe211d17926b0dae36b0d585206aed64646ef795c15c1d",
  "studio:denial-spike-workup": "cb1f2bdcfe28846e6d51c95e4548f35fc72bf29508d753eda06af740007af23a",
  "foundry:denial-spike-workup": "df410319e56b4a44dfa456d4501f08bd7c2364f2e800adfaf13b3c4ad568fcc6",
  "claude:hipaa-security-evidence-checklist": "6e7e931f630484092fdbd5d632dab0f17255fc4a89421acd3467c91ffb952499",
  "codex:hipaa-security-evidence-checklist": "f87370ed42140a994447c24592d617b5f984b6f537ba005567454cc88b271beb",
  "copilot:hipaa-security-evidence-checklist": "1cf4a4c34d0f6b776203c181fbd2412928ed3d3a31d1cf70c11f2e247f894361",
  "m365:hipaa-security-evidence-checklist": "4986c99b196fc0ecb0c29c5d9c25a16c33f220ce7df29d5eed4c11a22b454d32",
  "studio:hipaa-security-evidence-checklist": "0f19ab9cce13b39faf777ec739c9a2d6ec5bc43906d0dc40b3b70dc1760b5a6d",
  "foundry:hipaa-security-evidence-checklist": "862f9b47c99f9b2c9d6e2abdcd672a4ffa863addb43d5f4fc0e4db6f1fed3cc7",
  "claude:hedis-stars-gap-closure-sprint": "f227dd683a8dbd6f9403ba0f43276ea31bf67380579a01ffdfdd9fd2d4667d21",
  "codex:hedis-stars-gap-closure-sprint": "aad1020d69ac9842c3c5e07d1585095829a6cddc36c7c2e04ce270dfdde02e71",
  "copilot:hedis-stars-gap-closure-sprint": "2fbeaad9b7413f6abacd7d3adf152f8b19ce5076735abe7aaaf7b3a76c50821f",
  "m365:hedis-stars-gap-closure-sprint": "2636b137acb08f6ebecaa6353b52b5b2130ecc164b3c5e37bad7f806900c5bf6",
  "studio:hedis-stars-gap-closure-sprint": "c3f4e9b0638ddff46ed403005f2a0d6657841b5f8f66304a473e88ea09dd728d",
  "foundry:hedis-stars-gap-closure-sprint": "8bbafd33f9e368ac1bfad4e130dd7bd595338c46999d13bcc82e97b0b163e536",
  "copilot-repo": "a204622df3a724c1505a37709048df79666faaa783f7c548bd4401e5793f92ed"
};

const failures = [];
for (const [key, hash] of Object.entries(expected)) {
  if (actual[key] !== hash) failures.push(key + ' expected ' + hash + ' got ' + actual[key]);
}
for (const key of Object.keys(actual)) {
  if (!expected[key]) failures.push(key + ' missing expected snapshot hash');
}

if (failures.length) {
  for (const failure of failures) console.error('snapshot: ' + failure);
  process.exit(1);
}

console.log('platform render snapshots ok: ' + Object.keys(expected).length + ' hashes');
