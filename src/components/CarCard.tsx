import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Milestone, Settings2 } from 'lucide-react';

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

  return (
    <Link to={`/car/${car.id}`} className={`block group ${className}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-[#D4AF37]/40 shadow-2xl transition-all duration-500 relative"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/11] overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            src={car.image}
            alt={`${car.make} ${car.model}`}
            className={`w-full h-full object-cover transition-all duration-700 ${car.is_sold ? 'opacity-40 grayscale' : 'grayscale-[0.2] group-hover:grayscale-0'}`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* SOLD Badge — center */}
          {car.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <span className="px-6 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-500/50">
                Sold
              </span>
            </div>
          )}

          {/* Condition badge — top left */}
          {car.condition && !car.is_sold && (
            <div className="absolute top-4 left-4 z-10">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
                car.condition.toUpperCase() === 'NEW' 
                ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_4px_15px_rgba(212,175,55,0.4)]' 
                : 'bg-black/60 backdrop-blur-md border-white/20 text-white'
              }`}>
                {car.condition}
              </span>
            </div>
          )}

          {/* Year Badge — top right */}
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[10px] font-black italic bg-white/10 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg">
              {car.year}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 md:p-7 space-y-4">
          <div className="space-y-1">
            <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-gray-500 group-hover:text-[#D4AF37] transition-colors">
              {car.make}
            </h3>
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
              {car.model}
            </h2>
          </div>
          
          <div className="flex items-center justify-between items-end">
            <p className="text-xl md:text-2xl font-black text-[#D4AF37] tracking-tighter">
              {formattedPrice}
            </p>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
              View &rarr;
            </span>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Specs row */}
          <div className="flex items-center gap-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Milestone className="w-3.5 h-3.5 text-[#D4AF37]/60" />
              <span>{car.mileage.toLocaleString()} KM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-[#D4AF37]/60" />
              <span>{car.transmission}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

