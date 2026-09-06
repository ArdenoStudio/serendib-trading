const MIN_VEHICLE_YEAR = 1980;
const MAX_VEHICLE_YEAR = 2035;

const getSafeCurrentYear = () => {
  const y = new Date().getUTCFullYear();
  return y >= 2000 && y <= 2100 ? y : 2026;
};

const YEAR_TOKEN = /\b(19[89]\d|20[0-3]\d)\b/;
const YEAR_RANGE = /\b(19[89]\d|20[0-3]\d)\s*\/\s*(19[89]\d|20[0-3]\d)\b/;

export const isCorruptVehicleYear = (year: unknown): boolean => {
  const n = Number(year);
  return !Number.isFinite(n) || n < MIN_VEHICLE_YEAR || n > MAX_VEHICLE_YEAR || n === 1971;
};

export const extractYearFromText = (text?: string | null): number | null => {
  if (!text) return null;
  const slash = text.match(YEAR_RANGE);
  if (slash) {
    const registrationYear = parseInt(slash[2], 10);
    if (registrationYear >= MIN_VEHICLE_YEAR && registrationYear <= MAX_VEHICLE_YEAR) {
      return registrationYear;
    }
  }
  const match = text.match(YEAR_TOKEN);
  if (!match) return null;
  const year = parseInt(match[0], 10);
  return year >= MIN_VEHICLE_YEAR && year <= MAX_VEHICLE_YEAR ? year : null;
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

  return getSafeCurrentYear();
};
