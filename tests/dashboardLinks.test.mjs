import{test}from'node:test';import assert from'node:assert/strict';import{dashboardLinkParams}from'../src/dashboardLinks.ts';
test('dashboard drilldown preserves scope and uses inclusive score maximum',()=>{
 const base=new URLSearchParams('date_from=2026-11-01&department_id=2&support_agent_id=3&source_type=upload&offset=25');
 const p=dashboardLinkParams(base,'low');assert.equal(p.get('score_max'),'60');assert.equal(p.get('evaluation_status'),'completed');assert.equal(p.get('department_id'),'2');assert.equal(p.get('date_from'),'2026-11-01');assert.equal(p.has('offset'),false);assert.equal(p.has('eligibility_status'),false);
});
test('failed processing links use processing rather than evaluation status',()=>{const p=dashboardLinkParams(new URLSearchParams(),'failed');assert.equal(p.get('processing_status'),'failed');assert.equal(p.has('evaluation_status'),false);});
