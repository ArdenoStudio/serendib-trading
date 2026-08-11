import { query } from '../_db.js';
import { getSessionFromRequest } from '../auth/_session.js';

// Simple in-memory throttle for public write endpoints (per function instance).
// Not a hard guarantee across instances, but stops naive floods.
const POST_BUCKET_MS = 60_000;
const MAX_POSTS_PER_IP = 60;
const postBuckets = new Map();

const throttle = (key) => {
  const now = Date.now();
  const bucket = postBuckets.get(key);
  if (!bucket || now - bucket.startedAt > POST_BUCKET_MS) {
    postBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (bucket.count >= MAX_POSTS_PER_IP) return false;
  bucket.count += 1;
  return true;
};

const getClientIp = (req) => {
  const vercelForwarded = req.headers['x-vercel-forwarded-for'];
  if (typeof vercelForwarded === 'string' && vercelForwarded.trim()) {
    return vercelForwarded.split(',')[0].trim();
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    const firstHop = forwardedFor.split(',')[0].trim();
    if (firstHop) return firstHop;
  }
  return req.socket?.remoteAddress || 'unknown';
};

const sameOriginRequest = (req) => {
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = typeof hostHeader === 'string' ? hostHeader.split(',')[0].trim().toLowerCase() : '';
  if (!host) return false;

  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.length > 0) {
    try {
      return new URL(origin).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.referer;
  if (typeof referer === 'string' && referer.length > 0) {
    try {
      return new URL(referer).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }

  return false;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // GET: admin-only daily traffic aggregates for the dashboard.
  if (req.method === 'GET') {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const rows = await query(
        `SELECT created_at::date AS date,
                COUNT(*)::int AS page_views,
                COUNT(*)::int AS visitor_count
         FROM site_traffic
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY created_at::date
         ORDER BY created_at::date DESC`
      );
      return res.status(200).json(Array.isArray(rows) ? rows : []);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Analytics read error' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Public write path (page/car views from the SPA): same-origin + throttle.
  if (!sameOriginRequest(req)) {
    return res.status(403).json({ error: 'Cross-origin analytics writes are not allowed.' });
  }
  const ip = getClientIp(req);
  if (!throttle(ip)) {
    return res.status(429).json({ error: 'Too many analytics events.' });
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
      await query('UPDATE cars SET views = COALESCE(views, 0) + 1 WHERE id = $1', [String(body.car_id).slice(0, 80)]);
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
