export const batchLabels:Record<string,string>={draft:'در انتظار فایل',uploading:'در حال دریافت فایل',ready:'آمادهٔ شروع',processing:'در حال پردازش',completed:'تکمیل‌شده',partial_completed:'بخشی تکمیل‌شده',failed:'ناموفق',cancelled:'لغوشده',expired:'مهلت پایان‌یافته'};
export function editableBatch(batch:{status:string;started_at:string|null;draft_expires_at:string},now=Date.now()){
 const expiry=/(?:Z|[+-]\d{2}:\d{2})$/i.test(batch.draft_expires_at)?batch.draft_expires_at:batch.draft_expires_at+'Z';
 return !batch.started_at&&['draft','uploading','ready'].includes(batch.status)&&Date.parse(expiry)>now;
}
export function uploadError(detail:unknown){
 const errors:Record<string,string>={
 'No published question set for this department':'ابتدا مجموعه‌سؤال این دپارتمان را منتشر کنید.',
 'Batch selection is no longer valid':'انتساب داخلی یا وضعیت کارشناس تغییر کرده است؛ مجموعهٔ جدیدی با اطلاعات فعلی بسازید.',
 'Extension assignment is not current':'این داخلی دیگر به کارشناس انتخاب‌شده اختصاص ندارد. گزینه‌ها را تازه کنید.',
 'Upload selection is inactive':'دپارتمان یا کارشناس غیرفعال شده است.',
 'Department is inactive':'این دپارتمان غیرفعال است.',
 'Upload batch has already started':'پردازش آغاز شده و افزودن فایل ممکن نیست.',
 'Upload batch is not editable':'این مجموعه دیگر قابل ویرایش نیست.',
 'Upload batch has expired':'مهلت ارسال این مجموعه پایان یافته است؛ مجموعهٔ جدیدی بسازید.',
 'Upload batch has no files':'ابتدا حداقل یک فایل صوتی ارسال کنید.',
 'Batch has no call date; create a new dated batch':'این مجموعهٔ قدیمی تاریخ تماس ندارد؛ مجموعهٔ جدیدی بسازید.',
 'Upload ID was already used for different content':'فایل این تلاش با ارسال قبلی متفاوت است؛ فایل اصلی را انتخاب کنید.',
 'Batch file-count limit exceeded':'تعداد فایل‌های مجموعه به سقف مجاز رسیده است.',
 'Batch size limit exceeded':'حجم مجموعه به سقف مجاز رسیده است.',
 'Audio format is disabled':'این قالب صوتی در تنظیمات سامانه غیرفعال است.',
 'Cannot cancel a started batch':'پردازش آغاز شده و لغو مجموعه ممکن نیست.',
 };
 return typeof detail==='string'?errors[detail]:undefined;
}
export function uploadFileProblem(file:{name:string;size:number}){
 if(!/\.(wav|mp3)$/i.test(file.name))return 'فقط فایل WAV یا MP3 انتخاب کنید.';
 if(!file.size)return 'فایل خالی است.';
 if(file.name.length>255)return 'نام فایل نباید بیشتر از ۲۵۵ نویسه باشد.';
 return '';
}
