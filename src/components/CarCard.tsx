import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Milestone, Settings2, Heart, BarChart2 } from 'lucide-react';
import ImageLightbox, { LightboxTrigger } from './ImageLightbox';

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
  const formattedPrice = `LKR ${car.price.toLocaleString()}`;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareToast, setCompareToast] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(car.id));
    
    const compareList = JSON.parse(localStorage.getItem('compare') || '[]');
    setIsComparing(compareList.includes(car.id));
  }, [car.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist;
    if (wishlist.includes(car.id)) {
      newWishlist = wishlist.filter((id: string) => id !== car.id);
    } else {
      newWishlist = [...wishlist, car.id];
    }
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const compareList = JSON.parse(localStorage.getItem('compare') || '[]');
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
    localStorage.setItem('compare', JSON.stringify(newCompare));
    setIsComparing(!isComparing);
  };

  return (
    <Link to={`/car/${car.id}`} className={`block group ${className}`}>
      <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="overflow-hidden rounded-3xl bg-white/[0.03] border border-white/5 hover:border-[#D4AF37]/40 shadow-2xl transition-all duration-500 relative h-full flex flex-col focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] will-change-transform"
      >
        {/* Background Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Compare limit toast */}
        {compareToast && (
          <div className="absolute top-4 left-4 right-4 z-30 px-4 py-2.5 bg-black/95 border border-white/10 rounded-xl text-[11px] font-bold text-white/80 text-center shadow-lg">
            Max 2 vehicles for comparison
          </div>
        )}

        {/* Lightbox */}
        <ImageLightbox
          src={car.image}
          alt={`${car.year} ${car.make} ${car.model}`}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        {/* Image Container - taller aspect on mobile to show more vehicle */}
        <div className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            src={car.image.includes('unsplash.com') ? `${car.image}&w=600&q=70` : car.image}
            alt={`${car.make} ${car.model}`}
            width={384}
            height={240}
            className={`w-full h-full object-contain md:object-cover transition-transform duration-700 ${car.is_sold ? 'opacity-40 grayscale' : ''}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          
          {/* Lightbox Trigger */}
          <LightboxTrigger onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxOpen(true); }} />

          {/* Cinematic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          {/* Image Outline for Depth */}
          <div className="absolute inset-0 border border-white/10 pointer-events-none" />

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
            <button
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-[0.96] ${
                isWishlisted
                ? 'bg-red-500 border-red-400 text-white shadow-lg'
                : 'bg-black/60 border-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={toggleCompare}
              aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-[0.96] ${
                isComparing
                ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg'
                : 'bg-black/60 border-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>

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
              <div className="w-5 h-[1px] bg-white/20" />
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#D4AF37]">
                {car.make}
              </h3>
            </div>
            <h2 className="text-2xl font-extrabold uppercase tracking-[-0.04em] text-white leading-none mb-6 transition-colors duration-500 group-hover:text-[#F3D67E] text-wrap-balance">
              {car.model}
            </h2>
            
            {/* Minimal Specs */}
            <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-8 pb-8 border-b border-white/5 tabular-nums">
              <div className="flex items-center gap-2">
                <Gauge className="w-3 h-3 text-[#D4AF37]" />
                <span>{car.mileage.toLocaleString()} KM</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings2 className="w-3 h-3 text-[#D4AF37]" />
                <span>{car.transmission}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-1">Price Guide</span>
              <p className="text-2xl font-black text-white tracking-[-0.05em] tabular-nums">
                {car.price ? `LKR ${(car.price/1000000).toFixed(1)}M` : 'POA'}
              </p>
            </div>
            
            <div className="w-11 h-11 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black group-hover:border-[#D4AF37] transition-all duration-500">
              &rarr;
            </div>
          </div>

          {/* Corner Accent */}
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      </motion.div>
    </Link>
  );
}

