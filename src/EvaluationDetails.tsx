import{detailRows}from'./detailValues';
export default function EvaluationDetails({value}:{value:unknown}) {
 return <details open><summary>جزئیات تکمیلی ارزیابی</summary>
   {value===null?<p className="muted">جزئیات تکمیلی برای این پاسخ ذخیره نشده است.</p>:<dl className="qc-detail-list">{detailRows(value).map((row,index)=><div key={index}><dt>{row.path.length?row.path.map((part,i)=><span key={i}><bdi>{part||'کلید بدون نام'}</bdi>{i<row.path.length-1?' / ':''}</span>):'محتوا'}</dt><dd>{row.text}</dd></div>)}</dl>}
   <details><summary>نمایش ساختار اصلی</summary><pre className="structured">{JSON.stringify(value,null,2)}</pre></details>
 </details>;
}
