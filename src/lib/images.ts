/**
 * Client-side image URL helpers for Supabase Storage and static assets.
 * Prefer resized/render URLs for cards so inventory pages pull less bytes.
 */

const SUPABASE_OBJECT = '/storage/v1/object/public/';
const SUPABASE_RENDER = '/storage/v1/render/image/public/';

export type ImageSize = 'thumb' | 'card' | 'detail' | 'full';

const WIDTH: Record<ImageSize, number | null> = {
  thumb: 320,
  card: 640,
  detail: 1280,
  full: null,
};

/** True when the URL is a local blob preview (must never be saved to the DB). */
export function isBlobUrl(url?: string | null): boolean {
  return Boolean(url && url.startsWith('blob:'));
}

/**
 * Optionally rewrite a Supabase public object URL to the image renderer.
 *
 * Image Transformations are a paid/Pro Supabase feature. When disabled the
 * /render/image endpoint returns 403, which blanked out featured marquee
 * images. Only rewrite when explicitly enabled via env.
 */
export function optimizeImageUrl(
  url?: string | null,
  size: ImageSize = 'card',
  quality = 72,
): string {
  if (!url) return '';
  if (isBlobUrl(url) || url.startsWith('data:')) return url;

  // Always prefer the stable public object URL unless transforms are enabled.
  const transformsEnabled = import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORM === 'true';
  if (!transformsEnabled) {
    if (url.includes(SUPABASE_RENDER)) {
      return url.replace(SUPABASE_RENDER, SUPABASE_OBJECT).split('?')[0];
    }
    return url;
  }

  if (!url.includes(SUPABASE_OBJECT) && !url.includes(SUPABASE_RENDER)) return url;

  const width = WIDTH[size];
  if (!width) {
    return url.replace(SUPABASE_RENDER, SUPABASE_OBJECT).split('?')[0];
  }

  const base = url
    .replace(SUPABASE_OBJECT, SUPABASE_RENDER)
    .split('?')[0];

  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
    resize: 'contain',
  });

  return `${base}?${params.toString()}`;
}

/**
 * Compress and convert an image File to WebP in the browser before upload.
 * Falls back to the original file when canvas conversion is unavailable.
 */
export async function prepareImageForUpload(file: File, maxEdge = 1920, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (typeof createImageBitmap !== 'function' && typeof Image === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });

    if (!blob || blob.size === 0) return file;

    // Keep original if WebP somehow got larger (rare for photos).
    if (blob.size >= file.size && file.type === 'image/webp') return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'vehicle';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  }
}
