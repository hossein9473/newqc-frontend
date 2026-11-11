import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ApiError,request} from './api';
import PersianPicker from './PersianPicker';
import {toGregorian} from './persianDate';
import type {UploadBatch,UploadSelection} from './uploadTypes';
type Department={id:number;name:string;is_active:boolean};
export default function NewUpload({token,onCreated,onExpired}:{token:string;onCreated:(b:UploadBatch)=>void;onExpired:()=>void}){
 const [departments,setDepartments]=useState<Department[]>([]),[department,setDepartment]=useState(''),[options,setOptions]=useState<UploadSelection[]>([]),[assignment,setAssignment]=useState('');
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0),[uncertain,setUncertain]=useState(false);
 const name=useRef('batch_'+crypto.randomUUID().replaceAll('-',''));const alive=useRef(true);const lock=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
 function fail(e:unknown){if(e instanceof ApiError&&e.status===401)onExpired();else setError(e instanceof Error?e.message:'دریافت اطلاعات انجام نشد.');}
 useEffect(()=>{let active=true;setLoading(true);setError('');(async()=>{
 const all:Department[]=[];for(let offset=0;active;offset+=100){const page=await request<Department[]>(`/departments?limit=100&offset=${offset}`,token);all.push(...page);if(page.length<100)break;}
 if(!active)return;const available=all.filter(d=>d.is_active);setDepartments(available);
 if(!department)return;
 if(!available.some(d=>String(d.id)===department)){setDepartment('');setAssignment('');setOptions([]);return;}
 const choices:UploadSelection[]=[];for(let offset=0;active;offset+=100){const page=await request<UploadSelection[]>(`/upload-batches/options?department_id=${department}&limit=100&offset=${offset}`,token);choices.push(...page);if(page.length<100)break;}
 if(active){setOptions(choices);setAssignment(previous=>choices.some(o=>String(o.extension_assignment_id)===previous)?previous:'');}
 })().catch(e=>{if(active)fail(e)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[department,token,retry]);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();if(lock.current)return;const form=new FormData(e.currentTarget);setError('');
 let date:string;try{date=toGregorian(String(form.get('date')||''));}catch(e){fail(e);return;}
 lock.current=true;setSaving(true);
 try{
  if(uncertain){const found=await request<UploadBatch[]>('/upload-batches?name='+name.current,token);if(found.length){onCreated(found[0]);return;}}
  const batch=await request<UploadBatch>('/upload-batches',token,{name:name.current,display_name:String(form.get('title')||'').trim()||null,department_id:Number(department),extension_assignment_id:Number(assignment),call_date:date,...(form.get('time')?{call_time:form.get('time')}:{})});if(alive.current)onCreated(batch);
 }catch(e){if(alive.current){if(e instanceof ApiError&&(e.status===0||e.status>=500||e.status===409))setUncertain(true);fail(e);}}
 finally{lock.current=false;if(alive.current)setSaving(false);}}
 return <section className="panel department-editor new-upload"><h2>ایجاد مجموعهٔ جدید تماس‌ها</h2><p className="muted">فایل‌های هر مجموعه برای یک کارشناس و داخلی و یک تاریخ و ساعت مشترک ثبت می‌شوند. برای زمان‌های متفاوت، مجموعه‌های جدا بسازید.</p><form onSubmit={save}><fieldset disabled={saving}><label>عنوان مجموعه<input name="title" maxLength={200} placeholder="مثلاً تماس‌های صبح پشتیبانی"/></label><label>دپارتمان<select required value={department} disabled={loading||uncertain} onChange={e=>{setDepartment(e.target.value);setAssignment('');setOptions([])}}><option value="">انتخاب دپارتمان</option>{departments.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></label><label>کارشناس و داخلی<select required value={assignment} disabled={loading||uncertain} onChange={e=>setAssignment(e.target.value)}><option value="">انتخاب کارشناس و داخلی</option>{options.map(o=><option key={o.extension_assignment_id} value={o.extension_assignment_id}>{o.support_agent_name} · داخلی {o.extension} · {o.voip_source_name}</option>)}</select></label><PersianPicker name="date" label="تاریخ تماس‌ها" initial=""/><label>ساعت تماس‌ها به وقت تهران<input name="time" type="time" dir="ltr" onClick={e=>{try{e.currentTarget.showPicker?.()}catch{/* Native keyboard entry remains available. */}}}/><small>اگر خالی بماند، ساعت ۱۰ صبح ثبت می‌شود.</small></label><div className="filter-actions">{loading&&<span role="status">دریافت گزینه‌ها…</span>}{!loading&&department&&!options.length&&<p>این دپارتمان کارشناس فعال با داخلی جاری ندارد.</p>}{error&&<p role="alert">{error}</p>}{uncertain&&<p>نتیجهٔ ساخت قبلی نامشخص است. دکمهٔ زیر ابتدا وجود همان مجموعه را بررسی می‌کند.</p>}{error&&!uncertain&&<button type="button" className="secondary" disabled={loading} onClick={()=>setRetry(v=>v+1)}>تلاش مجدد برای دریافت گزینه‌ها</button>}<button className="secondary" aria-pressed={saving} disabled={loading||!assignment}>{saving?'در حال ثبت…':uncertain?'بررسی و ادامه':'اطلاعات بالا رو ثبت کن، بریم برای انتخاب فایل'}</button></div></fieldset></form></section>;
}
