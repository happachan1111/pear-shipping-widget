const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../portal/home-clock.js','utf8');
let now=Date.parse('2026-12-01T08:29:59Z'),tick,click,store=new Map(),events={};
const nodes={homeClock:{},homeClockDate:{},holdReminder:{hidden:true},holdReminderAcknowledge:{addEventListener:(e,fn)=>click=fn}};
class FakeDate extends Date{constructor(...a){super(...(a.length?a:[now]));}}
const ctx={Intl,Date:FakeDate,document:{getElementById:id=>nodes[id],body:{classList:{toggle(){}}},addEventListener:(e,f)=>events[e]=f},window:{addEventListener:(e,f)=>events[e]=f},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},setInterval:f=>tick=f};
vm.runInNewContext(source,ctx);
function check(want,label){assert.equal(nodes.holdReminder.hidden,!want,label);console.log('PASS '+label)}
check(false,'17:29 hidden');now+=1000;tick();check(true,'17:30 shown');tick();check(true,'persistent');click();check(false,'acknowledge');vm.runInNewContext(source,ctx);check(false,'reload same day');now+=86400000;tick();check(true,'next day shows');now=Date.parse('2026-12-03T07:00:00Z');tick();check(false,'before threshold');now=Date.parse('2026-12-03T12:00:00Z');events.visibilitychange();check(true,'return late to tab');
assert.equal(nodes.homeClock.textContent,'21:00:00');console.log('PASS Japanese time');
ctx.localStorage.setItem=()=>{throw Error('blocked')};click();tick();check(false,'blocked storage remains acknowledged in tab');
