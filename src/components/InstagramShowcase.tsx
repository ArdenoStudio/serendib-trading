import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Instagram } from 'lucide-react';

import { SHOWROOM_IMAGES } from '../data/showroomImages';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/socialLinks';
import { cn } from '../lib/utils';

const showroomSlides = [
  SHOWROOM_IMAGES[2],
  SHOWROOM_IMAGES[3],
  SHOWROOM_IMAGES[1],
  SHOWROOM_IMAGES[5],
  SHOWROOM_IMAGES[7],
];

const profileStats = [
  { value: 'New', label: 'arrivals' },
  { value: 'Walkaround', label: 'clips' },
  { value: 'Showroom', label: 'updates' },
];

export default function InstagramShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const currentSlide = showroomSlides[activeSlide];

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % showroomSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  return (
    <section
      aria-labelledby="instagram-showcase-title"
      className="relative scroll-mt-28 overflow-hidden border-y border-white/5 bg-[#0A0A0A] px-6 py-20 lg:px-10"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-7 sm:flex-row sm:items-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Serendib Trading Instagram profile"
              className="group relative size-24 shrink-0 rounded-full border border-[#D4AF37]/35 bg-black p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
            >
              <span className="absolute inset-[-5px] rounded-full border border-[#D4AF37]/25" aria-hidden="true" />
              <img
                src="/serendib-logo-192.png"
                alt="Serendib Trading"
                className="size-full rounded-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            </a>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-2 text-xl font-black text-white transition-colors duration-200 hover:text-[#F3D67E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
                >
                  <Instagram className="size-5 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                  <span className="truncate">{INSTAGRAM_HANDLE.replace('@', '')}</span>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-5 py-2 text-xs font-black uppercase text-black transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
                >
                  Follow
                </a>
              </div>

              <div className="mb-5 flex flex-wrap gap-x-7 gap-y-2">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-white">{stat.value}</span>
                    <span className="text-sm text-white/55">{stat.label}</span>
                  </div>
                ))}
              </div>

              <h2
                id="instagram-showcase-title"
                className="mb-3 max-w-2xl text-balance text-4xl font-black leading-none text-white md:text-5xl"
              >
                Follow the showroom feed.
              </h2>
              <p className="max-w-2xl text-pretty text-base leading-8 text-white/62">
                New arrivals, showroom walkarounds, and quick updates from Serendib Trading.
              </p>
            </div>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center gap-3 rounded-full border border-[#D4AF37]/30 px-6 py-3 text-sm font-black uppercase text-[#D4AF37] transition-colors duration-200 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
          >
            Open Instagram
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="relative h-[240px] overflow-hidden sm:h-[320px] lg:h-[390px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={currentSlide.src}
                src={currentSlide.src}
                alt={currentSlide.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
                style={{ objectPosition: currentSlide.objectPosition || 'center center' }}
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.01 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
              />
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#D4AF37]">
                    Showroom Preview
                  </p>
                  <p className="text-xl font-black text-white md:text-3xl">
                    {currentSlide.caption}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {showroomSlides.map((slide, index) => (
                    <button
                      key={slide.src}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Show ${slide.caption}`}
                      className={cn(
                        'h-2 rounded-full transition-[background-color,width] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]',
                        activeSlide === index ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/35 hover:bg-white/70',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 border-t border-white/10 bg-black/20 p-2">
            {showroomSlides.map((slide, index) => (
              <button
                key={`${slide.src}-thumb`}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Preview ${slide.caption}`}
                className={cn(
                  'relative aspect-[4/3] overflow-hidden rounded-xl border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]',
                  activeSlide === index ? 'border-[#D4AF37]' : 'border-white/10 hover:border-white/30',
                )}
              >
                <img
                  src={slide.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                  style={{ objectPosition: slide.objectPosition || 'center center' }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
