import EvaluationDetails from './EvaluationDetails';
export type Answer={question_set_item_id:number;question_code:string;question_text:string;position:number;weight:string|number;score:number|null;reason_code:string;reason:string;evidence:string[];rubric?:string;rubricUnavailable?:boolean;details?:unknown};
const numbers=new Intl.NumberFormat('fa-IR');
const weightFormat=new Intl.NumberFormat('fa-IR',{minimumFractionDigits:1,maximumFractionDigits:1});
export default function QuestionCard({answer:a,number,transcript,onWitness}:{answer:Answer;number:number;transcript:string|null;onWitness:(text:string)=>void}){
 const weight=Number(a.weight);
 return <article className="question-card">
   <header className="question-heading"><div className="question-title"><h3>{numbers.format(number)}- {a.question_text}</h3><p className="question-weight">وزن سؤال: {Number.isFinite(weight)?weightFormat.format(weight):'—'}</p></div>
   <div className="question-score" aria-label={a.score===null?'بدون نمره':`نمره ${a.score} از ۲`}><span>نمره</span><strong>{a.score===null?'—':numbers.format(a.score)}</strong><span>{a.score===null?'بدون نمره':'از ۲'}</span></div></header>
   <div className="question-body">
   {a.rubric&&<section className="question-definition"><h4>متن کامل و معیار ارزیابی سؤال</h4><p>{a.rubric}</p></section>}
   {a.rubricUnavailable&&<p className="muted">متن تکمیلی سؤال دریافت نشد؛ برای دریافت دوباره صفحه را باز کنید.</p>}
   {a.score===null&&<p className="question-unscored">{a.reason_code==='not_applicable'?'این سؤال در این تماس کاربرد ندارد.':a.reason_code==='insufficient_evidence'?'اطلاعات کافی برای نمره‌دهی این سؤال وجود ندارد.':'برای این سؤال نمره‌ای ثبت نشده است.'}</p>}
   <section><h4>دلیل نمره</h4><p>{a.reason||'دلیلی ثبت نشده است.'}</p></section>
   <section><h4>شواهد</h4>{a.evidence.map((s,i)=><blockquote key={i}><p>{s}</p>{s&&transcript?.includes(s)&&<button className="textlink evidence-button" onClick={()=>onWitness(s)}>نمایش در متن مکالمه</button>}</blockquote>)}</section>
   {a.details!==undefined&&<EvaluationDetails value={a.details}/>}
   </div>
 </article>;
}
