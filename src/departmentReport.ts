export const departmentScopeKeys=['date_from','date_to','department_id','support_agent_id','source_type'];
export function departmentScope(params:URLSearchParams,id?:number){const p=new URLSearchParams();for(const key of departmentScopeKeys){const value=params.get(key);if(value)p.set(key,value);}if(id!==undefined)p.set('department_id',String(id));return p;}
export function departmentReportHref(params:URLSearchParams,id:number,target:'calls'|'agents'|'questions'|'dashboard'){
 const p=departmentScope(params,id);if(target==='calls')p.set('evaluation_status','all');if(target==='dashboard'&&!p.has('date_from')&&!p.has('date_to'))p.set('period','all');
 return '#'+(target==='calls'?'/calls':target==='dashboard'?'/dashboard':'/reports/'+target)+'?'+p;
}
