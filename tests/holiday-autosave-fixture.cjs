// All requests are intercepted; test writes update an in-memory store only.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),BASE='https://happachan1111.github.io/pear-shipping-widget/';
const OUT=process.env.TEST_OUTPUT_DIR||path.join(require('os').tmpdir(),'holiday-autosave-tests');fs.mkdirSync(OUT,{recursive:true});
const seeds=JSON.parse(fs.readFileSync(ROOT+'/portal/holiday-shipping-seeds.json'));
const ok=(v,m)=>{if(!v)throw Error(m);console.log('PASS',m)};
async function scene(browser,{width=1440,region='sanin',kind='yearend',empty=false,fastTimeout=false}={}){
 const plan=structuredClone(region==='sanin'?seeds.plans[kind]:seeds.regionalTemplates.okinawa[kind]);plan.region=region;const r=plan.firstSupplier,id='holiday-shipping|'+(region==='sanin'?'':region+'|')+'2026|'+kind;
 plan.sheets[0].cells[r+1][0].v=' ';plan.sheets[0].cells[r+1][2].v='非表示の保存データ';
 const original={id,record_type:'holiday_shipping_plan',memo:JSON.stringify({version:1,plan}),comments:[{text:'既存の保存内容'}],updated_at:1};
 const control={rows:empty?[]:[structuredClone(original)],writes:[],reads:0,failRead:false,mode:'ok',delay:0,accept:true};
 control.rows.push({id:'untouched',record_type:'order',memo:'変更しない'});
 const contexts=[];
 async function person(){const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',hasTouch:width<651});contexts.push(c);
 if(fastTimeout)await c.addInitScript(()=>{const set=window.setTimeout;window.setTimeout=(fn,ms,...args)=>set(fn,ms===30000?150:ms,...args)});
 await c.route('**/*',async route=>{const q=route.request(),u=new URL(q.url());
 if(u.hostname.endsWith('workers.dev')){
  if(q.method()==='GET'){control.reads++;if(control.failRead)return route.fulfill({status:503,json:{error:'模擬読み込み失敗'}});if(control.mode==='preflight-timeout'&&control.reads>1){await new Promise(r=>setTimeout(r,250));return route.fulfill({json:{rows:control.rows}}).catch(()=>{})}return route.fulfill({json:{rows:structuredClone(control.rows),activity:[]}})}
  if(!['POST','PUT'].includes(q.method()))throw Error('Unexpected '+q.method());const body=q.postDataJSON();control.writes.push({method:q.method(),body});
  if(control.delay)await new Promise(r=>setTimeout(r,control.delay));
  if(control.mode==='write-fail')return route.fulfill({status:503,json:{error:'模擬保存失敗'}});
  const row={...body,updated_at:Date.now()};control.rows=control.rows.filter(x=>x.id!==body.id);control.rows.push(row);
  if(control.mode==='write-timeout'){await new Promise(r=>setTimeout(r,250));return route.fulfill({json:{ok:true}}).catch(()=>{})}
  if(control.mode==='write-abort')return route.abort();
  if(control.mode==='verify-fail')control.failRead=true;
  if(control.mode==='verify-different'){const p=JSON.parse(row.memo).plan;p.sheets[0].cells[r][1].v='別の更新';row.memo=JSON.stringify({version:1,plan:p})}
  return route.fulfill({json:{ok:true}});
 }
 if(u.hostname==='happachan1111.github.io'){const f=path.join(ROOT,u.pathname.replace('/pear-shipping-widget/',''));if(fs.existsSync(f)&&fs.statSync(f).isFile())return route.fulfill({path:f,contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':f.endsWith('.svg')?'image/svg+xml':'text/html'});return route.fulfill({status:404,body:''})}
 return route.abort();});const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>control.accept?d.accept():d.dismiss());
 await p.goto(BASE+'portal/holiday-shipping.html?kind='+kind+'&region='+region);await ready(p);return {p,errors};}
 return {control,person,plan,r,id,original,close:async()=>{for(const c of contexts)await c.close()}};
}
const ready=p=>p.waitForFunction(()=>window.AppUI?.state==='ready'&&!document.querySelector('#reload').disabled);
const toggle=(p,r)=>p.locator('#grid [data-confirm-r="'+r+'"]').first();
const saved=p=>p.waitForFunction(()=>document.getElementById('saveIndicator').dataset.state==='saved'&&!document.getElementById('reload').disabled);
const state=p=>p.locator('#saveIndicator').getAttribute('data-state');
async function edit(p,r,c,value){await p.evaluate(({r,c})=>shippingColors.openCell(r,c),{r,c});await p.locator('#cellDialog').waitFor({state:'visible'});await p.locator('#value').fill(value);await p.locator('#cellForm .primary').click()}
async function settings(p){if(!await p.locator('#tableSettings').evaluate(e=>e.open))await p.locator('#tableSettings > summary').click()}
const current=p=>p.evaluate(()=>shippingColors.getTable().plan);
module.exports={OUT,chromium,scene,ok,ready,toggle,saved,state,edit,settings,current};
