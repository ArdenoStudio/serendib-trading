import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_TYPES = new Set(['Test Drive', 'General Inquiry']);
const ALLOWED_TIMES = new Set(['9:30am', '1:00pm', '4:30pm']);
const PHONE_PATTERN = /^[0-9+() -]{7,20}$/;
const MAX_BODY_BYTES = 8192;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_PHONE_SUBMISSIONS_PER_WINDOW = 3;

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
  if (req.body && typeof req.body === 'object') return req.body;
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

  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.length > 0) {
    try {
      return new URL(origin).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }

  // Browsers always send Origin on JSON POSTs. Missing Origin is treated as
  // non-browser traffic and must present a matching Referer instead.
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

/** Prefer platform-trusted IP headers; never trust the leftmost XFF hop alone. */
const getClientIp = (req) => {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();

  const vercelForwarded = req.headers['x-vercel-forwarded-for'];
  if (typeof vercelForwarded === 'string' && vercelForwarded.trim()) {
    return vercelForwarded.split(',')[0].trim();
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    const hops = forwardedFor
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return req.socket?.remoteAddress || 'unknown';
};

const hashRateKey = (req, phone) => {
  const salt = process.env.LEAD_RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'serendib-leads';
  return crypto
    .createHash('sha256')
    .update(`${salt}:${getClientIp(req)}:${phone}`)
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
  const phone = cleanText(body.phone, 20);
  const vehicleModel = cleanText(body.vehicle_model, 160);
  const message = cleanText(body.message, 1000);
  const date = cleanText(body.date, 10);
  const time = cleanText(body.time, 10);

  if (!ALLOWED_TYPES.has(type)) {
    const error = new Error('Invalid inquiry type.');
    error.status = 400;
    throw error;
  }

  if (name.length < 2 || !PHONE_PATTERN.test(phone)) {
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

const createSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const error = new Error('Lead capture is not configured.');
    error.status = 503;
    throw error;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

const enforceRateLimit = async (supabase, req, lead) => {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const keyHash = hashRateKey(req, lead.phone);

  const [ipLimit, phoneLimit] = await Promise.all([
    supabase
      .from('lead_rate_limits')
      .select('id')
      .eq('key_hash', keyHash)
      .gte('created_at', since)
      .limit(1),
    supabase
      .from('leads')
      .select('id')
      .eq('phone', lead.phone)
      .gte('created_at', since)
      .limit(MAX_PHONE_SUBMISSIONS_PER_WINDOW),
  ]);

  if (ipLimit.error) throw ipLimit.error;
  if (phoneLimit.error) throw phoneLimit.error;

  const phoneHits = phoneLimit.data?.length || 0;
  if ((ipLimit.data && ipLimit.data.length > 0) || phoneHits >= MAX_PHONE_SUBMISSIONS_PER_WINDOW) {
    const error = new Error('Please wait before submitting another inquiry.');
    error.status = 429;
    throw error;
  }

  const { error } = await supabase.from('lead_rate_limits').insert({ key_hash: keyHash });
  if (error) throw error;

  await supabase
    .from('lead_rate_limits')
    .delete()
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .then(() => undefined)
    .catch(() => undefined);
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
    const supabase = createSupabaseClient();

    await enforceRateLimit(supabase, req, lead);

    const { error } = await supabase.from('leads').insert(lead);
    if (error) throw error;

    return send(res, 201, { ok: true });
  } catch (error) {
    const status = error.status || 500;
    const message = status >= 500 ? 'Lead capture failed.' : error.message;

    return send(res, status, { error: message });
  }
}
