import{test}from'node:test';import assert from'node:assert/strict';
import{normalizeDigits,scoreError,duration}from'../src/reportFilters.ts';
test('normalizes Persian and Arabic digits without changing extension punctuation',()=>{assert.equal(normalizeDigits('۱۰٥-2'),'105-2');});
test('score range handles zero and rejects reversed or invalid ranges',()=>{
 assert.equal(scoreError(new URLSearchParams('score_min=0&score_max=0')),null);
 for(const query of ['score_min=80&score_max=20','score_min=-1','score_max=101','score_min=bad'])assert.ok(scoreError(new URLSearchParams(query)));
});
test('duration distinguishes unavailable from zero and retains long minutes',()=>{
 assert.equal(duration(null),'—');assert.equal(duration(0),'۰ دقیقه و ۰ ثانیه');assert.equal(duration(3661000),'۶۱ دقیقه و ۱ ثانیه');
});

 test('default completed view and explicit all remain distinct in API requests',async()=>{
 const {callViewParams,callApiParams}=await import('../src/reportFilters.ts');
 assert.equal(callApiParams(callViewParams('')).get('evaluation_status'),'completed');
 assert.equal(callApiParams(callViewParams('evaluation_status=all')).has('evaluation_status'),false);
 const failed=callApiParams(callViewParams('processing_status=failed'));
 assert.equal(failed.get('processing_status'),'failed');assert.equal(failed.has('evaluation_status'),false);
 assert.equal(callApiParams(callViewParams('offset=25')).get('evaluation_status'),'completed');
 });
