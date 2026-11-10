import{useEffect,useState}from'react';
import{ApiError,request}from'./api';
type Department={id:number;name:string;is_active:boolean};
type Agent={id:number;full_name:string;department_id:number;is_active:boolean};
export default function OrganizationFilters({token,params,onExpired}:{token:string;params:URLSearchParams;onExpired:()=>void}){
 const [departments,setDepartments]=useState<Department[]>([]);const [agents,setAgents]=useState<Agent[]>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError('');
  async function all<T>(path:string):Promise<T[]>{const items:T[]=[];for(let offset=0;active;offset+=100){const page=await request<T[]>(`${path}?limit=100&offset=${offset}`,token);items.push(...page);if(page.length<100)return items;}return [];}
  Promise.all([all<Department>('/departments'),all<Agent>('/support-agents')]).then(([d,a])=>{if(active){setDepartments(d);setAgents(a);}}).catch(e=>{if(!active)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError('دریافت فهرست دپارتمان‌ها و کارشناسان انجام نشد.');}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[token,retry]);
 const department=params.get('department_id')||'';const agent=params.get('support_agent_id')||'';
 return <><label>دپارتمان<select name="department_id" defaultValue={department} aria-busy={loading}><option value="">همهٔ دپارتمان‌های مجاز</option>{department&&!departments.some(d=>String(d.id)===department)&&<option value={department}>دپارتمان انتخاب‌شده</option>}{departments.map(d=><option key={d.id} value={d.id}>{d.name}{d.is_active?'':' (غیرفعال)'}</option>)}</select></label><label>کارشناس<select name="support_agent_id" defaultValue={agent} aria-busy={loading}><option value="">همهٔ کارشناسان مجاز</option>{agent&&!agents.some(a=>String(a.id)===agent)&&<option value={agent}>کارشناس انتخاب‌شده</option>}{agents.map(a=><option key={a.id} value={a.id}>{a.full_name} · {departments.find(d=>d.id===a.department_id)?.name||'دپارتمان نامشخص'}{a.is_active?'':' (غیرفعال)'}</option>)}</select></label>{loading&&<span role="status" className="visually-hidden">دریافت گزینه‌ها…</span>}{error&&<div role="alert"><span>{error} </span><button type="button" className="textlink evidence-button" onClick={()=>setRetry(retry+1)}>تلاش مجدد</button></div>}</>;
}
