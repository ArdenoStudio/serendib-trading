import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Plus, Info, ShieldCheck, TrendingUp, Cpu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';
import { LiquidButton } from './ui/liquid-glass-button';

export default function ComparisonTray() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleStorage = () => {
      const list = JSON.parse(localStorage.getItem('compare') || '[]');
      setCompareIds(list);
    };

    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (compareIds.length > 0) {
      const fetchInfo = async () => {
        const { data } = await supabase.from('cars').select('*').in('id', compareIds);
        if (data && data.length > 0) {
          setVehicles(data);
        } else {
          const fallbacks = (carsData as Car[]).filter(c => compareIds.includes(c.id));
          setVehicles(fallbacks);
        }
      };
      fetchInfo();
    } else {
      setVehicles([]);
    }
  }, [compareIds]);

  const removeVehicle = (id: string) => {
    const newList = compareIds.filter(i => i !== id);
    localStorage.setItem('compare', JSON.stringify(newList));
    setCompareIds(newList);
  };

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Floating Tray Trigger */}
      <div className="fixed bottom-12 left-6 md:left-12 z-[60]">
        <motion.div
           initial={{ y: 100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-4 px-8 py-4 bg-black/80 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <BarChart2 className="w-5 h-5 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
            <div className="text-left py-0.5">
               <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/70">Analysis Terminal</p>
               <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white">Compare {compareIds.length} Assets</p>
            </div>
            <div className="size-6 bg-[#D4AF37] text-black rounded-full flex items-center justify-center text-[10px] font-black">
              {compareIds.length}
            </div>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-[#080706]/95 backdrop-blur-3xl"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl h-full max-h-[90vh] bg-white/[0.01] border border-white/10 rounded-[24px] md:rounded-[48px] overflow-hidden relative shadow-2xl flex flex-col"
            >
              {/* Top Controls */}
              <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20">
                <button 
                   onClick={() => setIsOpen(false)} 
                   className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 group transition-all"
                >
                  <X className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                </button>
              </div>

              <div 
                className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-20 space-y-8 md:space-y-16"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onScroll={(e) => e.stopPropagation()}
              >
                 {/* Header */}
                 <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                       <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Market Value Comparison</span>
                    </div>
                     <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
                        Side-by-side <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20">Analysis</span>
                     </h2>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative items-start">
                    {/* VS Badge in Center (only on large screens) */}
                    {vehicles.length === 2 && (
                       <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 select-none pointer-events-none items-center justify-center">
                          <div className="size-20 bg-black/80 backdrop-blur-3xl border border-[#D4AF37]/40 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                             <span className="text-[#D4AF37] font-black italic text-2xl tracking-tighter">VS</span>
                          </div>
                       </div>
                    )}

                    {vehicles.map((v, idx) => (
                      <motion.div 
                        key={v.id} 
                        initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="group relative"
                      >
                        {/* Remove Action */}
                        <button 
                           onClick={() => removeVehicle(v.id)} 
                           className="absolute top-6 right-6 z-10 size-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 space-y-8 group-hover:bg-white/[0.05] group-hover:border-[#D4AF37]/20 transition-all duration-500">
                           {/* Vehicle Image Container */}
                           <div className="aspect-[16/10] rounded-2xl overflow-hidden relative shadow-2xl">
                              <img src={v.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={v.model} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                              <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                 <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{v.condition}</span>
                              </div>
                           </div>

                           {/* Metadata */}
                           <div className="space-y-8 px-2">
                              <div className="space-y-1">
                                 <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none flex gap-3 flex-wrap">
                                    <span className="text-[#D4AF37]">{v.year}</span>
                                    <span className="text-white/90">{v.make}</span>
                                    <span className="text-white">{v.model}</span>
                                 </h3>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/70">Investment ID: SR{v.id?.slice(0, 6)}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-y-10 gap-x-8">
                                {[
                                  { label: 'Current Valuation', value: `LKR ${v.price.toLocaleString()}`, accent: true },
                                  { label: 'Odometer Reading', value: `${v.mileage.toLocaleString()} KM` },
                                  { label: 'Transmission System', value: v.transmission },
                                  { label: 'Power Source', value: v.fuel },
                                ].map((spec, i) => (
                                  <div key={i} className="space-y-1.5 border-l-2 border-white/5 pl-4 hover:border-[#D4AF37]/30 transition-colors">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{spec.label}</p>
                                    <p className={`text-sm md:text-base font-black italic tracking-tight ${spec.accent ? 'text-[#D4AF37]' : 'text-white'}`}>
                                       {spec.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              

                           </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Empty Slot */}
                    {compareIds.length < 2 && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="flex flex-col items-center justify-center p-12 text-center space-y-8 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[32px] min-h-[500px] group hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all duration-500"
                       >
                          <div className="size-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-2xl relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             <Plus className="w-10 h-10 text-gray-600 group-hover:text-[#D4AF37] relative z-10" />
                          </div>
                          <div className="space-y-2">
                             <p className="text-xl font-black italic uppercase tracking-tighter text-gray-400 group-hover:text-white transition-colors">Compare Counterpart</p>
                             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-700 max-w-[200px]">Select another asset from inventory to begin side-by-side analysis</p>
                          </div>
                          
                          <LiquidButton asChild variant="gold" size="sm" className="opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest px-8">Return to Inventory</button>
                          </LiquidButton>
                       </motion.div>
                    )}
                 </div>

                 {/* Footer Trust Signal */}
                 <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8">
                       <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                          <ShieldCheck className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Assets</span>
                       </div>
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.5em] text-center">Serendib Intelligence Terminal ⋅ Since 2010</p>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
