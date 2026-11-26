/* Read-only layout: separate record cards in two columns, order left and shipment right. */
(()=>{
'use strict';
function layout(){
 const byId=new Map(rows.map(r=>[String(r.id),r]));
 document.querySelectorAll('#calendar .day[data-date]').forEach(day=>{
  const entries=[...day.querySelectorAll(':scope > .entry[data-id]')];if(!entries.length)return;
  const groups=new Map();
  for(const entry of entries){const r=byId.get(String(entry.dataset.id));if(!r)continue;const key=String(r.partner||'');if(!groups.has(key))groups.set(key,{order:[],ship:[]});groups.get(key)[r.record_type==='ship'?'ship':'order'].push(entry)}
  const grid=document.createElement('div');grid.className='crabCountGrid';
  for(const group of groups.values())for(let i=0;i<Math.max(group.order.length,group.ship.length);i++)for(const type of ['order','ship']){
   const entry=group[type][i];if(entry){grid.append(entry)}else{const empty=document.createElement('span');empty.className='crabCountEmpty';empty.setAttribute('aria-hidden','true');grid.append(empty)}
  }
  // Do not discard an entry if its source is unexpectedly unavailable.
  for(const entry of entries)if(entry.parentNode===day)grid.append(entry);
  day.append(grid)
 })
}
const previous=render;render=function(){previous();layout()};
// Pickers must call the current renderer, not an earlier captured version.
yearPick.onchange=()=>render();monthPick.onchange=()=>render();render();
})();
