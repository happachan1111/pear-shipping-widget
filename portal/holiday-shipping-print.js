/* Read-only, A4 landscape printouts: one region per sheet, independent of mobile week grouping. */
(()=>{
 const button=document.getElementById('printShipping');if(!button)return;
 const labels={sanin:'山陰',okinawa:'沖縄'},text=v=>String(v??''),esc=v=>text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dlg=document.createElement('dialog');dlg.id='shippingPrintDialog';dlg.setAttribute('aria-labelledby','shippingPrintTitle');dlg.innerHTML='<header><h2 id="shippingPrintTitle">印刷する地域</h2><button type="button" data-print-close>閉じる</button></header><p>A4・横向き。山陰と沖縄は別々の用紙に、各1枚で印刷します。</p><div class="shippingPrintOptions"><button type="button" data-print-regions="sanin">山陰（1枚）</button><button type="button" data-print-regions="okinawa">沖縄（1枚）</button><button type="button" class="primary" data-print-regions="sanin,okinawa">山陰・沖縄（合計2枚）</button></div><p>出荷不可の色を出すには、印刷設定の「背景のグラフィック」を有効にしてください。ヘッダー・フッターはオフがおすすめです。</p><p>未保存の変更も印刷に含まれますが、共有データには保存されません。行数が増えると、用紙に合わせて文字も縮小します。</p><p id="shippingPrintError" role="status"></p>';document.body.append(dlg);dlg.querySelector('[data-print-close]').onclick=()=>dlg.close();
 let prepared=false;
 const root=document.createElement('div');root.id='shippingPrintRoot';root.setAttribute('aria-hidden','true');document.body.append(root);
 function cellAt(sheet,r,c){const m=sheet.merges.find(m=>r>=m[0]&&r<=m[2]&&c>=m[1]&&c<=m[3]);return sheet.cells[m?.[0]??r]?.[m?.[1]??c]||{v:'',s:0}}
 function ink(style){const value=color(style.fg,'#222222'),dark=v=>[1,3,5].reduce((n,i)=>n+parseInt(v.slice(i,i+2),16),0)<210;return dark(color(style.bg,'#ffffff'))&&dark(value)?'#ffffff':value}
 function color(v,fallback){return /^#[0-9a-f]{6}$/i.test(v)?v:fallback}
 function page({plan:p,note}){
  const s=p.sheets[0],visible=r=>!(r>=p.firstSupplier&&r<=p.lastSupplier&&!text(s.cells[r]?.[0]?.v).trim()),cols=Array.from({length:p.dateCols+1},(_,i)=>i),last=(()=>{let r=s.cells.length-1;while(r>p.lastSupplier&&s.cells[r].every(c=>!text(c.v).trim()))r--;return r})();
  let html='<section class="shippingPrintPage"><div class="shippingPrintContent"><header><h1>'+esc(p.year+'年 '+p.label+' 長期休暇の出荷予定 — '+labels[p.region])+'</h1><p>'+esc(p.start.replaceAll('-','/')+' ～ '+p.end.replaceAll('-','/'))+'　■ 出荷不可（色なしは出荷可の確認済みを意味しません）'+(note?'　／ '+esc(note):'')+'</p></header><table><colgroup><col class="printVendor">'+cols.slice(1).map(()=>'<col>').join('')+'</colgroup><tbody>';
  for(let r=p.dateRow;r<=last;r++){if(!visible(r))continue;const header=r===p.dateRow||r===p.weekdayRow;html+='<tr>';for(const c of cols){const merge=s.merges.find(m=>r>=m[0]&&r<=m[2]&&c>=m[1]&&c<=m[3]),rr=merge?Array.from({length:merge[2]-merge[0]+1},(_,i)=>merge[0]+i).filter(i=>i>=p.dateRow&&i<=last&&visible(i)):null;if(merge&&(r!==rr[0]||c!==Math.max(0,merge[1])))continue;const cell=cellAt(s,r,c),style=p.styles[cell.s]||{},closed=text(style.bg).toUpperCase()==='#FFC000';let value=cell.v;if(header&&c===0)value=r===p.dateRow?'取引先':'曜日';else if(r===p.dateRow&&c>0)value=text(value).slice(5).replace('-','/');else if(closed&&!text(value).trim())value='×';const tag=header?'th':'td';html+='<'+tag+(merge?' rowspan="'+rr.length+'" colspan="'+cols.filter(i=>i>=merge[1]&&i<=merge[3]).length+'"':'')+' style="background:'+color(style.bg,'#ffffff')+';color:'+ink(style)+'">'+esc(value)+'</'+tag+'>'}
   html+='</tr>'}

  return html+'</tbody></table><p class="printFootnote">出荷不可の背景色を保持しています。白黒印刷でも分かるよう、出荷不可の空欄には「×」を付けています。</p></div></section>';
 }
 function fit(){for(const page of root.querySelectorAll('.shippingPrintPage')){const content=page.firstElementChild;content.style.transform='none';const scale=Math.min(1,(page.clientHeight-2)/content.scrollHeight,(page.clientWidth-2)/content.scrollWidth);content.style.transform='scale('+scale+')';content.style.transformOrigin='top left';page.dataset.scale=String(scale)}}
 async function prepare(regions){const plans=await window.shippingPrint.getPlans(regions);root.innerHTML=plans.map(page).join('');await document.fonts.ready;fit();prepared=true;return plans.length}
 const update=()=>{button.disabled=!window.shippingPrint?.state().ready};document.addEventListener('shipping-state-changed',update);update();
 button.onclick=()=>{const state=window.shippingPrint?.state();if(!state?.ready)return;dlg.querySelector('#shippingPrintError').textContent='';for(const b of dlg.querySelectorAll('[data-print-regions]'))b.disabled=b.dataset.printRegions.split(',').some(r=>!state.available(r));dlg.showModal()};
 for(const b of dlg.querySelectorAll('[data-print-regions]'))b.onclick=async()=>{const error=dlg.querySelector('#shippingPrintError');error.textContent='印刷用の表を準備しています…';try{await prepare(b.dataset.printRegions.split(','));dlg.close();window.print()}catch(e){error.textContent='印刷できませんでした。'+e.message}};
 window.addEventListener('beforeprint',()=>{if(!prepared){const current=window.shippingColors?.getTable();if(current?.plan)root.innerHTML=page({plan:current.plan,note:document.getElementById('saveIndicator')?.dataset.state==='dirty'?'未保存の変更を含みます':''})}fit()});window.addEventListener('afterprint',()=>{prepared=false});
 // Exposed for print-preview verification; no writes or table switching.
 window.shippingPrintPreview={prepare};
})();
