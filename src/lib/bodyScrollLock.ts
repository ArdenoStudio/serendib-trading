import { useEffect } from 'react';

/**
 * iOS Safari ignores `overflow: hidden` on <body> for touch scrolling.
 * Position-fixed the body, contain overscroll, and swallow touchmoves that
 * aren't inside an explicit scroll pane so overlays don't pan the page behind.
 */
const SCROLLABLE_SELECTOR = '[data-scroll-lock-scrollable]';

let lockCount = 0;
let savedScrollY = 0;
let lastTouchY = 0;
let listenersBound = false;

function isScrollableTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(SCROLLABLE_SELECTOR);
}

function onTouchStart(event: TouchEvent) {
  lastTouchY = event.touches[0]?.clientY ?? 0;
}

function onTouchMove(event: TouchEvent) {
  if (event.touches.length > 1) return;

  const y = event.touches[0]?.clientY ?? 0;
  const deltaY = y - lastTouchY;
  lastTouchY = y;

  const scrollable = isScrollableTarget(event.target);
  if (!scrollable) {
    event.preventDefault();
    return;
  }

  const { scrollTop, scrollHeight, clientHeight } = scrollable;
  const canScroll = scrollHeight > clientHeight + 1;
  if (!canScroll) {
    event.preventDefault();
    return;
  }

  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
  const pullingDown = deltaY > 0;
  const pullingUp = deltaY < 0;
  if ((atTop && pullingDown) || (atBottom && pullingUp)) {
    event.preventDefault();
  }
}

function bindTouchGuards() {
  if (listenersBound) return;
  document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  listenersBound = true;
}

function unbindTouchGuards() {
  if (!listenersBound) return;
  document.removeEventListener('touchstart', onTouchStart, true);
  document.removeEventListener('touchmove', onTouchMove, true);
  listenersBound = false;
}

export function lockBodyScroll() {
  lockCount += 1;
  if (lockCount > 1) return;

  savedScrollY = window.scrollY;
  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

  document.documentElement.classList.add('scroll-lock');
  document.body.classList.add('scroll-lock');
  document.body.style.top = `-${savedScrollY}px`;
  if (scrollbarGap > 0) {
    document.body.style.paddingRight = `${scrollbarGap}px`;
  }

  bindTouchGuards();
}

export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.documentElement.classList.remove('scroll-lock');
  document.body.classList.remove('scroll-lock');
  document.body.style.top = '';
  document.body.style.paddingRight = '';
  unbindTouchGuards();
  window.scrollTo(0, savedScrollY);
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [locked]);
}
