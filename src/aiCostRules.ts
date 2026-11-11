export const costKeys=['date_from','date_to','department_id','support_agent_id','source_type','stage','provider','model','currency'];
export function costScope(query:string){const input=new URLSearchParams(query),p=new URLSearchParams();for(const k of costKeys)if(input.get(k))p.set(k,input.get(k)!);return p;}
// Preserve backend decimal strings; do not round small amounts or coerce missing amounts to zero.
export function costAmount(value:string|null){if(value===null)return 'نامشخص';return value.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]).replace('.', '٫');}
export function costGroupScope(scope:string,group:string,key:string,currency:string){const p=costScope(scope);p.set('currency',currency);const field=group==='department'?'department_id':group;if(['department_id','stage','provider','model'].includes(field))p.set(field,key);return p;}
