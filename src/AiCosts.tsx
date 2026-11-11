import {useEffect,useState} from 'react';
import {ApiError,request} from './api';
import {costAmount} from './aiCostRules';
import type {CurrencyCost,CostGroup} from './aiCostTypes';
import AiCostDetails from './AiCostDetails';
import ReportLoading from './ReportLoading';
const n=new Intl.NumberFormat('fa-IR');
type Department={id:number;name:string};
type Summary={total_requests:number;priced_requests:number;currencies:CurrencyCost[]};
function MoneyCard({title,rows}:{title:string;rows:CurrencyCost[]}){return <section className="panel cost-stat"><h2>{title}</h2>{rows.length?rows.map(r=><div className="cost-stat-amount" key={r.currency}><strong>{costAmount(r.known_cost)}</strong><bdi>{r.currency}</bdi></div>):<strong className="cost-stat-number">۰</strong>}</section>;}
export default function AiCosts({token,route,onExpired}:{token:string;route:string;onExpired:()=>void}){
 const [data,setData]=useState<{overview:Summary;departments:Department[];departmentCosts:CostGroup[];stages:CostGroup[]}|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setError('');setData(null);
 async function groups(group:string){const rows:CostGroup[]=[];for(let offset=0;active;offset+=100){const page=await request<{items:CostGroup[];total:number}>(`/reports/ai-costs/breakdown?group_by=${group}&limit=100&offset=${offset}`,token);rows.push(...page.items);if(rows.length>=page.total)break;if(!page.items.length)throw new Error('داده‌های هزینه تغییر کرده‌اند؛ دوباره تازه‌سازی کنید.');}return rows;}
 async function departments(){const rows:Department[]=[];for(let offset=0;active;offset+=100){const page=await request<Department[]>(`/departments?limit=100&offset=${offset}`,token);rows.push(...page);if(page.length<100)break;}return rows;}
 Promise.all([request<Summary>('/reports/ai-costs/overview',token),departments(),groups('department'),groups('stage')]).then(([overview,departments,departmentCosts,stages])=>{if(active)setData({overview,departments,departmentCosts,stages})}).catch(e=>{if(!active)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError(e instanceof Error?e.message:'دریافت خلاصه انجام نشد.')});return()=>{active=false}},[token,retry]);
 const departmentCards=new Map<number|null,{name:string;rows:CostGroup[]}>();
 if(data){for(const d of data.departments)departmentCards.set(d.id,{name:d.name,rows:[]});for(const row of data.departmentCosts){let card=departmentCards.get(row.department_id);if(!card){card={name:row.department_name||'دپارتمان نامشخص',rows:[]};departmentCards.set(row.department_id,card)}card.rows.push(row);}}
 return <><div className="heading"><div><small>مصرف سرویس‌های هوش مصنوعی</small><h1>هزینه و مصرف</h1></div><button className="secondary" onClick={()=>setRetry(v=>v+1)}>تازه‌کردن</button></div>{error?<p role="alert">{error}</p>:!data?<ReportLoading label="دریافت خلاصهٔ مصرف…"/>:<div className="cost-overview-rows"><div className="cost-overview-grid cost-count-row"><section className="panel cost-stat"><h2>تعداد کل درخواست‌ها</h2><strong className="cost-stat-number">{n.format(data.overview.total_requests)}</strong></section><section className="panel cost-stat"><h2>درخواست‌های دارای هزینه</h2><strong className="cost-stat-number">{n.format(data.overview.priced_requests)}</strong></section></div><div className="cost-overview-grid cost-total-row"><MoneyCard title="هزینهٔ کل" rows={data.overview.currencies}/><MoneyCard title="هزینهٔ تبدیل صوت به متن (کل)" rows={data.stages.filter(r=>r.group_key==='transcription')}/><MoneyCard title="هزینهٔ ارزیابی کیفیت (کل)" rows={data.stages.filter(r=>r.group_key==='evaluation')}/></div><div className="cost-overview-grid cost-department-row">{Array.from(departmentCards,([id,card])=><MoneyCard key={id??'unknown'} title={'هزینهٔ دپارتمان '+card.name} rows={card.rows}/>)}</div></div>}<AiCostDetails key={'table:'+retry} route={route} token={token} onExpired={onExpired}/></>;
}
