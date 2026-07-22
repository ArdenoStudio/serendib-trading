import fs from 'node:fs';
import path from 'node:path';

// Serves crawler requests for /car/:id with per-vehicle Open Graph / Twitter
// meta so shared links (WhatsApp, Facebook, Twitter, LinkedIn, Slack, search)
// preview the actual vehicle instead of the generic site fallback. Humans are
// routed straight to the static SPA by vercel.json (this function is only hit
// for known bot user-agents), so there is no added latency for real visitors.

const SHELL_CANDIDATES = [
  path.join(process.cwd(), 'dist', 'index.html'),
  path.join(process.cwd(), 'index.html'),
];

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const DEFAULT_SITE_ORIGIN = 'https://serendib-trading.vercel.app';
const DEFAULT_OG_IMAGE = '/images/showroom/serendib-showroom-floor-02.webp';

const configuredOrigin = () => {
  const raw = process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_ORIGIN;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
};

const originFor = (req) => {
  const configured = configuredOrigin();
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = typeof hostHeader === 'string' ? hostHeader.split(',')[0].trim().toLowerCase() : '';
  if (!host) return configured;

  try {
    const configuredHost = new URL(configured).host.toLowerCase();
    if (host === configuredHost || host.endsWith('.vercel.app')) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // fall through
  }

  return configured;
};

const readShell = async () => {
  for (const candidate of SHELL_CANDIDATES) {
    try {
      return fs.readFileSync(candidate, 'utf8');
    } catch {
      // Try the next candidate path.
    }
  }
  return null;
};

const fetchCar = async (id) => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || !id) return null;

  try {
    const res = await fetch(
      `${url}/rest/v1/cars?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
};

export const buildMeta = (car, origin, id) => {
  // The year is shown separately, so drop a redundant 4-digit year from the model
  // (e.g. a mis-entered "Sorento 2017" would otherwise read "2017 Kia Sorento 2017").
  const model = String(car.model || '')
    .replace(/\b(19[89]\d|20[0-3]\d)\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const name = [car.year, car.make, model].filter(Boolean).join(' ').trim() || 'Vehicle';
  const title = `${name} for Sale | Serendib Trading`;

  const parts = [`Explore the ${name} at Serendib Trading in Sri Lanka.`];
  if (typeof car.price === 'number') parts.push(`LKR ${car.price.toLocaleString('en-US')}.`);
  const details = [];
  if (car.condition) details.push(`${car.condition} condition`);
  if (typeof car.mileage === 'number') details.push(`${car.mileage.toLocaleString('en-US')} KM`);
  if (details.length) parts.push(`${details.join(', ')}.`);
  const description = parts.join(' ');

  let image = car.image || '';
  if (image && !/^https?:\/\//i.test(image)) {
    image = origin + (image.startsWith('/') ? image : `/${image}`);
  }
  if (!image) image = `${origin}${DEFAULT_OG_IMAGE}`;

  return { title, description, image, name, url: `${origin}/car/${id}` };
};

export const injectMeta = (html, meta) => {
  const esc = escapeHtml;

  // Drop existing SEO tags (static fallbacks and any prerendered home tags)
  // so bot responses never emit duplicate canonical / OG metadata.
  let out = html
    .replace(/\s*<meta\s+data-seo-fallback="true"[^>]*>/gi, '')
    .replace(/\s*<link\s+data-seo-fallback="true"[^>]*>/gi, '')
    .replace(/\s*<meta\s+(?:name|property)=["'](?:title|description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '');

  // Use replacement functions so `$` in titles/models is never treated as a
  // String.replace substitution pattern (`$&`, `$1`, etc.).
  out = out.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${esc(meta.title)}</title>`);

  const tags = [
    `<meta name="title" content="${esc(meta.title)}" />`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<link rel="canonical" href="${esc(meta.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${esc(meta.url)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${esc(meta.image)}" />`,
    `<meta property="og:image:alt" content="${esc(meta.name)} listed by Serendib Trading" />`,
    `<meta property="og:site_name" content="Serendib Trading" />`,
    `<meta property="og:locale" content="en_LK" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.image)}" />`,
  ].join('\n    ');

  return out.replace(/<\/head>/i, () => `    ${tags}\n  </head>`);
};

export default async function handler(req, res) {
  const id = (req.query && req.query.id) || '';
  const origin = originFor(req);

  const html = await readShell();

  // If the shell is somehow unavailable, send the bot to the real page rather
  // than erroring — worst case it falls back to the static default preview.
  if (!html) {
    res.setHeader('Location', `${origin}/car/${encodeURIComponent(id)}`);
    return res.status(302).end();
  }

  const car = await fetchCar(id);
  const output = car ? injectMeta(html, buildMeta(car, origin, id)) : html;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(output);
}
