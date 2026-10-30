/* Local, per-browser reminder. No shared business data or API writes. */
(() => {
  'use strict';
  const clock = document.getElementById('homeClock');
  const dateLabel = document.getElementById('homeClockDate');
  const reminder = document.getElementById('holdReminder');
  const acknowledge = document.getElementById('holdReminderAcknowledge');
  if (!clock || !reminder || !acknowledge) return;
  const key = 'tearlum.hold-reminder.ack-date.v1';
  const formatter = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const dateFormatter = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  let memoryAck = '';
  let currentDay = '';
  function readAck() {
    try { return memoryAck || localStorage.getItem(key); } catch (_) { return memoryAck; }
  }
  function update() {
    const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(p => [p.type, p.value]));
    currentDay = `${parts.year}-${parts.month}-${parts.day}`;
    clock.textContent = `${parts.hour}:${parts.minute}:${parts.second}`;
    clock.dateTime = `${currentDay}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
    dateLabel.textContent = dateFormatter.format(new Date());
    dateLabel.title = '日本時間';
    reminder.hidden = !(Number(parts.hour) * 60 + Number(parts.minute) >= 1050 && readAck() !== currentDay);
    document.body.classList.toggle('holdReminderVisible', !reminder.hidden);
  }
  acknowledge.addEventListener('click', () => {
    // Recalculate date even if the tab was sleeping across midnight.
    update();
    memoryAck = currentDay;
    try { localStorage.setItem(key, currentDay); } catch (_) { /* This tab still remembers. */ }
    update();
  });
  window.addEventListener('storage', e => { if (e.key === key) { memoryAck = ''; update(); } });
  window.addEventListener('pageshow', update);
  document.addEventListener('visibilitychange', update);
  update();
  setInterval(update, 1000);
})();
