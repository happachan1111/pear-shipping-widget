(()=>{
const eventNav=document.querySelector('.event-tabs');
const widget=document.querySelector('.widget');
const seasonalTabs=document.querySelector('.main-tabs');
const seasonalMain=document.querySelector('main');
const footer=document.querySelector('footer');
if(!eventNav||!widget||document.getElementById('toolSubtabs44'))return;

const groups={
  pear:{label:'梨・柿',color:'#4f8554',items:[
    ['timeline','出荷時期','../index.html?v=24'],
    ['deadline','受注締切','../deadline/index.html?v=18'],
    ['sales','販売終了見込み','../sales-end/index.html?v=6'],
    ['orders','発注・出荷件数','../orders/index.html?v=30'],
    ['board','梨掲示板','../sorting/board.html?v=7']
  ]},
  crab:{label:'カニ',color:'#b84a3a',items:[
    ['auction','せり情報','../crab-auction/index.html?v=7'],
    ['deadline','受注・発注締切','../crab-deadline/index.html?v=2'],
    ['orders','発注・出荷件数','../crab-orders/index.html?v=14'],
    ['board','カニ掲示板','../crab-board/index.html?v=4']
  ]}
};

const style=document.createElement('style');
style.textContent=`
html.tool-open44,body.tool-open44{height:100%;overflow:hidden!important}
body.tool-open44{padding-bottom:0!important}
.widget.tool-mode44{height:calc(100vh - 10px);max-width:none;overflow:hidden!important;display:flex;flex-direction:column}
.widget.tool-mode44>header{display:none!important}
.event-tabs{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;overflow:visible!important;flex:0 0 auto}
.event-tab{width:100%;min-width:0;min-height:40px;padding:7px 5px!important;text-align:center;white-space:normal!important;line-height:1.2}
.main-tabs{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:9px 12px!important}
.main-tabs[hidden]{display:none!important}
.main-tab{width:100%;min-height:46px;padding:10px 8px!important;text-align:center;border:1px solid var(--line)!important;border-radius:9px!important;margin-bottom:9px}
.tool-subtabs44{display:grid;gap:6px;padding:7px 12px;border-bottom:1px solid var(--line);overflow:visible;flex:0 0 auto}
.tool-subtabs44[hidden]{display:none!important}
.tool-subtab44{width:100%;min-width:0;min-height:40px;padding:6px 5px;border:1px solid var(--line);border-radius:9px;background:#fff;color:var(--muted);font-weight:800;font-size:14px;white-space:normal;line-height:1.2;cursor:pointer}
.tool-panel44{min-height:0;flex:1;background:#fff;overflow:hidden}
.tool-panel44[hidden]{display:none!important}
.tool-frame44{display:block;width:100%;height:100%;border:0;background:#fff;opacity:0;transition:opacity .12s ease}
.tool-frame44.fitted{opacity:1}
@media(max-width:760px){
  .event-tabs{gap:3px;padding:6px!important}
  .event-tab{font-size:11px!important;padding:5px 2px!important}
  .tool-subtabs44{gap:3px;padding:6px}
  .tool-subtab44{font-size:11px;min-height:38px;padding:4px 2px}
}
`;
document.head.appendChild(style);

const sub=document.createElement('nav');
sub.id='toolSubtabs44';
sub.className='tool-subtabs44';
sub.hidden=true;
const panel=document.createElement('section');
panel.id='toolPanel44';
panel.className='tool-panel44';
panel.hidden=true;
panel.innerHTML='<iframe class="tool-frame44" id="toolFrame44" title="統合ツール"></iframe>';
widget.insertBefore(sub,seasonalMain);
widget.insertBefore(panel,seasonalMain);
const frame=panel.querySelector('iframe');
let activeGroup='',activeItem='',fitTimer=0;

const notify=(group,item)=>{try{parent.postMessage({type:'event-tool-v41',event:group,tab:item},location.origin)}catch(e){}};

function boardStyle(doc,group){
  let s=doc.getElementById('notionBoardFit44');
  if(!s){s=doc.createElement('style');s.id='notionBoardFit44';doc.head.appendChild(s)}
  if(group==='pear')s.textContent=`
    html,body{height:100%!important;overflow:hidden!important}
    body{background:#f6f1e9!important}
    .app{height:100vh!important;max-width:none!important;padding:10px!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
    .head,.boardSwitch,.textYear,.textTabs,.yearBar,.tabs,.documents{flex:0 0 auto}
    #textBoard:not([hidden]){min-height:0!important;flex:1!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
    .textColumns{min-height:0!important;flex:1!important;height:auto!important;align-items:stretch!important}
    .textFeed{height:100%!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:5px!important;scrollbar-gutter:stable}
    .textComposer{max-height:100%!important;margin-bottom:0!important}
    .workspace{min-height:0!important;flex:1!important;margin-top:8px!important;overflow:hidden!important;align-items:stretch!important}
    .workspace>.card{min-height:0!important;height:100%!important}
    .viewer{height:calc(100% - 55px)!important;overflow:hidden!important;padding:8px!important}
    .viewer img,.viewer canvas{max-height:100%!important;width:auto!important;object-fit:contain!important}
    .side{height:100%!important;overflow:hidden!important}
  `;
  else s.textContent=`
    html,body{height:100%!important;overflow:hidden!important}
    .app{height:100vh!important;width:100%!important;max-width:none!important;padding:10px!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
    .header,.boardKinds,.tabs,.yearBar{flex:0 0 auto}
    .header{margin-bottom:7px!important}.boardKinds{margin-bottom:7px!important}.tabs{padding-bottom:6px!important}.yearBar{margin-bottom:7px!important;padding-block:7px!important}
    .boardColumns{min-height:0!important;flex:1!important;height:auto!important;align-items:stretch!important}
    .feed{height:100%!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:5px!important;scrollbar-gutter:stable}
    .composer{max-height:100%!important;margin:0!important;overflow:hidden!important}
  `;
  doc.documentElement.style.overflow='hidden';
  doc.body.style.overflow='hidden';
  frame.classList.add('fitted');
}

function fitStatic(doc){
  if(!doc||!doc.body)return;
  const body=doc.body,root=doc.documentElement;
  body.style.zoom='1';
  body.style.transform='none';
  root.style.overflow='hidden';
  body.style.overflow='hidden';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const vw=Math.max(1,frame.clientWidth-2),vh=Math.max(1,frame.clientHeight-2);
    const sw=Math.max(root.scrollWidth,body.scrollWidth,1);
    const sh=Math.max(root.scrollHeight,body.scrollHeight,1);
    const scale=Math.min(1,vw/sw,vh/sh);
    body.style.zoom=String(Math.max(.01,scale));
    root.style.overflow='hidden';
    body.style.overflow='hidden';
    frame.classList.add('fitted');
  }));
}

