import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HERO_SHOWROOM_SLIDES } from '../data/showroomImages';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/socialLinks';
import { cn } from '../lib/utils';

const instagramSlides = HERO_SHOWROOM_SLIDES.map((slide) => ({
  ...slide,
  label: slide.caption,
}));

export default function InstagramShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const currentSlide = instagramSlides[activeSlide];

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % instagramSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  return (
    <section
      aria-labelledby="instagram-showcase-title"
      className="relative flex min-h-[720px] items-end overflow-hidden border-y border-white/5 bg-[#0A0A0A] md:min-h-[780px]"
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={currentSlide.src}
            src={currentSlide.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover brightness-[0.92] contrast-[1.08] saturate-[1.03]"
            style={{ objectPosition: currentSlide.objectPosition || 'center center' }}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.015 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/80 via-[#0d0b09]/12 to-[#0d0b09]/96" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09]/88 via-[#0d0b09]/38 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-noise" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[720px] w-full max-w-[1400px] flex-col justify-between px-6 py-14 md:min-h-[780px] md:py-20 lg:px-10">
        <div className="flex justify-end">
          <div className="hidden max-w-[400px] items-center gap-4 rounded-full border border-white/10 bg-black/35 px-4 py-3 text-white shadow-2xl backdrop-blur-xl md:flex">
            <span className="max-w-[190px] truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
              {currentSlide.label}
            </span>
            <div className="flex items-center gap-2">
              {instagramSlides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show ${slide.caption}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    activeSlide === index ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-white/30 hover:bg-white/60',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div className="max-w-2xl">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-4 py-2 text-sm font-bold text-[#D4AF37] transition-colors duration-200 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
              aria-label="Open Serendib Trading Instagram profile"
            >
              <Instagram className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{INSTAGRAM_HANDLE}</span>
            </a>

            <h2
              id="instagram-showcase-title"
              className="mb-6 max-w-xl text-4xl font-black leading-none text-balance text-white md:text-6xl"
            >
              See what is on the showroom floor.
            </h2>

            <p className="mb-9 max-w-xl text-pretty text-base leading-8 text-white/72 md:text-lg">
              Follow new arrivals, walkaround clips, delivery moments, and behind-the-scenes updates from the Serendib Trading showroom.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#D4AF37] px-7 py-4 text-sm font-black uppercase text-black transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
              >
                Open Instagram
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-7 py-4 text-sm font-bold text-white/80 transition-colors duration-200 hover:border-[#D4AF37]/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
              >
                View Website Gallery
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            {instagramSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${slide.caption}`}
                className={cn(
                  'group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-black/30 text-left transition-all duration-300',
                  activeSlide === index ? 'border-[#D4AF37] p-1' : 'border-white/10 opacity-70 hover:opacity-100',
                  index === 0 ? 'col-span-2 sm:col-span-1' : '',
                )}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full rounded-[14px] object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: slide.objectPosition || 'center center' }}
                />
                <span className="absolute inset-x-3 bottom-3 truncate rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                  {slide.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
