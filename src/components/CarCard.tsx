import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Milestone, Settings2, Heart, BarChart2 } from 'lucide-react';

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
        alert('You can only compare up to 2 vehicles at a time.');
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
        className="overflow-hidden rounded-[32px] bg-white/[0.02] backdrop-blur-2xl border border-white/5 hover:border-[#D4AF37]/40 shadow-2xl transition-all duration-700 relative h-full flex flex-col"
      >
        {/* Background Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            src={`${car.image}&w=600&q=70`}
            alt={`${car.make} ${car.model}`}
            width={384}
            height={240}
            className={`w-full h-full object-cover transition-all duration-700 ${car.is_sold ? 'opacity-40 grayscale' : 'group-hover:grayscale-0'}`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          
          {/* Cinematic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
            <button 
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 ${
                isWishlisted 
                ? 'bg-red-500 border-red-400 text-white shadow-lg' 
                : 'bg-black/40 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={toggleCompare}
              aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 ${
                isComparing 
                ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg' 
                : 'bg-black/40 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>

          {/* SOLD Badge */}
          {car.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <span className="px-6 py-2 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-500/50">
                Sold
              </span>
            </div>
          )}

          {/* Year/Condition Caps — Bottom Left */}
          <div className="absolute bottom-6 left-6 z-20 flex gap-2">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 text-[#D4AF37] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-lg">
              {car.year}
            </div>
            {car.condition && !car.is_sold && (
              <div className={`bg-white/10 backdrop-blur-xl border border-white/10 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-lg`}>
                {car.condition}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-8 pb-10 flex-1 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1px] bg-[#D4AF37]/50" />
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-[#D4AF37]">
                {car.make}
              </h3>
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-6 transition-colors duration-500 group-hover:text-[#F3D67E]">
              {car.model}
            </h2>
            
            {/* Minimal Specs */}
            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 pb-8 border-b border-white/5">
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
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-1">Price Guide</span>
              <p className="text-2xl font-black text-white tracking-tighter">
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

