import {useEffect,useRef,useState} from 'react';
import {ApiError} from './api';
import {fetchExport,type ExportKind} from './exportDownload';
export default function ReportExport({kind,scope,token,onExpired}:{kind:ExportKind;scope:string;token:string;onExpired:()=>void}){
 const [format,setFormat]=useState<'xlsx'|'csv'>('xlsx'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');const lock=useRef(false),active=useRef(true),controller=useRef<AbortController|null>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort()}},[]);
 const blocked=kind==='calls'&&!!new URLSearchParams(scope).get('voip_source_id');
 async function download(){if(lock.current||blocked)return;lock.current=true;setBusy(true);setError('');setNotice('');const current=new AbortController();controller.current=current;const timer=setTimeout(()=>current.abort(),120000);
 try{const file=await fetchExport(kind,scope,format,token,current.signal);if(!active.current)return;const url=URL.createObjectURL(file.blob),a=document.createElement('a');a.href=url;a.download=file.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setNotice('فایل برای دانلود به مرورگر ارسال شد.');}
 catch(e){if(!active.current)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError(e instanceof Error?e.message:'دریافت فایل انجام نشد.');}finally{clearTimeout(timer);lock.current=false;if(active.current)setBusy(false);}}
 return <div className="report-export"><div className="report-export-controls"><label>قالب خروجی<select value={format} disabled={busy} onChange={e=>setFormat(e.target.value as 'xlsx'|'csv')}><option value="xlsx">Excel</option><option value="csv">CSV</option></select></label><button type="button" className="secondary" aria-pressed={busy} disabled={busy||blocked} onClick={()=>void download()}>{busy?'آماده‌سازی فایل…':'دریافت خروجی'}</button></div><small>خروجی همهٔ نتایج با فیلترهای اعمال‌شده، حداکثر ۵۰۰۰ ردیف است؛ محدود به این صفحه نیست.{kind==='calls'?' متن مکالمه در فایل خروجی نیست.':''}</small>{blocked&&<p>خروجی با فیلتر مرکز تلفن هنوز در دسترس نیست.</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}</div>;
}
