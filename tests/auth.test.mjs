import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validUser,request,ApiError} from '../src/api.ts';
test('only backend roles and valid identity shapes are accepted',()=>{
 assert.equal(validUser({id:1,full_name:'Test',email:'a@b.c',role:'admin'}),true);
 for(const role of ['employee','owner',null])assert.equal(validUser({id:1,full_name:'Test',email:'a@b.c',role}),false);
 assert.equal(validUser({id:'1',full_name:'Test',email:'a@b.c',role:'analyst'}),false);
});
test('request serializes JSON and Bearer without browser credentials',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async(url,options)=>{assert.equal(url,'/api/v1/users/me/password');assert.equal(options.headers.Authorization,'Bearer example');assert.equal(options.credentials,'omit');assert.deepEqual(JSON.parse(options.body),{new_password:'sample'});return new Response(null,{status:204});};
 assert.equal(await request('/users/me/password','example',{new_password:'sample'}),undefined);
 }finally{globalThis.fetch=original;}
});
test('errors retain HTTP status but do not leak server exception text',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response(JSON.stringify({detail:'private traceback'}),{status:500});
 await assert.rejects(request('/auth/me','example'),e=>e instanceof ApiError&&e.status===500&&!e.message.includes('traceback'));
 globalThis.fetch=async()=>new Response('{}',{status:401});
 await assert.rejects(request('/auth/me','example'),e=>e instanceof ApiError&&e.status===401);
 }finally{globalThis.fetch=original;}
});

test('department edits send PATCH and preserve false active status',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async(url,options)=>{assert.equal(url,'/api/v1/departments/3');assert.equal(options.method,'PATCH');assert.equal(options.headers.Authorization,'Bearer example');assert.deepEqual(JSON.parse(options.body),{name:'Support',is_active:false});return new Response(JSON.stringify({id:3,name:'Support',is_active:false}),{status:200});};
 const result=await request('/departments/3','example',{name:'Support',is_active:false},'PATCH');assert.equal(result.is_active,false);
 }finally{globalThis.fetch=original;}
});
test('duplicate department conflict preserves status for the form',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response(JSON.stringify({detail:'Department name already exists'}),{status:409});await assert.rejects(request('/departments','example',{name:'Support'}),e=>e instanceof ApiError&&e.status===409);}finally{globalThis.fetch=original;}
});

test('extension release sends an explicit bodyless POST, not GET',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async(url,options)=>{assert.equal(url,'/api/v1/support-agent-extensions/7/release');assert.equal(options.method,'POST');assert.equal(options.body,undefined);assert.equal(options.headers.Authorization,'Bearer example');return new Response(JSON.stringify({id:7,current_slot:null}),{status:200});};const result=await request('/support-agent-extensions/7/release','example',undefined,'POST');assert.equal(result.current_slot,null);}finally{globalThis.fetch=original;}
});
