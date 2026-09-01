import vehiclesHandler from '../../api/db/vehicles.js';
import dbLeadsHandler from '../../api/db/leads.js';
import analyticsHandler from '../../api/db/analytics.js';
import knowledgeHandler from '../../api/db/knowledge.js';
import authLoginHandler from '../../api/auth/login.js';
import authCallbackHandler from '../../api/auth/callback.js';
import authLogoutHandler from '../../api/auth/logout.js';
import authSessionHandler from '../../api/auth/session.js';
import leadsHandler from '../../api/leads.js';
import uploadHandler from '../../api/upload.js';
import imageHandler from '../../api/image.js';
import sitemapHandler from '../../api/sitemap.js';
import ogHandler from '../../api/og.js';

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

function createReqRes(request, context, url) {
  const headers = {};
  for (const [k, v] of request.headers.entries()) {
    headers[k.toLowerCase()] = v;
  }

  // Ensure client IP headers are populated for rate limiting / analytics
  if (context?.ip && !headers['x-nf-client-connection-ip']) {
    headers['x-nf-client-connection-ip'] = context.ip;
  }

  const query = Object.fromEntries(url.searchParams.entries());

  const req = {
    method: request.method,
    headers,
    query,
    url: url.pathname + url.search,
    socket: { remoteAddress: context?.ip || '127.0.0.1' },
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
      if (name.toLowerCase() === 'set-cookie') {
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

export default async function (request, context) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  const userAgent = request.headers.get('user-agent') || '';

  // Social bot crawler for /car/:id dynamic OG tags
  const carMatch = pathname.match(/^\/car\/([^/]+)$/);
  if (carMatch && BOT_UA_PATTERN.test(userAgent)) {
    const { req, res, finish, promise } = createReqRes(request, context, url);
    req.query.id = decodeURIComponent(carMatch[1]);
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

  // Find matching API route
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
        const text = await request.text();
        req.body = text;
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
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), {
      status: err?.status || 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export const config = {
  path: ['/api/*', '/sitemap.xml'],
};
