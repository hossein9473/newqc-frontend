import {ApiError} from './api.ts';
export type ExportKind='calls'|'agents'|'questions'|'question-calls'|'departments'|'dashboard-trends'|'processing-overview'|'processing-jobs'|'ai-overview'|'ai-breakdown'|'ai-requests';
const base=['date_from','date_to','department_id','support_agent_id','source_type'];
const ai=[...base,'stage','provider','model','currency'];
const allowed:Record<ExportKind,string[]>={calls:[...base,'voip_source_id','extension','processing_status','evaluation_status','score_min','score_max','sort_by','sort_dir'],agents:[...base,'sort_by','sort_dir'],questions:[...base,'question_set_id','sort_by','sort_dir'],'question-calls':[...base,'question_set_id','question_revision_id','score','reason_code'],departments:[...base,'include_inactive','sort_by','sort_dir'],'dashboard-trends':base,'processing-overview':base,'processing-jobs':[...base,'stage','status','error_code'],'ai-overview':ai,'ai-breakdown':[...ai,'group_by'],'ai-requests':[...ai,'only_unpriced']};
export function exportParams(kind:ExportKind,scope:string,format:'xlsx'|'csv'){
 const input=new URLSearchParams(scope),p=new URLSearchParams();
 for(const key of allowed[kind]){const value=input.get(key);if(value&&!(key==='evaluation_status'&&value==='all'))p.set(key,value);}
 if(kind==='departments'){if(!p.has('sort_by'))p.set('sort_by','total_calls');if(!p.has('sort_dir'))p.set('sort_dir','desc');}
 p.set('format',format);return p;
}
export async function fetchExport(kind:ExportKind,scope:string,format:'xlsx'|'csv',token:string,signal:AbortSignal){
 const params=exportParams(kind,scope,format);
 try{const response=await fetch('/api/v1/reports/export/'+kind+'?'+params,{headers:{Authorization:`Bearer ${token}`,Accept:format==='csv'?'text/csv':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},credentials:'omit',cache:'no-store',signal});
 if(!response.ok)throw new ApiError(response.status,({401:'نشست پایان یافته است؛ دوباره وارد شوید.',403:'اجازهٔ دریافت این گزارش را ندارید.',413:'حجم خروجی یا تعداد ردیف‌ها بیشتر از حد مجاز است؛ بازهٔ تاریخ یا فیلترها را محدودتر کنید.',409:'داده‌های گزارش هنگام آماده‌سازی تغییر کردند؛ دوباره تلاش کنید.',422:'خروجی برای این فیلترها قابل تهیه نیست. تاریخ‌ها و انتخاب‌ها را بررسی کنید.'} as Record<number,string>)[response.status]||'تهیهٔ فایل انجام نشد؛ دوباره تلاش کنید.');
 const mime=response.headers.get('content-type')||'';if(!mime.includes(format==='csv'?'text/csv':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))throw new Error('unexpected content');
 return {blob:await response.blob(),filename:`goftban_${kind}.${format}`};
 }catch(e){if(e instanceof ApiError)throw e;throw new ApiError(0,signal.aborted?'دریافت فایل متوقف شد یا بیش از حد طول کشید؛ دوباره تلاش کنید.':'ارتباط برای دریافت فایل برقرار نشد.');}
}
