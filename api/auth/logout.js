import { clearSessionCookie } from './_session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
