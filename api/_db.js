/**
 * System of record: Neon Postgres (DATABASE_URL).
 * Photos: Supabase Storage URLs stored as text on `cars.image` / `cars.gallery`.
 * Do not move records back to Supabase Postgres, and never store image bytes
 * in Postgres — that is what blew egress on both providers.
 */
import { neon } from '@neondatabase/serverless';

export const getDb = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }
  return neon(connectionString);
};

export const query = async (text, params = []) => {
  const sql = getDb();
  return await sql.query(text, params);
};

const FUEL = new Set(['Petrol', 'Diesel', 'Hybrid', 'Electric']);
const TRANSMISSION = new Set(['Automatic', 'Manual']);
const CONDITION = new Set(['New', 'Used', 'Registered', 'Reconditioned']);
const LEAD_STATUSES = new Set(['New', 'Contacted', 'Closed']);
const MAX_HTTPS_URL = 2048;
const CURRENT_YEAR = new Date().getFullYear();

export const sanitizeText = (value, max = 200) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
};

export const sanitizeFuel = (value) => {
  const trimmed = sanitizeText(value, 32);
  return FUEL.has(trimmed) ? trimmed : 'Petrol';
};

export const sanitizeTransmission = (value) => {
  const trimmed = sanitizeText(value, 32);
  return TRANSMISSION.has(trimmed) ? trimmed : 'Automatic';
};

export const sanitizeCondition = (value) => {
  const trimmed = sanitizeText(value, 32);
  return CONDITION.has(trimmed) ? trimmed : 'Registered';
};

export const sanitizeLeadStatus = (value) => {
  const trimmed = sanitizeText(value, 32);
  return LEAD_STATUSES.has(trimmed) ? trimmed : null;
};

export const clampInt = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

export const sanitizeYear = (value) => clampInt(value, 1980, CURRENT_YEAR + 1, CURRENT_YEAR);
export const sanitizePrice = (value) => clampInt(value, 0, 500_000_000, 0);
export const sanitizeMileage = (value) => clampInt(value, 0, 2_000_000, 0);

export const sanitizeHttpsUrl = (value) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_HTTPS_URL) {
    return '';
  }
  const trimmed = value.trim();
  if (trimmed.startsWith('/api/image') || trimmed.startsWith('/.netlify/functions/api/image')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return '';
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
};

export const sanitizeHttpsUrlList = (value, maxItems = 24) => {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((item) => sanitizeHttpsUrl(item))
    .filter(Boolean)
    .slice(0, maxItems);
};

export const sanitizeFeatureList = (value, maxItems = 24) => {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((item) => sanitizeText(item, 80))
    .filter(Boolean)
    .slice(0, maxItems);
};
