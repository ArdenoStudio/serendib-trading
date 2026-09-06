import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Calculator, MapPin, MessageCircle, Search, X } from 'lucide-react';
import { useBodyScrollLock } from '../lib/bodyScrollLock';
import { isTouchOrMobileDevice } from '../lib/device';
import { logCtaClick } from '../lib/supabase';
import {
  hasSeenWelcome,
  markWelcomeSeen,
  shouldForceWelcome,
  stripWelcomeQuery,
} from '../lib/welcome';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const OPEN_DELAY_MS = 480;
const WHATSAPP_HREF =
  'https://wa.me/94756363427?text=Hi%20Serendib%20Trading%20%E2%80%94%20I%20just%20opened%20the%20new%20site%20and%20would%20like%20help%20finding%20a%20vehicle.';

type WelcomePath = 'browse' | 'finance' | 'visit' | 'whatsapp' | 'dismiss';

const PATHS: ReadonlyArray<{
  id: Exclude<WelcomePath, 'whatsapp' | 'dismiss'>;
  to: string;
  title: string;
  short: string;
  detail: string;
  Icon: typeof Search;
}> = [
  {
    id: 'browse',
    to: '/inventory',
    title: 'Browse the collection',
    short: 'Browse',
    detail: 'Inspected UK and Japan imports, ready to view.',
    Icon: Search,
  },
  {
    id: 'finance',
    to: '/calculator',
    title: 'Estimate monthly payments',
    short: 'Finance',
    detail: 'Check a first figure before you visit the floor.',
    Icon: Calculator,
  },
  {
    id: 'visit',
    to: '/contact',
    title: 'Book a Dehiwala viewing',
    short: 'Visit',
    detail: 'Share the model, budget, and a time that works.',
    Icon: MapPin,
  },
];

function assertNever(value: never): never {
  throw new Error(`Unhandled welcome path: ${String(value)}`);
}

