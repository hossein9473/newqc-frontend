import {ApiError} from './api.ts';
import {uploadError} from './uploadRules.ts';
export async function sendAudio(batchId:number,file:File,uploadId:string,token:string,signal:AbortSignal){
 const query=new URLSearchParams({upload_id:uploadId,filename:file.name});
 try{
  const response=await fetch(`/api/v1/upload-batches/${batchId}/files?${query}`,{method:'POST',credentials:'omit',cache:'no-store',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/octet-stream',Accept:'application/json'},body:file,signal});
  if(!response.ok){const data=await response.json().catch(()=>null);throw new ApiError(response.status,uploadError(data?.detail)||({401:'نشست پایان یافته است.',403:'اجازهٔ ارسال به این مجموعه را ندارید.',413:'حجم فایل یا مجموعه از سقف مجاز بیشتر است.',415:'قالب فایل پشتیبانی نمی‌شود.',422:'فایل صوتی معتبر نیست یا قالب آن مجاز نیست.',410:'مهلت ارسال این مجموعه پایان یافته است.'} as Record<number,string>)[response.status]||'ارسال تأیید نشد؛ وضعیت مجموعه را بررسی و دوباره تلاش کنید.');}
  return await response.json();
 }catch(e){if(e instanceof ApiError)throw e;throw new ApiError(0,'نتیجهٔ ارسال مشخص نیست. با تلاش مجدد همین فایل، ارسال قبلی بررسی می‌شود.');}
}
// Keep only retry identifiers, never audio bytes or authentication, across navigation/reload.
export function retryUploadId(userId:number,batchId:number,file:File){
 const key='goftban-upload:'+JSON.stringify([userId,batchId,file.name,file.size,file.lastModified]);
 const existing=sessionStorage.getItem(key);if(existing)return existing;
 const id=crypto.randomUUID();sessionStorage.setItem(key,id);return id;
}
