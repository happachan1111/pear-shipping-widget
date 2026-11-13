'use strict';
(()=>{
 const previous=window.AppUI;if(previous?.root?.isConnected)return;previous?.destroy?.();
 const script=document.currentScript,manual=script?.dataset.mode==='manual',supportOff=script?.dataset.support==='off',TIMEOUT=45000,base=new URL('../',script.src),native=window.__tearlumNativeFetch||(window.__tearlumNativeFetch=window.fetch.bind(window));
 const previewMode=(()=>{try{for(let w=window,depth=0;w&&depth<8;w=w.parent,depth++){const q=new URLSearchParams(w.location.search);if(['1','true'].includes(q.get('preview'))||['1','true'].includes(q.get('readonly')))return true;if(w===w.parent)break}}catch{}return false})();
 const previewWriteError=()=>new Error('プレビューではデータを変更できません。通常画面で操作してください。');
 if(previewMode){document.documentElement.dataset.previewReadonly='true';const xhrOpen=XMLHttpRequest.prototype.open,xhrSend=XMLHttpRequest.prototype.send,xhrMethods=new WeakMap();XMLHttpRequest.prototype.open=function(method,...args){xhrMethods.set(this,String(method||'GET').toUpperCase());return xhrOpen.call(this,method,...args)};XMLHttpRequest.prototype.send=function(...args){if(!['GET','HEAD','OPTIONS'].includes(xhrMethods.get(this)||'GET'))throw previewWriteError();return xhrSend.apply(this,args)}}
 let state='loading',timer,settle,domReady=false,dataSeen=false,pending=0,dead=false;const listeners=[],controllers=new Set();
 const listen=(target,name,fn,options)=>{target.addEventListener(name,fn,options);listeners.push(()=>target.removeEventListener(name,fn,options))};
 const root=document.createElement('div');root.id='commonLoading';root.dataset.commonUi='';root.setAttribute('role','status');root.setAttribute('aria-live','polite');root.innerHTML='<div class="ui-load-card"><span class="ui-spinner" aria-hidden="true"></span><div><p class="ui-load-title">読み込み中…</p><p class="ui-load-detail">最新の情報を取得しています。しばらくお待ちください。</p><div class="ui-load-actions" hidden><button type="button">再読み込み</button><a>ポータルのホームへ</a></div></div></div>';document.documentElement.append(root);document.documentElement.classList.add('ui-common','ui-pending');root.querySelector('a').href=new URL('portal/index.html#home',base).href;
 function message(type,detail={}){try{if(parent!==window)parent.postMessage({type,...detail},location.origin)}catch{}}
 function begin(){if(dead)return;clearTimeout(timer);clearTimeout(settle);state='loading';root.hidden=false;root.classList.remove('ui-error');root.setAttribute('role','status');root.querySelector('.ui-load-title').textContent='読み込み中…';root.querySelector('.ui-load-detail').textContent='最新の情報を取得しています。しばらくお待ちください。';root.querySelector('.ui-load-actions').hidden=true;document.documentElement.classList.add('ui-pending');document.documentElement.classList.remove('ui-failed');message('tool-ui-loading');timer=setTimeout(()=>fail('読み込みに時間がかかっています。接続を確認して、もう一度お試しください。'),TIMEOUT)}
 function fail(text='読み込めませんでした。通信状況を確認して、もう一度お試しください。'){if(dead||state==='failed')return;state='failed';clearTimeout(timer);clearTimeout(settle);root.hidden=false;root.classList.add('ui-error');root.setAttribute('role','alert');root.querySelector('.ui-load-title').textContent='読み込みに失敗しました';root.querySelector('.ui-load-detail').textContent=text;root.querySelector('.ui-load-actions').hidden=false;document.documentElement.classList.remove('ui-pending');document.documentElement.classList.add('ui-failed');for(const c of controllers)c.abort();message('portal-tool-error',{message:text})}
 function ready(){if(dead||state==='failed')return;clearTimeout(timer);clearTimeout(settle);state='ready';root.hidden=true;document.documentElement.classList.remove('ui-pending','ui-failed');window.dispatchEvent(new Event('tearlum-ui-ready'));message('tool-ui-ready');message('portal-tool-ready')}
 function auto(){if(!manual&&domReady&&dataSeen&&pending===0&&state==='loading'){clearTimeout(settle);settle=setTimeout(ready,250)}}
 const isData=u=>/(?:\/orders\/data|\/timeline\/data|\/data|\/api\/products|\/api\/vendors)$/.test(u.pathname);
 // Share only concurrent, read-only requests for the same public orders feed.
 // Never cache completed data: edits and explicit refreshes must see fresh results.
 const orderOrigin='https://flat-disk-51b0.sasaki-8ef.workers.dev';
 function orderBroker(){try{const h=window.top;if(h.location.origin!==location.origin)return null;return h.__tearlumOrderBroker||(h.__tearlumOrderBroker={host:h,entry:null,writes:0})}catch{return null}}
 function sharedOrderFetch(input,options={}){
  let url;try{if(typeof input!=='string'&&!(input instanceof URL))return native(input,options);url=new URL(String(input),location.href)}catch{return native(input,options)}
  const allowed=new Set(['method','headers','cache','credentials','signal']);
  if(url.origin!==orderOrigin||url.pathname!=='/orders/data'||String(options.method||'GET').toUpperCase()!=='GET'||Object.keys(options).some(k=>!allowed.has(k))||!['no-store',undefined].includes(options.cache)||!['omit','same-origin',undefined].includes(options.credentials))return native(input,options);
  let headers;try{headers=new Headers(options.headers);if([...headers].some(([k,v])=>k.toLowerCase()!=='content-type'||v.toLowerCase()!=='application/json'))return native(input,options)}catch{return native(input,options)}
  const b=orderBroker(),signal=options.signal;if(!b||b.writes)return native(input,options);
  if(signal?.aborted)return Promise.reject(new DOMException('Aborted','AbortError'));
  let entry=b.entry;
  if(!entry||entry.url!==url.href){
   const controller=new AbortController(),hostNative=b.host.__tearlumNativeFetch||b.host.fetch.bind(b.host);
   entry={url:url.href,controller,refs:0,settled:false};b.entry=entry;
   entry.promise=hostNative(url.href,{...options,signal:controller.signal}).then(async response=>{await response.clone().arrayBuffer();return response}).finally(()=>{entry.settled=true;if(b.entry===entry)b.entry=null});
  }
  entry.refs++;let onAbort;
  const aborted=signal?new Promise((_,reject)=>{onAbort=()=>reject(new DOMException('Aborted','AbortError'));signal.addEventListener('abort',onAbort,{once:true})}):null;
  return (aborted?Promise.race([entry.promise,aborted]):entry.promise).then(response=>response.clone()).finally(()=>{if(onAbort)signal.removeEventListener('abort',onAbort);entry.refs--;if(!entry.refs&&!entry.settled){if(b.entry===entry)b.entry=null;entry.controller.abort()}});
 }
 window.__tearlumSharedOrderFetch=sharedOrderFetch;
 // Retry read-only data requests once. Never repeat a save, delete or other write.
 window.fetch=async function(input,options={}){
  const req=input instanceof Request?input:null,url=new URL(req?.url||String(input),location.href),method=String(options.method||req?.method||'GET').toUpperCase();
  if(method!=='GET'){if(previewMode)return Promise.reject(previewWriteError());const b=url.origin===orderOrigin?orderBroker():null;if(b){b.entry=null;b.writes++}try{return await native(input,options)}finally{if(b){b.entry=null;b.writes--}}}
  const tracked=isData(url),retryable=tracked||(url.origin===location.origin&&/\.html$/i.test(url.pathname)),signal=options.signal||req?.signal,maxAttempts=retryable?2:1,retryStatus=new Set([408,429,500,502,503,504]);
  if(tracked)pending++;
  let finished=false,lastTimedOut=false;
  function done(ok,detail){if(finished)return;finished=true;if(tracked){pending--;if(ok)dataSeen=true;else if(state==='loading'&&!signal?.aborted)fail(detail||(lastTimedOut?'接続が時間切れになりました。再読み込みしてお試しください。':'共有データの取得に失敗しました。再接続を試しましたが完了できませんでした。「再読み込み」でやり直してください。'));auto()}}
  async function attempt(){
   for(let n=0;n<maxAttempts;n++){
    const controller=new AbortController(),abort=()=>controller.abort(signal?.reason);let timeout,response,raw,shouldRetry=false;
    if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});controllers.add(controller);lastTimedOut=false;
    timeout=setTimeout(()=>{lastTimedOut=true;controller.abort()},15000);
    try{
     response=await sharedOrderFetch(input,{...options,signal:controller.signal});
     if(tracked&&response.ok){raw=await response.clone().text();JSON.parse(raw)}
     shouldRetry=retryable&&retryStatus.has(response.status)&&n+1<maxAttempts&&!signal?.aborted&&!dead;
     if(!shouldRetry){
      if(!response.ok){done(false,[401,403].includes(response.status)?'共有データへのアクセスが拒否されました（HTTP '+response.status+'）。管理者に接続設定をご確認ください。':undefined);return response}
      const json=response.json.bind(response),text=response.text.bind(response);
      response.json=async()=>{try{const data=raw===undefined?await json():JSON.parse(raw);done(true);return data}catch(e){done(false);throw e}};
      response.text=async()=>{try{const data=raw===undefined?await text():raw;done(true);return data}catch(e){done(false);throw e}};
      if(!tracked)done(true);return response;
     }
    }catch(e){
     shouldRetry=retryable&&n+1<maxAttempts&&!signal?.aborted&&!dead;
     if(!shouldRetry){done(false);throw e}
    }finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);controllers.delete(controller)}
    if(shouldRetry){try{await response?.body?.cancel()}catch{}await new Promise(resolve=>setTimeout(resolve,600))}
   }
  }
  return attempt();
 };
 root.querySelector('button').onclick=()=>{let unsaved=false;try{unsaved=!!window.portalHasUnsavedChanges?.()||!!document.querySelector('dialog[open]:not(#commonSupportDialog)')}catch{}if(!unsaved||confirm('編集中の内容が失われる可能性があります。再読み込みしますか？'))location.reload()};
 listen(window,'error',e=>{if(e.target?.tagName==='SCRIPT'&&e.target.dataset.uiManagedRetry==='1')return;if(state==='loading'&&(e.error||e.target?.tagName==='SCRIPT'))fail('画面の読み込みを完了できませんでした。再読み込みしてお試しください。')},true);
 window.AppUI={root,begin,ready,fail,get state(){return state},supportOwned:false,destroy(){dead=true;clearTimeout(timer);clearTimeout(settle);listeners.forEach(f=>f());for(const c of controllers)c.abort();root.remove()}};begin();
 listen(document,'DOMContentLoaded',()=>{domReady=true;if(document.body?.dataset.uiStatic==='true')ready();else auto();setupSupport()},{once:true});
 if(document.readyState!=='loading'){domReady=true;setupSupport();auto()}
 function setupSupport(){if(supportOff||window.AppUI.supportOwned)return;let embeddedOwner=false;try{let w=parent;while(w!==window){if(w.AppUI?.supportOwned){embeddedOwner=true;break}if(w===w.parent)break;w=w.parent}}catch{}if(embeddedOwner)return;window.AppUI.supportOwned=true;
 const launcher=document.createElement('button');launcher.id='commonSupport';launcher.dataset.commonUi='';launcher.innerHTML='ⓘ サポートメニュー<span id="commonSupportBadge" role="status" aria-live="polite" hidden></span>';launcher.setAttribute('aria-label','サポートメニュー');document.body.append(launcher);
 const dialog=document.createElement('dialog');dialog.id='commonSupportDialog';dialog.dataset.commonUi='';dialog.innerHTML='<header><h2>サポートメニュー</h2><button type="button">閉じる</button></header>';document.body.append(dialog);
 const seenKey='tearlum-support-feedback-seen-v1';let posts=[],polling=false;const seen=()=>{try{return Number(localStorage.getItem(seenKey))||0}catch{return 0}},created=r=>{let m={};try{m=JSON.parse(r.memo||'{}')}catch{}return Number(m.createdAt)||Number(r.updated_at)||Date.parse(r.updated_at)||0};
 const paint=()=>{const count=posts.filter(p=>created(p)>seen()).length,b=launcher.querySelector('span');b.textContent=count>99?'99+':String(count);b.hidden=count===0;launcher.setAttribute('aria-label','サポートメニュー'+(count?'・未読の連絡'+count+'件':''));launcher.title=count?'未読の連絡が'+count+'件あります':'サポートメニュー'};
 async function poll(){if(polling||dead)return;polling=true;const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);try{const res=await sharedOrderFetch('https://flat-disk-51b0.sasaki-8ef.workers.dev/orders/data',{cache:'no-store',signal:c.signal});if(!res.ok)return;const data=await res.json();posts=(Array.isArray(data.rows)?data.rows:[]).filter(r=>r.record_type==='tool_feedback');paint()}catch{}finally{clearTimeout(t);polling=false}}
 launcher.onclick=()=>{const frame=document.createElement('iframe');frame.title='不具合・要望／使い方／バックアップ';frame.src=new URL('support/index.html?v=ui38',base).href;dialog.append(frame);dialog.showModal()};dialog.querySelector('button').onclick=()=>dialog.close();listen(dialog,'close',()=>{dialog.querySelector('iframe')?.remove();launcher.focus()});
 listen(window,'message',e=>{if(e.origin!==location.origin||e.source!==dialog.querySelector('iframe')?.contentWindow||e.data?.type!=='support-feedback-seen')return;try{localStorage.setItem(seenKey,String(Math.max(seen(),Number(e.data.latestCreatedAt)||0)))}catch{}paint()});listen(window,'storage',e=>{if(e.key===seenKey)paint()});listen(document,'visibilitychange',()=>{if(!document.hidden)poll()});listen(window,'focus',()=>{if(!document.hidden)poll()});poll();const interval=setInterval(()=>{if(!document.hidden)poll()},60000);listeners.push(()=>clearInterval(interval));
 }
})();
