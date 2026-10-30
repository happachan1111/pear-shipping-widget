const fs=require('fs'),vm=require('vm'),assert=require('assert');
const js=fs.readFileSync('portal/calendar.js','utf8');
const declarations=js.slice(js.indexOf('const E='),js.indexOf('let remote='));
const make=js.slice(js.indexOf('function makeBody('),js.indexOf('\n',js.indexOf('function makeBody(')));
const fields={};for(const id of ['category','title','titleHint','event','date','partner','details','endDate']) fields[id]={value:'',textContent:'',setCustomValidity(){}};
fields.event.value='normal';fields.date.value='2026-12-01';
const ctx={$:id=>fields[id]};vm.createContext(ctx);vm.runInContext(declarations+make+'globalThis.fn={syncTitleRequirement,makeBody,parse,displayTitle}',ctx);
for(const c of ['発注NG','出荷OK','出荷NG']){fields.category.value=c;ctx.fn.syncTitleRequirement();assert.equal(fields.title.required,false);const data=ctx.fn.makeBody(null,'test');assert.equal(JSON.parse(data.memo).title,'');const row=ctx.fn.parse(data);assert.equal(row.title,'');assert.equal(ctx.fn.displayTitle(row),c);console.log('PASS '+c+' blank title roundtrip');}
for(const c of ['備品準備','集計','その他']){fields.category.value=c;ctx.fn.syncTitleRequirement();assert.equal(fields.title.required,true);console.log('PASS '+c+' still required');}
fields.title.value='入力した予定名';assert.equal(ctx.fn.displayTitle({title:fields.title.value,category:'出荷NG'}),'入力した予定名');
const notice=fs.readFileSync('portal/home-notices.js','utf8');const normalize=notice.slice(notice.indexOf('function normalize('),notice.indexOf('function combine('));
vm.runInContext('function memoOf(r){return JSON.parse(r.memo)} function validDate(v){return /^\\d{4}-\\d{2}-\\d{2}$/.test(v)} function category(v){return v}'+normalize+'globalThis.normalize=normalize',ctx);
assert.equal(ctx.normalize({id:'x',date:'2026-12-01',memo:'{"category":"発注NG"}'},'通常').title,'発注NG');console.log('PASS notice fallback and existing title preserved');
