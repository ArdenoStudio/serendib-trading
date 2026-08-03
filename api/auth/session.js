import { getSessionFromRequest } from './_session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const session = await getSessionFromRequest(req);
  if (!session) {
    return res.status(200).json({ user: null, session: null });
  }

  return res.status(200).json({
    user: session,
    session: {
      user: session,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 86400,
    },
  });
}
