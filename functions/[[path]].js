import vehiclesHandler from '../api/db/vehicles.js';
import dbLeadsHandler from '../api/db/leads.js';
import analyticsHandler from '../api/db/analytics.js';
import knowledgeHandler from '../api/db/knowledge.js';
import authLoginHandler from '../api/auth/login.js';
import authCallbackHandler from '../api/auth/callback.js';
import authLogoutHandler from '../api/auth/logout.js';
import authSessionHandler from '../api/auth/session.js';
import leadsHandler from '../api/leads.js';
import uploadHandler from '../api/upload.js';
import imageHandler from '../api/image.js';
import sitemapHandler from '../api/sitemap.js';
import ogHandler from '../api/og.js';

const BOT_UA_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Slack-ImgProxy|TelegramBot|Discordbot|Pinterest|redditbot|Googlebot|Google-InspectionTool|bingbot|Applebot|SkypeUriPreview|vkShare|W3C_Validator|Embedly|Iframely|DuckDuckBot|ia_archiver|Yeti/i;

const ROUTES = [
  { path: '/api/db/vehicles', handler: vehiclesHandler },
  { path: '/api/db/leads', handler: dbLeadsHandler },
  { path: '/api/db/analytics', handler: analyticsHandler },
  { path: '/api/db/knowledge', handler: knowledgeHandler },
  { path: '/api/auth/login', handler: authLoginHandler },
  { path: '/api/auth/callback', handler: authCallbackHandler },
  { path: '/api/auth/logout', handler: authLogoutHandler },
  { path: '/api/auth/session', handler: authSessionHandler },
  { path: '/api/leads', handler: leadsHandler },
  { path: '/api/upload', handler: uploadHandler },
  { path: '/api/image', handler: imageHandler },
  { path: '/api/sitemap', handler: sitemapHandler },
  { path: '/sitemap.xml', handler: sitemapHandler },
  { path: '/api/health', handler: sitemapHandler },
  { path: '/api/og', handler: ogHandler },
];

function syncEnv(env) {
  if (!env || typeof env !== 'object') return;
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && value !== '') {
      process.env[key] = value;
    }
  }
}

function createReqRes(request, context, url) {
  const headers = {};
  for (const [k, v] of request.headers.entries()) {
    headers[k.toLowerCase()] = v;
  }

  const clientIp =
    headers['cf-connecting-ip'] ||
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    '127.0.0.1';

  const query = Object.fromEntries(url.searchParams.entries());

  const req = {
    method: request.method,
    headers,
    query,
    url: url.pathname + url.search,
    socket: { remoteAddress: clientIp },
    body: null,
  };

  let statusCode = 200;
  const resHeaders = new Headers();
  let responseBody = null;
  let resolved = false;

  let resolvePromise;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  const finish = () => {
    if (resolved) return;
    resolved = true;
    resolvePromise(
      new Response(responseBody, {
        status: statusCode,
        headers: resHeaders,
      })
    );
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(name, value) {
      const lower = name.toLowerCase();
      if (lower === 'set-cookie') {
        if (Array.isArray(value)) {
          for (const c of value) resHeaders.append('set-cookie', c);
        } else {
          resHeaders.append('set-cookie', String(value));
        }
      } else {
        resHeaders.set(name, String(value));
      }
      return res;
    },
    getHeader(name) {
      return resHeaders.get(name);
    },
    json(data) {
      if (!resHeaders.has('content-type')) {
        resHeaders.set('content-type', 'application/json; charset=utf-8');
      }
      responseBody = JSON.stringify(data);
      finish();
      return res;
    },
    send(data) {
      responseBody = data;
      finish();
      return res;
    },
    end(data) {
      if (data !== undefined) responseBody = data;
      finish();
      return res;
    },
    redirect(statusOrUrl, urlMaybe) {
      const code = typeof statusOrUrl === 'number' ? statusOrUrl : 302;
      const target = typeof statusOrUrl === 'string' ? statusOrUrl : urlMaybe;
      statusCode = code;
      resHeaders.set('location', target);
      finish();
      return res;
    },
  };

  return { req, res, finish, promise };
}

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();

  // Canonical redirect: If accessed via *.pages.dev, redirect permanently to https://serendibtrading.lk
  if (hostname.endsWith('.pages.dev')) {
    const target = new URL(request.url);
    target.hostname = 'serendibtrading.lk';
    target.protocol = 'https:';
    target.port = '';
    return Response.redirect(target.toString(), 301);
  }

  // Sync Cloudflare environment variables to process.env
  syncEnv(context.env);

  const pathname = url.pathname.replace(/\/$/, '') || '/';
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Social bot crawler on /car/:id dynamic OG tags
  const carMatch = pathname.match(/^\/car\/([^/]+)$/);
  if (carMatch) {
    if (BOT_UA_PATTERN.test(userAgent)) {
      let shellHtml = null;
      if (context.env?.ASSETS) {
        try {
          const assetRes = await context.env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
          if (assetRes.ok) {
            shellHtml = await assetRes.text();
          }
        } catch {
          // fallback to handler internal reader
        }
      }

      const { req, res, finish, promise } = createReqRes(request, context, url);
      req.query.id = decodeURIComponent(carMatch[1]);
      req._shellHtml = shellHtml;
      try {
        await ogHandler(req, res);
        finish();
        return await promise;
      } catch (err) {
        return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });
      }
    }
    // Normal browser visitor: let Cloudflare Pages serve the SPA
    return context.next();
  }

  // 2. Pass non-API and non-sitemap routes through to static assets
  if (!pathname.startsWith('/api') && pathname !== '/sitemap.xml') {
    return context.next();
  }

  // 3. Find matching API route
  const route = ROUTES.find((r) => r.path === pathname);
  if (!route) {
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { req, res, finish, promise } = createReqRes(request, context, url);

  // Parse request body for methods with payload
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        req.body = await request.json();
      } else {
        req.body = await request.text();
      }
    } catch {
      req.body = {};
    }
  }

  try {
    await route.handler(req, res);
    finish();
    return await promise;
  } catch (err) {
    console.error('Cloudflare Pages API Error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), {
      status: err?.status || 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