export default function WelcomeGuide() {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dismissedRef = useRef(false);
  const [open, setOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      setOpen(false);
      return;
    }
    if (dismissedRef.current) return;

    const force = shouldForceWelcome(location.search);
    if (!force && hasSeenWelcome()) return;

    const delay = force || shouldReduceMotion || isTouchOrMobileDevice() ? 0 : OPEN_DELAY_MS;
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [isAdmin, location.pathname, location.search, shouldReduceMotion]);

  useBodyScrollLock(open);

  const dismiss = useCallback((path: WelcomePath) => {
    switch (path) {
      case 'browse':
        logCtaClick('welcome_browse');
        break;
      case 'finance':
        logCtaClick('welcome_finance');
        break;
      case 'visit':
        logCtaClick('welcome_visit');
        break;
      case 'whatsapp':
        logCtaClick('welcome_whatsapp');
        break;
      case 'dismiss':
        logCtaClick('welcome_dismiss');
        break;
      default:
        assertNever(path);
    }

    dismissedRef.current = true;
    markWelcomeSeen();
    const staysOnPage = path === 'dismiss' || path === 'whatsapp';
    if (staysOnPage && shouldForceWelcome(location.search)) {
      navigate(stripWelcomeQuery(location.pathname, location.search, location.hash), { replace: true });
    }
    setOpen(false);
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    document.body.classList.toggle('welcome-open', open);
    const root = document.getElementById('root');
    if (open) root?.setAttribute('inert', '');
    else root?.removeAttribute('inert');
    return () => {
      document.body.classList.remove('welcome-open');
      root?.removeAttribute('inert');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss('dismiss');
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.tabIndex !== -1 && !el.hasAttribute('disabled'),
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => {
      // Autofocusing the close control jumps the iOS viewport. Keep focus on the sheet.
      if (isTouchOrMobileDevice()) {
        dialogRef.current?.focus({ preventScroll: true });
        return;
      }
      closeButtonRef.current?.focus();
    }, 0);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [dismiss, open]);

  if (typeof document === 'undefined') return null;

  const motionDuration = shouldReduceMotion ? 0 : 0.2;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration, ease: 'easeOut' }}
            className="absolute inset-0 bg-[#080706]/80"
            onClick={() => dismiss('dismiss')}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            data-testid="welcome-guide"
            data-scroll-lock-scrollable
            data-lenis-prevent="true"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: motionDuration, ease: 'easeOut' }}
            className="relative z-10 box-border flex h-auto max-h-full max-h-[100svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0d0b09] shadow-2xl sm:max-h-[min(42rem,calc(100svh-2rem))] sm:rounded-[28px]"
            style={{
              paddingBottom: 'max(0.5rem, var(--safe-bottom))',
              paddingLeft: 'max(1.25rem, var(--safe-left))',
              paddingRight: 'max(1.25rem, var(--safe-right))',
            }}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />

            <div className="flex items-start justify-between gap-3 pt-3 [@media(min-height:700px)]:pt-6">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/serendib-logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 shrink-0 object-contain"
                />
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute hidden size-full animate-ping rounded-full bg-[#D4AF37] opacity-75 motion-reduce:hidden [@media(pointer:fine)]:inline-flex" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#D4AF37]" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">
                    Now open
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => dismiss('dismiss')}
                aria-label="Close welcome"
                className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors duration-200 hover:border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="shrink-0 pt-3 [@media(min-height:700px)]:pt-5">
              <h2
                id={titleId}
                className="text-balance font-serif text-2xl italic leading-tight text-white [@media(min-height:500px)]:text-3xl [@media(min-height:800px)]:text-4xl"
              >
                Welcome to Serendib Trading
              </h2>
              <p
                id={descriptionId}
                className="mt-2 hidden text-pretty text-sm leading-6 text-white/70 [@media(min-height:520px)]:line-clamp-2 [@media(min-height:800px)]:line-clamp-none [@media(min-height:800px)]:text-base [@media(min-height:800px)]:leading-7"
              >
                The Dehiwala showroom is live. Start with the collection, check finance, or message us — we will take it from there.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
              <div className="mt-4 hidden grid-cols-3 gap-2 [@media(min-height:640px)]:grid [@media(min-height:800px)]:hidden">
                {PATHS.map((path) => (
                  <Link
                    key={path.id}
                    to={path.to}
                    aria-label={path.title}
                    onClick={() => dismiss(path.id)}
                    className="flex min-h-12 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center transition-colors duration-200 hover:border-[#D4AF37]/35 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                  >
                    <path.Icon className="size-4 text-[#D4AF37]" aria-hidden="true" />
                    <span aria-hidden="true" className="text-[11px] font-bold text-white">
                      {path.short}
                    </span>
                  </Link>
                ))}
              </div>

              <ul className="mt-4 hidden space-y-2 [@media(min-height:800px)]:block">
                {PATHS.map((path) => (
                  <li key={path.id}>
                    <Link
                      to={path.to}
                      onClick={() => dismiss(path.id)}
                      className="group flex min-h-12 touch-manipulation items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition-colors duration-200 hover:border-[#D4AF37]/35 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] sm:min-h-14 sm:gap-4 sm:px-4 sm:py-3"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#D4AF37] sm:size-11">
                        <path.Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white">{path.title}</span>
                        <span className="mt-0.5 hidden truncate text-xs text-white/65 [@media(min-height:720px)]:block">
                          {path.detail}
                        </span>
                      </span>
                      <span className="text-[#D4AF37]" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-3 [@media(min-height:700px)]:gap-3 [@media(min-height:700px)]:pt-4">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => dismiss('whatsapp')}
                className="order-1 inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-[#D4AF37] text-[12px] font-black uppercase tracking-[0.12em] text-black transition-transform duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] [@media(min-height:500px)]:h-12 sm:order-2 sm:border sm:border-white/15 sm:bg-white/5 sm:text-white"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Message us on WhatsApp
              </a>
              <Link
                to="/inventory"
                onClick={() => dismiss('browse')}
                className="order-2 inline-flex h-11 w-full touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/5 text-[12px] font-black uppercase tracking-[0.12em] text-white transition-transform duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] [@media(min-height:500px)]:h-12 sm:order-1 sm:border-0 sm:bg-[#D4AF37] sm:text-black"
              >
                Explore the collection
              </Link>
              <button
                type="button"
                onClick={() => dismiss('dismiss')}
                className="order-3 inline-flex h-11 w-full touch-manipulation items-center justify-center text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
              >
                Continue exploring
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
