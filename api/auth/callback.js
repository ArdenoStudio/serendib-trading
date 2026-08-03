import { createSessionToken, setSessionCookie, ALLOWED_ADMIN_EMAILS } from './_session.js';
import { query } from '../_db.js';

const DEFAULT_SITE_ORIGIN = 'https://serendib-trading.vercel.app';

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
    if (host === configuredHost || host.endsWith('.vercel.app') || host.includes('localhost') || host.includes('127.0.0.1')) {
      const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  } catch {
    // fall through
  }

  return configured;
};

export default async function handler(req, res) {
  const origin = originFor(req);
  const code = (req.query && req.query.code) || '';

  if (!code) {
    res.setHeader('Location', `${origin}/admin/login?error=missing_code`);
    return res.status(302).end();
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    res.setHeader('Location', `${origin}/admin/login?error=unconfigured`);
    return res.status(302).end();
  }

  try {
    // Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      res.setHeader('Location', `${origin}/admin/login?error=token_exchange_failed`);
      return res.status(302).end();
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get profile details
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      res.setHeader('Location', `${origin}/admin/login?error=userinfo_failed`);
      return res.status(302).end();
    }

    const profile = await userRes.json();
    const email = String(profile.email || '').toLowerCase().trim();

    if (!email) {
      res.setHeader('Location', `${origin}/admin/login?error=invalid_email`);
      return res.status(302).end();
    }

    // Check whitelist or admin_users table in database
    let isAuthorized = ALLOWED_ADMIN_EMAILS.has(email);
    if (!isAuthorized) {
      try {
        const rows = await query('SELECT email FROM admin_users WHERE LOWER(email) = $1 LIMIT 1', [email]);
        if (Array.isArray(rows) && rows.length > 0) {
          isAuthorized = true;
        }
      } catch {
        // Table query fallback failed; retain whitelist check
      }
    }

    if (!isAuthorized) {
      res.setHeader('Location', `${origin}/admin/login?error=unauthorized&email=${encodeURIComponent(email)}`);
      return res.status(302).end();
    }

    const sessionToken = await createSessionToken({
      email,
      name: profile.name || profile.given_name || email,
      picture: profile.picture || '',
    });

    setSessionCookie(res, sessionToken);
    res.setHeader('Location', `${origin}/admin/dashboard`);
    return res.status(302).end();
  } catch {
    res.setHeader('Location', `${origin}/admin/login?error=server_error`);
    return res.status(302).end();
  }
}
