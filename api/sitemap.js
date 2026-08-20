import { query } from './_db.js';

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/inventory', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.7' },
  { path: '/calculator', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
];

const DEFAULT_OG = '/images/showroom/serendib-showroom-floor-02.webp';
const DEFAULT_SITE_ORIGIN = 'https://serendibtrading.lk';

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

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
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  } catch {
    // fall through
  }

  return configured;
};

const absoluteUrl = (origin, pathOrUrl) => {
  if (!pathOrUrl) return `${origin}${DEFAULT_OG}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${origin}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
};

const today = () => new Date().toISOString().slice(0, 10);

const fetchLiveCars = async () => {
  try {
    const rows = await query(
      'SELECT id, make, model, year, image, is_sold, sold_at, updated_at, created_at FROM cars ORDER BY created_at DESC'
    );
    if (!Array.isArray(rows)) return [];

    const maxSoldMs = 14 * 24 * 60 * 60 * 1000;
    return rows.filter((car) => {
      if (!car?.id || String(car.id).startsWith('demo-')) return false;
      if (!car.is_sold) return true;
      if (!car.sold_at) return true;
      const soldMs = new Date(car.sold_at).getTime();
      if (Number.isNaN(soldMs)) return true;
      return Date.now() - soldMs <= maxSoldMs;
    });
  } catch {
    return [];
  }
};

const urlEntry = ({ loc, lastmod, changefreq, priority, imageLoc, imageTitle }) => {
  const imageBlock =
    imageLoc && imageTitle
      ? `
    <image:image>
      <image:loc>${escapeXml(imageLoc)}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
    </image:image>`
      : '';

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${escapeXml(priority)}</priority>${imageBlock}
  </url>`;
};

export default async function handler(req, res) {
  const isHealth = (req.query && req.query.health === '1') || (req.url && req.url.includes('health'));
  if (isHealth) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).send(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    }
    return res.status(200).send(JSON.stringify({ ok: true, service: 'serendib-trading', timestamp: new Date().toISOString() }));
  }
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const origin = originFor(req);
  const lastmod = today();
  const cars = await fetchLiveCars();

  const staticEntries = STATIC_PATHS.map((page) =>
    urlEntry({
      loc: `${origin}${page.path === '/' ? '/' : page.path}`,
      lastmod,
      changefreq: page.changefreq,
      priority: page.priority,
      imageLoc: page.path === '/' ? absoluteUrl(origin, DEFAULT_OG) : undefined,
      imageTitle: page.path === '/' ? 'Serendib Trading showroom' : undefined,
    })
  );

  const carEntries = cars.map((car) => {
    const name = [car.year, car.make, car.model].filter(Boolean).join(' ').trim() || 'Vehicle';
    const carLastmod = (car.updated_at || car.created_at || lastmod).toString().slice(0, 10);
    return urlEntry({
      loc: `${origin}/car/${car.id}`,
      lastmod: carLastmod,
      changefreq: 'daily',
      priority: '0.8',
      imageLoc: absoluteUrl(origin, car.image),
      imageTitle: name,
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${[...staticEntries, ...carEntries].join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
