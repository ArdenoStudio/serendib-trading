import { SignJWT, jwtVerify } from 'jose';
import * as cookie from 'cookie';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'serendib-trading-admin-jwt-secret-key-32-chars-min'
);
export const COOKIE_NAME = 'admin_session';

export const ALLOWED_ADMIN_EMAILS = new Set([
  'bilalikras1@gmail.com',
  'ardenostudio@gmail.com',
  'suvenseoras@gmail.com',
]);

export async function createSessionToken(user) {
  return await new SignJWT({
    email: user.email.toLowerCase(),
    name: user.name || user.email.split('@')[0],
    picture: user.picture || '',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function getSessionFromRequest(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  res.setHeader('Set-Cookie', serialized);
}

export function clearSessionCookie(res) {
  const serialized = cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', serialized);
}
