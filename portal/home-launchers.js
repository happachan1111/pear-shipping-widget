'use strict';
(()=>{
 const dialog=document.getElementById('homePickerDialog');
 if(!dialog)return;
 const groups={
  event:{title:'季節イベント',help:'イベントを選んでください。',links:[['mother','母の日'],['father','父の日'],['aged','敬老の日'],['valentine','バレンタイン'],['white','ホワイトデー'],['pear','梨・柿'],['crab','カニ']]},
  holiday:{title:'長期休暇の出荷予定',help:'地域を選んでください。開いた画面で予定表・年を切り替えられます。',links:[['holiday-gw','山陰'],['holiday-okinawa-yearend','沖縄']]},
  parcel:{title:'個口数',help:'地域を選んでください。',links:[['koguchisu-sanin','山陰'],['koguchisu-okinawa','沖縄']]}
 };
 let opener=null,leaving=false;
 document.querySelectorAll('[data-home-picker]').forEach(button=>button.addEventListener('click',()=>{
  const group=groups[button.dataset.homePicker];if(!group)return;
  opener=button;leaving=false;
  document.getElementById('homePickerTitle').textContent=group.title;
  document.getElementById('homePickerHelp').textContent=group.help;
  const links=group.links.map(([route,label])=>{const link=document.createElement('a');link.href='#'+route;link.textContent=label;const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');link.append(arrow);return link});
  document.getElementById('homePickerLinks').replaceChildren(...links);
  dialog.showModal();
 }));
 function closeForRoute(){if(dialog.open){leaving=true;dialog.close()}}
 document.getElementById('homePickerClose').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))closeForRoute()});
 dialog.addEventListener('close',()=>{if(!leaving&&!document.getElementById('home').classList.contains('hidden'))opener?.focus()});
 window.addEventListener('hashchange',closeForRoute);
})();
