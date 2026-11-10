import {useState,type FormEvent} from 'react';
import {normalizeDigits} from './reportFilters';
import {validWeight,reorderedItems} from './questionRules';
export default function DraftQuestionTools({itemId,weight,index,ids,disabled,onWeight,onOrder}:{itemId:number;weight:string;index:number;ids:number[];disabled:boolean;onWeight:(id:number,value:string)=>void;onOrder:(ids:number[])=>void}){
 const [value,setValue]=useState(weight),[error,setError]=useState('');
 function save(e:FormEvent){e.preventDefault();const v=normalizeDigits(value.trim()).replace('٫','.');if(!validWeight(v)){setError('وزن باید بین ۰٫۰۰۱ و ۹۹۹۹۹۹۹٫۹۹۹، با حداکثر سه رقم اعشار باشد.');return;}setError('');onWeight(itemId,v);}
 return <div className="draft-tools"><form onSubmit={save}><label>وزن سؤال<input dir="ltr" inputMode="decimal" value={value} disabled={disabled} onChange={e=>setValue(e.target.value)}/></label><button className="secondary" disabled={disabled||Number(normalizeDigits(value).replace('٫','.'))===Number(weight)}>ذخیرهٔ وزن</button></form><div className="department-actions"><button className="secondary" disabled={disabled||index===0} onClick={()=>onOrder(reorderedItems(ids,index,-1))}>↑ بالاتر</button><button className="secondary" disabled={disabled||index===ids.length-1} onClick={()=>onOrder(reorderedItems(ids,index,1))}>↓ پایین‌تر</button></div>{error&&<p className="form-error" role="alert">{error}</p>}</div>;
}
