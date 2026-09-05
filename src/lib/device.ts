/** True on iPhone / iPad / iPod, including iPadOS that reports as Mac. */
export function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iP(hone|od|ad)/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1;
}

export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** True on any touch or mobile device (Android, iOS, iPadOS, coarse pointer). */
export function isTouchOrMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (isAppleTouchDevice()) return true;
  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')) {
    return true;
  }
  return isCoarsePointer();
}
