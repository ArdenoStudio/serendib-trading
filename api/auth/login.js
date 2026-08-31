import {
  createOauthChallenge,
  setOauthStateCookie,
} from './_session.js';

const DEFAULT_SITE_ORIGIN = 'https://serendibtrading.lk';

const configuredOrigin = () => {
  const raw = process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_ORIGIN;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
};

// Only ever build redirect_uri from the configured site origin (or localhost in
// development). Accepting arbitrary hosts would let an attacker pin a
// redirect_uri they control to the Google OAuth flow.
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
    if (host === configuredHost || host.endsWith('.vercel.app') || host.endsWith('.netlify.app')) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // fall through
  }

  return configured;
};

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = originFor(req);
  const redirectUri = `${origin}/api/auth/callback`;

  if (!clientId) {
    // If client ID is missing in dev mode, return helpful guidance
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Google Auth Setup Required</title></head>
        <body style="font-family: system-ui; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="max-width: 500px; padding: 30px; background: #111; border: 1px solid #333; border-radius: 16px;">
            <h2 style="color: #D4AF37; margin-top: 0;">Google OAuth Required</h2>
            <p>GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be configured in Vercel or local environment.</p>
            <p style="color: #888; font-size: 13px;">Redirect URI to register in Google Cloud Console: <code>${redirectUri}</code></p>
            <a href="/admin/login" style="color: #D4AF37;">Return to Login</a>
          </div>
        </body>
      </html>
    `);
  }

  // OAuth state (CSRF) + PKCE code challenge, stored in a short-lived httpOnly cookie
  const { state, verifier, challenge } = createOauthChallenge();
  setOauthStateCookie(res, { state, verifier });

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('code_challenge', challenge);
  googleAuthUrl.searchParams.set('code_challenge_method', 'S256');

  res.setHeader('Location', googleAuthUrl.toString());
  return res.status(302).end();
}
