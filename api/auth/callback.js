import {
  createSessionToken,
  setSessionCookie,
  clearOauthStateCookie,
  getOauthState,
  timingSafeEqualStr,
  ALLOWED_ADMIN_EMAILS,
} from './_session.js';
import { query } from '../_db.js';

const DEFAULT_SITE_ORIGIN = 'https://serendibtrading.lk';

const configuredOrigin = () => {
  const raw = process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_ORIGIN;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
};

// Must mirror api/auth/login.js: only the configured origin (or localhost in dev)
// may be used as the OAuth redirect_uri.
const originFor = (req) => {
  const configured = configuredOrigin();
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = typeof hostHeader === 'string' ? hostHeader.split(',')[0].trim().toLowerCase() : '';

  if (!host) return configured;
  if (process.env.NODE_ENV !== 'production' && (host.includes('localhost') || host.includes('127.0.0.1'))) {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    return `${proto}://${host}`;
  }

  try {
    const configuredHost = new URL(configured).host.toLowerCase();
    if (host === configuredHost) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
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
  const stateParam = (req.query && req.query.state) || '';

  const redirect = (error) => {
    res.setHeader('Location', `${origin}/admin/login?error=${error}`);
    return res.status(302).end();
  };

  if (!code) return redirect('missing_code');

  const oauthState = getOauthState(req);

  // Validate the CSRF state token BEFORE exchanging anything with Google.
  // A mismatch (or a missing state cookie) aborts the flow.
  if (!oauthState || !stateParam || !timingSafeEqualStr(oauthState.state, stateParam)) {
    clearOauthStateCookie(res);
    return redirect('state_mismatch');
  }

  // One-time use: burn the state cookie immediately.
  clearOauthStateCookie(res);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback`;

  if (!clientId || !clientSecret) return redirect('unconfigured');

  try {
    // Exchange auth code for tokens (PKCE verifier proves this callback belongs
    // to the browser that started the login).
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: oauthState.verifier,
      }),
    });

    if (!tokenRes.ok) return redirect('token_exchange_failed');

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get profile details
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) return redirect('userinfo_failed');

    const profile = await userRes.json();
    const email = String(profile.email || '').toLowerCase().trim();

    if (!email) return redirect('invalid_email');

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

    if (!isAuthorized) return redirect('unauthorized');

    const sessionToken = await createSessionToken({
      email,
      name: profile.name || profile.given_name || email,
      picture: profile.picture || '',
    });

    setSessionCookie(res, sessionToken);
    res.setHeader('Location', `${origin}/admin/dashboard`);
    return res.status(302).end();
  } catch {
    return redirect('server_error');
  }
}
