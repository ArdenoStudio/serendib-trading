const isBrowser = typeof window !== 'undefined';

const normalizeStringList = (value: unknown, maxItems: number) => {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    items.push(trimmed);
    if (items.length >= maxItems) break;
  }

  return items;
};

export const readStringList = (key: string, maxItems = 50) => {
  if (!isBrowser) return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const normalized = normalizeStringList(parsed, maxItems);

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      window.localStorage.setItem(key, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage access failures; callers can continue with an empty list.
    }
    return [];
  }
};

export const writeStringList = (key: string, value: string[], maxItems = 50) => {
  if (!isBrowser) return [];

  const normalized = normalizeStringList(value, maxItems);
  window.localStorage.setItem(key, JSON.stringify(normalized));
  return normalized;
};
