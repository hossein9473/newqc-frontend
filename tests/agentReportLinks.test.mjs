import {test} from 'node:test';import assert from 'node:assert/strict';
import {agentCallsParams} from '../src/agentReportLinks.ts';
test('agent drilldown preserves dates and historical department without completed-only default',()=>{
 const p=agentCallsParams(new URLSearchParams('date_from=2026-10-01&date_to=2026-11-01&department_id=8&support_agent_id=99&source_type=upload&sort_by=average_qc_percent&offset=25'),3,2);
 assert.equal(p.get('department_id'),'2');assert.equal(p.get('support_agent_id'),'3');assert.equal(p.get('evaluation_status'),'all');assert.equal(p.get('date_from'),'2026-10-01');assert.equal(p.get('date_to'),'2026-11-01');assert.equal(p.get('source_type'),'upload');assert.equal(p.has('sort_by'),false);assert.equal(p.has('offset'),false);
});
