#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { targets } = require('./release-targets');
const root = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'healthcare-version-test-'));
const t = targets(require('../package.json'));
let checks = 0;
try {
  function mocks(npmBody, ghBody) {
    for (const [name, body] of [['npm', npmBody], ['gh', ghBody]]) {
      fs.writeFileSync(path.join(tmp,name), '#!' + process.execPath + '\n' + body + '\n', {mode:0o755});
    }
    return spawnSync(process.execPath,['scripts/validate-public-version-sync.js','--network'], {
      cwd:root, encoding:'utf8', env:{...process.env,PATH:tmp+path.delimiter+process.env.PATH}
    });
  }
  const goodNpm = 'require("assert/strict").deepEqual(process.argv.slice(2),' +
    JSON.stringify(['view',t.name+'@next','version','--registry',t.registry]) + '); console.log(' + JSON.stringify(t.version) + ');';
  const goodGh = 'require("assert/strict").deepEqual(process.argv.slice(2),' +
    JSON.stringify(['release','view',t.github_tag,'--repo',t.repository,'--json','tagName,isDraft,isPrerelease']) +
    '); console.log(' + JSON.stringify(JSON.stringify({tagName:t.github_tag,isDraft:false,isPrerelease:true})) + ');';
  for (const [npm, gh, ok] of [
    ['process.exit(7)','process.exit(7)',false],['','',false],
    ['console.log("1.5.0")',goodGh,false],[goodNpm,'console.log("bad-json")',false],
    [goodNpm,'console.log('+JSON.stringify(JSON.stringify({tagName:t.github_tag,isDraft:false,isPrerelease:false}))+')',false],
    ...[undefined,null,0,'false'].map(isDraft => [goodNpm,'console.log('+JSON.stringify(JSON.stringify({tagName:t.github_tag,isDraft,isPrerelease:true}))+')',false]),
    [goodNpm,goodGh,true]
  ]) { const r=mocks(npm,gh); assert.equal(r.status===0,ok,r.stderr); checks++; }
  console.log('Release network gate: '+checks+' controlled access/empty/drift/channel/exact-tag/prerelease cases passed; no public receipt asserted');
} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
