export const questionScopeKeys=['date_from','date_to','department_id','support_agent_id','source_type','question_set_id'];
export function questionCallsParams(scope:URLSearchParams,department:number,group:string){
 const p=new URLSearchParams();for(const key of questionScopeKeys){const value=scope.get(key);if(value)p.set(key,value);}p.set('department_id',String(department));
 if(['0','1','2'].includes(group))p.set('score',group);
 if(['insufficient_evidence','not_applicable'].includes(group))p.set('reason_code',group);
 return p;
}
export function answerGroups(q:{zero_count:number;one_count:number;two_count:number;insufficient_evidence_count:number;not_applicable_count:number}){return [
 {key:'0',label:'نمرهٔ صفر',count:q.zero_count,color:'#b65a4c'},
 {key:'1',label:'نمرهٔ یک',count:q.one_count,color:'#b59a67'},
 {key:'2',label:'نمرهٔ دو',count:q.two_count,color:'#478474'},
 {key:'insufficient_evidence',label:'شواهد ناکافی',count:q.insufficient_evidence_count,color:'#7789a6'},
 {key:'not_applicable',label:'بدون کاربرد در تماس',count:q.not_applicable_count,color:'#8d8792'}];}

export function questionCallHref(callId:number,runId:number,scope:string){return '#/calls/'+callId+'?'+new URLSearchParams({run:String(runId),back:'/reports/questions'+(scope?'?'+scope:'')});}