function prepareFrame(){
  clearTimeout(fitTimer);
  frame.classList.remove('fitted');
  try{
    const doc=frame.contentDocument;
    if(!doc)return frame.classList.add('fitted');
    if(activeItem==='board'){
      boardStyle(doc,activeGroup);
      setTimeout(()=>boardStyle(doc,activeGroup),350);
      setTimeout(()=>boardStyle(doc,activeGroup),1200);
    }else{
      const run=()=>fitStatic(doc);
      run();setTimeout(run,250);setTimeout(run,850);setTimeout(run,1800);
      doc.addEventListener('click',()=>setTimeout(run,120),true);
      doc.addEventListener('change',()=>setTimeout(run,120),true);
    }
  }catch(e){frame.classList.add('fitted')}
}
frame.addEventListener('load',prepareFrame);

function loadItem(group,id,push=true){
  const g=groups[group];
  const item=(g&&g.items.find(x=>x[0]===id))||g.items[0];
  activeItem=item[0];
  sub.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.id===activeItem));
  const active=sub.querySelector('.active');
  if(active){active.style.background=g.color;active.style.borderColor=g.color;active.style.color='#fff'}
  sub.querySelectorAll('button:not(.active)').forEach(b=>{b.style.background='';b.style.borderColor='';b.style.color='' });
  if(frame.getAttribute('src')!==item[2])frame.src=item[2];else prepareFrame();
  frame.title=g.label+' '+item[1];
  if(push)notify(group,activeItem);
}

function activateGroup(key,push=true,requestedTab=''){
  const g=groups[key];if(!g)return;
  activeGroup=key;
  document.documentElement.classList.add('tool-open44');
  document.body.classList.add('tool-open44');
  widget.classList.add('tool-mode44');
  eventNav.querySelectorAll('.event-tab').forEach(b=>b.classList.remove('active'));
  const top=eventNav.querySelector('[data-tool="'+key+'"]');if(top)top.classList.add('active');
  if(seasonalTabs)seasonalTabs.hidden=true;
  if(seasonalMain)seasonalMain.hidden=true;
  if(footer)footer.hidden=true;
  sub.hidden=false;panel.hidden=false;
  sub.style.gridTemplateColumns='repeat('+g.items.length+',minmax(0,1fr))';
  sub.innerHTML=g.items.map(x=>'<button type="button" class="tool-subtab44" data-id="'+x[0]+'">'+x[1]+'</button>').join('');
  sub.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>loadItem(key,b.dataset.id)));
  loadItem(key,g.items.some(x=>x[0]===requestedTab)?requestedTab:g.items[0][0],push);
}

function showSeasonal(key){
  activeGroup='';
  document.documentElement.classList.remove('tool-open44');
  document.body.classList.remove('tool-open44');
  widget.classList.remove('tool-mode44');
  sub.hidden=true;panel.hidden=true;
  if(seasonalTabs)seasonalTabs.hidden=false;
  if(seasonalMain)seasonalMain.hidden=false;
  if(footer)footer.hidden=false;
  notify(key,'');
}

[...eventNav.querySelectorAll('.event-tab')].forEach(b=>b.addEventListener('click',()=>showSeasonal(b.dataset.event)));
Object.entries(groups).forEach(([key,g])=>{
  const b=document.createElement('button');b.type='button';b.className='event-tab';b.dataset.tool=key;b.textContent=g.label;
  b.addEventListener('click',()=>activateGroup(key));eventNav.appendChild(b);
});
window.addEventListener('resize',()=>{if(activeGroup)prepareFrame()});
const q=new URLSearchParams(location.search),initial=q.get('tool');
if(groups[initial])activateGroup(initial,false,q.get('tooltab')||'');
})();
