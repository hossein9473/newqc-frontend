import {test} from 'node:test';import assert from 'node:assert/strict';import {exportParams,fetchExport} from '../src/exportDownload.ts';
test('exports exclude pagination, retain zero score, and preserve applied completed/all status',()=>{
 const p=exportParams('calls','offset=25&limit=25&evaluation_status=completed&score_max=0&department_id=2','xlsx');assert.equal(p.has('offset'),false);assert.equal(p.has('limit'),false);assert.equal(p.get('score_max'),'0');assert.equal(p.get('evaluation_status'),'completed');assert.equal(p.get('department_id'),'2');assert.equal(exportParams('calls','evaluation_status=all','csv').has('evaluation_status'),false);
});
test('call export preserves source alongside extension and agent; other report types exclude it',()=>{for(const format of ['csv','xlsx']){const p=exportParams('calls','voip_source_id=2&extension=105&support_agent_id=42',format);assert.equal(p.get('voip_source_id'),'2');assert.equal(p.get('extension'),'105');assert.equal(p.get('support_agent_id'),'42');}assert.equal(exportParams('agents','voip_source_id=2','xlsx').has('voip_source_id'),false);});
test('department export matches UI sort defaults and question drilldown retains revision and reason',()=>{const p=exportParams('departments','include_inactive=false','xlsx');assert.equal(p.get('sort_by'),'total_calls');assert.equal(p.get('sort_dir'),'desc');assert.equal(p.get('include_inactive'),'false');const q=exportParams('question-calls','question_revision_id=9&reason_code=not_applicable&date_from=2026-11-01','csv');assert.equal(q.get('question_revision_id'),'9');assert.equal(q.get('reason_code'),'not_applicable');});
test('binary download uses bearer headers without placing credentials in URL',async()=>{const old=globalThis.fetch;let call;globalThis.fetch=async(url,options)=>{call={url,options};return new Response('test',{headers:{'Content-Type':'text/csv'}})};try{const file=await fetchExport('agents','department_id=1','csv','secret',new AbortController().signal);assert.equal(await file.blob.text(),'test');assert.equal(file.filename,'goftban_agents.csv');assert.equal(call.url.includes('secret'),false);assert.equal(call.options.headers.Authorization,'Bearer secret');assert.equal(call.options.credentials,'omit');}finally{globalThis.fetch=old}});
test('large outputs and session failures are explicit and unknown server text is never exposed',async()=>{const old=globalThis.fetch;try{for(const status of [401,413,500]){globalThis.fetch=async()=>new Response('secret server message',{status});await assert.rejects(fetchExport('calls','','xlsx','token',new AbortController().signal),e=>e.status===status&&!e.message.includes('secret'));}}finally{globalThis.fetch=old}});

test('filter forms and exports use distinct React keys and render export after filters',async()=>{
 const {readFile}=await import('node:fs/promises');
 for(const name of ['AgentPerformance','QuestionPerformance','DepartmentPerformance','Reports']){
  const source=await readFile(new URL('../src/'+name+'.tsx',import.meta.url),'utf8');
  assert.ok(source.includes("<form key={'filters:'+query}"),name);
  assert.ok(source.includes("<ReportExport key={'export:'+query}"),name);
  assert.ok(source.indexOf('</form>')<source.indexOf('<ReportExport'),name);
 }
});
