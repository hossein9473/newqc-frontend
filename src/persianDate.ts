const calendar=new Intl.DateTimeFormat('en-US-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
const dayMs=86400000;
function parts(date:Date){const p=calendar.formatToParts(date);return ['year','month','day'].map(k=>Number(p.find(v=>v.type===k)?.value));}
const digits=(s:string)=>s.replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
export function toPersian(iso:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return '';const date=new Date(iso+'T12:00:00Z');if(!Number.isFinite(date.getTime()))return '';return parts(date).map((v,i)=>String(v).padStart(i?2:4,'0')).join('/');}
export function toGregorian(input:string){
 const match=digits(input.trim()).match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);if(!match)throw new Error('تاریخ شمسی را مانند ۱۴۰۵/۰۸/۱۸ وارد کنید.');
 const [y,m,d]=match.slice(1).map(Number);if(y<1200||y>1600||m<1||m>12||d<1||d>31)throw new Error('تاریخ شمسی معتبر نیست (سال ۱۲۰۰ تا ۱۶۰۰).');
 const target=y*10000+m*100+d;let low=Math.floor(Date.UTC(y+621,0,1)/dayMs),high=Math.floor(Date.UTC(y+622,11,31)/dayMs);
 while(low<=high){const mid=Math.floor((low+high)/2);const date=new Date(mid*dayMs);const [a,b,c]=parts(date);const value=a*10000+b*100+c;if(value===target)return date.toISOString().slice(0,10);if(value<target)low=mid+1;else high=mid-1;}
 throw new Error('این روز در تقویم شمسی وجود ندارد.');
}
export function applyDates(fields:FormData,params:URLSearchParams){
 for(const [field,key]of [['jalali_from','date_from'],['jalali_to','date_to']]){const text=String(fields.get(field)||'').trim();if(text)params.set(key,toGregorian(text));else params.delete(key);params.delete(field);}
 if(params.get('date_from')&&params.get('date_to')&&params.get('date_from')!>params.get('date_to')!)throw new Error('تاریخ شروع باید قبل از تاریخ پایان یا برابر آن باشد.');
}
export function rangeDays(from:string,to:string){return Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/dayMs)+1;}
