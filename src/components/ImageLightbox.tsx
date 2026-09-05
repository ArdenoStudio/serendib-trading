import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { useBodyScrollLock } from '../lib/bodyScrollLock';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(Boolean(isOpen && src));

  useEffect(() => {
    if (!isOpen || !src) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose, src]);

  if (!isOpen || !src) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Full view: ${alt}`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95" />

          {/* Close */}
          <motion.button
            ref={closeButtonRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.08 }}
            onClick={onClose}
            aria-label="Close image viewer"
            className="absolute top-[max(1.25rem,var(--safe-top))] right-[max(1.25rem,var(--safe-right))] z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute bottom-[max(1.5rem,calc(var(--safe-bottom)+0.75rem))] left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 text-center whitespace-nowrap px-4"
          >
            {alt} &nbsp;·&nbsp; Click anywhere to close
          </motion.p>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 max-w-[90vw] max-h-[85dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85dvh] object-contain rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
              decoding="async"
            />
            {/* Gold corner accent */}
            <div className="absolute -top-px -left-px w-10 h-10 border-t border-l border-[#D4AF37]/40 rounded-tl-2xl pointer-events-none" />
            <div className="absolute -bottom-px -right-px w-10 h-10 border-b border-r border-[#D4AF37]/40 rounded-br-2xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Trigger button — renders as an overlay on the image in CarCard */
export function LightboxTrigger({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="View full image"
      className="absolute inset-0 z-10 flex items-end justify-end p-4 opacity-0 pointer-events-none [@media(hover:hover)]:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:pointer-events-auto transition-opacity duration-300"
    >
      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.15em]">
        <ZoomIn className="w-3.5 h-3.5" />
        View
      </span>
    </button>
  );
}
