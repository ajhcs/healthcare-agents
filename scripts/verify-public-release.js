#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const path = require('path');
const { ROOT, fail, readJson } = require('./_release-utils');

const network = process.argv.includes('--network');
const pkg = readJson(path.join(ROOT, 'package.json'));
const version = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const install = fs.readFileSync(path.join(ROOT, 'install.sh'), 'utf8');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const changelog = fs.existsSync(path.join(ROOT, 'CHANGELOG.md')) ? fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8') : '';
const messages = [];

if (pkg.version !== version) messages.push(`package.json version ${pkg.version} != VERSION ${version}`);
if (!install.includes(`VERSION="${version}"`)) messages.push('install.sh VERSION does not match package/VERSION');
if (!readme.includes(`version-${version}`) && !readme.includes(`v${version}`)) messages.push('README version badge/link does not match package version');
if (changelog && !changelog.includes(version)) messages.push('CHANGELOG does not mention package version');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'healthcare-agents-release-check' } }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`${url} returned ${response.statusCode}: ${body.slice(0, 200)}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!network) {
    fail(messages);
    console.log('public release metadata ok locally; pass --network before publication to verify npm and GitHub artifacts');
    return;
  }
  const npm = await fetchJson('https://registry.npmjs.org/healthcare-agents');
  if (!npm.versions || !npm.versions[version]) messages.push(`npm registry does not contain healthcare-agents@${version}`);
  const npmFiles = npm.versions && npm.versions[version] && npm.versions[version].dist;
  if (!npmFiles || !npmFiles.tarball) messages.push(`npm registry metadata for ${version} has no tarball URL`);
  const release = await fetchJson(`https://api.github.com/repos/ajhcs/healthcare-agents/releases/tags/v${version}`);
  if (release.tag_name !== `v${version}`) messages.push(`GitHub release tag mismatch: ${release.tag_name}`);
  if (release.draft || release.prerelease) messages.push('GitHub release is draft or prerelease');
  fail(messages);
  console.log(`public release artifacts ok: npm healthcare-agents@${version}, GitHub v${version}`);
}

main().catch(error => {
  console.error('error: public release verification failed: ' + error.message);
  process.exit(1);
});
