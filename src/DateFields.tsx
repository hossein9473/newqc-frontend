import{toPersian}from'./persianDate';
import PersianPicker from './PersianPicker';
export default function DateFields({params}:{params:URLSearchParams}){return <><PersianPicker name="jalali_from" label="از تاریخ" initial={toPersian(params.get('date_from')||'')}/><PersianPicker name="jalali_to" label="تا تاریخ" initial={toPersian(params.get('date_to')||'')}/></>;}
