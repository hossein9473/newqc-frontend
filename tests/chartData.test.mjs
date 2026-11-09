import {test} from 'node:test';import assert from 'node:assert/strict';
import {recentPeriod,dashboardScope,dayCallsParams,scoreSegments} from '../src/chartData.ts';
test('recent periods use Tehran day at UTC midnight boundary and include both endpoints',()=>{
 const now=new Date('2026-11-08T21:00:00Z');
 assert.deepEqual(recentPeriod(7,now),{from:'2026-11-03',to:'2026-11-09'});
 assert.deepEqual(recentPeriod(30,now),{from:'2026-10-11',to:'2026-11-09'});
 assert.deepEqual(recentPeriod(7,new Date('2026-03-02T12:00:00Z')),{from:'2026-02-24',to:'2026-03-02'});
});
test('dashboard default adds dates, explicit all-time and one-ended ranges stay unchanged',()=>{
 const now=new Date('2026-11-09T12:00:00Z');
 assert.equal(dashboardScope('',now).get('date_from'),'2026-10-11');
 assert.equal(dashboardScope('period=all',now).has('date_from'),false);
 assert.equal(dashboardScope('date_from=2026-01-01',now).has('date_to'),false);
 assert.equal(dashboardScope('department_id=4',now).get('department_id'),'4');
});
test('daily drilldown narrows dates while preserving scope and all evaluation states',()=>{
 const p=dayCallsParams(new URLSearchParams('date_from=2026-10-01&date_to=2026-10-30&department_id=4&support_agent_id=8&source_type=upload&offset=25'),'2026-10-15');
 assert.equal(p.get('date_from'),'2026-10-15');assert.equal(p.get('date_to'),'2026-10-15');assert.equal(p.get('department_id'),'4');assert.equal(p.get('support_agent_id'),'8');assert.equal(p.get('source_type'),'upload');assert.equal(p.get('evaluation_status'),'all');assert.equal(p.has('offset'),false);
});
test('missing scores break lines without discarding real zeros or single-day series',()=>{
 const points=[null,0,40,null,70,null].map(average_qc_percent=>({average_qc_percent}));
 assert.deepEqual(scoreSegments(points),[[{index:1,value:0},{index:2,value:40}],[{index:4,value:70}]]);
 assert.deepEqual(scoreSegments([{average_qc_percent:null}]),[]);
 assert.deepEqual(scoreSegments([{average_qc_percent:0}]),[[{index:0,value:0}]]);
});
