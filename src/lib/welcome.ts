const isBrowser = typeof window !== 'undefined';

export const WELCOME_STORAGE_KEY = 'serendib:welcome-seen';
export const WELCOME_QUERY_PARAM = 'welcome';

export function hasSeenWelcome(): boolean {
  if (!isBrowser) return true;

  try {
    return window.localStorage.getItem(WELCOME_STORAGE_KEY) === '1';
  } catch {
    // If storage is blocked, skip the overlay so it cannot reappear every load.
    return true;
  }
}

export function markWelcomeSeen(): void {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(WELCOME_STORAGE_KEY, '1');
  } catch {
    // Ignore quota / privacy-mode failures; the overlay still closes in memory.
  }
}

export function shouldForceWelcome(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return params.get(WELCOME_QUERY_PARAM) === '1';
}

export function stripWelcomeQuery(pathname: string, search: string, hash = ''): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete(WELCOME_QUERY_PARAM);
  const nextSearch = params.toString();
  return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash}`;
}
