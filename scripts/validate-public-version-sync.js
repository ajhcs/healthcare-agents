#!/usr/bin/env node
const fs = require('fs');
const { run } = require('./_release-utils');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionFile = fs.readFileSync('VERSION', 'utf8').trim();
const installText = fs.readFileSync('install.sh', 'utf8');
const failures = [];

if (pkg.version !== versionFile) failures.push('package.json version ' + pkg.version + ' does not match VERSION ' + versionFile);
if (!installText.includes('VERSION="' + pkg.version + '"')) failures.push('install.sh VERSION does not match package.json');

if (process.argv.includes('--network')) {
  const npm = run('npm', ['view', pkg.name, 'version']);
  if (npm.status === 0 && npm.stdout.trim() && npm.stdout.trim() !== pkg.version) {
    failures.push('npm latest ' + npm.stdout.trim() + ' does not match package.json ' + pkg.version);
  }
  const gh = run('gh', ['release', 'view', '--json', 'tagName', '--jq', '.tagName']);
  if (gh.status === 0 && gh.stdout.trim()) {
    const tag = gh.stdout.trim().replace(/^v/, '');
    if (tag !== pkg.version) failures.push('GitHub latest release ' + tag + ' does not match package.json ' + pkg.version);
  }
}

if (failures.length) {
  for (const failure of failures) console.error('version sync: ' + failure);
  process.exit(1);
}

console.log('public version sync ok: ' + pkg.version + (process.argv.includes('--network') ? ' with network checks' : ' local checks'));
