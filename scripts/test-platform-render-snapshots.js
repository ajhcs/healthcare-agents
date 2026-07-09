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
  "claude:denial-spike-workup": "fcd07907630823b7daf7084d1d5101a41eb0d49b689b1b1d656d20ee41f13048",
  "codex:denial-spike-workup": "6433bb12730cab7bc5e4d143314484e309be695d8ed0f4735e5e7fbe07a7f080",
  "copilot:denial-spike-workup": "7df692f50bd33b1ef6029eacde692674302fa0f2fbe40087058138de04c31ce9",
  "m365:denial-spike-workup": "9f0e7a78ac93ef408b37c7ea3811d5dd75fb494385859a9bf3f05904d3ee1064",
  "studio:denial-spike-workup": "384d2c1a241b32d2512efe032d5086ce42902a2c7018bdd3528d668f4b085142",
  "foundry:denial-spike-workup": "32bf1005f2b2708d0674f08ca07788e3747b3a501fbe494c622341f49548fe67",
  "claude:hipaa-security-evidence-checklist": "c4a4096afc19ab71ddb54914cecdc19d1276aa8c4c3103f5abf19554d26be62a",
  "codex:hipaa-security-evidence-checklist": "f0a60238952096414b65ac62168d3d6f893c7e655d1f9676ec0d8c1760b0541d",
  "copilot:hipaa-security-evidence-checklist": "eadfa7f28840d05ab0574458e30d48bd8a76178d8037f401c2b79c3ea73e83e9",
  "m365:hipaa-security-evidence-checklist": "7ffff50cf3c52eea69bda6ab5da6efcd5a499725317cad9d236dc43a6500033b",
  "studio:hipaa-security-evidence-checklist": "5cb7ade71e4dbfe9c3ebc4eb76696df1acecbf3cc21402e49dc1acfb8134f051",
  "foundry:hipaa-security-evidence-checklist": "e6939cad907ffc3ba32597f839f8ccc7f62e279594a7d83f26219e871e2ba2be",
  "claude:hedis-stars-gap-closure-sprint": "05238280b3f32f12f0b41a278f6dccf3f043a2a578474a31a68af595774fb499",
  "codex:hedis-stars-gap-closure-sprint": "241ed28b21037768c1a381924b9dd1e0b915802aca8404da2e87bb8c24e2d47a",
  "copilot:hedis-stars-gap-closure-sprint": "09f9055752341a1413f9481f87fcf02785b67e2e43617cc6c1bd8d8f917bdde7",
  "m365:hedis-stars-gap-closure-sprint": "bfc3e43ba138ccb8d9c8ef17549cce0e61535ca93841c49eee5146c3b3a79099",
  "studio:hedis-stars-gap-closure-sprint": "46d592664de43b126fe59c9cc7ba1e773f825b897bea87690f3d6256081919e6",
  "foundry:hedis-stars-gap-closure-sprint": "4c2880def9fba6c36c45e304795d326b05315617b284bf6b547327548cc87240",
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
