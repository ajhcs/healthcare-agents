#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const { targets, assertRequested, assertRegistry, assertGithub } = require('./release-targets');
const { workflowProblems } = require('./validate-npm-publish-workflow');
const pkg = require('../package.json');
const t = targets(pkg);
let checks = 0;
function pass(fn) { fn(); checks++; }
function denied(fn) { assert.throws(fn); checks++; }
pass(() => assert.equal(t.npm_tag, 'next'));
pass(() => assert.equal(t.github_prerelease, true));
for (const patch of [{name:'other'}, {version:'2.0.0-beta.01'}, {version:'2.0.0-rc.1'},
  {repository:{type:'git',url:'git+https://github.com/other/healthcare-agents.git'}}, {homepage:'https://example.org'},
  {publishConfig:{...pkg.publishConfig,tag:'latest'}}, {publishConfig:{...pkg.publishConfig,registry:'https://example.org'}}])
  denied(() => targets({...pkg,...patch}));
const stable = targets({...pkg,version:'2.0.0',publishConfig:{...pkg.publishConfig,tag:'latest'}});
pass(() => assert.deepEqual([stable.npm_tag,stable.github_prerelease],['latest',false]));
denied(() => targets({...pkg,version:'2.0.0'}));
const head = 'a'.repeat(40);
const env = {EXPECTED_VERSION:t.version,EXPECTED_COMMIT:head,GITHUB_REPOSITORY:t.repository,GITHUB_SHA:head};
pass(() => assertRequested(t,env,head));
for (const patch of [{EXPECTED_VERSION:''},{EXPECTED_VERSION:'1.5.0'},{EXPECTED_COMMIT:'aaaaaaa'},
  {EXPECTED_COMMIT:'b'.repeat(40)},{GITHUB_REPOSITORY:'fork/healthcare-agents'},{GITHUB_SHA:'b'.repeat(40)}])
  denied(() => assertRequested(t,{...env,...patch},head));
const release = {tag_name:t.github_tag,draft:false,prerelease:true};
pass(() => assertGithub(t,release));
for (const patch of [{tag_name:'v1.5.0'},{draft:true},{draft:undefined},{draft:null},{draft:0},{draft:'false'},{prerelease:false}])
  denied(() => assertGithub(t,{...release,...patch}));
const doc = {versions:{[t.version]:{name:t.name,version:t.version,repository:pkg.repository,
  dist:{tarball:t.registry+'/'+t.name+'/-/'+t.name+'-'+t.version+'.tgz',integrity:'sha512-'+Buffer.alloc(64).toString('base64')}}},
  'dist-tags':{next:t.version,latest:'1.5.0'}};
pass(() => assertRegistry(t,doc,{latest:'1.5.0'}));
for (const dist of [{tarball:true,integrity:true},{tarball:{},integrity:{}},{tarball:[],integrity:[]},
  {tarball:doc.versions[t.version].dist.tarball,integrity:'sha512-example'},
  {tarball:'https://example.org/package.tgz',integrity:doc.versions[t.version].dist.integrity}])
  denied(() => assertRegistry(t,{...doc,versions:{[t.version]:{...doc.versions[t.version],dist}}}));
denied(() => assertRegistry(t,{...doc,'dist-tags':{next:t.version}}));
denied(() => assertRegistry(t,doc,{latest:null}));
denied(() => assertRegistry(t,{...doc,'dist-tags':{next:t.version,latest:t.version}},{latest:'1.5.0'}));
denied(() => assertRegistry(t,{...doc,'dist-tags':{next:'1.5.0',latest:'1.5.0'}}));
denied(() => assertRegistry(t,{...doc,versions:{}}));
denied(() => assertRegistry(t,{...doc,versions:{[t.version]:{...doc.versions[t.version],repository:{url:'wrong'}}}}));
const workflow = fs.readFileSync('.github/workflows/npm-publish.yml','utf8');
pass(() => assert.deepEqual(workflowProblems(workflow),[]));
for (const changed of [
  workflow.replace('--tag "$RELEASE_NPM_TAG"','--tag latest'),
  workflow.replace('contents: read','contents: write'),
  workflow.replace('GH_TOKEN: ${{ github.token }}','GH_TOKEN: removed'),
  workflow.replace('required: true','required: false'),
  workflow.replace('run: npm ci --ignore-scripts --no-audit --no-fund','run: echo skipped'),
  workflow.replace('Install locked dependencies','Run release readiness gate'),
  workflow.replace('--provenance --registry','--registry'),
  workflow.replace("env.HAS_NPM_TOKEN != 'true'","env.HAS_NPM_TOKEN == 'true'"),
  workflow.replace('run: node scripts/release-targets.js ci','run: echo ${{ inputs.expected_version }}')
]) pass(() => assert.ok(workflowProblems(changed).length));
console.log('Release policy: ' + checks + ' controlled package/channel/repository/commit/GitHub/latest/workflow checks passed; no publication');
