import{test}from'node:test';import assert from'node:assert/strict';
import{toGregorian,toPersian,applyDates,rangeDays}from'../src/persianDate.ts';
test('Persian date conversion handles Persian and Arabic digits and Nowruz',()=>{
 assert.equal(toGregorian('۱۴۰۵/۰۸/۱۸'),'2026-11-09');assert.equal(toGregorian('١٤٠٥/٠٨/١٨'),'2026-11-09');assert.equal(toPersian('2026-11-09'),'1405/08/18');assert.equal(toGregorian('1403/01/01'),'2024-03-20');
});
test('leap days and impossible days are validated by the Persian calendar',()=>{
 assert.equal(toGregorian('1399/12/30'),'2021-03-20');for(const d of ['1400/12/30','1405/07/31','1405/13/01','1405/00/01','x'])assert.throws(()=>toGregorian(d));
});
test('day conversion round trips independent of timezone and validates range order',()=>{
 for(const d of ['2026-03-20','2026-03-21','2024-02-29','2021-03-20'])assert.equal(toGregorian(toPersian(d)),d);
 const form=new FormData();form.set('jalali_from','۱۴۰۵/۰۸/۱۸');form.set('jalali_to','۱۴۰۵/۰۸/۱۷');assert.throws(()=>applyDates(form,new URLSearchParams()));form.set('jalali_to','۱۴۰۵/۰۸/۱۸');const params=new URLSearchParams();applyDates(form,params);assert.equal(params.get('date_from'),'2026-11-09');assert.equal(rangeDays('2026-11-09','2026-11-09'),1);
});
