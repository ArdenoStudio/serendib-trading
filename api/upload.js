import { getSessionFromRequest } from './auth/_session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized admin request' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    // If image URL or base64 data is passed, return as public URL
    const imageUrl = body.imageUrl || body.url || '';
    if (imageUrl) {
      return res.status(200).json({ url: imageUrl });
    }

    return res.status(400).json({ error: 'No image provided' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Upload error' });
  }
}
