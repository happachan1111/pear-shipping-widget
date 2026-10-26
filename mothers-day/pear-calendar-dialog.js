/* Central editor for pear/persimmon deadline and sales calendars. Uses the original form and save handlers. */
(()=>{
 const form=document.getElementById('form');if(!form||document.getElementById('pearCalendarDialog'))return;
 const dlg=document.createElement('dialog');dlg.id='pearCalendarDialog';dlg.setAttribute('aria-labelledby','formTitle');
 const bar=document.createElement('header'),close=document.createElement('button');close.type='button';close.textContent='閉じる';close.onclick=()=>dlg.close();bar.append(close);dlg.append(bar,form);document.body.append(dlg);
 document.body.classList.add('pear-calendar-modal');
 const style=document.createElement('style');style.textContent=`body.pear-calendar-modal .layout{grid-template-columns:minmax(0,1fr)!important}
 #pearCalendarDialog{margin:auto;width:min(560px,calc(100% - 24px));max-width:calc(100% - 24px);max-height:90dvh;box-sizing:border-box;overflow:auto;padding:16px;border:1px solid #ddd;border-radius:14px;color:#2c2c2b;background:#fff}
 #pearCalendarDialog::backdrop{background:rgba(0,0,0,.35)}#pearCalendarDialog>header{display:flex;justify-content:flex-end;margin-bottom:4px}
 #pearCalendarDialog>header button{min-height:40px;padding:8px 14px;color:#444;background:#fff;border:1px solid #ddd;border-radius:8px;cursor:pointer}
 #pearCalendarDialog #form{position:static!important;top:auto!important;width:100%;min-width:0;box-sizing:border-box;border:0;box-shadow:none;padding:0;max-height:none;overflow:visible}
 #pearCalendarDialog input,#pearCalendarDialog select,#pearCalendarDialog textarea{max-width:100%;box-sizing:border-box}#pearCalendarDialog .actions{flex-wrap:wrap}
 #pearCalendarNotice{position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:10000;border-radius:10px;padding:12px 20px;background:#246947;color:#fff;box-shadow:0 3px 14px #0002}`;document.head.append(style);
 window.openCalendarForm=()=>{if(!dlg.open)dlg.showModal();document.getElementById('date')?.focus({preventScroll:true})};
 const edit=window.edit;window.edit=function(...args){const result=edit.apply(this,args);window.openCalendarForm();return result};
 const cancel=document.getElementById('cancel');if(cancel){const original=cancel.onclick;cancel.onclick=e=>{original?.call(cancel,e);dlg.close()}}
 // Only successful native save/delete messages close the form. Validation and errors remain visible.
 const msg=window.msg;window.msg=function(text){const result=msg.apply(this,arguments);if(dlg.open&&['保存しました','削除しました'].includes(text)){dlg.close();let notice=document.getElementById('pearCalendarNotice');if(!notice){notice=document.createElement('div');notice.id='pearCalendarNotice';notice.setAttribute('role','status');document.body.append(notice)}notice.textContent=text;notice.hidden=false;clearTimeout(notice._timer);notice._timer=setTimeout(()=>notice.hidden=true,2500)}return result};
})();
