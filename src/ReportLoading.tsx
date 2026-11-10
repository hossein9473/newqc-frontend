export default function ReportLoading({label}:{label:string}){
 return <div className="panel report-loading" role="status" aria-busy="true"><p>{label}</p><div aria-hidden="true" className="loading-placeholder">{Array.from({length:5},(_,i)=><div key={i}><span/><span/><span/></div>)}</div></div>;
}
