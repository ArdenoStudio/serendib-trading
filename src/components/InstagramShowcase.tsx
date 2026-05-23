import { ExternalLink, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SHOWROOM_IMAGES } from '../data/showroomImages';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/socialLinks';
import { cn } from '../lib/utils';

const instagramMoments = [
  {
    ...SHOWROOM_IMAGES[5],
    label: 'Identity wall',
  },
  {
    ...SHOWROOM_IMAGES[1],
    label: 'Showroom floor',
  },
  {
    ...SHOWROOM_IMAGES[2],
    label: 'Feature bay',
  },
];

export default function InstagramShowcase() {
  return (
    <section
      aria-labelledby="instagram-showcase-title"
      className="relative overflow-hidden border-y border-white/5 bg-[#0A0A0A] py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-10">
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
            Follow the showroom as it moves.
          </h2>

          <p className="mb-9 max-w-xl text-pretty text-base leading-8 text-white/60 md:text-lg">
            Get the newest showroom moments, vehicle walkarounds, and delivery updates directly from Serendib Trading's Instagram page.
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
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-7 py-4 text-sm font-bold text-white/72 transition-colors duration-200 hover:border-[#D4AF37]/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
            >
              View Website Gallery
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {instagramMoments.map((moment, index) => (
              <figure
                key={moment.src}
                className={cn(
                  'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]',
                  index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square',
                )}
              >
                <img
                  src={moment.src}
                  alt={moment.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: moment.objectPosition || 'center center' }}
                />
                <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
                <figcaption className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-sm text-white backdrop-blur-md">
                  <span className="min-w-0 truncate font-semibold">{moment.label}</span>
                  <Instagram className="size-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-black">
                <img src="/serendib-logo-192.png" alt="" aria-hidden="true" className="h-8 w-auto object-contain" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">Serendib Trading</p>
                <p className="truncate text-sm text-white/50">{INSTAGRAM_HANDLE}</p>
              </div>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#D4AF37]/30 px-5 py-3 text-sm font-bold text-[#D4AF37] transition-colors duration-200 hover:bg-[#D4AF37]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
              aria-label="Follow Serendib Trading on Instagram"
            >
              Follow
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
