export type DetailRow = { path: string[]; text: string };
// Keep original keys and distinguish empty containers, null, false and zero.
export function detailRows(value: unknown, path: string[] = []): DetailRow[] {
  if(value === null) return [{path,text:'ثبت نشده (null)'}];
  if(Array.isArray(value)) return value.length
    ? value.flatMap((item,index)=>detailRows(item,[...path,`[${index}]`]))
    : [{path,text:'فهرست خالی []'}];
  if(typeof value === 'object' && value !== null) {
    const entries=Object.entries(value);
    return entries.length?entries.flatMap(([key,item])=>detailRows(item,[...path,key])):[{path,text:'شیء خالی {}'}];
  }
  if(typeof value==='boolean') return [{path,text:value?'بله (true)':'خیر (false)'}];
  if(value==='') return [{path,text:'رشتهٔ خالی ""'}];
  return [{path,text:String(value)}];
}
