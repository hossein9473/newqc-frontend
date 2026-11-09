import{detailRows}from'./detailValues';
const titles:Record<string,string>={improvement:'پیشنهاد بهبود',improvements:'پیشنهادهای بهبود',recommendation:'توصیه',recommendations:'توصیه‌ها',strengths:'نقاط قوت',weaknesses:'زمینه‌های بهبود',summary:'جمع‌بندی',reason:'دلیل',evidence:'شواهد',description:'توضیح',note:'یادداشت',notes:'یادداشت‌ها'};
const title=(key:string)=>titles[key]||(/^\[\d+\]$/.test(key)?`مورد ${Number(key.slice(1,-1))+1}`:key.replace(/_/g,' '));
export default function EvaluationDetails({value}:{value:unknown}) {
 return <section className="question-extra" aria-label="جزئیات تکمیلی ارزیابی"><h4>جزئیات تکمیلی ارزیابی</h4>
   {value===null?<p className="muted">جزئیات تکمیلی برای این پاسخ ذخیره نشده است.</p>:<dl className="qc-detail-list">{detailRows(value).map((row,index)=><div key={index}><dt>{row.path.length?row.path.map((part,i)=><span key={i}><bdi>{title(part)||'توضیح'}</bdi>{i<row.path.length-1?' / ':''}</span>):'محتوا'}</dt><dd>{row.text}</dd></div>)}</dl>}
 </section>;
}
