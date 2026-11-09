export const filterKeys=['date_from','date_to','department_id','support_agent_id','extension','source_type','evaluation_status','sort_by','sort_dir','score_min','score_max'] as const;
export function normalizeDigits(value:string){return value.replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));}
export function scoreError(params:URLSearchParams):string|null{
 const min=params.get('score_min'),max=params.get('score_max');
 for(const value of [min,max])if(value!==null&&value!==''&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>100))return 'نمره باید عددی بین صفر و صد باشد.';
 if(min&&max&&Number(min)>Number(max))return 'حداقل نمره نمی‌تواند از حداکثر بیشتر باشد.';
 return null;
}
export function duration(ms:number|null){
 if(ms===null||!Number.isFinite(ms)||ms<0)return '—';
 const seconds=Math.floor(ms/1000);const n=new Intl.NumberFormat('fa-IR');
 return `${n.format(Math.floor(seconds/60))} دقیقه و ${n.format(seconds%60)} ثانیه`;
}
