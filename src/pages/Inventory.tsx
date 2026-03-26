import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Fuel, Settings2, LayoutList, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';
import Loader from '../components/Loader';

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>(carsData);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    condition: searchParams.get('condition') || 'all',
    make: searchParams.get('make') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    maxPrice: Number(searchParams.get('maxPrice')) || 100000000
  });

  const [sortBy, setSortBy] = useState('Newest First');

  const filterOptions = useMemo(() => {
    // Calculate options from the full pool (carsData or cars state if available)
    const source = cars.length > 0 ? cars : (carsData as Car[]);
    const makes = Array.from(new Set(source.map(c => c.make))).sort();
    const bodyTypes = Array.from(new Set(source.map(c => c.bodyType))).sort();
    const fuels = Array.from(new Set(source.map(c => c.fuel))).sort();
    const transmissions = Array.from(new Set(source.map(c => c.transmission))).sort();
    return { makes, bodyTypes, fuels, transmissions };
  }, [cars]);

  useEffect(() => {
    const fetchLiveVehicles = async () => {
      const { data, error } = await supabase.from('cars').select('*');
      if (!error && data) {
        setCars(data);
      }
      setLoading(false);
    };
    fetchLiveVehicles();
  }, []);

  const filteredCars = useMemo(() => {
    let result = [...cars];
    
    // Filtering
    if (filters.condition !== 'all') {
      result = result.filter(v => v.condition.toLowerCase() === filters.condition.toLowerCase());
    }
    if (filters.make) {
      result = result.filter(v => v.make === filters.make);
    }
    if (filters.bodyType) {
      result = result.filter(v => (v as any).bodyType === filters.bodyType);
    }
    if (filters.fuel) {
      result = result.filter(v => v.fuel === filters.fuel);
    }
    if (filters.transmission) {
      result = result.filter(v => v.transmission === filters.transmission);
    }
    result = result.filter(v => v.price <= filters.maxPrice);

    // Sorting Logic
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest First') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'Mileage: Low to High') {
      result.sort((a, b) => a.mileage - b.mileage);
    }

    return result;
  }, [filters, sortBy, cars]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      condition: 'all',
      make: '',
      bodyType: '',
      fuel: '',
      transmission: '',
      maxPrice: 100000000,
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen font-sans bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* LUXURY INVENTORY HERO */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/inventory_hero.png" 
            className="w-full h-full object-cover opacity-60 scale-105" 
            alt="Inventory Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black" />
        </div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center space-y-4">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="space-y-4"
          >
            <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px] md:text-xs">The Global Collection</p>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              Premier <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D4AF37] to-white/20">Inventory</span>
            </h1>
            <p className="max-w-xl mx-auto text-gray-400 font-medium text-sm md:text-base">
                Sourced strictly from trusted partners in the UK & Japan. <br className="hidden md:block"/> Authentic mileage and verified history guaranteed.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* THE CURATION SUITE / SIDEBAR FILTERS */}
          <aside className={`fixed lg:relative inset-0 z-[60] lg:z-0 lg:w-[320px] shrink-0 transition-all duration-300 ${isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md lg:hidden" onClick={() => setIsMobileFilterOpen(false)} />
            <div className={`absolute lg:relative left-0 top-0 bottom-0 w-4/5 max-w-[320px] lg:w-full bg-[#050505] lg:bg-transparent p-8 lg:p-0 overflow-y-auto lg:overflow-visible transition-transform duration-500 ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="space-y-10 lg:sticky lg:top-28">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Curation <span className="text-[#D4AF37]">Suite</span></h3>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden text-gray-500"><X className="w-5 h-5" /></button>
                  </div>
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#D4AF37] transition-colors"
                  >
                    Reset
                  </button>
                </div>

              {/* Status Tab Toggle */}
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                {(['all', 'New', 'Registered'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleFilterChange('condition', tab)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                      filters.condition === tab ? 'bg-[#D4AF37] text-black shadow-lg ring-1 ring-white/20' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? 'In Stock' : tab}
                  </button>
                ))}
              </div>

              {/* Collapsible Filter Groups */}
              <div className="space-y-8">
                {[
                  { label: "Manufacturer", key: "make", options: filterOptions.makes, icon: <LayoutList className="w-4 h-4" /> },
                  { label: "Body Architecture", key: "bodyType", options: filterOptions.bodyTypes, icon: <Activity className="w-4 h-4" /> },
                  { label: "Engine & Fuel", key: "fuel", options: filterOptions.fuels, icon: <Fuel className="w-4 h-4" /> },
                  { label: "Transmission", key: "transmission", options: filterOptions.transmissions, icon: <Settings2 className="w-4 h-4" /> }
                ].map((f, i) => (
                  <div key={i} className="space-y-3 relative group">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[#D4AF37] opacity-60">{f.icon}</span>
                       <label className="text-[10px] font-black tracking-widest uppercase text-gray-500">{f.label}</label>
                    </div>
                    <div className="relative">
                      <select 
                        value={filters[f.key as keyof typeof filters]} 
                        onChange={(e) => handleFilterChange(f.key, e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-[13px] font-bold focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer appearance-none hover:bg-white/10"
                      >
                        <option className="bg-black" value="">All {f.label}</option>
                        {f.options.map((opt) => (
                          <option className="bg-black text-white" key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                  </div>
                ))}

                {/* Price Range Slider */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black tracking-widest uppercase text-gray-500">Max Investment</label>
                     <span className="text-[13px] font-black text-[#D4AF37] tracking-tight">LKR {(filters.maxPrice / 1000000).toFixed(0)}M</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000000" 
                    max="100000000" 
                    step="1000000" 
                    value={filters.maxPrice} 
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))} 
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#D4AF37]" 
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} 
                  />
                  <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
                    <span>1M</span>
                    <span>100M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

          {/* VEHICLE GRID */}
          <main className="flex-1 space-y-12">
            {/* Grid Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Showroom <span className="text-gray-500">Collection</span></h2>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <span className="text-[#D4AF37]">{filteredCars.length}</span> Pieces Available
                  </p>
                </div>
                {/* Mobile Filter Trigger */}
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#D4AF37]"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Sort By</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-[11px] font-black border-none focus:outline-none focus:ring-0 text-white cursor-pointer uppercase tracking-widest"
                  >
                    <option className="bg-black" value="Newest First">Newest First</option>
                    <option className="bg-black" value="Price: Low to High">Price: Low to High</option>
                    <option className="bg-black" value="Price: High to Low">Price: High to Low</option>
                    <option className="bg-black" value="Mileage: Low to High">Mileage: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <AnimatePresence mode="popLayout">
              {filteredCars.length > 0 ? (
                <motion.div 
                  layout 
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
                >
                  {filteredCars.map((car, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      key={car.id}
                    >
                      <CarCard car={car} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* No Results Exclusive State */
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-40 space-y-10 glass-panel rounded-[40px] px-6"
                >
                  <div className="space-y-4">
                     <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-xs">Custom Acquisition Request</p>
                     <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">No collection matches <br /> your precise criteria</h2>
                  </div>
                  <p className="text-gray-400 max-w-sm mx-auto font-medium text-sm leading-relaxed">Allow our global sourcing specialists to locate your ideal vehicle through our private invitation-only network.</p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <button 
                      onClick={clearFilters}
                      className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-[#D4AF37] transition-all rounded-2xl"
                    >
                      Reset Selection
                    </button>
                    <a 
                      href="https://wa.me/94756363427"
                      className="px-10 py-5 border border-white/10 hover:border-[#D4AF37] rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                    >
                      Bespoke Inquiry
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
