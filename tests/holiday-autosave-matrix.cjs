const {OUT,chromium,scene,ok,ready,toggle,saved,state,edit,settings,current}=require('./holiday-autosave-fixture.cjs');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
for(const width of [1440,390])for(const region of ['sanin','okinawa'])for(const kind of ['gw','obon','yearend']){
 const s=await scene(b,{width,region,kind}),{control:t,r,id}=s,A=await s.person(),B=await s.person(),p=A.p;
 await p.waitForTimeout(1050);ok(t.writes.length===0,`${width} ${region}/${kind}: view never saves`);ok(await p.locator('#grid [data-r="'+(r+1)+'"]').count()===0,'Blank supplier remains hidden');
 await toggle(p,r).click();ok(await state(p)==='dirty','Confirmation queues auto-save');await saved(p);ok(t.writes.length===1,'Confirmation auto-saves exactly once without Save click');ok(JSON.parse(t.rows.find(x=>x.id===id).memo).plan.sheets[0].cells[r][0].supplierConfirmed===true,'Confirmation persisted');
 await B.p.locator('#reload').click();await ready(B.p);ok(await toggle(B.p,r).textContent()==='確定','Independent user Update gets confirmation');ok(await B.p.locator('#grid [data-r="'+r+'"][data-c="1"]').first().isDisabled(),'Independent user row is locked');
 await toggle(p,r).click();await saved(p);ok(!(await current(p)).sheets[0].cells[r][0].supplierConfirmed,'Unlock auto-saved');
 await edit(p,r,1,'日別の入力');await saved(p);await edit(p,r,s.plan.dateCols+1,'備考の入力');await saved(p);ok(JSON.parse(t.rows.find(x=>x.id===id).memo).plan.sheets[0].cells[r][1].v==='日別の入力','Cell text auto-saved');ok(JSON.parse(t.rows.find(x=>x.id===id).memo).plan.sheets[0].cells[r][s.plan.dateCols+1].v==='備考の入力','Note auto-saved');
 await settings(p);await p.locator('#grid [data-r="'+(r+2)+'"][data-c="1"]').first().click();const n=t.writes.length;await p.locator('#copyColor').click();await p.waitForTimeout(1000);ok(t.writes.length===n,'Select/copy does not save');await p.locator('#setClosed').click();await saved(p);const remote=JSON.parse(t.rows.find(x=>x.id===id).memo).plan;ok(remote.styles[remote.sheets[0].cells[r+2][1].s].bg.toUpperCase()==='#FFC000','Color auto-saved');
 ok(remote.sheets[0].cells[r+1][2].v==='非表示の保存データ','Hidden data retained');ok(JSON.stringify(t.rows.find(x=>x.id===id).comments)===JSON.stringify(s.original.comments),'Existing record comments retained');ok(t.rows.find(x=>x.id==='untouched').memo==='変更しない','Unrelated shared records unchanged');
 await p.reload();await ready(p);ok((await current(p)).sheets[0].cells[r][1].v==='日別の入力','F5/reload keeps saved values');ok(!await p.evaluate(()=>portalHasUnsavedChanges()),'Completed auto-save clears navigation guard');ok(A.errors.length+B.errors.length===0,'No runtime errors');
 if(kind==='yearend'){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:OUT+'/' +region+'-'+width+'.png'})}
 await s.close();
}
await b.close();console.log('AUTO-SAVE MATRIX PASSED')})().catch(e=>{console.error(e);process.exit(1)});
