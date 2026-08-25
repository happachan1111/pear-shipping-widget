export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);
    try {
      // 初回セットアップ用。通常の表示では毎回実行しないので軽くなります。
      if (url.pathname === '/setup') {
        await init(env);
        await seedDeadline(env);
        await seedTimeline(env);
        return json({ ok: true, message: 'setup complete' }, cors);
      }

      if (url.pathname === '/data' && request.method === 'GET') {
        const items = (await env.DB.prepare('SELECT * FROM items ORDER BY date, source, variety').all()).results.map(row => ({...row, comments: JSON.parse(row.comments || '[]')}));
        const activity = (await env.DB.prepare('SELECT text, created_at FROM activity ORDER BY id DESC LIMIT 8').all()).results;
        return json({ items, activity }, cors);
      }
      if (url.pathname === '/items' && request.method === 'POST') {
        const body = await request.json();
        const id = body.id || String(Date.now());
        await env.DB.prepare('INSERT INTO items (id, source, variety, date, comments, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, body.source, body.variety, body.date, JSON.stringify(body.comments || []), Date.now()).run();
        await addActivity(env, `${body.date} ${body.source} ${body.variety}を追加しました。`);
        return json({ ok: true, id }, cors);
      }
      const itemMatch = url.pathname.match(/^\/items\/([^/]+)$/);
      if (itemMatch && request.method === 'PUT') {
        const id = decodeURIComponent(itemMatch[1]);
        const body = await request.json();
        await env.DB.prepare('UPDATE items SET source=?, variety=?, date=?, comments=?, updated_at=? WHERE id=?')
          .bind(body.source, body.variety, body.date, JSON.stringify(body.comments || []), Date.now(), id).run();
        await addActivity(env, `${body.date} ${body.source} ${body.variety}を更新しました。`);
        return json({ ok: true }, cors);
      }
      if (itemMatch && request.method === 'DELETE') {
        const id = decodeURIComponent(itemMatch[1]);
        const old = await env.DB.prepare('SELECT * FROM items WHERE id=?').bind(id).first();
        await env.DB.prepare('DELETE FROM items WHERE id=?').bind(id).run();
        if (old) await addActivity(env, `${old.date} ${old.source} ${old.variety}を削除しました。`);
        return json({ ok: true }, cors);
      }
      const commentMatch = url.pathname.match(/^\/items\/([^/]+)\/comments$/);
      if (commentMatch && request.method === 'PUT') {
        const id = decodeURIComponent(commentMatch[1]);
        const body = await request.json();
        const comments = body.comments || [];
        const item = await env.DB.prepare('SELECT * FROM items WHERE id=?').bind(id).first();
        await env.DB.prepare('UPDATE items SET comments=?, updated_at=? WHERE id=?').bind(JSON.stringify(comments), Date.now(), id).run();
        if (item) await addActivity(env, `${item.date} ${item.source} ${item.variety}のコメントを更新しました。`);
        return json({ ok: true }, cors);
      }

      if (url.pathname === '/timeline/data' && request.method === 'GET') {
        const rows = (await env.DB.prepare('SELECT * FROM timeline ORDER BY year, source, variety').all()).results.map(row => ({...row, comments: JSON.parse(row.comments || '[]')}));
        const activity = (await env.DB.prepare('SELECT text, created_at FROM timeline_activity ORDER BY id DESC LIMIT 8').all()).results;
        return json({ rows, activity }, cors);
      }
      if (url.pathname === '/timeline/rows' && request.method === 'POST') {
        const body = await request.json();
        const id = body.id || [body.source, body.variety, String(body.year || (body.start || '').slice(0,4))].join('|');
        const year = Number(body.year || String(body.start).slice(0,4));
        await env.DB.prepare('INSERT OR REPLACE INTO timeline (id, source, variety, year, start, end, hidden, comments, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(id, body.source, body.variety, year, body.start, body.end, body.hidden ? 1 : 0, JSON.stringify(body.comments || []), Date.now()).run();
        await addTimelineActivity(env, `${year}年 ${body.source} ${body.variety}を保存しました。`);
        return json({ ok: true, id }, cors);
      }
      const timelineMatch = url.pathname.match(/^\/timeline\/rows\/([^/]+)$/);
      if (timelineMatch && request.method === 'PUT') {
        const id = decodeURIComponent(timelineMatch[1]);
        const body = await request.json();
        const year = Number(body.year || String(body.start).slice(0,4));
        await env.DB.prepare('UPDATE timeline SET source=?, variety=?, year=?, start=?, end=?, hidden=?, comments=?, updated_at=? WHERE id=?')
          .bind(body.source, body.variety, year, body.start, body.end, body.hidden ? 1 : 0, JSON.stringify(body.comments || []), Date.now(), id).run();
        await addTimelineActivity(env, `${year}年 ${body.source} ${body.variety}を更新しました。`);
        return json({ ok: true }, cors);
      }
      if (timelineMatch && request.method === 'DELETE') {
        const id = decodeURIComponent(timelineMatch[1]);
        const old = await env.DB.prepare('SELECT * FROM timeline WHERE id=?').bind(id).first();
        await env.DB.prepare('DELETE FROM timeline WHERE id=?').bind(id).run();
        if (old) await addTimelineActivity(env, `${old.year}年 ${old.source} ${old.variety}を削除しました。`);
        return json({ ok: true }, cors);
      }
      const timelineCommentMatch = url.pathname.match(/^\/timeline\/rows\/([^/]+)\/comments$/);
      if (timelineCommentMatch && request.method === 'PUT') {
        const id = decodeURIComponent(timelineCommentMatch[1]);
        const body = await request.json();
        const row = await env.DB.prepare('SELECT * FROM timeline WHERE id=?').bind(id).first();
        await env.DB.prepare('UPDATE timeline SET comments=?, updated_at=? WHERE id=?').bind(JSON.stringify(body.comments || []), Date.now(), id).run();
        if (row) await addTimelineActivity(env, `${row.year}年 ${row.source} ${row.variety}のコメントを更新しました。`);
        return json({ ok: true }, cors);
      }
      return new Response('Not found', { status: 404, headers: cors });
    } catch (e) {
      return json({ ok: false, error: String(e && e.message || e) }, cors, 500);
    }
  }
}
function json(data, cors, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); }
async function init(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, source TEXT NOT NULL, variety TEXT NOT NULL, date TEXT NOT NULL, comments TEXT NOT NULL DEFAULT '[]', updated_at INTEGER NOT NULL)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, created_at INTEGER NOT NULL)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS timeline (id TEXT PRIMARY KEY, source TEXT NOT NULL, variety TEXT NOT NULL, year INTEGER NOT NULL, start TEXT NOT NULL, end TEXT NOT NULL, hidden INTEGER NOT NULL DEFAULT 0, comments TEXT NOT NULL DEFAULT '[]', updated_at INTEGER NOT NULL)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS timeline_activity (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, created_at INTEGER NOT NULL)`).run();
}
async function addActivity(env, text) { await env.DB.prepare('INSERT INTO activity (text, created_at) VALUES (?, ?)').bind(text, Date.now()).run(); }
async function addTimelineActivity(env, text) { await env.DB.prepare('INSERT INTO timeline_activity (text, created_at) VALUES (?, ?)').bind(text, Date.now()).run(); }
async function seedDeadline(env) {
  const count = await env.DB.prepare('SELECT COUNT(*) AS c FROM items').first();
  if (count && count.c > 0) return;
  const seeds = [['h2025-0904','二十世紀梨','広岡農場','2025-09-04'],['h2025-0908','秋栄','広岡農場','2025-09-08'],['h2025-0915','新甘泉','広岡農場','2025-09-15'],['h2025-0925','二十世紀梨','広岡農場','2025-09-25'],['h2025-1105','あきづき','広岡農場','2025-11-05'],['h2025-1126','新興梨','広岡農場','2025-11-26'],['h2025-1225','王秋','広岡農場','2025-12-25']];
  for (const [id,variety,source,date] of seeds) await env.DB.prepare('INSERT INTO items (id, source, variety, date, comments, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, source, variety, date, '[]', Date.now()).run();
  await addActivity(env, '2025年の広岡農場の受注STOP日を反映済みです。');
}
async function seedTimeline(env) {
  const count = await env.DB.prepare('SELECT COUNT(*) AS c FROM timeline').first();
  if (count && count.c > 0) return;
  const seeds = [
    ['広岡農場|二十世紀梨|2026','広岡農場','二十世紀梨',2026,'2026-09-04','2026-09-25'],['広岡農場|秋栄|2026','広岡農場','秋栄',2026,'2026-09-08','2026-09-08'],['広岡農場|新甘泉|2026','広岡農場','新甘泉',2026,'2026-09-15','2026-09-15'],['広岡農場|あきづき|2026','広岡農場','あきづき',2026,'2026-11-05','2026-11-05'],['広岡農場|新興梨|2026','広岡農場','新興梨',2026,'2026-11-26','2026-11-26'],['広岡農場|王秋|2026','広岡農場','王秋',2026,'2026-12-25','2026-12-25'],
    ['広岡農場|二十世紀梨|2025','広岡農場','二十世紀梨',2025,'2025-09-08','2025-09-25'],['広岡農場|秋栄|2025','広岡農場','秋栄',2025,'2025-08-26','2025-09-11'],['広岡農場|新甘泉|2025','広岡農場','新甘泉',2025,'2025-08-28','2025-09-18'],['広岡農場|あきづき|2025','広岡農場','あきづき',2025,'2025-09-20','2025-10-10'],['広岡農場|新興梨|2025','広岡農場','新興梨',2025,'2025-10-15','2025-11-28'],['広岡農場|王秋|2025','広岡農場','王秋',2025,'2025-11-05','2025-12-26']
  ];
  for (const [id,source,variety,year,start,end] of seeds) await env.DB.prepare('INSERT INTO timeline (id, source, variety, year, start, end, hidden, comments, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)').bind(id, source, variety, year, start, end, '[]', Date.now()).run();
  await addTimelineActivity(env, '出荷時期タイムラインの初期データを反映済みです。');
}
