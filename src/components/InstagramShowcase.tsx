import { ExternalLink, Grid3X3, Heart, Instagram, MessageCircle, Play, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SHOWROOM_IMAGES } from '../data/showroomImages';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/socialLinks';
import { cn } from '../lib/utils';

const storyHighlights = [
  { label: 'Arrivals', image: SHOWROOM_IMAGES[0] },
  { label: 'Walkarounds', image: SHOWROOM_IMAGES[2] },
  { label: 'Showroom', image: SHOWROOM_IMAGES[5] },
  { label: 'Deliveries', image: SHOWROOM_IMAGES[7] },
];

const feedPosts = [
  { image: SHOWROOM_IMAGES[2], label: 'Feature display', type: 'reel' },
  { image: SHOWROOM_IMAGES[3], label: 'New arrival bay', type: 'post' },
  { image: SHOWROOM_IMAGES[1], label: 'Showroom floor', type: 'post' },
  { image: SHOWROOM_IMAGES[5], label: 'Logo wall', type: 'reel' },
  { image: SHOWROOM_IMAGES[6], label: 'Interior details', type: 'post' },
  { image: SHOWROOM_IMAGES[7], label: 'Collection view', type: 'post' },
];

const profileStats = [
  { value: 'Daily', label: 'Stories' },
  { value: 'Fresh', label: 'Arrivals' },
  { value: 'DM', label: 'Inquiries' },
];

export default function InstagramShowcase() {
  return (
    <section
      aria-labelledby="instagram-showcase-title"
      className="relative scroll-mt-28 overflow-hidden border-y border-white/5 bg-[#0A0A0A] px-6 py-24 lg:px-10"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-12 flex flex-col gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-7 sm:flex-row sm:items-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Serendib Trading Instagram profile"
              className="group relative size-28 shrink-0 rounded-full border border-[#D4AF37]/35 bg-black p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
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
                <Link
                  to="/gallery"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 text-xs font-bold uppercase text-white/70 transition-colors duration-200 hover:border-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
                >
                  Gallery
                </Link>
              </div>

              <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
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
                New arrivals, walkaround clips, delivery moments, and quick showroom updates from Serendib Trading.
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

        <div className="mb-12 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {storyHighlights.map((story) => (
            <a
              key={story.label}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-24 shrink-0 flex-col items-center gap-3 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
            >
              <span className="rounded-full border border-white/10 bg-white/[0.03] p-1 transition-colors duration-200 group-hover:border-[#D4AF37]/45">
                <span className="block size-20 overflow-hidden rounded-full bg-black">
                  <img
                    src={story.image.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                    style={{ objectPosition: story.image.objectPosition || 'center center' }}
                  />
                </span>
              </span>
              <span className="max-w-full truncate text-xs font-bold text-white/70">{story.label}</span>
            </a>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-3 border-t border-white/10 text-center text-[11px] font-black uppercase text-white/45">
          <div className="flex items-center justify-center gap-2 border-t border-[#D4AF37] py-4 text-[#D4AF37]">
            <Grid3X3 className="size-3.5" aria-hidden="true" />
            Posts
          </div>
          <div className="flex items-center justify-center gap-2 py-4">
            <Play className="size-3.5" aria-hidden="true" />
            Reels
          </div>
          <div className="flex items-center justify-center gap-2 py-4">
            <UserRound className="size-3.5" aria-hidden="true" />
            Tagged
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-2">
          {feedPosts.map((post, index) => (
            <a
              key={`${post.image.src}-${post.label}`}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${post.label} on Instagram`}
              className={cn(
                'group relative aspect-square overflow-hidden bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]',
                index === 0 ? 'rounded-tl-2xl' : '',
                index === 2 ? 'sm:rounded-tr-2xl' : '',
                index === 3 ? 'sm:rounded-bl-2xl' : '',
                index === 5 ? 'rounded-br-2xl' : '',
              )}
            >
              <img
                src={post.image.src}
                alt={post.image.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                style={{ objectPosition: post.image.objectPosition || 'center center' }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-[background-color,opacity] duration-200 group-hover:bg-black/55 group-hover:opacity-100">
                <div className="flex items-center gap-5 text-sm font-black text-white">
                  <span className="inline-flex items-center gap-2">
                    <Heart className="size-5 fill-white" aria-hidden="true" />
                    View
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="size-5" aria-hidden="true" />
                    DM
                  </span>
                </div>
              </div>
              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase text-white/85">
                {post.type}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
