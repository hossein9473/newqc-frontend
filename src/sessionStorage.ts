const key='goftban.access-token';
export function tokenExpiresAt(token:string){try{const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return typeof payload.exp==='number'&&Number.isFinite(payload.exp)?payload.exp*1000:0;}catch{return 0;}}
export function savedToken(storage:Storage|undefined,now=Date.now()){try{const token=storage?.getItem(key);if(token&&tokenExpiresAt(token)>now)return token;storage?.removeItem(key);}catch{/* Storage may be unavailable. */}return null;}
export function saveToken(storage:Storage|undefined,token:string){try{if(tokenExpiresAt(token)>Date.now())storage?.setItem(key,token);}catch{/* In-memory sign-in still works. */}}
export function clearToken(storage:Storage|undefined){try{storage?.removeItem(key)}catch{/* No stored session. */}}
export const sessionKey=key;

export function browserStorage():Storage|undefined{try{return window.localStorage}catch{return undefined}}
