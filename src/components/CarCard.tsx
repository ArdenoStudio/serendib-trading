import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Settings2, Heart, BarChart2 } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { readStringList, writeStringList } from '../lib/storage';
import { cleanSpec } from '../lib/utils';
import { optimizeImageUrl } from '../lib/images';
import { BrandMark, getBrandLabel, getDisplayModel } from './brand/BrandMark';
import { logCtaClick } from '../lib/supabase';

function cardImageSrc(url: string) {
  if (url.includes('unsplash.com')) return `${url}&w=600&q=70`;
  return optimizeImageUrl(url, 'card');
}

interface CarCardProps {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuel: string;
    transmission: string;
    image: string;
    condition: string;
    is_sold?: boolean;
    sold_at?: string;
    key_features?: string[];
  };
  className?: string;
}

export default function CarCard({ car, className = '' }: CarCardProps) {
  const formattedPrice = car.price > 0 ? `LKR ${car.price.toLocaleString()}` : 'Price on request';
  const displayMake = getBrandLabel(car.make);
  const displayModel = getDisplayModel(car.make, car.model);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareToast, setCompareToast] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const preferredSrc = cardImageSrc(car.image);
  const [imageSrc, setImageSrc] = useState(preferredSrc);

  useEffect(() => {
    setImageSrc(cardImageSrc(car.image));
  }, [car.image]);

  useEffect(() => {
    const wishlist = readStringList('wishlist');
    setIsWishlisted(wishlist.includes(car.id));
    
    const compareList = readStringList('compare', 2);
    setIsComparing(compareList.includes(car.id));
  }, [car.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = readStringList('wishlist');
    const wasWishlisted = wishlist.includes(car.id);
    let newWishlist;
    if (wasWishlisted) {
      newWishlist = wishlist.filter((id: string) => id !== car.id);
    } else {
      newWishlist = [...wishlist, car.id];
    }
    const normalizedWishlist = writeStringList('wishlist', newWishlist);
    setIsWishlisted(normalizedWishlist.includes(car.id));
    window.dispatchEvent(new Event('wishlistchange'));
    logCtaClick(wasWishlisted ? 'wishlist_remove' : 'wishlist_add', { car_id: car.id });
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const compareList = readStringList('compare', 2);
    let newCompare;
    if (compareList.includes(car.id)) {
      newCompare = compareList.filter((id: string) => id !== car.id);
    } else {
      if (compareList.length >= 2) {
        setCompareToast(true);
        setTimeout(() => setCompareToast(false), 2500);
        return;
      }
      newCompare = [...compareList, car.id];
    }
    const normalizedCompare = writeStringList('compare', newCompare, 2);
    setIsComparing(normalizedCompare.includes(car.id));
    window.dispatchEvent(new Event('comparechange'));
  };

  return (
    <article className={`block group ${className}`}>
      {/* Card shell: Link covers content, actions sit outside Link to avoid nested interactive */}
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] shadow-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,transform] duration-200 ease-out motion-reduce:transform-none group-hover:border-[#D4AF37]/40 group-focus-within:outline-none group-focus-within:ring-2 group-focus-within:ring-[#D4AF37] [@media(hover:hover)]:group-hover:-translate-y-2"
      >
        {/* Background Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Compare limit toast */}
        {compareToast && (
          <div className="absolute top-4 left-4 right-4 z-30 px-4 py-2.5 bg-black/95 border border-white/10 rounded-xl text-[11px] font-bold text-white/80 text-center shadow-lg">
            Max 2 vehicles for comparison
          </div>
        )}

        {/* Lightbox */}
        <ImageLightbox
          src={optimizeImageUrl(car.image, 'detail')}
          alt={`${car.year} ${displayMake} ${displayModel}`}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        {/* Quick Actions — sibling of Link, not nested (a11y fix for nested interactive) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-100 translate-x-0 transition-all duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-x-4 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-0 focus-within:opacity-100 focus-within:translate-x-0">
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-[0.96] ${
              isWishlisted
                ? 'bg-red-500 border-red-400 text-white shadow-lg'
                : 'bg-black/60 border-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleCompare}
            aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
            aria-pressed={isComparing}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-[0.96] ${
              isComparing
              ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg'
              : 'bg-black/60 border-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <Link to={`/car/${car.id}`} onClick={() => logCtaClick('car_card', { car_id: car.id })} className="flex h-full flex-col focus:outline-none">
        {/* Image Container - taller aspect on mobile to show more vehicle */}
        <div className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden bg-[#0d0b09]">
          <img
            src={imageSrc}
            alt={`${displayMake} ${displayModel}`}
            width={384}
            height={240}
            className={`h-full w-full origin-center scale-[0.94] object-cover object-center transition-transform duration-300 ease-out motion-reduce:transform-none [@media(hover:hover)]:group-hover:scale-[1.02] ${car.is_sold ? 'opacity-40 grayscale' : ''}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onError={() => {
              // Storage can be down (e.g. quota). Try the raw URL once, then
              // fall back to a local showroom image so cards never show a
              // broken-image icon.
              if (imageSrc !== car.image) {
                setImageSrc(car.image);
              } else {
                setImageSrc('/images/showroom/serendib-showroom-floor-02.webp');
              }
            }}
          />

          {/* Cinematic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-transparent opacity-90 pointer-events-none" />
          <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          {/* Image Outline for Depth */}
          <div className="absolute inset-0 border border-white/10 pointer-events-none" />

          {/* SOLD Badge */}
          {car.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <span className="px-6 py-2 bg-red-600/95 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-500/50">
                Sold
              </span>
            </div>
          )}

          {/* Year/Condition Caps — Bottom Left */}
          <div className="absolute bottom-6 left-6 z-20 flex gap-2">
            <div className="bg-black/70 border border-white/10 text-[#D4AF37] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
              {car.year}
            </div>
            {car.condition && !car.is_sold && (
              <div className={`bg-black/50 border border-white/10 text-white/80 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg`}>
                {car.condition}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 pb-8 flex-1 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <BrandMark
                make={car.make}
                tone="mono"
                className="size-8 shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-white/45 transition-colors duration-500 group-hover:border-[#D4AF37]/35 group-hover:text-[#D4AF37]"
              />
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#D4AF37]">
                {displayMake}
              </h3>
            </div>
            <h2 className="text-2xl font-extrabold uppercase tracking-[-0.04em] text-white leading-none mb-6 transition-colors duration-500 group-hover:text-[#F3D67E] text-wrap-balance">
              {displayModel}
            </h2>
            
            {/* Minimal Specs */}
            <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 mb-8 pb-8 border-b border-white/5 tabular-nums">
              <div className="flex items-center gap-2">
                <Gauge className="w-3 h-3 text-[#D4AF37]" />
                <span>{car.mileage > 0 ? `${car.mileage.toLocaleString()} KM` : 'Ask for KM'}</span>
              </div>
              {cleanSpec(car.transmission) && (
                <div className="flex items-center gap-2">
                  <Settings2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>{cleanSpec(car.transmission)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-1">Price Guide</span>
              <p className="text-2xl font-black text-white tracking-[-0.05em] tabular-nums">
                {car.price ? `LKR ${(car.price/1000000).toFixed(1)}M` : 'Price on request'}
              </p>
            </div>
            
            <div className="flex size-11 items-center justify-center rounded-full border border-[#D4AF37]/30 text-[#D4AF37] transition-colors duration-200 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black">
              &rarr;
            </div>
          </div>

          {/* Corner Accent */}
          <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-24 bg-gradient-to-br from-transparent to-[#D4AF37]/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
        </Link>
      </div>
    </article>
  );
}
