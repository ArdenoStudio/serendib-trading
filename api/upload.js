import { randomUUID } from 'node:crypto';
import { getSessionFromRequest } from './auth/_session.js';

const MAX_DATA_URL_BYTES = 5 * 1024 * 1024;
const MAX_URL_LENGTH = 2048;
const DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp|avif);base64,(.+)$/s;
const EXT_BY_MIME = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };

const send = (res, status, payload) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(payload);
};

const parseBody = (req) => {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body && typeof body === 'object' ? body : {};
};

const validateRemoteUrl = (url) => {
  if (typeof url !== 'string' || url.length === 0 || url.length > MAX_URL_LENGTH) return false;
  try {
    const parsed = new URL(url);
    // Only plain https image URLs may be stored; data:/blob:/javascript: and
    // private-network hosts are rejected so the DB can never hold executable
    // or metadata-exfiltrating content.
    if (parsed.protocol !== 'https:') return false;
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '0.0.0.0' ||
      parsed.hostname.endsWith('.internal') ||
      parsed.hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const uploadToStorage = async (base64Data, mimeType) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) {
    const error = new Error('Image storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    error.status = 500;
    throw error;
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.byteLength > MAX_DATA_URL_BYTES) {
    const error = new Error('Image is too large after decoding (max 5 MB).');
    error.status = 413;
    throw error;
  }

  const bucket = 'vehicle-images';
  const ext = EXT_BY_MIME[mimeType] || 'jpg';
  const objectPath = `vehicles/${randomUUID()}.${ext}`;

  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': `image/${mimeType}`,
      'x-upsert': 'false',
    },
    body: buffer,
  });

  if (!res.ok) {
    const error = new Error(`Image storage upload failed (${res.status}).`);
    error.status = 502;
    throw error;
  }

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${objectPath}`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Method not allowed' });
  }

  const session = await getSessionFromRequest(req);
  if (!session) {
    return send(res, 401, { error: 'Unauthorized admin request' });
  }

  try {
    const body = parseBody(req);
    const imageUrl = body.imageUrl || body.url || '';

    if (!imageUrl) {
      return send(res, 400, { error: 'No image provided' });
    }

    // Case 1: an existing https URL — validate and echo it back.
    if (!imageUrl.startsWith('data:')) {
      if (!validateRemoteUrl(imageUrl)) {
        return send(res, 400, { error: 'Only https image URLs are allowed.' });
      }
      return send(res, 200, { url: imageUrl });
    }

    // Case 2: a base64 data URL — decode and persist to object storage.
    const match = DATA_URL_PATTERN.exec(imageUrl);
    if (!match) {
      return send(res, 400, { error: 'Unsupported image data. Use JPG, PNG, WebP, or AVIF.' });
    }
    const mimeType = match[1] === 'jpg' ? 'jpeg' : match[1];
    const publicUrl = await uploadToStorage(match[2], mimeType);
    return send(res, 200, { url: publicUrl });
  } catch (err) {
    return send(res, err.status || 500, { error: err.message || 'Upload error' });
  }
}
