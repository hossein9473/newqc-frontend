export function canReviseQuestion(role:string,status:string,isGlobal:boolean){return status==='draft'&&(['admin','manager'].includes(role)||(role==='supervisor'&&!isGlobal));}
export function newQuestionCode(){return 'qc_'+crypto.randomUUID().replaceAll('-','');}

export function validWeight(value:string){return /^(?:0|[1-9]\d{0,6})(?:\.\d{1,3})?$/.test(value)&&Number(value)>=0.001&&Number(value)<=9999999.999;}
export function reorderedItems(ids:number[],index:number,delta:number){const next=[...ids],to=index+delta;if(index<0||index>=ids.length||to<0||to>=ids.length)return next;[next[index],next[to]]=[next[to],next[index]];return next;}
export function questionError(detail:unknown):string|undefined{
 if(typeof detail!=='string')return;
 const messages:Record<string,string>={
 'Publish or discard the existing draft first':'پیش‌نویس دیگری وجود دارد؛ ابتدا آن را منتشر یا کنار بگذارید.',
 'Active department not found':'دپارتمان فعال نیست یا در دسترس شما قرار ندارد.',
 'Only draft question sets can be modified':'این نسخه دیگر پیش‌نویس نیست؛ اطلاعات را تازه‌سازی کنید.',
 'Only draft question sets can be published':'فقط پیش‌نویس قابل انتشار است.',
 'Only the newest question set version can be published':'نسخهٔ جدیدتری وجود دارد؛ فهرست نسخه‌ها را تازه‌سازی کنید.',
 'Cannot publish an empty question set':'پیش از انتشار حداقل یک سؤال اضافه کنید.',
 'Active global questions cannot be removed from a draft':'سؤال مشترک فعال را نمی‌توان از پیش‌نویس حذف کرد.',
 'Order must contain every draft item exactly once':'فهرست سؤال‌ها تغییر کرده است؛ تازه‌سازی کنید و ترتیب را دوباره تنظیم کنید.',
 'Question position capacity exceeded':'ظرفیت ترتیب سؤال‌ها کافی نیست؛ بررسی مدیر سامانه لازم است.',
 'Question set not found':'این نسخه دیگر در دسترس نیست؛ نسخهٔ دیگری انتخاب کنید.',
 'Question set item not found in this draft':'این سؤال در پیش‌نویس فعلی نیست؛ اطلاعات را تازه‌سازی کنید.',
 'Active question not found':'سؤال فعال در دسترس نیست؛ گزینهٔ دیگری انتخاب کنید.',
 'Question has no revision':'سؤال نسخهٔ قابل استفاده ندارد.',
 'Question is already in this draft':'این سؤال قبلاً به پیش‌نویس اضافه شده است؛ فهرست را تازه‌سازی کنید.',
 'Question transaction conflict; retry':'تغییر هم‌زمان رخ داد؛ اطلاعات را تازه‌سازی و دوباره تلاش کنید.',
 'Question storage temporarily unavailable':'ذخیره‌سازی موقتاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.',
 'Question set version conflict':'نسخه‌ها هم‌زمان تغییر کرده‌اند؛ اطلاعات را تازه‌سازی کنید.',
 'Question set publication conflict':'انتشار با تغییر هم‌زمان مواجه شد؛ نسخه را تازه‌سازی کنید.',
 'Question data conflict':'اطلاعات سؤال هم‌زمان تغییر کرده است؛ تازه‌سازی کنید.'};
 if(messages[detail])return messages[detail];
 if(detail.startsWith('Draft is missing active global questions:'))return 'سؤال‌های مشترک الزامی کامل نیستند؛ از بخش سؤال‌های موجود آن‌ها را اضافه کنید.';
 if(detail.startsWith('Global question ')&&detail.endsWith(' has no revision'))return 'یک سؤال مشترک نسخه ندارد؛ مدیر باید معیار آن را تکمیل کند.';
 if(detail.startsWith('Inactive question:'))return 'یک سؤال غیرفعال در پیش‌نویس است؛ سؤال‌های مجموعه را بررسی کنید.';
 if(detail.startsWith('Incomplete question revision:'))return 'متن یا معیار یک سؤال کامل نیست.';
 if(detail.startsWith('Invalid scoring:'))return 'وزن یا سقف نمرهٔ یک سؤال معتبر نیست.';
}
