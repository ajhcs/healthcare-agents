#!/usr/bin/env node
const fs = require('fs');
const { targets, assertRegistry, assertGithub, fetchJson } = require('./release-targets');
const path = require('path');
const { ROOT, fail, readJson } = require('./_release-utils');

const network = process.argv.includes('--network');
const pkg = readJson(path.join(ROOT, 'package.json'));
const version = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const install = fs.readFileSync(path.join(ROOT, 'install.sh'), 'utf8');
const plugin = readJson(path.join(ROOT, '.codex-plugin', 'plugin.json'));
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const changelog = fs.existsSync(path.join(ROOT, 'CHANGELOG.md')) ? fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8') : '';
const messages = [];

if (pkg.version !== version) messages.push(`package.json version ${pkg.version} != VERSION ${version}`);
if (!install.includes(`VERSION="${version}"`)) messages.push('install.sh VERSION does not match package/VERSION');
if (plugin.version !== version) messages.push(`Codex plugin version ${plugin.version} != package/VERSION ${version}`);
if (!readme.includes(`version-${version}`) && !readme.includes(`v${version}`)) messages.push('README version badge/link does not match package version');
if (changelog && !changelog.includes(version)) messages.push('CHANGELOG does not mention package version');

async function main() {
  const target = targets(pkg);
  if (!network) {
    fail(messages);
    console.log('public release metadata ok locally; pass --network after publication to verify npm and GitHub artifacts');
    return;
  }
  const npm = await fetchJson(target.registry + '/' + target.name);
  assertRegistry(target, npm);
  const release = await fetchJson('https://api.github.com/repos/' + target.repository + '/releases/tags/' + target.github_tag);
  assertGithub(target, release);
  fail(messages);
  console.log(`public release artifacts ok: npm healthcare-agents@${version}, GitHub v${version}`);
}

main().catch(error => {
  console.error('error: public release verification failed: ' + error.message);
  process.exit(1);
});
