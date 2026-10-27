// Run: node tests/card-input-stability.cjs (no network or dependencies).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cases = [
  ['father-data-stability-v36.js', 'loadFatherOpsV34', ['father']],
  ['aged-data-stability-v37.js', 'loadAgedOpsV37', ['aged']],
  ['valentine-white-stability-v39.js', 'loadValentineWhiteOpsV39', ['valentine', 'white']],
];
(async () => {
  for (const [file, loader, events] of cases) for (const event of events) {
    const fallback = {schedules:[{id:'schedule',value:'fallback'}], forecasts:[{id:'forecast',value:'fallback'}], cards:[{id:'card',value:0}]};
    for (const initiallyActive of [true, false]) {
      let renders=0, timers=0;
      const c={activeEvent:initiallyActive?event:'mother', scheduleRows:[], forecastRows:[], cardRows:[],
        renderAll:()=>renders++, setTimeout:()=>timers++,
        [loader]:async()=>events.length===1?structuredClone(fallback):Object.fromEntries(events.map(e=>[e,structuredClone(fallback)]))};
      vm.createContext(c);
      await vm.runInContext(fs.readFileSync(path.join(__dirname,'../mothers-day',file),'utf8'),c);
      assert.equal(timers,0,'No unsolicited delayed full render');
      assert.equal(renders,initiallyActive?1:0,'Initial merge renders only active event');
      c.activeEvent=event;
      c.cardRows=[{id:'card',value:60},{id:'new-card',value:40}];
      c.renderAll();
      assert.equal(c.cardRows.find(r=>r.id==='card').value,60,'Remote/current value wins over fallback');
      assert.equal(c.cardRows.length,2,'No duplicate card IDs');
      assert.equal(c.scheduleRows.length,1,'Schedule fallback retained after event switch');
      assert.equal(c.forecastRows.length,1,'Forecast fallback retained after event switch');
      c.renderAll();
      assert.equal(c.cardRows.length,2,'Repeated real renders remain idempotent');
      console.log('PASS',event,initiallyActive?'initial':'switch');
    }
  }
})().catch(e=>{console.error(e);process.exitCode=1});
