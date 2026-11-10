// Backend history timestamps are naive UTC; never interpret them in browser local time.
export function historyInstant(value:string){return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)?value:value+'Z';}
