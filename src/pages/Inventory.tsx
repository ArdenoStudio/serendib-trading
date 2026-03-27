import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Fuel, 
  Settings2, 
  LayoutList, 
  Activity, 
  Search,
  SlidersHorizontal,
  ArrowRight,
  Database,
  Grid2X2
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cars, setCars] = useState<Car[]>(carsData);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    condition: searchParams.get('condition') || 'all',
    make: searchParams.get('make') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    maxPrice: Number(searchParams.get('maxPrice')) || 150000000
  });

  const [sortBy, setSortBy] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMakeOpen, setIsMakeOpen] = useState(false);
  const [isBodyTypeOpen, setIsBodyTypeOpen] = useState(false);

  const filterOptions = useMemo(() => {
    // Merge all possible options from both sources to ensure filters are always populated with baseline categories
    const allSources = [...(carsData as Car[]), ...cars];
    
    const makes = Array.from(new Set(allSources.map(c => c.make).filter(Boolean))).sort();
    const bodyTypes = Array.from(new Set(allSources.map(c => c.bodyType).filter(Boolean))).sort();
    const fuels = Array.from(new Set(allSources.map(c => c.fuel).filter(Boolean))).sort();
    const transmissions = Array.from(new Set(allSources.map(c => c.transmission).filter(Boolean))).sort();
    
    return { makes, bodyTypes, fuels, transmissions };
  }, [cars]);

  useEffect(() => {
    const fetchLiveVehicles = async () => {
      try {
        const { data, error } = await supabase.from('cars').select('*');
        if (!error && data && data.length > 0) {
          // Robust mapping from potential Supabase snake_case/variations to frontend camelCase
          const mappedData = data.map((v: any) => ({
            ...v,
            bodyType: v.bodyType || v.body_type || v.body_style || v.style || v.bodytype || "",
            fuel: v.fuel || v.fuel_type || v.fuelType || "",
            transmission: v.transmission || v.transmission_type || v.transmissionType || ""
          }));
          setCars(mappedData);
        }
      } catch (err) {
        console.error('Failed to fetch from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveVehicles();
  }, []);

  const filteredCars = useMemo(() => {
    let result = [...cars];
    
    // Search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(v => 
            v.make.toLowerCase().includes(query) || 
            v.model.toLowerCase().includes(query) ||
            v.year.toString().includes(query)
        );
    }

    // Dropdown filters
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

    // Sorting
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
  }, [filters, sortBy, cars, searchQuery]);

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
      maxPrice: 150000000,
    });
    setSearchQuery('');
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#0d0b09] text-white overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <img 
              src="/images/inventory_hero.png" 
              className="w-full h-full object-cover" 
              alt="Inventory Hero" 
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/80 via-transparent to-[#0d0b09]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09] opacity-60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px]">The Showroom Collection</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] pr-12 overflow-visible">
              Master <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10">Inventory</span>
            </h1>

            <div className="max-w-xl mx-auto space-y-8">
              <p className="text-gray-400 font-medium text-sm md:text-xl leading-relaxed">
                A meticulously curated selection of the world's most desired automotive masterpieces, verified by our experts.
              </p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center gap-12 pt-4">
                {[
                  { label: "Vehicles", val: "40+" },
                  { label: "Global Marks", val: "12" },
                  { label: "Verified Heritage", val: "100%" }
                ].map((s, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-black text-white">{s.val}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Scroll Hint */}
        <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20"
        >
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* --- MAIN CURATION LAYOUT --- */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 pb-40">
        
        {/* Sticky Filters Bar */}
        <div className="sticky top-20 z-40 mb-16 py-6 border-b border-white/5 bg-[#0d0b09]/80 backdrop-blur-xl">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Search Field */}
              <div className="relative group w-full lg:max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search manufacturer, model or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1715] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Quick Filter Controls */}
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Condition</span>
                    <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                        {['all', 'New', 'Registered'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleFilterChange('condition', tab)}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg ${
                                    filters.condition === tab ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                {tab === 'all' ? 'Inventory' : tab}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="h-8 w-[1px] bg-white/5" />

                  <div className="flex items-center gap-3 relative">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Sort</span>
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 text-[11px] font-black text-white hover:text-[#D4AF37] transition-all uppercase tracking-widest outline-none group"
                        >
                            {sortBy === 'Newest First' ? 'Latest Arrival' : 
                             sortBy === 'Price: Low to High' ? 'Value: Low → High' : 
                             sortBy === 'Price: High to Low' ? 'Value: High → Low' : 
                             'Mileage: Low → High'}
                            <motion.div
                                animate={{ rotate: isSortOpen ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={3} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                                        className="absolute right-0 mt-4 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                                        style={{ transformOrigin: 'top right' }}
                                    >
                                        <motion.div
                                            initial="hidden"
                                            animate="show"
                                            variants={{
                                                show: {
                                                    transition: { staggerChildren: 0.05 }
                                                }
                                            }}
                                        >
                                            {[
                                                { label: 'Latest Arrival', value: 'Newest First' },
                                                { label: 'Value: Low → High', value: 'Price: Low to High' },
                                                { label: 'Value: High → Low', value: 'Price: High to Low' },
                                                { label: 'Mileage: Low → High', value: 'Mileage: Low to High' }
                                            ].map((opt) => (
                                                <motion.button
                                                    key={opt.value}
                                                    variants={{
                                                        hidden: { opacity: 0, x: -10 },
                                                        show: { opacity: 1, x: 0 }
                                                    }}
                                                    onClick={() => {
                                                        setSortBy(opt.value);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        sortBy === opt.value 
                                                        ? 'bg-[#D4AF37] text-black' 
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-3 px-6 py-4 bg-[#D4AF37] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  <SlidersHorizontal className="w-4 h-4" /> 
                  Filters
                </button>
              </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* ADVANCED SIDEBAR (Desktop) */}
          <aside className="hidden lg:block w-[300px] shrink-0">
             <div className="sticky top-44 space-y-12">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Curation Palette</h3>
                    <button onClick={clearFilters} className="text-[10px] font-bold text-gray-600 hover:text-white transition-colors">Reset All</button>
                </div>

                <div className="space-y-10">
                    {/* Manufacturer Select */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <LayoutList className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Manufacturer
                        </label>
                        <div className="relative">
                            <button 
                                onClick={() => setIsMakeOpen(!isMakeOpen)}
                                className={`w-full bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border transition-all duration-300 rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-between group outline-none ${
                                    isMakeOpen 
                                    ? 'border-[#C69320] shadow-[0_0_20px_rgba(198,147,32,0.15)] ring-1 ring-[#C69320]/20' 
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className={`truncate ${filters.make ? "text-white" : "text-gray-500"}`}>
                                    {filters.make || "All Makers"}
                                </span>
                                <motion.div
                                    animate={{ rotate: isMakeOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <ChevronDown className="w-4 h-4 text-[#D4AF37]/70" strokeWidth={2.5} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isMakeOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsMakeOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                                            className="absolute left-0 mt-3 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl max-h-72 overflow-y-auto custom-scrollbar no-scrollbar"
                                            style={{ transformOrigin: 'top center' }}
                                            data-lenis-prevent="true"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            <motion.div
                                                initial="hidden"
                                                animate="show"
                                                variants={{
                                                    show: {
                                                        transition: { staggerChildren: 0.03 }
                                                    }
                                                }}
                                            >
                                                <motion.button
                                                    variants={{
                                                        hidden: { opacity: 0, x: -10 },
                                                        show: { opacity: 1, x: 0 }
                                                    }}
                                                    onClick={() => {
                                                        handleFilterChange('make', '');
                                                        setIsMakeOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${
                                                        filters.make === '' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    All Makers
                                                </motion.button>
                                                {filterOptions.makes.map(m => (
                                                    <motion.button
                                                        variants={{
                                                            hidden: { opacity: 0, x: -10 },
                                                            show: { opacity: 1, x: 0 }
                                                        }}
                                                        key={m}
                                                        onClick={() => {
                                                            handleFilterChange('make', m);
                                                            setIsMakeOpen(false);
                                                        }}
                                                        className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${
                                                            filters.make === m ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {m}
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Body Type Select */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Body Architecture
                        </label>
                        <div className="relative">
                            <button 
                                onClick={() => setIsBodyTypeOpen(!isBodyTypeOpen)}
                                className={`w-full bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border transition-all duration-300 rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-between group outline-none ${
                                    isBodyTypeOpen 
                                    ? 'border-[#C69320] shadow-[0_0_20px_rgba(198,147,32,0.15)] ring-1 ring-[#C69320]/20' 
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className={`truncate ${filters.bodyType ? "text-white" : "text-gray-500"}`}>
                                    {filters.bodyType || "All Styles"}
                                </span>
                                <motion.div
                                    animate={{ rotate: isBodyTypeOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <ChevronDown className="w-4 h-4 text-[#D4AF37]/70" strokeWidth={2.5} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isBodyTypeOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsBodyTypeOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                                            className="absolute left-0 mt-3 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl max-h-72 overflow-y-auto custom-scrollbar no-scrollbar"
                                            style={{ transformOrigin: 'top center' }}
                                            data-lenis-prevent="true"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            <motion.div
                                                initial="hidden"
                                                animate="show"
                                                variants={{
                                                    show: {
                                                        transition: { staggerChildren: 0.03 }
                                                    }
                                                }}
                                            >
                                                <motion.button
                                                    variants={{
                                                        hidden: { opacity: 0, x: -10 },
                                                        show: { opacity: 1, x: 0 }
                                                    }}
                                                    onClick={() => {
                                                        handleFilterChange('bodyType', '');
                                                        setIsBodyTypeOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${
                                                        filters.bodyType === '' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    All Styles
                                                </motion.button>
                                                {filterOptions.bodyTypes.map(m => (
                                                    <motion.button
                                                        variants={{
                                                            hidden: { opacity: 0, x: -10 },
                                                            show: { opacity: 1, x: 0 }
                                                        }}
                                                        key={m}
                                                        onClick={() => {
                                                            handleFilterChange('bodyType', m);
                                                            setIsBodyTypeOpen(false);
                                                        }}
                                                        className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${
                                                            filters.bodyType === m ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {m}
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Transmission Select */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <Settings2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Performance
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                             {['Automatic', 'Manual'].map(t => (
                                 <button
                                    key={t}
                                    onClick={() => handleFilterChange('transmission', filters.transmission === t ? '' : t)}
                                    className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left border ${
                                        filters.transmission === t 
                                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]' 
                                        : 'bg-white/5 border-transparent text-gray-500 hover:text-white'
                                    }`}
                                 >
                                    {t} Transmission
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Investment Range */}
                    <div className="space-y-6 pt-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500">Max Investment</label>
                            <span className="text-sm font-black text-[#D4AF37]">LKR {(filters.maxPrice / 1000000).toFixed(0)}M</span>
                        </div>
                        <input 
                            type="range" 
                            min="1000000" 
                            max="150000000" 
                            step="5000000" 
                            value={filters.maxPrice} 
                            onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))} 
                            className="w-full h-1 bg-white/5 accent-[#D4AF37] appearance-none rounded-full cursor-pointer"
                        />
                         <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                            <span>1M</span>
                            <span>150M</span>
                        </div>
                    </div>
                </div>
             </div>
          </aside>

          {/* MAIN GRID */}
          <main className="flex-1">
             <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Verified <span className="text-gray-500">Assets</span></h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                        {filteredCars.length} Handpicked Results
                    </p>
                </div>
                
                <button 
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-all bg-white/5 px-4 py-2 rounded-xl group"
                >
                    {viewMode === 'grid' ? (
                        <>
                            <LayoutList className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">List View</span>
                        </>
                    ) : (
                        <>
                            <Grid2X2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Grid View</span>
                        </>
                    )}
                </button>
             </div>

             <motion.div 
                layout
                className={`grid gap-10 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'}`}
             >
                <AnimatePresence mode="popLayout">
                    {filteredCars.length > 0 ? (
                        filteredCars.map((car, idx) => (
                            <motion.div
                                key={car.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ 
                                    duration: 0.8, 
                                    delay: idx * 0.05,
                                    ease: [0.16, 1, 0.3, 1] 
                                }}
                            >
                                <CarCard car={car} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-40 flex flex-col items-center text-center space-y-12 bg-white/[0.02] border border-white/5 rounded-[40px] px-10"
                        >
                            <div className="p-8 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                                <Search className="w-12 h-12 text-[#D4AF37] opacity-40" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">Bespoke sourcing <br /> <span className="text-[#D4AF37]">Required</span></h3>
                                <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
                                    Our current collection does not meet these exact specifications. Allow our specialists to hunt your ideal masterpiece.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button onClick={clearFilters} className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#D4AF37] hover:scale-105 transition-all">
                                    Clear Parameters
                                </button>
                                <a href="https://wa.me/94756363427" className="group flex items-center gap-4 px-10 py-5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-[#D4AF37]/40 transition-all">
                                    Concierge Request
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </motion.div>
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER FILTERS */}
      <AnimatePresence>
          {isMobileFilterOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 inset-x-0 h-[85vh] bg-[#0d0b09] rounded-t-[40px] border-t border-[#D4AF37]/20 p-8 flex flex-col overflow-hidden"
                  >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[#D4AF37]">Advanced <span className="text-white">Curation</span></h3>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-3 bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-12 pb-12">
                            {/* Mobile Filters Content - Reusing sidebar logic but larger for touch */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Manufacturer</label>
                                    <select 
                                        value={filters.make}
                                        onChange={(e) => handleFilterChange('make', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-bold"
                                    >
                                        <option value="">All Maker</option>
                                        {filterOptions.makes.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Price Threshold</label>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-black italic">LKR {(filters.maxPrice / 1000000).toFixed(0)}M</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1000000" 
                                        max="150000000" 
                                        step="5000000" 
                                        value={filters.maxPrice} 
                                        onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))} 
                                        className="w-full h-2 rounded-full bg-white/10 accent-[#D4AF37] appearance-none"
                                    />
                                </div>

                                {/* Transmission, Fuel etc */}
                                <div className="grid grid-cols-2 gap-4">
                                    {filterOptions.fuels.map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => handleFilterChange('fuel', filters.fuel === f ? '' : f)}
                                            className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                filters.fuel === f ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 border-white/5 text-gray-500'
                                            }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 grid grid-cols-2 gap-4">
                            <button onClick={clearFilters} className="py-5 font-black uppercase text-[10px] tracking-widest border border-white/10 rounded-2xl">Reset</button>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="py-5 bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl">Show Results</button>
                        </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
