import fs from 'node:fs';
import path from 'node:path';
import { query } from './_db.js';

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

const DEFAULT_SITE_ORIGIN = 'https://serendibtrading.lk';
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
    const cleanHost = host.replace(/:\d+$/, '');
    const cleanConfigured = configuredHost.replace(/:\d+$/, '');
    if (
      cleanHost === cleanConfigured ||
      cleanHost === `www.${cleanConfigured}` ||
      cleanConfigured === `www.${cleanHost}` ||
      cleanHost.endsWith('.pages.dev') ||
      cleanHost.endsWith('.vercel.app') ||
      cleanHost.endsWith('.netlify.app')
    ) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // fall through
  }

  return configured;
};

const readShell = async (req) => {
  if (req && typeof req._shellHtml === 'string' && req._shellHtml.length > 0) {
    return req._shellHtml;
  }
  for (const candidate of SHELL_CANDIDATES) {
    try {
      return fs.readFileSync(candidate, 'utf8');
    } catch {
      // Try next candidate
    }
  }
  return null;
};

const fetchCar = async (id) => {
  if (!id) return null;
  try {
    const rows = await query('SELECT * FROM cars WHERE id = $1 LIMIT 1', [id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
};

export const buildMeta = (car, origin, id) => {
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

  let out = html
    .replace(/\s*<meta\s+data-seo-fallback="true"[^>]*>/gi, '')
    .replace(/\s*<link\s+data-seo-fallback="true"[^>]*>/gi, '')
    .replace(/\s*<meta\s+(?:name|property)=["'](?:title|description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '');

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
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/webp" />`,
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

  const html = await readShell(req);

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
