const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('portal/home-notices.js','utf8');
const fn=source.slice(source.indexOf('function drawSlide()'),source.indexOf('function drawList()'));
const nodes={};const get=id=>nodes[id]??=( {textContent:'',hidden:false,title:'',setAttribute(k,v){this[k]=v}} );
const ctx={$:get,items:[{date:'2026-12-01',endDate:'2026-12-01',event:'通常',category:'発注NG',title:'発注休止',partner:'山芳海産'}],index:0,paused:false,host:{querySelector:get},range:()=> '2026/12/01'};
vm.createContext(ctx);vm.runInContext(fn+'drawSlide()',ctx);assert.equal(nodes.homeNoticePartner.textContent,'山芳海産');assert.equal(nodes.homeNoticePartner.hidden,false);assert.match(nodes.homeNoticeOpen['aria-label'],/山芳海産/);
ctx.items[0].partner='';vm.runInContext('drawSlide()',ctx);assert.equal(nodes.homeNoticePartner.hidden,true);assert.equal(nodes.homeNoticePartner.textContent,'');
const css=fs.readFileSync('portal/home-notices.css','utf8');assert.match(css,/homeNoticePartner\{display:block;grid-column:2;grid-row:2/);console.log('PASS partner displayed, accessible name, empty partner hidden, two-row compact layout');
