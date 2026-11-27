'use strict';
(()=>{
 const typeFor={forecast:'event_forecast',card:'event_card_rate',invoice:'event_invoice_cloud'};
 const key=(kind,x)=>JSON.stringify(kind==='invoice'?[x.eventKey,+x.year,x.partner,x.issueDate,x.searchTitle,x.searchKey]:[x.eventKey,+x.year,x.partner,x.item]);
 window.seasonalDeleteKey=key;
 window.seasonalDeleted=(kind,x)=>{
  if(!x)return false;const rows=allRowsCache||[],id=String(x.id||'');
  if(id&&rows.some(r=>String(r.id)===id&&r.record_type==='seasonal_deleted_v1'))return true;
  if(id&&rows.some(r=>String(r.id)===id&&r.record_type===typeFor[kind]))return false;
  const k=key(kind,x);
  return rows.some(r=>{if(r.record_type!=='seasonal_deleted_v1')return false;try{const m=JSON.parse(r.memo||'{}');return m?.deletedInfo?.kind===kind&&m.deletedInfo.key===k}catch{return false}})
 };
})();
