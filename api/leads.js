import crypto from 'node:crypto';
import { query } from './_db.js';

const ALLOWED_TYPES = new Set(['Test Drive', 'General Inquiry']);
const ALLOWED_TIMES = new Set(['9:30am', '1:00pm', '4:30pm']);
const PHONE_PATTERN = /^[0-9+() ./\-–—]{7,25}$/;
const MAX_BODY_BYTES = 8192;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_PHONE_SUBMISSIONS_PER_WINDOW = 3;
const MAX_IP_SUBMISSIONS_PER_WINDOW = 8;

const send = (res, status, payload) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).send(JSON.stringify(payload));
};

const parseJsonBody = (raw) => {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    const error = new Error('Invalid JSON body.');
    error.status = 400;
    throw error;
  }
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') {
    // Runtime already parsed the body (e.g. vercel dev): enforce the same cap.
    const size = Buffer.byteLength(JSON.stringify(req.body) || '', 'utf8');
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body too large.');
      error.status = 413;
      throw error;
    }
    return req.body;
  }
  if (typeof req.body === 'string') return parseJsonBody(req.body || '{}');

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY_BYTES) {
      const error = new Error('Request body too large.');
      error.status = 413;
      throw error;
    }
  }

  return parseJsonBody(raw);
};

const cleanText = (value, maxLength) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const requestHost = (req) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return typeof host === 'string' ? host.split(',')[0].trim().toLowerCase() : '';
};

const sameOriginRequest = (req) => {
  const host = requestHost(req);
  if (!host) return false;

  const normalizeHost = (h) => h.replace(/^www\./, '').replace(/:\d+$/, '');
  const cleanHost = normalizeHost(host);

  const check = (raw) => {
    if (typeof raw !== 'string' || !raw) return false;
    try {
      const rawHost = normalizeHost(new URL(raw).host.toLowerCase());
      return rawHost === cleanHost || rawHost.endsWith('.pages.dev') || cleanHost.endsWith('.pages.dev');
    } catch {
      return false;
    }
  };

  if (req.headers.origin && check(req.headers.origin)) return true;
  if (req.headers.referer && check(req.headers.referer)) return true;

  return false;
};

const getClientIp = (req) => {
  // Only trust platform-provided IP headers.
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }

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

const getRateLimitSalt = () => {
  const salt = process.env.LEAD_RATE_LIMIT_SALT;
  if (!salt || salt.length < 16) {
    // Fail closed: without a strong salt the rate-limit keying is predictable.
    const error = new Error('Lead capture is unavailable right now.');
    error.status = 500;
    throw error;
  }
  return salt;
};

const hashRateKey = (req, phone) => {
  const salt = getRateLimitSalt();
  return crypto
    .createHash('sha256')
    .update(`${salt}:${getClientIp(req)}:${phone}`)
    .digest('hex');
};

const hashIpKey = (req) => {
  const salt = getRateLimitSalt();
  return crypto
    .createHash('sha256')
    .update(`${salt}:ip:${getClientIp(req)}`)
    .digest('hex');
};

const validateLead = (body) => {
  if (body.company || body.website || body.botField) {
    const error = new Error('Lead rejected.');
    error.status = 400;
    throw error;
  }

  const type = cleanText(body.type, 40);
  const name = cleanText(body.name, 120);
  const phone = cleanText(body.phone, 25);
  const vehicleModel = cleanText(body.vehicle_model, 160);
  const message = cleanText(body.message, 1000);
  const date = cleanText(body.date, 10);
  const time = cleanText(body.time, 10);

  if (!ALLOWED_TYPES.has(type)) {
    const error = new Error('Invalid inquiry type.');
    error.status = 400;
    throw error;
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (name.length < 2 || !PHONE_PATTERN.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 16) {
    const error = new Error('Enter a valid name and contact number.');
    error.status = 400;
    throw error;
  }

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const error = new Error('Invalid preferred date.');
    error.status = 400;
    throw error;
  }

  if (date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requested = new Date(`${date}T00:00:00`);
    if (Number.isNaN(requested.getTime()) || requested < today) {
      const error = new Error('Choose today or a future date.');
      error.status = 400;
      throw error;
    }
  }

  if (time && !ALLOWED_TIMES.has(time)) {
    const error = new Error('Invalid preferred time.');
    error.status = 400;
    throw error;
  }

  if (body.consent !== true) {
    const error = new Error('Please accept the privacy policy so we can handle this inquiry.');
    error.status = 400;
    throw error;
  }

  return {
    type,
    name,
    phone,
    vehicle_id: cleanText(body.vehicle_id, 80) || null,
    vehicle_model: vehicleModel || null,
    message: message || null,
    date: date || null,
    time: time || null,
    status: 'New',
  };
};

