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
  "claude:denial-spike-workup": "68aa28a0cfd081bb9f8c836a7b3e7c4e2223ec4b8aac6a1b7d1536c8d71afa38",
  "codex:denial-spike-workup": "8b14589c6f875c7382903eadc47bef64f1eb7ada9e9df508a97651b6caccc24b",
  "copilot:denial-spike-workup": "e191bd8dbb546a09ef8ca89e93c74d4502e2a7e8c17279babbc1ae5ac61d02f5",
  "m365:denial-spike-workup": "402dc01d75f76cf6aa71aaf9600ada3ef3ea8420fdad5f0facf91c7baa016af2",
  "studio:denial-spike-workup": "0d8f1bdbf1c7bf2868470c75e2bc2ab6262664e46b7a083d5452736906cd6366",
  "foundry:denial-spike-workup": "4d9ce650958185dc0f2ddffacbd775998f8f6faf2144bf6a6bf5d6d063a6d1a8",
  "claude:hipaa-security-evidence-checklist": "3b069a1890173b04b62d691caf1fa93f80f7248b291657399b60866a3863b48c",
  "codex:hipaa-security-evidence-checklist": "fa4e457bb2d1d86c6070c1a6d89b7aa6917c35b82f451affac7d7274e1d614cc",
  "copilot:hipaa-security-evidence-checklist": "1c416d0387b8095301306c380e6b52e17cab9959d13d42b22a1c4143b29e445d",
  "m365:hipaa-security-evidence-checklist": "13197f8567872554c0252075dbe7795effc021d85938911e24f3d6b126416c6a",
  "studio:hipaa-security-evidence-checklist": "7f917ef9665bedf567731eee3bcaa6a09184c1c1ea71c34f526a52565f5a2506",
  "foundry:hipaa-security-evidence-checklist": "e113ac14bacb3cf41c49cf6821eb6ec593b6fbd610cfe7e79c43e5be0573b9d9",
  "claude:hedis-stars-gap-closure-sprint": "82ef87046c63d41d1a0e3c62ad0e46b7efbea968207c3098d7cf2ada3cccf14a",
  "codex:hedis-stars-gap-closure-sprint": "32204d3b8b48454f6c75f41a44827dc9cdc3b22c26c5b98ca0243720b7aeeec9",
  "copilot:hedis-stars-gap-closure-sprint": "61b82591b35511354412e887e40b9545ae28eb515126ec574491b9f6c0d3d9ab",
  "m365:hedis-stars-gap-closure-sprint": "d385164df0ba79f7738749430e9b08c98a2bc3958a20a344cd8e768ff1feeda3",
  "studio:hedis-stars-gap-closure-sprint": "d3d7df891c9224d1001144cb3c7225bb669f80f55a5600f08f3641f258ef1dee",
  "foundry:hedis-stars-gap-closure-sprint": "b9b92b3fe918e5d52654bbc7486d32cd84f3fbf2fa54c3c83c27e956d563977a",
  "copilot-repo": "3580de9e9a68f2bf471a4aa9a97cfee57738aa6afc7e3b1f263c9048a6dc0200"
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
