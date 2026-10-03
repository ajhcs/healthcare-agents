#!/usr/bin/env node
'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const { mapPublicEvidence, importEvidence } = require('../lib/public-evidence');
const { runCase } = require('../lib/admin-workflows');
const { ToolRuntime } = require('../lib/admin-tools');
const ROOT = path.resolve(__dirname, '..'), dir = path.join(ROOT, 'examples/admin-v2/data-mcp');
const python = process.env.HAG_EVIDENCE_PYTHON || 'python3', options = { python };
const clone = x => JSON.parse(JSON.stringify(x));
let assertions = 0;
function test(name, fn) { fn(); assertions++; console.log('ok ' + name); }
function fixture(id = 'denial-spike-workup') {
  const raw = fs.readFileSync(path.join(dir, id + '.bundle.json'), 'utf8');
  return { raw, bundle: JSON.parse(raw), mapping: JSON.parse(fs.readFileSync(path.join(dir, id + '.mapping.json'), 'utf8')) };
}
function seal(f) {
  const code = "import json,sys; from public_evidence import PublicEvidenceBundleInput,build_public_evidence_bundle; x=json.load(sys.stdin); x.pop('bundle_sha256',None); x.pop('schema_version',None); print(build_public_evidence_bundle(PublicEvidenceBundleInput.model_validate(x)).model_dump_json())";
  const p = spawnSync(python, ['-B', '-c', code], { input: JSON.stringify(f.bundle), encoding: 'utf8',
    env: { ...process.env, PYTHONPATH: path.join(ROOT, 'lib/data-mcp-contract'), PYTHONDONTWRITEBYTECODE: '1' }, timeout: 5000 });
  assert.equal(p.status, 0, p.stderr); f.raw = p.stdout; f.mapping.bundle_sha256 = JSON.parse(p.stdout).bundle_sha256;
}
const mapped = f => mapPublicEvidence(f.raw, f.mapping, options);
function blocked(f, code) {
  const x = mapped(f); assert.equal(x.status, 'blocked'); assert.equal(x.case, null);
  assert.ok(x.blockers.some(b => b.code === code), JSON.stringify(x.blockers));
  assert.deepEqual(x.provenance.public_evidence.coverage, JSON.parse(f.raw).coverage);
  return x;
}
const facts = {
  'denial-spike-workup': { baseline_rate: .1, current_rate: .18, percentage_point_change: 8, relative_change: .8, denied_dollars: 42000, recoverable_dollars: null },
  'ambulatory-access-backlog': { weekly_shortfall: 20, proposed_net_weekly_capacity: 20, weeks_to_clear_backlog: 5 },
  'survey-readiness-gap-review': { findings: 2, missing_evidence: 1 },
  'prior-authorization-appeal-workup': { supplied_calendar_day_window: 30, missing_documents: ['clinician statement'] },
  'payer-contract-underpayment-review': { net_variance: 150, positive_variance: 200 },
  'discharge-barrier-workplan': { barrier_counts: 6, reported_avoidable_days: 13 }
};
for (const [id, expected] of Object.entries(facts)) {
  const f = fixture(id), x = mapped(f), result = runCase(x.case);
  test(id + ' independent expected outcomes', () => {
    assert.equal(x.status, 'ready_for_human_review');
    for (const [key, v] of Object.entries(expected)) assert.deepEqual(result.values[key], v);
    if (id === 'payer-contract-underpayment-review') assert.equal(result.values.lines[1].variance, -50);
  });
  test(id + ' full source custody', () => {
    assert.deepEqual(x.provenance.public_evidence, f.bundle);
    assert.equal(x.provenance.raw_bundle_sha256, 'sha256:' + crypto.createHash('sha256').update(f.raw).digest('hex'));
    assert.equal(x.provenance.producer_bundle_hash_verified, true);
    assert.equal(x.provenance.public_evidence.coverage.at(-1).status, 'unavailable_public');
    assert.equal(x.provenance.field_map.length, f.mapping.bindings.length + f.mapping.owner_inputs.length);
    assert.equal(x.external_actions_performed, false); assert.equal(x.case.human_owner, f.mapping.human_owner);
  });
}
test('retrieval time does not become case as-of', () => {
  const x = mapped(fixture()); assert.equal(x.case.evidence[0].as_of, '2026-10-03');
  assert.equal(x.provenance.public_evidence.sources[0].receipt.retrieved_at, '2026-10-02T12:00:00Z');
});
for (const status of ['not_yet_researched','unavailable_public','not_applicable','blocked_source_conflict']) {
  test(status + ' never becomes zero', () => {
    const f = fixture(); Object.assign(f.bundle.coverage[0], { status, observation_refs: [] }); f.mapping.bindings[0].observation_id = null; seal(f);
    assert.equal(blocked(f, 'COVERAGE_' + status.toUpperCase()).blockers.find(b => b.field === '/baseline_claims').refs[0], f.bundle.coverage[0].coverage_id);
  });
}
for (const [name, mutate, code] of [
  ['bundle pin', f => f.mapping.bundle_sha256 = 'sha256:' + 'f'.repeat(64), 'BUNDLE_PIN_MISMATCH'],
  ['scope pin', f => f.mapping.scope.service_line = 'wrong', 'SCOPE_MISMATCH'],
  ['period', f => f.mapping.bindings[0].expect.period.end = '2026-10-31', 'OBSERVATION_SCOPE_MISMATCH'],
  ['entity', f => f.mapping.entity_id = 'wrong-id', 'ENTITY_NOT_FOUND'],
  ['invented conflict acknowledgment', f => f.mapping.accepted_conflict_ids = ['invented'], 'CONFLICT_ACKNOWLEDGEMENT_INVALID']
]) test(name + ' blocks', () => { const f = fixture(); mutate(f); blocked(f, code); });
for (const key of ['unit','denominator_scope','measure_id','value_type','derivation_class']) {
  test(key + ' cannot be converted or inferred', () => {
    const f = fixture(); f.mapping.bindings[0].expect[key] = key === 'value_type' ? 'number' : key === 'derivation_class' ? 'modeled_input' : 'wrong';
    blocked(f, key === 'measure_id' ? 'COVERAGE_SCOPE_MISMATCH' : 'OBSERVATION_SCOPE_MISMATCH');
  });
}
for (const key of ['unresolved_identifiers','conflicts','match_decisions']) test('identity ' + key, () => {
  const f = fixture(); f.bundle.entities[0][key] = key === 'match_decisions' ? [] : [{ identifier: 'unresolved' }]; seal(f);
  blocked(f, 'IDENTITY_REQUIRES_REVIEW');
});
test('open conflict is preserved and blocks', () => {
  const f = fixture(); f.bundle.conflicts[0].status = 'open'; seal(f);
  assert.equal(blocked(f, 'SOURCE_CONFLICT_REQUIRES_REVIEW').provenance.public_evidence.conflicts[0].status, 'open');
});
test('accepted conflict needs explicit acknowledgment', () => {
  const f = fixture(); f.bundle.conflicts[0].status = 'accepted_with_rationale'; seal(f); blocked(f, 'SOURCE_CONFLICT_REQUIRES_REVIEW');
  f.mapping.accepted_conflict_ids = ['resolved-synthetic']; assert.equal(mapped(f).status, 'ready_for_human_review');
});
test('unscoped open conflict blocks conservatively', () => {
  const f = fixture(); Object.assign(f.bundle.conflicts[0], { status: 'open', entity_refs: [], observation_refs: [], receipt_refs: [] }); seal(f); blocked(f, 'SOURCE_CONFLICT_REQUIRES_REVIEW');
});
for (const rights of ['unknown_review_required','restricted_publication']) test(rights + ' requires review', () => {
  const f = fixture(); f.bundle.sources[0].access_rights = rights; f.bundle.sources[0].receipt.rights_classification = rights; seal(f); blocked(f, 'SOURCE_RIGHTS_REQUIRES_REVIEW');
});
test('non-web source locator is not a citation', () => {
  const f = fixture(); f.bundle.sources[0].receipt.source_url = 'javascript:alert(1)'; seal(f); blocked(f, 'SOURCE_LOCATOR_REQUIRES_REVIEW');
});
for (const [name, mutate] of [
  ['tamper', f => f.bundle.observations[0].value = 2000],
  ['duplicate entity', f => f.bundle.entities.push(clone(f.bundle.entities[0]))],
  ['dangling receipt', f => f.bundle.observations[0].receipt_refs.push('unknown')],
  ['dangling parent', f => f.bundle.sources[0].receipt.parent_receipt_ids.push('unknown')],
  ['changed lineage', f => f.bundle.sources[0].receipt.artifact.cache_run_id = 'wrong'],
  ['wrong coverage relationship', f => f.bundle.coverage[0].observation_refs = [f.bundle.observations[1].observation_id]],
  ['string count', f => f.bundle.observations[0].value = '1000'],
  ['reversed period', f => f.bundle.observations[0].period.end = '2026-08-01'],
  ['mismatched rights', f => f.bundle.sources[0].receipt.rights_classification = 'unknown_review_required'],
  ['array observation', f => f.bundle.observations[0].value = [1000]],
  ['unexpected property', f => f.bundle.unexpected = 'hidden']
]) test('producer rejects ' + name, () => {
  const f = fixture(); mutate(f); assert.throws(() => mapPublicEvidence(JSON.stringify(f.bundle), f.mapping, options), { code: 'PUBLIC_EVIDENCE_CONTRACT_INVALID' });
});
for (const uri of ['/tmp/private.json','file:///tmp/private.json','C:\\private.json']) test('reject local locator ' + uri, () => {
  const f = fixture(); f.bundle.sources[0].receipt.artifact.uri = uri; f.bundle.input_artifacts[0].uri = uri;
  assert.throws(() => mapPublicEvidence(JSON.stringify(f.bundle), f.mapping, options), { code: 'PUBLIC_EVIDENCE_CONTRACT_INVALID' });
});
test('duplicate keys in either JSON rejected', () => {
  const f = fixture(); assert.throws(() => mapPublicEvidence(f.raw.replace('"bundle_id":','"bundle_id":"hidden","bundle_id":'),f.mapping,options), { code:'PUBLIC_EVIDENCE_CONTRACT_INVALID' });
  const raw = JSON.stringify(f.mapping).replace('"human_owner":','"human_owner":"hidden","human_owner":');
  assert.throws(() => mapPublicEvidence(f.raw,raw,options), { code:'PUBLIC_EVIDENCE_CONTRACT_INVALID' });
});
test('zero observation retained with attribution', () => {
  const f=fixture(); f.bundle.observations.find(x=>x.measure_id==='/baseline_denied').value=0; seal(f); const x=mapped(f);
  assert.equal(x.case.data.baseline_denied,0); assert.equal(runCase(x.case).values.relative_change,null);
});
for (const [name,mutate,code] of [
  ['mixed source origin',f=>f.mapping.source_origin='source_derived','MAPPING_ORIGIN_MISMATCH'],
  ['missing assignment',f=>f.mapping.bindings.pop(),'MAPPING_PATHS_INVALID'],
  ['duplicate path',f=>f.mapping.bindings[1].path=f.mapping.bindings[0].path,'MAPPING_PATHS_INVALID'],
  ['prototype path',f=>f.mapping.bindings[0].path='/__proto__/polluted','MAPPING_PATHS_INVALID'],
  ['concealed literal',f=>f.mapping.data.baseline_claims=1000,'MAPPING_TEMPLATE_REQUIRES_NULL_LEAVES'],
  ['invalid calendar date',f=>f.mapping.as_of='2026-02-30','MAPPING_CONTRACT_INVALID']
]) test(name+' rejected',()=>{const f=fixture();mutate(f);assert.throws(()=>mapped(f),{code});assert.equal({}.polluted,undefined);});
test('synthetic fixture cannot become aggregate',()=>{const f=fixture();f.mapping.source_origin='source_derived';f.mapping.data_mode='aggregate';blocked(f,'SYNTHETIC_BUNDLE_CANNOT_BECOME_AGGREGATE');});
test('impossible denominator blocks final case',()=>{const f=fixture();f.bundle.observations.find(x=>x.measure_id==='/baseline_denied').value=1001;seal(f);blocked(f,'CASE_CONTRACT_INVALID');});
test('runtime unavailable is explicit',()=>{const f=fixture();assert.throws(()=>mapPublicEvidence(f.raw,f.mapping,{python:'/nonexistent/healthcare-python'}),{code:'EVIDENCE_VALIDATOR_UNAVAILABLE'});});
test('oversized input rejected before validator',()=>assert.throws(()=>mapPublicEvidence(' '.repeat(2*1024*1024+1),fixture().mapping,options),{code:'INPUT_TOO_LARGE'}));
test('licensed beds cannot become claims even with matching expected unit',()=>{
  const f=fixture();f.bundle.observations[0].unit='beds';f.mapping.bindings[0].expect.unit='beds';seal(f);blocked(f,'TARGET_UNIT_MISMATCH');
});
test('baseline numerator and denominator require the same period',()=>{
  const f=fixture();f.bundle.observations[1].period=f.bundle.observations[2].period;f.mapping.bindings[1].expect.period=clone(f.bundle.observations[1].period);seal(f);blocked(f,'COHORT_ALIGNMENT_REQUIRES_REVIEW');
});
test('source cohorts must match even when owner expectations match each row',()=>{
  const f=fixture();f.bundle.observations[1].denominator_scope='different cohort';f.mapping.bindings[1].expect.denominator_scope='different cohort';seal(f);blocked(f,'COHORT_ALIGNMENT_REQUIRES_REVIEW');
});
test('parent receipt with unreviewed rights blocks child evidence',()=>{
  const f=fixture(),parent=clone(f.bundle.sources[0]);parent.source_id='parent-source';parent.receipt.receipt_id='parent-receipt';parent.access_rights='unknown_review_required';parent.receipt.rights_classification='unknown_review_required';
  f.bundle.sources.push(parent);f.bundle.sources[0].receipt.parent_receipt_ids=['parent-receipt'];seal(f);blocked(f,'SOURCE_RIGHTS_REQUIRES_REVIEW');
});
test('parent receipt conflict blocks selected derived evidence',()=>{
  const f=fixture(),parent=clone(f.bundle.sources[0]);parent.source_id='parent-source';parent.receipt.receipt_id='parent-receipt';
  f.bundle.sources.push(parent);f.bundle.sources[0].receipt.parent_receipt_ids=['parent-receipt'];
  f.bundle.conflicts.push({conflict_id:'parent-conflict',conflict_type:'parent issue',entity_refs:[],observation_refs:[],receipt_refs:['parent-receipt'],status:'open',rationale:'Unresolved synthetic parent source.'});
  seal(f);blocked(f,'SOURCE_CONFLICT_REQUIRES_REVIEW');
});
test('cyclic parent lineage blocks safely',()=>{
  const f=fixture();f.bundle.sources[0].receipt.parent_receipt_ids=['synthetic-receipt'];seal(f);blocked(f,'RECEIPT_LINEAGE_REQUIRES_REVIEW');
});
test('Python canonical float representation is verified without JS rehashing',()=>{
  const f=fixture();f.bundle.observations.at(-1).value_type='number';f.mapping.bindings.at(-1).expect.value_type='number';
  const code="import json,sys; from public_evidence import PublicEvidenceBundleInput,build_public_evidence_bundle; x=json.load(sys.stdin); x.pop('bundle_sha256');x.pop('schema_version');x['observations'][-1]['value']=42000.0;print(build_public_evidence_bundle(PublicEvidenceBundleInput.model_validate(x)).model_dump_json())";
  const p=spawnSync(python,['-B','-c',code],{input:JSON.stringify(f.bundle),encoding:'utf8',env:{...process.env,PYTHONPATH:path.join(ROOT,'lib/data-mcp-contract')},timeout:5000});
  assert.equal(p.status,0,p.stderr);f.raw=p.stdout;f.mapping.bundle_sha256=JSON.parse(p.stdout).bundle_sha256;
  assert.ok(f.raw.includes('42000.0'));assert.equal(mapped(f).case.data.denied_dollars,42000);
});
test('transport schema does not coerce numeric dates',()=>{const f=fixture();f.bundle.created_at=1790942400;assert.throws(()=>mapPublicEvidence(JSON.stringify(f.bundle),f.mapping,options),{code:'PUBLIC_EVIDENCE_CONTRACT_INVALID'});});
test('unsafe integers cannot lose custody through JS parsing',()=>{const f=fixture();f.bundle.request.parameters.unsafe=9007199254740992;assert.throws(()=>mapPublicEvidence(JSON.stringify(f.bundle),f.mapping,options),{code:'UNSAFE_NUMBER_REQUIRES_REVIEW'});});
test('one leading BOM is parsed but remains in bundle and mapping custody hashes',()=>{
  const f=fixture(),raw='\uFEFF'+f.raw,mappingRaw='\uFEFF'+JSON.stringify(f.mapping),x=mapPublicEvidence(raw,mappingRaw,options);
  assert.equal(x.status,'ready_for_human_review');
  assert.equal(x.provenance.raw_bundle_sha256,'sha256:'+crypto.createHash('sha256').update(raw).digest('hex'));
  assert.equal(x.provenance.mapping_sha256,'sha256:'+crypto.createHash('sha256').update(mappingRaw).digest('hex'));
});
test('multiple leading BOMs are rejected',()=>{
  const f=fixture();assert.throws(()=>mapPublicEvidence('\uFEFF\uFEFF'+f.raw,f.mapping,options),{code:'PUBLIC_EVIDENCE_CONTRACT_INVALID'});
  assert.throws(()=>mapPublicEvidence(f.raw,'\uFEFF\uFEFF'+JSON.stringify(f.mapping),options),{code:'MAPPING_CONTRACT_INVALID'});
});
test('backlog from another population blocks despite matching owner expectations',()=>{
  const f=fixture('ambulatory-access-backlog'),o=f.bundle.observations.find(x=>x.measure_id==='/backlog'),binding=f.mapping.bindings.find(x=>x.path==='/backlog');
  o.denominator_scope=binding.expect.denominator_scope='different clinic population';seal(f);blocked(f,'COHORT_ALIGNMENT_REQUIRES_REVIEW');
});
test('backlog snapshot period can differ from aligned weekly reporting period',()=>{
  const f=fixture('ambulatory-access-backlog'),o=f.bundle.observations.find(x=>x.measure_id==='/backlog'),binding=f.mapping.bindings.find(x=>x.path==='/backlog');
  o.period={label:'snapshot 2026-10-03',start:'2026-10-03',end:'2026-10-03'};binding.expect.period=clone(o.period);seal(f);
  assert.equal(runCase(mapped(f).case).values.weeks_to_clear_backlog,5);
});
for(const field of ['/appeal_deadline','/available_documents/0','/required_documents/0'])test('appeal context mismatch '+field+' blocks',()=>{
  const f=fixture('prior-authorization-appeal-workup'),binding=f.mapping.bindings.find(x=>x.path===field);
  assert.ok(binding);const o=f.bundle.observations.find(x=>x.observation_id===binding.observation_id);
  o.denominator_scope=binding.expect.denominator_scope='different payer/product/decision context';seal(f);blocked(f,'COHORT_ALIGNMENT_REQUIRES_REVIEW');
});
test('appeal population compares remaining source observations with mixed owner inputs',()=>{
  const f=fixture('prior-authorization-appeal-workup'),binding=f.mapping.bindings.find(x=>x.path==='/decision_date'),o=f.bundle.observations.find(x=>x.observation_id===binding.observation_id);
  f.mapping.bindings=f.mapping.bindings.filter(x=>x!==binding);f.mapping.owner_inputs.push({path:binding.path,value:o.value,as_of:f.mapping.as_of,description:'Operator supplied decision date.'});
  const b=f.mapping.bindings.find(x=>x.path==='/appeal_deadline');f.bundle.observations.find(x=>x.observation_id===b.observation_id).denominator_scope=b.expect.denominator_scope='different payer context';seal(f);blocked(f,'COHORT_ALIGNMENT_REQUIRES_REVIEW');
});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'hag-evidence-map-'));
try {
  test('actual CLI creates pinned case and sidecar bundle',()=>{
    const id='denial-spike-workup',output=path.join(temp,'valid');
    const p=spawnSync(process.execPath,[path.join(ROOT,'bin/cli.js'),'admin','import-evidence',path.join(dir,id+'.bundle.json'),'--mapping',path.join(dir,id+'.mapping.json'),'--output',output,'--python',python],{encoding:'utf8',timeout:15000});
    assert.equal(p.status,0,p.stderr);assert.equal(JSON.parse(p.stdout).status,'ready_for_human_review');
    assert.equal(fs.readFileSync(path.join(output,'public-evidence-bundle.json'),'utf8'),fixture().raw);
    assert.equal(runCase(JSON.parse(fs.readFileSync(path.join(output,'case.json')))).values.percentage_point_change,8);
    const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json')));
    for(const row of manifest.files){const bytes=fs.readFileSync(path.join(output,row.path));assert.equal(bytes.length,row.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);}
    assert.throws(()=>importEvidence(fixture().raw,fixture().mapping,output,options),/Output already exists/);
  });
  test('actual CLI preserves original BOM bytes and manifest hash',()=>{
    const f=fixture(),input=path.join(temp,'bom-bundle.json'),mapping=path.join(temp,'bom-mapping.json'),output=path.join(temp,'bom-output');
    const bytes=Buffer.from('\uFEFF'+f.raw);fs.writeFileSync(input,bytes);fs.writeFileSync(mapping,'\uFEFF'+JSON.stringify(f.mapping));
    const p=spawnSync(process.execPath,[path.join(ROOT,'bin/cli.js'),'admin','import-evidence',input,'--mapping',mapping,'--output',output,'--python',python],{encoding:'utf8',timeout:15000});
    assert.equal(p.status,0,p.stderr);assert.deepEqual(fs.readFileSync(path.join(output,'public-evidence-bundle.json')),bytes);
    const hash=crypto.createHash('sha256').update(bytes).digest('hex'),sidecar=JSON.parse(fs.readFileSync(path.join(output,'evidence-map.json')));
    assert.equal(sidecar.provenance.raw_bundle_sha256,'sha256:'+hash);
    const row=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'))).files.find(x=>x.path==='public-evidence-bundle.json');
    assert.equal(row.bytes,bytes.length);assert.equal(row.sha256,hash);
  });
  test('blocked export keeps sidecar and omits case',()=>{const f=fixture();f.mapping.bindings[0].expect.unit='wrong';const output=path.join(temp,'blocked');const x=importEvidence(f.raw,f.mapping,output,options);assert.equal(x.status,'blocked');assert.equal(fs.existsSync(path.join(output,'case.json')),false);assert.equal(JSON.parse(fs.readFileSync(path.join(output,'evidence-map.json'))).case,null);});
} finally {fs.rmSync(temp,{recursive:true,force:true});}
(async()=>{
  const runtime=new ToolRuntime();
  try {
    const f=fixture();
    // Fully invented aggregate simulation, only for operator-policy contract testing.
    delete f.bundle.request.parameters.synthetic;f.bundle.sources[0].receipt.acquisition_method='simulated_public';seal(f);
    f.mapping.data_mode='aggregate';f.mapping.source_origin='source_derived';const x=mapped(f);assert.equal(x.status,'ready_for_human_review');
    const reply=await runtime.call('investigate_denial_spike',{case:x.case});
    test('mapping cannot enable aggregate MCP execution',()=>assert.equal(reply.structuredContent.error.code,'MODE_NOT_ALLOWED'));
    const approved=new ToolRuntime({allowAggregate:true});
    try{const allowed=await approved.call('investigate_denial_spike',{case:x.case});test('operator-owned runtime accepts mapped aggregate contract',()=>{assert.equal(allowed.structuredContent.result.values.percentage_point_change,8);assert.equal(allowed.structuredContent.result.data_mode,'aggregate');});}finally{await approved.close();}
  }finally{await runtime.close();}
  console.log(JSON.stringify({status:'passed',assertions,workflows:6,network_calls:0,model_calls:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
