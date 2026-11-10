import {request} from './api.ts';
import {normalizeDigits} from './reportFilters.ts';
export async function ensureInitialExtension(token:string,agentId:number,sourceId:number,extension:string){
 const number=normalizeDigits(extension.trim());
 const existing=await request<{extension:string;voip_source_id:number;current_slot:number|null;valid_to:string|null}[]>('/support-agent-extensions?support_agent_id='+agentId,token);
 if(!existing.some(r=>r.extension===number&&r.voip_source_id===sourceId&&r.current_slot===1&&r.valid_to===null))await request('/support-agent-extensions',token,{support_agent_id:agentId,voip_source_id:sourceId,extension:number});
}
