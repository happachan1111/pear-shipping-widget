'use strict';
(()=>{const start=()=>{
 // Calendar actions only open forms. They never create, update or delete records.
 function dateDialog(ds,record){
  if(typeof window.openDateDialog==='function'){window.openDateDialog(ds);if(record&&typeof window.edit==='function')window.edit(record);return}
  const editor=document.querySelector('.editor');if(!editor)return;
  let dlg=document.getElementById('commonDateDialog');if(!dlg){dlg=document.createElement('dialog');dlg.id='commonDateDialog';dlg.className='ui-date-dialog';dlg.innerHTML='<header><h2></h2><button type="button">閉じる</button></header><p class="ui-date-hint">内容を入力し、「保存」で登録します。</p><div class="ui-date-slot"></div>';document.body.append(dlg);dlg.querySelector('header button').onclick=()=>dlg.close();dlg.addEventListener('close',()=>{if(dlg._editor){dlg._parent.insertBefore(dlg._editor,dlg._next?.parentNode===dlg._parent?dlg._next:null);dlg._editor=null}})}
  if(typeof window.clearForm==='function')window.clearForm();const input=document.getElementById('date');if(input)input.value=ds;if(record&&typeof window.edit==='function')window.edit(record);dlg.querySelector('h2').textContent=ds+' の記録'+(record?'を編集':'を追加');dlg._editor=editor;dlg._parent=editor.parentNode;dlg._next=editor.nextSibling;dlg.querySelector('.ui-date-slot').append(editor);if(!dlg.open)dlg.showModal();
 }
 document.addEventListener('click',e=>{const day=e.target.closest('.day[data-date]');if(!day||!document.querySelector('#calendar'))return;if(e.target.closest('.commentBtn,.entryCommentBadge,.summaryDayBtn,.badge,[data-cid]'))return;
  const isOrder=document.querySelector('#recordType');if(!isOrder)return;
  const entry=e.target.closest('.entry[data-id]');let record=null;if(entry){try{record=(typeof rows!=='undefined'?rows:[]).find(r=>String(r.id)===entry.dataset.id)}catch{}if(!record)return}
  e.preventDefault();e.stopImmediatePropagation();dateDialog(day.dataset.date,record)
 },true);
 document.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key)||!e.target.matches('.day[data-date]'))return;e.preventDefault();e.target.click()});
 function accessible(){for(const day of document.querySelectorAll('.day[data-date]')){day.tabIndex=0;day.setAttribute('role','group');day.setAttribute('aria-label',day.dataset.date+'：クリックして追加・編集')}}
 new MutationObserver(accessible).observe(document.getElementById('calendar')||document.body,{childList:true,subtree:true});accessible();
};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
