import { SignJWT, jwtVerify } from 'jose';
import * as cookie from 'cookie';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSION_ISSUER = 'serendib-trading';
const SESSION_AUDIENCE = 'serendib-trading-admin';

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    // Fail closed: a missing/weak AUTH_SECRET must never fall back to a
    // publicly-known value, otherwise anyone can forge an admin session.
    throw new Error(
      'AUTH_SECRET environment variable is required (at least 32 characters). ' +
        'Set a strong random value in Vercel before enabling admin login.'
    );
  }
  return new TextEncoder().encode(secret);
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// __Host- prefix is only valid on secure origins; keep the plain name for local dev.
export const COOKIE_NAME = IS_PRODUCTION ? '__Host-admin_session' : 'admin_session';

export const ALLOWED_ADMIN_EMAILS = new Set([
  'bilalikras1@gmail.com',
  'ardenostudio@gmail.com',
  'suvenseoras@gmail.com',
]);

export async function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    email: user.email.toLowerCase(),
    name: user.name || user.email.split('@')[0],
    picture: user.picture || '',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function getSessionFromRequest(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    if (!payload.email || typeof payload.email !== 'string') return null;

    const email = payload.email.toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.has(email)) return null;

    return {
      email,
      name: payload.name || email,
      picture: payload.picture || '',
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const serialized = cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  res.setHeader('Set-Cookie', serialized);
}

export function clearSessionCookie(res) {
  const serialized = cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', serialized);
}

// --- OAuth CSRF (state) + PKCE helpers -------------------------------------

export const OAUTH_STATE_COOKIE = 'oauth_state';

export function createOauthChallenge() {
  // 32 random bytes -> base64url state param
  const state = randomBytes(32).toString('base64url');
  // 64 random bytes -> PKCE verifier (must be 43..128 chars, base64url)
  const verifier = randomBytes(64).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { state, verifier, challenge };
}

export function setOauthStateCookie(res, payload) {
  const serialized = cookie.serialize(OAUTH_STATE_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });
  res.setHeader('Set-Cookie', serialized);
}

export function clearOauthStateCookie(res) {
  const serialized = cookie.serialize(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', serialized);
}

export function getOauthState(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const raw = cookies[OAUTH_STATE_COOKIE];
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.state === 'string' &&
      typeof parsed.verifier === 'string' &&
      parsed.state.length >= 32
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function timingSafeEqualStr(a, b) {
  // Hash both sides first so the buffers are always equal length, then compare
  // with a real constant-time primitive (Buffer === compares references!).
  const hashA = createHash('sha256').update(String(a)).digest();
  const hashB = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(hashA, hashB);
}

