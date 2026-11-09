export type Call = { id:number; agent:string; extension:string; department:string; date:string; duration:string; score:number|null; coverage:number|null; status:'completed'|'evaluating'|'failed'; source:string };
export const calls:Call[] = [
{id:1042,agent:'سارا احمدی',extension:'۱۰۵',department:'فروش',date:'۱۴۰۵/۰۸/۱۸',duration:'۴:۳۲',score:88,coverage:90,status:'completed',source:'VoIP'},
{id:1041,agent:'علی رضایی',extension:'۱۰۸',department:'پشتیبانی',date:'۱۴۰۵/۰۸/۱۸',duration:'۶:۱۰',score:76,coverage:80,status:'completed',source:'آپلود'},
{id:1040,agent:'مریم کریمی',extension:'۱۱۲',department:'فروش',date:'۱۴۰۵/۰۸/۱۸',duration:'۳:۴۵',score:null,coverage:null,status:'evaluating',source:'VoIP'},
{id:1039,agent:'رضا محمدی',extension:'۱۱۴',department:'پشتیبانی',date:'۱۴۰۵/۰۸/۱۷',duration:'۵:۰۸',score:null,coverage:null,status:'failed',source:'VoIP'},
{id:1038,agent:'نرگس حسینی',extension:'۱۱۸',department:'فروش',date:'۱۴۰۵/۰۸/۱۷',duration:'۷:۲۰',score:92,coverage:100,status:'completed',source:'آپلود'},
];
export const fa=(n:number)=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(n);
export const statuses={completed:'ارزیابی‌شده',evaluating:'در حال ارزیابی',failed:'خطا در ارزیابی'};
export const answers=[{title:'شناسایی نیاز مشتری',score:2,weight:2,reason:'کارشناس دربارهٔ تعداد کاربران و نیاز اصلی پرسیده و برداشت خود را با مشتری بررسی کرده است.',evidence:'چند نفر از سامانه استفاده می‌کنند و مهم‌ترین نیاز تیمتان چیست؟',code:'observed',details:[['پرسش تکمیلی','مشاهده شد'],['بازگویی نیاز','مشاهده شد']]},{title:'ارائهٔ راهکار متناسب',score:1,weight:2,reason:'راهکار کلی معرفی شده، اما محدودیت‌های آن به‌صورت کامل توضیح داده نشده است.',evidence:'می‌توانید تماس‌ها را بررسی کنید و گزارش عملکرد بگیرید.',code:'observed',details:[['معرفی قابلیت مرتبط','مشاهده شد'],['توضیح محدودیت‌ها','مشاهده نشد']]},{title:'مدیریت اعتراض مشتری',score:null,weight:1,reason:'در این بخش از مکالمه اعتراضی مطرح نشده است.',evidence:null,code:'not_applicable',details:[]}];
