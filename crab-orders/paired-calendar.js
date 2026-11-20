/* Read-only display: pair each supplier's order and shipment for the day. */
(()=>{
'use strict';
const shortNames={'中村商店':'中村','浜勝商店':'浜勝','山根商店':'山根','梅吉水産':'梅吉'};
const shortName=p=>shortNames[p]||p;
const clean=p=>String(p||'').replace(/^🦀\s*/, '');
function display(){
 document.querySelectorAll('#calendar .day[data-date]').forEach(day=>{
  const records=rows.filter(r=>r.date===day.dataset.date&&String(r.partner||'').startsWith('🦀 ')&&['order','ship'].includes(r.record_type||'order'));
  const grouped=new Map();for(const r of records){const p=clean(r.partner);if(!grouped.has(p))grouped.set(p,{order:[],ship:[]});grouped.get(p)[r.record_type||'order'].push(r)}
  day.querySelectorAll('.entry').forEach(e=>e.remove());
  for(const [p,kinds] of grouped){
   const card=document.createElement('div');card.className='crabPair';card.tabIndex=0;card.setAttribute('role','button');
   const heading=document.createElement('strong');heading.className='crabPairName';heading.textContent=shortName(p);heading.title=p;card.append(heading);
   const box=document.createElement('div');box.className='crabPairColumns';const description=[];
   for(const [type,label] of [['order','発注'],['ship','出荷']]){
    const all=kinds[type],cell=document.createElement('div');cell.className='crabPairCell crabPair-'+type;
    const numbers=all.map(r=>String(type==='order'?r.order_count:r.ship_count));const val=all.length===0?'—':all.length===1?numbers[0]:'複数';
    const detail=all.length?`${label} ${numbers.join('、')}件${all.length>1?'（複数記録）':''}`:`${label} 未登録`;description.push(detail);cell.title=detail;
    const title=document.createElement('span');title.className='crabPairLabel';title.innerHTML=type==='order'?'<span class="crabPairLong">発注</span><span class="crabPairShort">発</span>':'<span class="crabPairLong">出荷</span><span class="crabPairShort">出</span>';
    const number=document.createElement('strong');number.className='crabPairNumber';number.textContent=val;cell.append(title,number);
    for(const r of all){const count=Array.isArray(r.comments)?r.comments.length:0;if(!count)continue;const b=document.createElement('button');b.type='button';b.className='entryCommentBadge';b.dataset.cid=String(r.id);b.title=`${label}のコメント ${count}件`;b.setAttribute('aria-label',b.title);b.textContent='💬'+count;cell.append(b)}
    box.append(cell)
   }
   card.setAttribute('aria-label',`${p}、${description.join('、')}。日付の編集を開く`);card.append(box);card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();card.click()}});day.append(card)
  }
 })
}
const previous=render;render=function(){previous();display()};render();
})();
