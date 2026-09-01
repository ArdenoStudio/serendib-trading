import { query } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = String(req.query?.id || req.query?.name || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  try {
    const rows = await query(
      'SELECT mime_type, data, byte_size FROM public.vehicle_images WHERE id = $1 LIMIT 1',
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0 || !rows[0].data) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const { mime_type, data, byte_size } = rows[0];
    const buffer = Buffer.from(data, 'base64');

    res.setHeader('Content-Type', mime_type || 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (byte_size) {
      res.setHeader('Content-Length', String(buffer.length));
    }

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Failed to load image from Neon:', err);
    return res.status(500).json({ error: 'Failed to retrieve image' });
  }
}
