import {dashboardLinkParams} from './dashboardLinks.ts';
export type TrendPoint={day:string;total_calls:number;evaluated_calls:number;average_qc_percent:number|null;evaluation_coverage_percent:number|null};
export function recentPeriod(days:number,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const to=['year','month','day'].map(k=>parts.find(p=>p.type===k)!.value).join('-');
 const from=new Date(Date.parse(to+'T12:00:00Z')-(days-1)*86400000).toISOString().slice(0,10);
 return {from,to};
}
export function dashboardScope(query:string,now=new Date()){
 const p=new URLSearchParams(query);
 if(!p.has('date_from')&&!p.has('date_to')&&p.get('period')!=='all'){
  const {from,to}=recentPeriod(30,now);p.set('date_from',from);p.set('date_to',to);
 }
 return p;
}
export function dayCallsParams(base:URLSearchParams,day:string){const p=dashboardLinkParams(base,'all');p.set('date_from',day);p.set('date_to',day);return p;}
// A missing score breaks the line; a real zero remains a plotted score.
export function scoreSegments(points:TrendPoint[]){
 const segments:{index:number;value:number}[][]=[];let current:{index:number;value:number}[]=[];
 points.forEach((p,index)=>{if(p.average_qc_percent===null){if(current.length)segments.push(current);current=[];}else current.push({index,value:p.average_qc_percent});});
 if(current.length)segments.push(current);return segments;
}
