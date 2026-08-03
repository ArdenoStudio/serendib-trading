import { query } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    if (body.type === 'car_view' && body.car_id) {
      await query('UPDATE cars SET views = COALESCE(views, 0) + 1 WHERE id = $1', [body.car_id]);
      return res.status(200).json({ ok: true });
    }

    if (body.type === 'page_view') {
      const path = String(body.path || '/').slice(0, 500);
      const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);
      const referrer = String(body.referrer || req.headers.referer || '').slice(0, 500);

      await query(
        'INSERT INTO site_traffic (path, user_agent, referrer, created_at) VALUES ($1, $2, $3, NOW())',
        [path, userAgent, referrer]
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Invalid analytics payload' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Analytics logging error' });
  }
}
