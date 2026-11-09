import{useEffect,useId,useRef,useState}from'react';
import{toPersian,toGregorian}from'./persianDate';
const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const n=new Intl.NumberFormat('fa-IR');
function today(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(k=>p.find(v=>v.type===k)!.value).join('-');}
export default function PersianPicker({name,label,initial}:{name:string;label:string;initial:string}){
 const now=toPersian(today());const [value,setValue]=useState(initial);const [year,setYear]=useState(Number((initial||now).split('/')[0]));const [month,setMonth]=useState(Number((initial||now).split('/')[1]));const input=useRef<HTMLInputElement>(null);const popup=useRef<HTMLDetailsElement>(null);const id=useId();
 useEffect(()=>{const form=input.current?.form;const reset=()=>{setValue('');if(popup.current)popup.current.open=false};form?.addEventListener('reset',reset);return()=>form?.removeEventListener('reset',reset)},[]);
 const dateValue=(d:number)=>`${year}/${String(month).padStart(2,'0')}/${String(d).padStart(2,'0')}`;
 let days=31;while(days>27){try{toGregorian(dateValue(days));break;}catch{days--;}}
 const weekday=(new Date(toGregorian(dateValue(1))+'T12:00:00Z').getUTCDay()+1)%7;
 const choose=(v:string)=>{setValue(v);if(popup.current)popup.current.open=false;input.current?.focus();};
 const move=(delta:number)=>{let m=month+delta,y=year;if(m<1){m=12;y--}if(m>12){m=1;y++}if(y>=1200&&y<=1600){setYear(y);setMonth(m)}};
 return <div className="date-field"><label htmlFor={id}>{label}</label><input id={id} ref={input} name={name} dir="ltr" value={value} onChange={e=>setValue(e.target.value)} placeholder="انتخاب از تقویم"/>
 <details ref={popup} className="calendar" onKeyDown={e=>{if(e.key==='Escape'){popup.current!.open=false;input.current?.focus();}}}><summary>انتخاب تاریخ شمسی</summary><div className="calendar-panel"><div className="calendar-heading"><button type="button" aria-label="ماه قبل" onClick={()=>move(-1)}>→</button><select aria-label="ماه" value={month} onChange={e=>setMonth(Number(e.target.value))}>{months.map((m,i)=><option value={i+1} key={m}>{m}</option>)}</select><select aria-label="سال" value={year} onChange={e=>setYear(Number(e.target.value))}>{Array.from({length:401},(_,i)=>1200+i).map(y=><option key={y} value={y}>{n.format(y)}</option>)}</select><button type="button" aria-label="ماه بعد" onClick={()=>move(1)}>←</button></div><div className="calendar-grid">{['ش','ی','د','س','چ','پ','ج'].map((d,i)=><span key={'w'+i}>{d}</span>)}{Array.from({length:weekday},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>i+1).map(d=><button type="button" key={d} aria-label={`${n.format(d)} ${months[month-1]} ${n.format(year)}`} aria-pressed={value===dateValue(d)} onClick={()=>choose(dateValue(d))}>{n.format(d)}</button>)}</div><div className="calendar-actions"><button type="button" onClick={()=>choose(now)}>امروز</button><button type="button" onClick={()=>choose('')}>بدون تاریخ</button></div></div></details></div>;
}