const enforceRateLimit = async (req, lead) => {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const keyHash = hashRateKey(req, lead.phone);
  const ipKey = hashIpKey(req);

  const [ipLimit, phoneLimit, ipBucket] = await Promise.all([
    query('SELECT id FROM lead_rate_limits WHERE key_hash = $1 AND created_at >= $2 LIMIT 1', [keyHash, since]),
    query('SELECT id FROM leads WHERE phone = $1 AND created_at >= $2 LIMIT $3', [lead.phone, since, MAX_PHONE_SUBMISSIONS_PER_WINDOW]),
    query('SELECT id FROM lead_rate_limits WHERE key_hash = $1 AND created_at >= $2 LIMIT $3', [ipKey, since, MAX_IP_SUBMISSIONS_PER_WINDOW]),
  ]);

  const phoneHits = Array.isArray(phoneLimit) ? phoneLimit.length : 0;
  const ipHits = Array.isArray(ipLimit) ? ipLimit.length : 0;
  const ipBucketHits = Array.isArray(ipBucket) ? ipBucket.length : 0;

  if (ipHits > 0 || phoneHits >= MAX_PHONE_SUBMISSIONS_PER_WINDOW || ipBucketHits >= MAX_IP_SUBMISSIONS_PER_WINDOW) {
    const error = new Error('Please wait before submitting another inquiry.');
    error.status = 429;
    throw error;
  }

  await query('INSERT INTO lead_rate_limits (key_hash, created_at) VALUES ($1, NOW())', [keyHash]);
  await query('INSERT INTO lead_rate_limits (key_hash, created_at) VALUES ($1, NOW())', [ipKey]);
  await query("DELETE FROM lead_rate_limits WHERE created_at < NOW() - INTERVAL '24 hours'").catch(() => undefined);
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { error: 'Method not allowed.' });
  }

  if (!sameOriginRequest(req)) {
    return send(res, 403, { error: 'Cross-origin lead submissions are not allowed.' });
  }

  try {
    const body = await readBody(req);
    const lead = validateLead(body);

    await enforceRateLimit(req, lead);

    await query(
      `INSERT INTO leads (type, name, phone, vehicle_id, vehicle_model, message, date, time, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        lead.type,
        lead.name,
        lead.phone,
        lead.vehicle_id,
        lead.vehicle_model,
        lead.message,
        lead.date,
        lead.time,
        lead.status,
      ]
    );

    try {
      await query(
        `INSERT INTO site_traffic (event_type, path, cta_name, car_id, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
        [
          'lead_submission',
          lead.type === 'Test Drive' ? `/car/${lead.vehicle_id || ''}` : '/contact',
          lead.type,
          lead.vehicle_id || null,
          JSON.stringify({ name: lead.name, vehicle: lead.vehicle_model, type: lead.type }),
        ]
      );
    } catch {}

    return send(res, 201, { ok: true });
  } catch (error) {
    const status = error.status || 500;
    const message = status >= 500 ? 'Lead capture failed.' : error.message;

    return send(res, status, { error: message });
  }
}
