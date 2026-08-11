import { clearSessionCookie } from './_session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // GET logout would be trivially triggerable as a CSRF; require POST.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
