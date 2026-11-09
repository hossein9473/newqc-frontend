export function dashboardLinkParams(base:URLSearchParams,kind:'all'|'low'|'failed'){
 const p=new URLSearchParams();for(const k of ['date_from','date_to','department_id','support_agent_id','source_type'])if(base.get(k))p.set(k,base.get(k)!);
 if(kind==='low'){p.set('score_max','60');p.set('evaluation_status','completed');}
 if(kind==='failed')p.set('processing_status','failed');return p;
}
