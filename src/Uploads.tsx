import {useEffect,useState} from 'react';
import {ApiError,request,type User} from './api';
import NewUpload from './NewUpload';
import UploadDetail from './UploadDetail';
import type {UploadBatch} from './uploadTypes';
import {batchLabels} from './uploadRules';
import {toPersian} from './persianDate';
export default function Uploads({token,user,route,onExpired}:{token:string;user:User;route:string;onExpired:()=>void}){
 const [items,setItems]=useState<UploadBatch[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[offset,setOffset]=useState(0),[retry,setRetry]=useState(0),[creating,setCreating]=useState(false);
 const id=Number(route.split('?')[0].split('/')[2]);
 useEffect(()=>{if(id)return;let active=true;setLoading(true);setError('');request<UploadBatch[]>(`/upload-batches?limit=21&offset=${offset}`,token).then(rows=>{if(active)setItems(rows)}).catch(e=>{if(!active)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError(e instanceof Error?e.message:'دریافت مجموعه‌ها انجام نشد.');}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[token,offset,retry,id]);
 if(id)return <UploadDetail key={id} id={id} token={token} user={user} onExpired={onExpired}/>;
 return <><div className="heading"><div><small>ورود تماس‌های صوتی</small><h1>بارگذاری تماس‌ها</h1><p>فایل‌ها را به کارشناس و داخلی مربوط اختصاص دهید و روند پردازش را دنبال کنید.</p></div><button className="secondary" aria-pressed={creating} onClick={()=>setCreating(v=>!v)}>مجموعهٔ جدید</button></div>{creating&&<NewUpload token={token} onExpired={onExpired} onCreated={b=>{setCreating(false);location.hash='/uploads/'+b.id}}/>}<section className="panel department-list"><div className="extension-heading"><h2>{user.role==='analyst'?'مجموعه‌های من':'مجموعه‌های در دسترس'}</h2><button className="secondary" onClick={()=>setRetry(v=>v+1)}>تازه‌کردن</button></div>{loading?<p role="status">دریافت مجموعه‌ها…</p>:error?<p role="alert">{error}</p>:items.length?<ul>{items.slice(0,20).map(b=><li key={b.id}><div><strong>{b.display_name||'مجموعهٔ تماس‌ها'}</strong><p>{b.selection?.support_agent_name||'کارشناس ثبت‌شده'} · داخلی {b.selection?.extension||'—'} · {b.selection?.department_name} · {b.call_date?toPersian(b.call_date):'بدون تاریخ'}</p><small>{batchLabels[b.status]||'وضعیت نامشخص'}</small></div><a className="textlink" href={'#/uploads/'+b.id}>فایل‌ها و پیگیری</a></li>)}</ul>:<p className="empty">مجموعه‌ای برای نمایش وجود ندارد.</p>}<div className="pagination"><button disabled={loading||offset===0} onClick={()=>setOffset(v=>v-20)}>قبلی</button><span>صفحهٔ {(offset/20+1).toLocaleString('fa-IR')}</span><button disabled={loading||items.length<=20} onClick={()=>setOffset(v=>v+20)}>بعدی</button></div></section></>;
}
