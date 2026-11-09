import{test}from'node:test';
import assert from'node:assert/strict';
import{detailRows}from'../src/detailValues.ts';
test('preserves all nested values including false zero null and empty structures',()=>{
 const rows=detailRows({unknown:{flag:false,score:0,nothing:null,empty:'',list:[],object:{},items:['الف',true]}});
 assert.equal(rows.length,8);
 assert.deepEqual(rows.map(r=>r.text),['خیر','0','ثبت نشده','متن خالی','فهرست خالی','جزئیاتی ثبت نشده است','الف','بله']);
 assert.deepEqual(rows[7].path,['unknown','items','[1]']);
});
test('does not interpret markup or drop unknown and ambiguous keys',()=>{
 const rows=detailRows({'a.b':'<script>example</script>',a:{b:'other'},'':'empty key'});
 assert.equal(rows[0].text,'<script>example</script>');
 assert.deepEqual(rows.map(r=>r.path),[['a.b'],['a','b'],['']]);
});
