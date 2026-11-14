import Pagination from './Pagination';
import ReportExport from './ReportExport';
import ReportLoading from './ReportLoading';
import {useEffect,useState,type FormEvent} from 'react';
import {ApiError,request} from './api';
import DateFields from './DateFields';
import OrganizationFilters from './OrganizationFilters';
import {applyDates} from './persianDate';
import {agentCallsParams} from './agentReportLinks';

type Item={support_agent_id:number;support_agent_name:string;department_id:number;department_name:string;total_calls:number;evaluated_calls:number;scored_calls:number;average_qc_percent:number|null;average_question_coverage_percent:number|null};
type Result={items:Item[];total:number};
const n=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
const pct=(v:number|null)=>v===null?'—':n.format(v)+'٪';
const keys=['date_from','date_to','department_id','support_agent_id','source_type','sort_by','sort_dir'];
export default function AgentPerformance({token,route,onExpired}:{token:string;route:string;onExpired:()=>void}){
 const query=route.split('?')[1]||'';const params=new URLSearchParams(query);const offset=Math.max(0,Number(params.get('offset'))||0);
 const [data,setData]=useState<Result|null>(null);const [error,setError]=useState('');const [formError,setFormError]=useState('');const [busy,setBusy]=useState(true);const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setBusy(true);setError('');setData(null);const p=new URLSearchParams();for(const k of keys)if(params.get(k))p.set(k,params.get(k)!);p.set('limit','25');p.set('offset',String(offset));
 request<Result>('/reports/agents?'+p,token).then(result=>{if(active)setData(result)}).catch(e=>{if(!active)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError(e instanceof Error?e.message:'دریافت گزارش انجام نشد.');}).finally(()=>{if(active)setBusy(false)});return()=>{active=false};
 },[token,query,retry]);
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const fields=new FormData(e.currentTarget);const p=new URLSearchParams();for(const k of keys)if(fields.get(k))p.set(k,String(fields.get(k)));try{applyDates(fields,p);setFormError('');location.hash='/reports/agents?'+p;}catch(e){setFormError((e as Error).message);}}
 function page(next:number){const p=new URLSearchParams(query);p.set('offset',String(next));location.hash='/reports/agents?'+p;}
 return <><div className="heading"><div><small>گزارش کیفیت</small><h1>عملکرد کارشناسان</h1><p>کیفیت را همراه با تعداد تماس‌های نمره‌دار مقایسه کنید.</p></div></div>
 <form key={'filters:'+query} className="panel filters call-filters" onSubmit={submit}><DateFields params={params}/><OrganizationFilters token={token} params={params} onExpired={onExpired}/><label>منبع<select name="source_type" defaultValue={params.get('source_type')||''}><option value="">همهٔ منابع</option><option value="voip">VoIP</option><option value="upload">آپلود</option></select></label><label>مرتب‌سازی<select name="sort_by" defaultValue={params.get('sort_by')||'average_qc_percent'}><option value="average_qc_percent">میانگین کیفیت</option><option value="total_calls">تعداد تماس‌ها</option><option value="evaluated_calls">تعداد ارزیابی‌ها</option></select></label><label>ترتیب<select name="sort_dir" defaultValue={params.get('sort_dir')||'asc'}><option value="asc">کمترین به بیشترین</option><option value="desc">بیشترین به کمترین</option></select></label>{formError&&<p role="alert" className="form-error">{formError}</p>}<div className="filter-actions"><button className="primary">اعمال فیلتر</button><button type="button" className="secondary" onClick={e=>{e.currentTarget.form?.reset();setFormError('');location.hash='/reports/agents';}}>پاک‌کردن فیلترها</button></div></form><ReportExport key={'export:'+query} kind="agents" scope={params.toString()} token={token} onExpired={onExpired}/>
 <p className="muted report-note">هر ردیف مربوط به یک کارشناس در دپارتمان زمان تماس است. میانگین کیفیت فقط از تماس‌های دارای نمره محاسبه می‌شود؛ «—» یعنی نمره‌ای در دسترس نیست.</p>
 {busy?<ReportLoading label="در حال دریافت عملکرد کارشناسان…"/>:error?<div className="panel empty"><p className="form-error" role="alert">{error}</p><button className="primary" onClick={()=>setRetry(retry+1)}>تلاش مجدد</button></div>:data&&<section className="panel"><div className="panel-title"><h2>{n.format(data.total)} ردیف عملکرد</h2></div>{data.items.length?<div className="tablewrap agent-performance"><table><thead><tr><th>کارشناس / دپارتمان</th><th>میانگین کیفیت</th><th>کل تماس‌ها</th><th>ارزیابی‌شده</th><th>دارای نمره</th><th>پوشش سؤال‌ها</th><th>تماس‌ها</th></tr></thead><tbody>{data.items.map(item=><tr key={item.department_id+'-'+item.support_agent_id}><td data-label="کارشناس / دپارتمان"><strong>{item.support_agent_name}</strong><small>{item.department_name}</small></td><td data-label="میانگین کیفیت"><strong>{pct(item.average_qc_percent)}</strong></td><td data-label="کل تماس‌ها">{n.format(item.total_calls)}</td><td data-label="ارزیابی‌شده">{n.format(item.evaluated_calls)}</td><td data-label="دارای نمره">{n.format(item.scored_calls)}</td><td data-label="پوشش سؤال‌ها">{pct(item.average_question_coverage_percent)}</td><td data-label="تماس‌ها"><a className="textlink" href={'#/calls?'+agentCallsParams(params,item.support_agent_id,item.department_id)}>مشاهدهٔ تماس‌ها ←</a></td></tr>)}</tbody></table></div>:<div className="empty">در این محدوده تماسی برای کارشناسان ثبت نشده است.</div>}<Pagination id="AgentPerformance" page={Math.floor(offset/25)+1} totalPages={Math.ceil(data.total/25)} onPage={p=>page((p-1)*25)} /></section>}</>;
}
