import { createHash } from 'node:crypto';
import { query } from '../_db.js';
import { getSessionFromRequest } from '../auth/_session.js';

const hashIp = (ip) => {
  const salt = process.env.LEAD_RATE_LIMIT_SALT || process.env.AUTH_SECRET || 'serendib-analytics';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
};

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
  const netlifyIp = req.headers['x-nf-client-connection-ip'] || req.headers['client-ip'];
  if (typeof netlifyIp === 'string' && netlifyIp.trim()) {
    return netlifyIp.split(',')[0].trim();
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

const ensureSiteTrafficTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public.site_traffic (
        id BIGSERIAL PRIMARY KEY,
        event_type TEXT NOT NULL DEFAULT 'page_view',
        path TEXT,
        user_agent TEXT,
        referrer TEXT,
        cta_name TEXT,
        car_id TEXT,
        ip_hash TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'page_view';
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS cta_name TEXT;
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS car_id TEXT;
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS metadata JSONB;
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS ip_hash TEXT;
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS user_agent TEXT;
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS referrer TEXT;
      ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `);
  } catch (err) {
    // Non-fatal: table might already exist or be locked
  }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // GET: admin-only analytics aggregates for the dashboard.
  if (req.method === 'GET') {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await ensureSiteTrafficTable();

      const days = Math.min(90, Math.max(7, parseInt(String(req.query?.days || '30'), 10) || 30));
      const range = `NOW() - ($1::text || ' days')::interval`;

      const [daily, topPages, topCtas, topCars, referrers, recent, uniques] = await Promise.all([
        query(
          `SELECT created_at::date AS date,
                  COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS page_views,
                  COUNT(DISTINCT ip_hash) FILTER (WHERE event_type = 'page_view')::int AS visitor_count,
                  COUNT(*) FILTER (WHERE event_type = 'cta_click')::int AS cta_clicks,
                  COUNT(*) FILTER (WHERE event_type = 'car_view')::int AS car_views
           FROM site_traffic
           WHERE created_at >= NOW() - ($1::text || ' days')::interval
           GROUP BY created_at::date
           ORDER BY created_at::date DESC`,
          [String(days)]
        ),
        query(
          `SELECT path, COUNT(*)::int AS count
           FROM site_traffic
           WHERE event_type = 'page_view' AND created_at >= NOW() - ($1::text || ' days')::interval
           GROUP BY path ORDER BY count DESC LIMIT 10`,
          [String(days)]
        ),
        query(
          `SELECT cta_name AS name, COUNT(*)::int AS count
           FROM site_traffic
           WHERE event_type = 'cta_click' AND created_at >= NOW() - ($1::text || ' days')::interval
           GROUP BY cta_name ORDER BY count DESC LIMIT 10`,
          [String(days)]
        ),
        query(
          `SELECT car_id, COUNT(*)::int AS count
           FROM site_traffic
           WHERE event_type = 'car_view' AND car_id IS NOT NULL AND created_at >= NOW() - ($1::text || ' days')::interval
           GROUP BY car_id ORDER BY count DESC LIMIT 8`,
          [String(days)]
        ),
        query(
          `SELECT COALESCE(NULLIF(referrer,''), 'Direct') AS referrer, COUNT(*)::int AS count
           FROM site_traffic
           WHERE event_type = 'page_view' AND created_at >= NOW() - ($1::text || ' days')::interval
           GROUP BY referrer ORDER BY count DESC LIMIT 6`,
          [String(days)]
        ),
        query(
          `SELECT event_type, path, cta_name, car_id, referrer, created_at
           FROM site_traffic ORDER BY created_at DESC LIMIT 20`
        ),
        query(
          `SELECT COUNT(DISTINCT ip_hash)::int AS uniques
           FROM site_traffic WHERE event_type='page_view' AND created_at >= NOW() - ($1::text || ' days')::interval`,
          [String(days)]
        ),
      ]);

      // Back-compat: legacy clients expect array of {date,visitor_count,page_views}
      // New clients can use ?format=detailed for full payload.
      const wantsDetailed = String(req.query?.format || '') === 'detailed' || String(req.query?.detailed || '') === '1';
      if (!wantsDetailed) {
        return res.status(200).json(Array.isArray(daily) ? daily : []);
      }

      // Enrich topCars with make/model if possible (best-effort)
      let enrichedTopCars = Array.isArray(topCars) ? topCars : [];
      if (enrichedTopCars.length > 0) {
        try {
          const ids = enrichedTopCars.map((r) => r.car_id).filter(Boolean);
          if (ids.length > 0) {
            const cars = await query(`SELECT id, make, model, year FROM cars WHERE id = ANY($1::text[])`, [ids]);
            const map = new Map((Array.isArray(cars) ? cars : []).map((c) => [c.id, c]));
            enrichedTopCars = enrichedTopCars.map((r) => ({
              ...r,
              car: map.get(r.car_id) || null,
            }));
          }
        } catch {}
      }

      return res.status(200).json({
        days,
        daily: Array.isArray(daily) ? daily : [],
        topPages: Array.isArray(topPages) ? topPages : [],
        topCtas: Array.isArray(topCtas) ? topCtas : [],
        topCars: enrichedTopCars,
        referrers: Array.isArray(referrers) ? referrers : [],
        recent: Array.isArray(recent) ? recent : [],
        uniques: Array.isArray(uniques) && uniques[0] ? Number(uniques[0].uniques || 0) : 0,
      });
    } catch (err) {
      console.error('Analytics read error:', err);
      const wantsDetailed = String(req.query?.format || '') === 'detailed' || String(req.query?.detailed || '') === '1';
      if (wantsDetailed) {
        return res.status(200).json({
          days: 30,
          daily: [],
          topPages: [],
          topCtas: [],
          topCars: [],
          referrers: [],
          recent: [],
          uniques: 0,
        });
      }
      return res.status(200).json([]);
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

    const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);
    const ipHash = hashIp(ip);
    const path = String(body.path || body.path_name || '/').slice(0, 500);
    const referrer = String(body.referrer || req.headers.referer || '').slice(0, 500);

    if (body.type === 'car_view' && body.car_id) {
      const carId = String(body.car_id).slice(0, 80);
      try {
        await query('UPDATE cars SET views = COALESCE(views, 0) + 1 WHERE id = $1', [carId]);
      } catch {}
      try {
        await query(
          'INSERT INTO site_traffic (event_type, path, user_agent, referrer, car_id, ip_hash, metadata, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,NOW())',
          ['car_view', path, userAgent, referrer, carId, ipHash, JSON.stringify({ car_id: carId }).slice(0, 2000)]
        );
      } catch {}
      return res.status(200).json({ ok: true });
    }

    if (body.type === 'page_view') {
      try {
        await query(
          'INSERT INTO site_traffic (event_type, path, user_agent, referrer, ip_hash, created_at) VALUES ($1,$2,$3,$4,$5,NOW())',
          ['page_view', path, userAgent, referrer, ipHash]
        );
      } catch {}
      return res.status(200).json({ ok: true });
    }

    if (body.type === 'cta_click') {
      const cta = String(body.cta || body.name || 'unknown').slice(0, 80).toLowerCase();
      const meta = body.meta && typeof body.meta === 'object' ? body.meta : {};
      const allowed = new Set(['whatsapp_float','whatsapp_car','whatsapp_nav','call','call_car','instagram','contact_form','test_drive','view_inventory','explore_vehicles','about','finance','gallery','wishlist_add','wishlist_remove','car_card','share']);
      const ctaName = allowed.has(cta) ? cta : cta.slice(0, 80);
      try {
        await query(
          'INSERT INTO site_traffic (event_type, path, user_agent, referrer, cta_name, car_id, ip_hash, metadata, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,NOW())',
          ['cta_click', path, userAgent, referrer, ctaName, body.car_id ? String(body.car_id).slice(0,80) : null, ipHash, JSON.stringify({ ...meta, cta: ctaName }).slice(0,2000)]
        );
      } catch {}
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Invalid analytics payload' });
  } catch (err) {
    console.error('Analytics handler error:', err);
    return res.status(200).json({ ok: false });
  }
}
