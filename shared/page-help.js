'use strict';
(()=>{
 if(window.TearlumPageHelp)return;
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('page-help.css?v=34',document.currentScript.src).href;document.head.append(css);
 // Only explicitly selected explanatory nodes are moved. Never collect generic
 // .hint / .note nodes: those may contain validation, save status or user data.
 function fold(node,title,extra=[]){
  if(!node||!node.isConnected)return null;
  let details=node.closest('details.uiHelp');
  if(!details){details=document.createElement('details');details.className='uiHelp';const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');body.className='uiHelpBody';details.append(summary,body);node.before(details);body.append(node)}
  const body=details.querySelector('.uiHelpBody');for(const part of extra)if(part&&part!==node&&!body.contains(part))body.prepend(part);
  return details;
 }
 function seasonal(){
  const forecast=document.getElementById('forecastSheetNoteV93'),card=document.getElementById('cardSheetNoteV99');
  const forecastIntro=document.querySelector('#forecast .forecast-head > div > p'),cardIntro=document.querySelector('#forecast .card-section .section-title > div > p');
  if(forecastIntro)forecastIntro.textContent='表示年と取引先を選んで、対象の行を編集します。';
  if(cardIntro)cardIntro.textContent='表示中の取引先の商品が対象です。';
  if(forecast)fold(forecast,'予測の入力・引き継ぎについて',[document.querySelector('#forecast .forecast-head > div > p')]);
  if(card)fold(card,'カード同梱率の入力について',[document.querySelector('#forecast .card-section .section-title > div > p')]);
  fold(document.querySelector('#cloud .cloud-head > div > p'),'伝票の入力方法');
 }
 window.TearlumPageHelp={fold,seasonal};
 function init(){
  if(document.getElementById('categoryFilter')&&document.querySelector('.categoryHelp')){
   const details=document.querySelector('.categoryHelp');details.classList.add('uiHelp');details.querySelector('summary').textContent='使い方・区分の見方';
   const foot=document.querySelector('.calendarApp > .footnote');if(foot)details.append(foot);
  }
  if(document.getElementById('board')&&document.getElementById('region'))fold(document.querySelector('.quantityHelp'),'上限の見方');
  // Legacy deadline pages use document.write. This module is loaded in the
  // generated document, and the status/notice controls remain outside the fold.
  if(document.getElementById('detailDlg')&&document.getElementById('noticeBox'))fold(document.querySelector('.head .sub'),'操作のヒント');
  document.querySelectorAll('details.guide').forEach(d=>{d.classList.add('uiHelp');d.querySelector('summary').textContent='使い方・補足'});
  seasonal();
  const panel=document.getElementById('forecast');
  if(panel){let queued=false;const observer=new MutationObserver(records=>{if(queued||!records.some(r=>r.type==='childList'))return;queued=true;requestAnimationFrame(()=>{queued=false;seasonal()})});observer.observe(panel,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true})}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
