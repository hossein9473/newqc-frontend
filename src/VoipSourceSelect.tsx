import {useEffect,useState} from 'react';
import {request,ApiError} from './api';
type Source={id:number;name:string;is_active:boolean};
export default function VoipSourceSelect({token,onExpired,value,onChange,initial='',required=false}:{token:string;onExpired:()=>void;value?:string;onChange?:(value:string)=>void;initial?:string;required?:boolean}){
 const [items,setItems]=useState<Source[]>([]),[busy,setBusy]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let current=true;setBusy(true);setError('');async function load(){try{const rows:Source[]=[];for(let offset=0;current;offset+=100){const batch=await request<Source[]>('/voip-sources/options?limit=100&offset='+offset,token);rows.push(...batch);if(batch.length<100)break;}if(current)setItems(rows);}catch(e){if(!current)return;if(e instanceof ApiError&&e.status===401)onExpired();else setError('دریافت مراکز تلفن انجام نشد.');}finally{if(current)setBusy(false)}}void load();return()=>{current=false}},[token,retry]);
 const selected=value??initial;
 return <label>مرکز تلفن<select name="voip_source_id" value={value} defaultValue={value===undefined?initial:undefined} required={required} aria-busy={busy} onChange={e=>onChange?.(e.target.value)}><option value="">{required?'انتخاب مرکز تلفن':'همهٔ مراکز'}</option>{selected&&!items.some(i=>String(i.id)===selected)&&<option value={selected}>مرکز انتخاب‌شده</option>}{items.map(i=><option key={i.id} value={i.id}>{i.name}{i.is_active?'':' (دریافت تماس غیرفعال)'}</option>)}</select>{error&&<span role="alert">{error} <button type="button" className="textlink" onClick={()=>setRetry(r=>r+1)}>تلاش مجدد</button></span>}</label>;
}
