import {test} from 'node:test';import assert from 'node:assert/strict';
import {questionCallsParams,answerGroups,questionCallHref} from '../src/questionReport.ts';
test('question drilldown keeps exact scope, overrides historical department and removes list ordering',()=>{
 const p=questionCallsParams(new URLSearchParams('department_id=1&support_agent_id=8&date_from=2026-11-01&date_to=2026-11-11&source_type=upload&question_set_id=3&sort_by=zero_rate&offset=20'),2,'0');
 assert.equal(p.get('department_id'),'2');assert.equal(p.get('score'),'0');assert.equal(p.get('support_agent_id'),'8');assert.equal(p.get('date_from'),'2026-11-01');assert.equal(p.get('date_to'),'2026-11-11');assert.equal(p.get('question_set_id'),'3');assert.equal(p.get('source_type'),'upload');assert.equal(p.has('offset'),false);assert.equal(p.has('sort_by'),false);
 const unknown=questionCallsParams(p,2,'insufficient_evidence');assert.equal(unknown.has('score'),false);assert.equal(unknown.get('reason_code'),'insufficient_evidence');
});
test('answer chart preserves zero counts and separates unscored groups',()=>{const groups=answerGroups({zero_count:0,one_count:2,two_count:3,insufficient_evidence_count:4,not_applicable_count:1});assert.deepEqual(groups.map(g=>g.count),[0,2,3,4,1]);assert.equal(groups.reduce((s,g)=>s+g.count,0),10);});
test('detail link pins the evaluation and returns to the original filtered report',()=>{const link=questionCallHref(7,9,'department_id=2&offset=10');const p=new URLSearchParams(link.split('?')[1]);assert.equal(p.get('run'),'9');assert.equal(p.get('back'),'/reports/questions?department_id=2&offset=10');});
