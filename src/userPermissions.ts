export type Role='admin'|'manager'|'supervisor'|'analyst';
export const creatableRoles=(role:Role):Role[]=>role==='admin'?['manager','supervisor','analyst']:role==='manager'?['supervisor','analyst']:role==='supervisor'?['analyst']:[];
export const canEditUser=(actor:Role,target:Role)=>actor==='admin'||(actor==='manager'&&['supervisor','analyst'].includes(target));
export const canAssignUser=(actor:Role,target:Role)=>['supervisor','analyst'].includes(target)&&(actor==='admin'||actor==='manager'||(actor==='supervisor'&&target==='analyst'));
export function assignmentChanges(before:number[],after:number[]){return {add_department_ids:after.filter(id=>!before.includes(id)),remove_department_ids:before.filter(id=>!after.includes(id))};}
