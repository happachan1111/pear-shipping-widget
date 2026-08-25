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
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, source TEXT NOT NULL, variety TEXT NOT NULL, date TEXT NOT NULL, comments TEXT NOT NULL DEFAULT '[]', updated_at INTEGER NOT NULL)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, created_at INTEGER NOT NULL)`).run();
      await seed(env);
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
      return new Response('Not found', { status: 404, headers: cors });
    } catch (e) {
      return json({ ok: false, error: String(e && e.message || e) }, cors, 500);
    }
  }
}
function json(data, cors, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }); }
async function addActivity(env, text) { await env.DB.prepare('INSERT INTO activity (text, created_at) VALUES (?, ?)').bind(text, Date.now()).run(); }
async function seed(env) {
  const count = await env.DB.prepare('SELECT COUNT(*) AS c FROM items').first();
  if (count && count.c > 0) return;
  const seeds = [
    ['h2025-0904','二十世紀梨','広岡農場','2025-09-04'],['h2025-0908','秋栄','広岡農場','2025-09-08'],['h2025-0915','新甘泉','広岡農場','2025-09-15'],['h2025-0925','二十世紀梨','広岡農場','2025-09-25'],['h2025-1105','あきづき','広岡農場','2025-11-05'],['h2025-1126','新興梨','広岡農場','2025-11-26'],['h2025-1225','王秋','広岡農場','2025-12-25']
  ];
  for (const [id,variety,source,date] of seeds) {
    await env.DB.prepare('INSERT INTO items (id, source, variety, date, comments, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, source, variety, date, '[]', Date.now()).run();
  }
  await addActivity(env, '2025年の広岡農場の受注STOP日を反映済みです。');
}
