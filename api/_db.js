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
const MIN_VEHICLE_YEAR = 1980;
const MAX_VEHICLE_YEAR = 2035;

/** Cloudflare Workers can boot with a stale system clock (~1970). Never gate years on it. */
export const getSafeCurrentYear = () => {
  const y = new Date().getUTCFullYear();
  return y >= 2000 && y <= 2100 ? y : 2026;
};

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

export const sanitizeYear = (value) => {
  const currentYear = getSafeCurrentYear();
  return clampInt(value, MIN_VEHICLE_YEAR, MAX_VEHICLE_YEAR, currentYear);
};

const YEAR_TOKEN = /\b(19[89]\d|20[0-3]\d)\b/;
const YEAR_RANGE = /\b(19[89]\d|20[0-3]\d)\s*\/\s*(19[89]\d|20[0-3]\d)\b/;

/** True when the stored year is missing or known-bad (Neon migration corruption). */
export const isCorruptVehicleYear = (year) => {
  const n = Number(year);
  return !Number.isFinite(n) || n < MIN_VEHICLE_YEAR || n > MAX_VEHICLE_YEAR || n === 1971;
};

export const extractYearFromText = (text) => {
  if (!text) return null;
  const value = String(text);
  const slash = value.match(YEAR_RANGE);
  if (slash) {
    const registrationYear = parseInt(slash[2], 10);
    if (registrationYear >= MIN_VEHICLE_YEAR && registrationYear <= MAX_VEHICLE_YEAR) {
      return registrationYear;
    }
  }
  const match = value.match(YEAR_TOKEN);
  if (!match) return null;
  const year = parseInt(match[0], 10);
  return year >= MIN_VEHICLE_YEAR && year <= MAX_VEHICLE_YEAR ? year : null;
};

const coerceStoredYear = (value) => {
  if (value instanceof Date) return value.getUTCFullYear();
  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-\d{2}-\d{2}/);
    if (iso) return parseInt(iso[1], 10);
  }
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

/** Recover a display year from stored value plus listing text. */
export const resolveVehicleYear = (row) => {
  const stored = coerceStoredYear(row?.year);
  if (!isCorruptVehicleYear(stored)) return stored;

  const fromDescription = extractYearFromText(row?.description);
  if (fromDescription) return fromDescription;

  const fromModel = extractYearFromText(row?.model);
  if (fromModel) return fromModel;

  return sanitizeYear(stored);
};

export const normalizeVehicleRowForRead = (row) => {
  if (!row || typeof row !== 'object') return row;
  const year = resolveVehicleYear(row);
  return year === row.year ? row : { ...row, year };
};

const repairInFlight = new Set();

/** Persist a recovered year when the DB row is still corrupted. */
export const repairVehicleYearInDb = async (id, storedYear, resolvedYear) => {
  if (!id || !resolvedYear || resolvedYear === storedYear || !isCorruptVehicleYear(storedYear)) {
    return;
  }
  if (repairInFlight.has(id)) return;
  repairInFlight.add(id);
  try {
    await query('UPDATE cars SET year = $1 WHERE id = $2::uuid AND year = $3', [
      resolvedYear,
      id,
      storedYear,
    ]);
  } catch (err) {
    console.error(`Failed to repair vehicle year for ${id}:`, err);
  } finally {
    repairInFlight.delete(id);
  }
};
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
