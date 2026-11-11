import {test} from 'node:test';
import assert from 'node:assert/strict';
import {editableBatch,uploadError,uploadFileProblem} from '../src/uploadRules.ts';
import {sendAudio,retryUploadId} from '../src/uploadApi.ts';
import {ApiError} from '../src/api.ts';
test('editing requires unstarted active draft and unexpired UTC deadline',()=>{
 const b={status:'ready',started_at:null,draft_expires_at:'2026-11-11T10:00:00'};const now=Date.parse('2026-11-11T09:00:00Z');
 assert.equal(editableBatch(b,now),true);assert.equal(editableBatch(b,now+3600000),false);
 assert.equal(editableBatch({...b,started_at:'2026-11-11T08:00:00'},now),false);
 for(const status of ['cancelled','expired','processing','completed','failed'])assert.equal(editableBatch({...b,status},now),false);
});
test('file checks and errors do not disclose arbitrary server messages',()=>{
 assert.equal(uploadFileProblem({name:'تماس.MP3',size:20}),'');assert.ok(uploadFileProblem({name:'x.exe',size:1}));assert.ok(uploadFileProblem({name:'x.wav',size:0}));
 assert.equal(uploadError('private path or SQL'),undefined);assert.ok(uploadError('No published question set for this department'));
});
test('retry IDs survive reselection and are scoped to owner and batch',()=>{
 const old=globalThis.sessionStorage;const store=new Map();globalThis.sessionStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
 try{const f=new File(['audio'],'a.wav',{lastModified:10});const id=retryUploadId(1,2,f);assert.equal(retryUploadId(1,2,new File(['audio'],'a.wav',{lastModified:10})),id);assert.notEqual(retryUploadId(1,3,f),id);assert.notEqual(retryUploadId(2,2,f),id);}finally{globalThis.sessionStorage=old;}
});
test('audio is raw bytes and the same retry identifier is sent on retry',async()=>{
 const original=globalThis.fetch;const file=new File(['audio'],'تماس.wav');const calls=[];
 globalThis.fetch=async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify({call_id:1}),{status:201});};
 try{for(let i=0;i<2;i++)await sendAudio(4,file,'same-id','token',new AbortController().signal);assert.equal(calls[0].url,calls[1].url);assert.equal(calls[0].init.body,file);assert.equal(calls[0].init.headers['Content-Type'],'application/octet-stream');assert.equal(new URL('http://local'+calls[0].url).searchParams.get('filename'),'تماس.wav');}finally{globalThis.fetch=original;}
});
test('network failure remains uncertain and server secrets stay hidden',async()=>{
 const original=globalThis.fetch;const f=new File(['x'],'x.wav');try{globalThis.fetch=async()=>{throw Error('internal')};await assert.rejects(sendAudio(1,f,'id','token',new AbortController().signal),e=>e instanceof ApiError&&e.status===0);globalThis.fetch=async()=>new Response(JSON.stringify({detail:'secret path'}),{status:500});await assert.rejects(sendAudio(1,f,'id','token',new AbortController().signal),e=>e.status===500&&!e.message.includes('secret'));}finally{globalThis.fetch=original;}
});

test('upload results are available only after processing completes, polling every two minutes',async()=>{
 const {canReviewUpload,uploadPollInterval}=await import('../src/uploadRules.ts');
 assert.equal(uploadPollInterval,120000);assert.equal(canReviewUpload('completed'),true);
 for(const state of ['queued','processing','evaluating','failed','cancelled',''])assert.equal(canReviewUpload(state),false);
});
