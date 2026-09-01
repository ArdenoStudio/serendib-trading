import { randomUUID } from 'node:crypto';
import { query } from './_db.js';
import { getSessionFromRequest } from './auth/_session.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB ceiling
const ALLOWED_MIME_TYPES = new Map([
  ['image/webp', 'webp'],
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/png', 'png'],
  ['image/avif', 'avif'],
]);

const validateBase64Payload = (data) => {
  if (typeof data !== 'string') return null;
  const match = data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const ext = ALLOWED_MIME_TYPES.get(mimeType);
  if (!ext) return null;
  const base64 = match[2];
  const approximateSize = (base64.length * 3) / 4;
  if (approximateSize > MAX_BYTES) return null;
  return { mimeType, ext, base64 };
};

const ensureVehicleImagesTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public.vehicle_images (
        id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL DEFAULT 'image/webp',
        data TEXT NOT NULL,
        byte_size INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } catch (err) {
    // Non-fatal if table already exists
  }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Admin authentication required
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

    await ensureVehicleImagesTable();

    // 1. Direct Base64 Data URL upload (primary admin flow)
    const base64Payload = validateBase64Payload(body.imageUrl || body.image || body.data || body.file);
    if (base64Payload) {
      const { mimeType, ext, base64 } = base64Payload;
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > MAX_BYTES) {
        return res.status(400).json({ error: 'Image exceeds the 5 MB limit.' });
      }

      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

      await query(
        `INSERT INTO public.vehicle_images (id, mime_type, data, byte_size, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, mime_type = EXCLUDED.mime_type, byte_size = EXCLUDED.byte_size`,
        [filename, mimeType, base64, buffer.length]
      );

      const publicUrl = `/api/image?id=${encodeURIComponent(filename)}`;
      return res.status(200).json({ url: publicUrl, filename });
    }

    // 2. Fetch remote image and store into Neon (for URL import flow)
    if (typeof body.url === 'string' && body.url.startsWith('http')) {
      const remoteUrl = body.url.trim();
      const remoteRes = await fetch(remoteUrl);
      if (!remoteRes.ok) {
        return res.status(400).json({ error: `Could not fetch remote image: HTTP ${remoteRes.status}` });
      }

      const arrayBuffer = await remoteRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > MAX_BYTES) {
        return res.status(400).json({ error: 'Remote image exceeds the 5 MB limit.' });
      }

      const contentType = remoteRes.headers.get('content-type') || 'image/webp';
      const ext = ALLOWED_MIME_TYPES.get(contentType) || 'webp';
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const base64 = buffer.toString('base64');

      await query(
        `INSERT INTO public.vehicle_images (id, mime_type, data, byte_size, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, mime_type = EXCLUDED.mime_type, byte_size = EXCLUDED.byte_size`,
        [filename, contentType, base64, buffer.length]
      );

      const publicUrl = `/api/image?id=${encodeURIComponent(filename)}`;
      return res.status(200).json({ url: publicUrl, filename });
    }

    return res.status(400).json({ error: 'Invalid upload request. Expected base64 image data or URL.' });
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to upload photo.' });
  }
}
