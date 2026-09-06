const CURRENT_YEAR = new Date().getFullYear();
const YEAR_TOKEN = /\b(19[89]\d|20[0-3]\d)\b/;
const YEAR_RANGE = /\b(19[89]\d|20[0-3]\d)\s*\/\s*(19[89]\d|20[0-3]\d)\b/;

export const isCorruptVehicleYear = (year: unknown): boolean => {
  const n = Number(year);
  return !Number.isFinite(n) || n < 1980 || n > CURRENT_YEAR + 1 || n === 1971;
};

export const extractYearFromText = (text?: string | null): number | null => {
  if (!text) return null;
  const slash = text.match(YEAR_RANGE);
  if (slash) {
    const registrationYear = parseInt(slash[2], 10);
    if (registrationYear >= 1980 && registrationYear <= CURRENT_YEAR + 1) {
      return registrationYear;
    }
  }
  const match = text.match(YEAR_TOKEN);
  if (!match) return null;
  const year = parseInt(match[0], 10);
  return year >= 1980 && year <= CURRENT_YEAR + 1 ? year : null;
};

const coerceStoredYear = (value: unknown): number => {
  if (value instanceof Date) return value.getUTCFullYear();
  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-\d{2}-\d{2}/);
    if (iso) return parseInt(iso[1], 10);
  }
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

export const resolveVehicleYear = (vehicle: {
  year?: unknown;
  description?: string | null;
  model?: string | null;
}): number => {
  const stored = coerceStoredYear(vehicle.year);
  if (!isCorruptVehicleYear(stored)) return stored;

  const fromDescription = extractYearFromText(vehicle.description);
  if (fromDescription) return fromDescription;

  const fromModel = extractYearFromText(vehicle.model);
  if (fromModel) return fromModel;

  return Math.min(CURRENT_YEAR + 1, Math.max(1980, CURRENT_YEAR));
};
