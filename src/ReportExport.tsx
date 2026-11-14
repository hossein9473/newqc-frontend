import {useEffect,useRef,useState} from 'react';
import {ApiError} from './api';
import {fetchExport,type ExportKind} from './exportDownload';
export default function ReportExport({kind,scope,token,onExpired}:{kind:ExportKind;scope:string;token:string;onExpired:()=>void}){
 const [format,setFormat]=useState<'xlsx'|'csv'>('xlsx'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');const lock=useRef(false),active=useRef(true),controller=useRef<AbortController|null>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort()}},[]);
 async function download(){if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');const current=new AbortController();controller.current=current;const timer=setTimeout(()=>current.abort(),120000);
 try{const file=await fetchExport(kind,scope,format,token,current.signal);if(!active.current)return;const url=URL.createObjectURL(file.blob),a=document.createElement('a');a.href=url;a.download=file.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setNotice('فایل برای دانلود به مرورگر ارسال شد.');}
 catch(e){if(!active.current)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError(e instanceof Error?e.message:'دریافت فایل انجام نشد.');}finally{clearTimeout(timer);lock.current=false;if(active.current)setBusy(false);}}
 return <section className="report-export"><div className="report-export-heading"><div><h2>دریافت خروجی گزارش</h2><p className="report-export-description">خروجی همهٔ نتایج با فیلترهای اعمال‌شده، حداکثر ۵۰۰۰ ردیف است.</p></div><div className="report-export-controls"><label>قالب خروجی<select value={format} disabled={busy} onChange={e=>setFormat(e.target.value as 'xlsx'|'csv')}><option value="xlsx">Excel</option><option value="csv">CSV</option></select></label><button type="button" className="secondary" aria-pressed={busy} disabled={busy} onClick={()=>void download()}>{busy?'آماده‌سازی فایل…':'دریافت خروجی'}</button></div></div>{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}</section>;
}
