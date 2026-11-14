import {uploadError} from './uploadRules.ts';
import {questionError} from './questionRules.ts';
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
const messages: Record<number,string> = {
  401:'اطلاعات ورود معتبر نیست یا نشست پایان یافته است.',
  403:'اجازهٔ انجام این عملیات را ندارید.',
  404:'اطلاعات درخواستی پیدا نشد یا در دسترس شما نیست.',
  422:'اطلاعات واردشده را بررسی کنید.',
  429:'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.',
};
export async function request<T>(path:string, token:string|null, body?:unknown,method?:'POST'|'PATCH'|'DELETE'|'PUT'):Promise<T> {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try {
    const response=await fetch('/api/v1'+path, {
      method:method??(body===undefined?'GET':'POST'), cache:'no-store', credentials:'omit',
      headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}:{})},
      body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,
    });
    if(!response.ok){
      const data=await response.json().catch(()=>null);
      const passwordErrors:Record<string,string>={
        'Current password is incorrect':'رمز فعلی درست نیست.',
        'New password must differ from current password':'رمز جدید باید با رمز فعلی متفاوت باشد.',
      };
      throw new ApiError(response.status,(path.includes('/question-sets')?questionError(data?.detail):undefined)||(path.startsWith('/upload-batches')?uploadError(data?.detail):undefined)||passwordErrors[data?.detail]||messages[response.status]||'ارتباط با سرور با خطا مواجه شد؛ دوباره تلاش کنید.');
    }
    if(response.status===204)return undefined as T;
    return await response.json() as T;
  } catch(error){
    if(error instanceof ApiError)throw error;
    throw new ApiError(0,controller.signal.aborted?'سرور در زمان مناسب پاسخ نداد.':'اتصال به سرور برقرار نشد. لطفاً دوباره تلاش کنید.');
  } finally {clearTimeout(timer);}
}
export type User={id:number;full_name:string;email:string;role:'admin'|'manager'|'supervisor'|'analyst'};
export function validUser(value:unknown):value is User {
  if(!value||typeof value!=='object')return false;
  const u=value as User;
  return Number.isInteger(u.id)&&typeof u.full_name==='string'&&typeof u.email==='string'&&['admin','manager','supervisor','analyst'].includes(u.role);
}
