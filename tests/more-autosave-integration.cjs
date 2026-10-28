// Actual v84 wrapper and seasonal extension chain, with all requests intercepted.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/data/browser-tests/node_modules/playwright-core'),fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),BASE='https://happachan1111.github.io/pear-shipping-widget/';
const source=fs.readFileSync(ROOT+'/mothers-day/forecast-excel-inline-v109.js','utf8'),excel=JSON.parse(source.slice(source.indexOf('const EXCEL_FORECASTS_2026=')+27,source.indexOf(';let stateKey=')));
const core=fs.readFileSync(ROOT+'/mothers-day/app-v7-core.js','utf8');const ctx={URLSearchParams,location:{search:'?event=mother'},Date,document:{}};vm.createContext(ctx);vm.runInContext(core,ctx);
const originals=vm.runInContext('[...scheduleSeeds.map(scheduleBody),...forecastSeeds.map(forecastBody),cardBody(cardSeed)]',ctx);
for(const list of Object.values(excel))for(const x of list)originals.push(vm.runInContext('forecastBody('+JSON.stringify(x)+')',ctx));
for(const event of ['mother','father','aged','valentine','white'])originals.push(vm.runInContext('invoiceBody('+JSON.stringify({id:'invoice-'+event,eventKey:event,year:2026,partner:'福田屋',issueDate:'2026-05-01',searchTitle:'試験',searchKey:'k',orderMemo:'',count:2,shippingDate:''})+')',ctx));
(async()=>{const b=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});try{
for(const [event,width] of [['mother',1440],['father',390],['aged',1440],['valentine',390],['white',1440]]){
 let rows=structuredClone(originals),writes=[],errors=[];const c=await b.newContext({serviceWorkers:'block',viewport:{width,height:900}});
 await c.route('**/*',async route=>{const q=route.request(),u=new URL(q.url());if(u.hostname.endsWith('workers.dev')){if(q.method()==='GET')return route.fulfill({json:{rows,posts:[],items:[],activity:[]}});const d=q.postDataJSON();writes.push(d);rows=rows.filter(x=>x.id!==d.id);rows.push({...d,updated_at:Date.now()});return route.fulfill({json:{ok:true}})}if(u.hostname==='happachan1111.github.io'){let f=path.join(ROOT,u.pathname.replace('/pear-shipping-widget/',''));if(process.env.BASELINE&&u.pathname.endsWith('/mothers-day/v84.html'))f='/data/portal-guide-audit/mothers-day/v84.html';if(fs.existsSync(f)&&fs.statSync(f).isFile())return route.fulfill({path:f,contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':f.endsWith('.svg')?'image/svg+xml':'text/html'});return route.fulfill({status:404,body:''})}return route.abort()});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(BASE+'mothers-day/v84.html?event='+event+'&tab=forecast');
 if(process.env.BASELINE){await p.waitForTimeout(2000);console.log('BASELINE ui42 loading notices',errors);await c.close();break}await p.waitForFunction(()=>!!document.getElementById('widget')?.contentWindow?.TearlumTableAutosave);
 const f=p.frames().find(f=>f.url().includes('mothers-day/index.html'));
 await f.waitForFunction(()=>document.querySelector('#forecastBody tr [role=status]'));
 await p.waitForTimeout(500);const loadingErrors=errors.splice(0);console.log('Initial offline loading notices',event,loadingErrors);const first=f.locator('#forecastBody tr').first(),id=await first.getAttribute('data-id');assert(rows.some(x=>x.id===id),'baseline remote record');
 await first.locator('[data-field=forecast]').fill('987');assert.equal(await p.evaluate(()=>portalHasUnsavedChanges()),true,'wrapper pending delegation');
 await first.locator('[role=status]').filter({hasText:'保存済み'}).waitFor();assert.equal(JSON.parse(rows.find(x=>x.id===id).memo).forecast,987);assert.equal(await p.evaluate(()=>portalHasUnsavedChanges()),false);assert.deepEqual(errors,[]);console.log('PASS actual v84 '+event+' '+width);await c.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
