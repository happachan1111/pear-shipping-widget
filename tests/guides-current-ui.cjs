// Guide UI only. All requests intercepted; no live API or Notion requests.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'..'),BASE='https://happachan1111.github.io/pear-shipping-widget/';
const marked=process.env.MARKED_TEST_FILE;
if(!marked)throw Error('Provide MARKED_TEST_FILE with marked 12.0.2');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox']});
 let writes=0,blocked=[];
 try{
 for(const width of [1440,390]){
  const ctx=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await ctx.route('**/*',async r=>{
   const q=r.request(),u=new URL(q.url());if(q.method()!=='GET'){writes++;return r.abort()}
   if(u.href==='https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js')return r.fulfill({contentType:'application/javascript',body:fs.readFileSync(marked)});
   if(u.href.startsWith(BASE)){
    const f=path.resolve(ROOT,decodeURIComponent(u.pathname.slice(new URL(BASE).pathname.length)));
    if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f))return r.fulfill({status:404,body:''});
    return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html'});
   }
   blocked.push(u.href);return r.abort();
  });
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE+'support/guides.html');await page.waitForFunction(()=>document.querySelector('#content h1'));
  const guides=await page.evaluate(()=>GUIDES.map(g=>({id:g.id,label:g.label})));
  assert.equal(guides.length,10);
  for(let i=0;i<guides.length;i++){
   if(width<600)await page.selectOption('#guidePicker',String(i));else await page.locator(`#tabs button[data-i="${i}"]`).click();
   assert((await page.locator('#content h1').innerText()).includes(guides[i].label));
   const text=await page.locator('#content').innerText();
   assert(!text.includes('<mention '));
   if(['mother','father','aged','valentine-white'].includes(guides[i].id)){assert(!text.includes('修正・コメントの追加'));assert(text.includes('コメント・吹き出しの見方'))}
   if(guides[i].id==='calendar'){assert(text.includes('日付の右上の「＋」'));assert(text.includes('一覧表示・スマートフォン表示からの新規追加はできない'))}
   if(guides[i].id==='holiday-shipping'){assert(text.includes('約1秒後に自動保存'));assert(text.includes('通常の保存ボタンはありません'));assert(!text.includes('備考が増えると'))}
   if(['home','pear','crab','mother','father','aged','valentine-white'].includes(guides[i].id)){
    assert(text.includes('返信を自動生成・送信する機能ではありません'));
    assert(await page.locator('#content a[href^="https://app.notion.com/p/"]').count()>0);
   }
   assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#content a')].every(a=>a.target==='_blank'&&a.rel==='noopener noreferrer')),true);
  }
  // Link allowlist: render approved Notion only, not executable or unrelated destinations.
  await page.evaluate(()=>{GUIDES[active].content='[unsafe](javascript:alert(1)) [external](https://example.com/) <mention url="https://evil.example/">bad</mention> <mention url="https://app.notion.com/p/2932f256c436478192c5fcd2ba4e7dba">safe</mention>';render()});
  assert.equal(await page.locator('#content a').count(),1);
  assert.equal(await page.locator('#content a').innerText(),'safe');
  assert.deepEqual(errors,[]);await ctx.close();console.log('PASS guides desktop/mobile navigation and links',width);
 }
 assert.equal(writes,0);assert.deepEqual(blocked,[]);console.log('PASS zero live requests and writes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
