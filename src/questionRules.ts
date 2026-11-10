export function canReviseQuestion(role:string,status:string,isGlobal:boolean){return status==='draft'&&(['admin','manager'].includes(role)||(role==='supervisor'&&!isGlobal));}
export function newQuestionCode(){return 'qc_'+crypto.randomUUID().replaceAll('-','');}
