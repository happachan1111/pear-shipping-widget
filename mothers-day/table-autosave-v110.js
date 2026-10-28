'use strict';
// Only forecast/invoice table edits. Posting, deleting and external invoice issuance remain explicit.
(()=>{
 if(window.TearlumTableAutosave)return;
 const states=new Map(),bound=new WeakMap(),delay=1000;let running=false;
 const readOnly=()=>{let w=window;for(let i=0;i<4;i++){try{const p=new URL(w.location.href).searchParams;if(['preview','readonly'].some(k=>['1','true'].includes(p.get(k))))return true;if(w===w.parent)break;w=w.parent}catch{break}}return false};
 if(readOnly())return;
 const canon=x=>JSON.stringify(x&&typeof x==='object'?(Array.isArray(x)?x.map(v=>JSON.parse(canon(v))):Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,JSON.parse(canon(x[k]))]))):x??null);
 const fingerprint=r=>r?canon(r):null;
 const pending=()=>[...states.values()].some(s=>s.dirty||s.saving);
 const notify=()=>{window.portalHasUnsavedChanges=pending};
 function status(s,text){s.message.textContent=text;s.retry.hidden=!(s.failed&&!s.blocked);s.retry.textContent='再試行';s.retry.style.display=s.retry.hidden?'none':'';notify()}
 function values(tr){return Object.fromEntries([...tr.querySelectorAll('[data-field]')].map(n=>[n.dataset.field,n.value.trim()]))}
 function observeRow(tr,kind){
  if(bound.has(tr))return bound.get(tr);
  const raw=allRowsCache.find(r=>String(r.id)===tr.dataset.id),record=(kind==='forecast'?forecastRows:invoiceRows).find(r=>String(r.id)===tr.dataset.id);
  const s={tr,kind,id:tr.dataset.id||'event-'+kind+'|'+crypto.randomUUID(),event:activeEvent,year:kind==='forecast'?forecastYear:invoiceYear,partner:record?.partner||(kind==='forecast'?document.querySelector('#forecastPartnerTabsV93 button.active')?.textContent:invoicePartner)||'',baseline:raw?structuredClone(raw):null,dirty:false,saving:false,failed:false,blocked:false,timer:0};
  s.initial=values(tr);s.retry=tr.querySelector(kind==='forecast'?'.save-forecast-row':'.save-invoice-row');s.retry.hidden=true;s.retry.style.setProperty('display','none');
  s.message=document.createElement('small');s.message.setAttribute('role','status');s.message.style.cssText='display:block;white-space:normal;font-size:12px;min-width:85px';s.retry.after(s.message);
  bound.set(tr,s);states.set(s.id,s);status(s,'自動保存オン');return s;
 }
 function changed(s){if(s.blocked){status(s,'保存を停止中。入力を控えて再読み込みしてください');return}s.dirty=true;s.failed=false;clearTimeout(s.timer);status(s,'保存待ち');s.timer=setTimeout(()=>{s.timer=0;flush(s)},delay)}
 function payload(s){const v=values(s.tr),x={id:s.id,eventKey:s.event,year:s.year,partner:s.partner};
  for(const n of s.tr.querySelectorAll('input[type=number]'))if(n.value!==''&&(!Number.isFinite(+n.value)||+n.value<0||!n.validity.valid))throw Error('数値は0以上の正しい値で入力してください');
  if(!x.partner)throw Error('取引先を確認してください');
  if(s.kind==='forecast'){if(!v.item)throw Error('商品名を入力してください');Object.assign(x,{item:v.item,price:+v.price||0,forecast:+v.forecast||0,note:v.note})}
  else{if(!v.issueDate||!v.searchTitle||!v.searchKey)throw Error('発行日・検索キータイトル・検索キー1を入力してください');Object.assign(x,{issueDate:v.issueDate,orderMemo:v.orderMemo,searchTitle:v.searchTitle,searchKey:v.searchKey,count:+v.count||0,shippingDate:v.shippingDate})}
  let memo={};try{memo=JSON.parse(s.baseline?.memo||'{}')}catch{}
  const body=(s.kind==='forecast'?forecastBody:invoiceBody)(x);body.memo=JSON.stringify({...memo,...x});body.comments=structuredClone(s.baseline?.comments||[]);
  return {x,body,typed:canon(v)};
 }
 async function request(path,opt={}){const c=new AbortController(),t=setTimeout(()=>c.abort(),20000);try{const r=await fetch(API+path,{cache:'no-store',headers:{'Content-Type':'application/json'},...opt,signal:c.signal});if(!r.ok)throw Error('通信エラー '+r.status);return await r.json()}finally{clearTimeout(t)}}
 async function getRows(){const d=await request('/orders/data');if(!Array.isArray(d.rows)||d.complete===false)throw Error('共有データをすべて取得できません');return d.rows}
 async function flush(s){
  clearTimeout(s.timer);s.timer=0;if(!s.dirty||s.blocked||s.saving||s.composing||readOnly())return;
  if(running){s.timer=setTimeout(()=>flush(s),150);return}
  let p;try{p=payload(s)}catch(e){s.failed=false;status(s,e.message+'（未保存）');return}
  running=true;s.saving=true;s.failed=false;status(s,'保存中…');let attempted=false;
  try{
   const all=await getRows(),latest=all.find(r=>String(r.id)===s.id);
   if(fingerprint(latest)!==fingerprint(s.baseline)){s.blocked=true;throw Error('競合あり。入力を控えて再読み込みしてください')}
   // Keep all existing fields and comments, including ones not editable in this table.
   const body={...(latest||{}),...p.body};if(latest){for(const k of ['sheet_url',s.kind==='forecast'?'order_count':'ship_count']){body[k]=latest[k];p.body[k]=latest[k]}}delete body.updated_at;delete body.updatedAt;
   attempted=true;await request('/orders/rows'+(latest?'/'+encodeURIComponent(s.id):''),{method:latest?'PUT':'POST',body:JSON.stringify(body)});
   const verified=await getRows(),saved=verified.find(r=>String(r.id)===s.id);
   if(!saved||Object.keys(p.body).some(k=>k==='memo'?canon(JSON.parse(saved.memo||'{}'))!==canon(JSON.parse(p.body.memo)):canon(saved[k])!==canon(p.body[k])))throw Error('保存結果を確認できません');
   s.baseline=structuredClone(saved);allRowsCache=[...allRowsCache.filter(r=>String(r.id)!==s.id),saved];allRowsCacheAt=0;remoteIds.add(s.id);s.tr.dataset.id=s.id;s.tr.classList.remove('forecast-draft-v93','invoice-draft');
   const list=s.kind==='forecast'?forecastRows:invoiceRows,i=list.findIndex(r=>r.id===s.id);if(i>=0)list[i]=p.x;else list.push(p.x);
   s.initial=JSON.parse(p.typed);s.dirty=canon(values(s.tr))!==p.typed;status(s,s.dirty?'保存待ち':'保存済み');
  }catch(e){s.failed=true;if(attempted)s.blocked=true;status(s,s.blocked?(attempted?'保存確認が必要。再送せず入力を控え、再読み込みで確認してください':e.message):'保存失敗。入力は残っています。「再試行」で確認してください')}
  finally{s.saving=false;running=false;notify();if(s.dirty&&!s.failed&&!s.blocked)s.timer=setTimeout(()=>flush(s),delay)}
 }
 function scan(){for(const [id,s] of states)if(!s.tr.isConnected&&!s.dirty&&!s.saving)states.delete(id);const h=document.getElementById('forecastSheetNoteV93');if(h&&!h.textContent.includes('自動保存'))h.textContent='前年の商品情報を引き継ぎます。入力後に自動保存します。「保存済み」を確認して切り替えてください。';document.querySelectorAll('select').forEach(n=>{if(!n.closest('#forecastBody,#invoiceBody'))n.dataset.autosavePrevious=n.value});for(const [selector,kind] of [['#forecastBody tr','forecast'],['#invoiceBody tr','invoice']])document.querySelectorAll(selector).forEach(tr=>observeRow(tr,kind))}
 document.addEventListener('input',e=>{const tr=e.target.closest('#forecastBody tr,#invoiceBody tr');if(tr&&e.target.matches('[data-field]')){const s=observeRow(tr,tr.closest('#forecastBody')?'forecast':'invoice');if(!e.isComposing)changed(s);else{s.dirty=true;status(s,'入力中（未保存）')}}},true);
 document.addEventListener('compositionstart',e=>{const s=bound.get(e.target.closest('tr'));if(s){clearTimeout(s.timer);s.timer=0;s.composing=true}},true);
 document.addEventListener('compositionend',e=>{const s=bound.get(e.target.closest('tr'));if(s){s.composing=false;changed(s)}},true);
 document.addEventListener('change',e=>{const s=bound.get(e.target.closest('tr'));if(s&&e.target.matches('[data-field]'))changed(s)},true);
 document.addEventListener('click',e=>{
  const b=e.target.closest('.save-forecast-row,.save-invoice-row');if(b){e.preventDefault();e.stopImmediatePropagation();const s=bound.get(b.closest('tr'));if(s&&!s.blocked){s.failed=false;flush(s)}return}
  const del=e.target.closest('.delete-forecast-row,.delete-invoice-row');if(del){const s=bound.get(del.closest('tr'));if(s?.dirty||s?.saving){e.preventDefault();e.stopImmediatePropagation();status(s,'保存完了後に削除してください');return}}
  if(pending()&&e.target.closest('.event-tab,.main-tab,.partner-tab,#forecastPartnerTabsV93 button,#invoiceAddRow,.forecast-add-v93,#forecastAddRow,#reload')){e.preventDefault();e.stopImmediatePropagation();alert('未保存または保存中の入力があります。保存済みを確認してから切り替えてください。')}
 },true);
 document.addEventListener('focusin',e=>{if(e.target.tagName==='SELECT')e.target.dataset.autosavePrevious=e.target.value},true);
 document.addEventListener('change',e=>{if(pending()&&e.target.tagName==='SELECT'&&!e.target.closest('#forecastBody,#invoiceBody')){e.preventDefault();e.stopImmediatePropagation();if(e.target.dataset.autosavePrevious!==undefined)e.target.value=e.target.dataset.autosavePrevious;alert('保存済みを確認してから表示を切り替えてください。')}},true);
 // Redraws must not replace an input with an unsaved snapshot.
 for(const name of ['renderForecast','renderInvoices']){const fn=window[name];if(typeof fn==='function')window[name]=function(...args){if(pending())return;return fn.apply(this,args)}}
 addEventListener('beforeunload',e=>{if(pending()){e.preventDefault();e.returnValue=''}});
 window.TearlumTableAutosave={pending,scan};new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();notify();
})();
