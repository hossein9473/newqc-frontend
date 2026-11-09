export function agentCallsParams(base:URLSearchParams,agentId:number,departmentId:number){
 const p=new URLSearchParams();
 for(const key of ['date_from','date_to','source_type'])if(base.get(key))p.set(key,base.get(key)!);
 p.set('support_agent_id',String(agentId));p.set('department_id',String(departmentId));p.set('evaluation_status','all');return p;
}
