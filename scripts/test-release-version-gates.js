#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-version-test-'));
const version = require('../package.json').version;
try {
  function mocks(npmBody, ghBody) {
    for (const [name, body] of [['npm', npmBody], ['gh', ghBody]]) {
      const file = path.join(tmp, name);
      fs.writeFileSync(file, '#!/bin/sh\n' + body + '\n', { mode: 0o755 });
    }
    return spawnSync(process.execPath, ['scripts/validate-public-version-sync.js', '--network'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PATH: tmp + path.delimiter + process.env.PATH }
    });
  }
  assert.notEqual(mocks('exit 7', 'exit 7').status, 0);
  assert.notEqual(mocks('exit 0', 'exit 0').status, 0);
  assert.notEqual(mocks('echo 1.5.0', 'echo v1.6.0').status, 0);
  assert.equal(mocks('echo ' + version, 'echo v' + version).status, 0);
  console.log('Release network gate: 4 controlled access/empty/drift/aligned cases passed; no public-channel receipt asserted');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
