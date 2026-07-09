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
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import SEO from '../components/SEO';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Car } from '../data/types';
import { getInitialInventory, mapLiveVehicles } from '../lib/inventory';
import Loader from '../components/Loader';
import { SHOWROOM_IMAGES } from '../data/showroomImages';
import { createInventoryItemListSchema } from '../lib/seo';
import { BrandMark, getBrandLabel, getDisplayModel } from '../components/brand/BrandMark';
export default function Inventory() {
  const [searchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get('q') || searchParams.get('model') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cars, setCars] = useState<Car[]>(getInitialInventory);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  
  const [filters, setFilters] = useState({
    condition: searchParams.get('condition') || 'all',
    make: searchParams.get('make') ? getBrandLabel(searchParams.get('make')) : '',
    model: searchParams.get('model') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    maxPrice: Number(searchParams.get('maxPrice')) || 150000000
  });

  const [sortBy, setSortBy] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMakeOpen, setIsMakeOpen] = useState(false);
  const [isBodyTypeOpen, setIsBodyTypeOpen] = useState(false);
  const [isFuelOpen, setIsFuelOpen] = useState(false);

  const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

  const filterOptions = useMemo(() => {
    const makes = Array.from(new Set(cars.map(c => getBrandLabel(c.make)).filter(Boolean))).sort();
    const bodyTypes = Array.from(new Set(cars.map(c => c.bodyType).filter(Boolean))).sort();
    const fuels = Array.from(new Set([
      ...FUEL_OPTIONS,
      ...cars.map(c => c.fuel).filter(Boolean),
    ])).sort();
    const transmissions = Array.from(new Set(cars.map(c => c.transmission).filter(Boolean))).sort();
    
    return { makes, bodyTypes, fuels, transmissions };
  }, [cars]);

  const fetchLiveVehicles = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (!error) {
        setCars(mapLiveVehicles(data));
      }
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    fetchLiveVehicles();

    // Realtime: re-fetch whenever anything changes in 'cars'
    const channel = supabase
      .channel('inventory-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, fetchLiveVehicles)
      .subscribe();

    return () => { void channel.unsubscribe(); };
  }, []);

  // Sync filters with URL parameters when they change
  useEffect(() => {
    setFilters({
      condition: searchParams.get('condition') || 'all',
      make: searchParams.get('make') ? getBrandLabel(searchParams.get('make')) : '',
      model: searchParams.get('model') || '',
      bodyType: searchParams.get('bodyType') || '',
      fuel: searchParams.get('fuel') || '',
      transmission: searchParams.get('transmission') || '',
      maxPrice: Number(searchParams.get('maxPrice')) || 150000000
    });
    const nextSearchQuery = searchParams.get('q') || searchParams.get('model') || '';
    setSearchQuery(nextSearchQuery);
  }, [searchParams]);

  const filteredCars = useMemo(() => {
    let result = [...cars];
    
    // Search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(v => 
            getBrandLabel(v.make).toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            getDisplayModel(v.make, v.model).toLowerCase().includes(query) ||
            v.year.toString().includes(query)
        );
    }

    // Dropdown filters
    if (filters.condition !== 'all') {
      result = result.filter(v => v.condition.toLowerCase() === filters.condition.toLowerCase());
    }
    if (filters.make) {
      result = result.filter(v => getBrandLabel(v.make).toLowerCase() === filters.make.toLowerCase());
    }
    if (filters.model) {
      result = result.filter(v => getDisplayModel(v.make, v.model).toLowerCase() === filters.model.toLowerCase());
    }
    if (filters.bodyType) {
      const bt = (v: any) => (v.bodyType || v.body_type || '').toLowerCase();
      result = result.filter(v => bt(v) === filters.bodyType.toLowerCase());
    }
    if (filters.fuel) {
      result = result.filter(v => (v.fuel || '').toLowerCase() === filters.fuel.toLowerCase());
    }
    if (filters.transmission) {
      result = result.filter(v => (v.transmission || '').toLowerCase() === filters.transmission.toLowerCase());
    }
    result = result.filter(v => (v.price || 0) <= filters.maxPrice);

    // Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'Newest First') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === 'Mileage: Low to High') {
      result.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
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
      model: '',
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
      <SEO 
        title="Imported Cars for Sale in Sri Lanka"
        description="Browse Serendib Trading's inspected vehicle inventory in Sri Lanka with filters for make, body type, fuel, transmission, mileage, and budget."
        canonical="/inventory"
        pageType="CollectionPage"
        ogImage={SHOWROOM_IMAGES[3].src}
        ogImageAlt="Serendib Trading showroom inventory display"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Inventory', path: '/inventory' },
        ]}
        keywords={[
          'cars for sale Sri Lanka',
          'imported cars for sale',
          'registered vehicles Sri Lanka',
          'reconditioned cars Sri Lanka',
          'Serendib Trading inventory',
        ]}
        structuredData={createInventoryItemListSchema(filteredCars)}
      />
      <main>

      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden md:h-[65vh]">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <img 
              src={SHOWROOM_IMAGES[3].src} 
              className="w-full h-full object-cover" 
              alt="Serendib Trading showroom with vehicles displayed indoors" 
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/80 via-transparent to-[#0d0b09]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09] opacity-60" />
          {/* Hero Depth Outline */}
          <div className="absolute inset-0 border border-white/5 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 flex flex-col items-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-center space-y-7 md:space-y-8"
          >
            <div className="inline-flex max-w-full items-center justify-center gap-3 px-4 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 sm:gap-4 sm:px-6">
              <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-center text-[#D4AF37] font-black uppercase tracking-[0.22em] text-[10px] sm:tracking-[0.4em]">The Showroom Collection</span>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight md:tracking-[-0.08em] leading-[0.92] uppercase text-wrap-balance">
              Available <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]">Inventory</span>
            </h1>
            <div className="mx-auto max-w-[21.5rem] space-y-8 px-1 sm:max-w-xl">
              <p
                className="max-w-full whitespace-normal break-words text-sm font-medium leading-7 text-gray-400 md:text-lg md:leading-relaxed"
                style={{ overflowWrap: 'break-word', textWrap: 'wrap' }}
              >
                <span className="block sm:inline">Browse inspected vehicles currently listed by </span>
                <span className="block sm:inline">Serendib Trading, with filters built for how </span>
                <span className="block sm:inline">Sri Lankan buyers actually compare cars.</span>
              </p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 pt-4 tabular-nums">
                {[
                  { label: "Vehicles", val: "40+" },
                  { label: "Makes Listed", val: "12" },
                  { label: "Record Checks", val: "100%" }
                ].map((s, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-black text-white">{s.val}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/60">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Scroll Hint - CSS animation for better performance */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 animate-bounce-slow">
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* --- MAIN CURATION LAYOUT --- */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 pb-24 md:pb-28">
        
        {/* Sticky Filters Bar */}
        <div className="sticky top-20 z-40 mb-16 py-6 border-b border-white/5 bg-[#0d0b09]/95">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Search Field */}
              <div className="relative group w-full lg:max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="text"
                  aria-label="Search vehicles"
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
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg active:scale-[0.96] ${
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
                            type="button"
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            aria-expanded={isSortOpen}
                            aria-haspopup="menu"
                            className="flex items-center gap-2 text-[11px] font-black text-white hover:text-[#D4AF37] transition-all uppercase tracking-widest outline-none group active:scale-[0.98]"
                        >
                            {sortBy === 'Newest First' ? 'Latest Arrival' :
                             sortBy === 'Price: Low to High' ? 'Value: Low → High' :
                             sortBy === 'Price: High to Low' ? 'Value: High → Low' :
                             'Mileage: Low → High'}
                            <ChevronDown className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                                        className="absolute right-0 mt-4 w-56 bg-[#0d0b09] border border-white/10 rounded-2xl p-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
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
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Filter Panel</h3>
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
                                className={`w-full bg-white/[0.03] hover:bg-white/[0.08] border transition-all duration-300 rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-between group outline-none active:scale-[0.98] ${
                                    isMakeOpen 
                                    ? 'border-[#C69320] shadow-[0_0_20px_rgba(198,147,32,0.15)] ring-1 ring-[#C69320]/20' 
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    {filters.make && (
                                        <BrandMark
                                            make={filters.make}
                                            tone="mono"
                                            className="size-5 shrink-0 text-white/50"
                                        />
                                    )}
                                    <span className={`truncate ${filters.make ? "text-white" : "text-gray-500"}`}>
                                        {filters.make || "All Makers"}
                                    </span>
                                </span>
                                <ChevronDown className={`w-4 h-4 text-[#D4AF37]/70 transition-transform duration-300 ${isMakeOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                            </button>

                            <AnimatePresence>
                                {isMakeOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsMakeOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                                            className="absolute left-0 mt-3 w-full bg-[#0d0b09] border border-white/10 rounded-2xl p-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-h-72 overflow-y-auto no-scrollbar"
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
                                                    <span className="flex items-center gap-3">
                                                        <span className="size-5 rounded-full border border-white/10 bg-white/[0.04]" />
                                                        All Makers
                                                    </span>
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
                                                        <span className="flex items-center gap-3">
                                                            <BrandMark
                                                                make={m}
                                                                tone="mono"
                                                                className="size-5 shrink-0 text-white/45"
                                                            />
                                                            <span className="truncate">{m}</span>
                                                        </span>
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
                                className={`w-full bg-white/[0.03] hover:bg-white/[0.08] border transition-all duration-300 rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-between group outline-none active:scale-[0.98] ${
                                    isBodyTypeOpen 
                                    ? 'border-[#C69320] shadow-[0_0_20px_rgba(198,147,32,0.15)] ring-1 ring-[#C69320]/20' 
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className={`truncate ${filters.bodyType ? "text-white" : "text-gray-500"}`}>
                                    {filters.bodyType || "All Styles"}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-[#D4AF37]/70 transition-transform duration-300 ${isBodyTypeOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                            </button>

                            <AnimatePresence>
                                {isBodyTypeOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsBodyTypeOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                                            className="absolute left-0 mt-3 w-full bg-[#0d0b09] border border-white/10 rounded-2xl p-2 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-h-72 overflow-y-auto no-scrollbar"
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

                    {/* Fuel Type Select */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <Fuel className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Fuel Type
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {FUEL_OPTIONS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange('fuel', filters.fuel === f ? '' : f)}
                                    className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left border ${
                                        filters.fuel === f
                                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]'
                                        : 'bg-white/5 border-transparent text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
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

                    {/* Budget Range */}
                    <div className="space-y-6 pt-6">
                        <div className="flex items-center justify-between">
                            <label htmlFor="inventory-max-price-desktop" className="text-[10px] font-black tracking-widest uppercase text-gray-500">Max Budget</label>
                            <span className="text-sm font-black text-[#D4AF37] tabular-nums">LKR {(filters.maxPrice / 1000000).toFixed(0)}M</span>
                        </div>
                        <input
                            id="inventory-max-price-desktop"
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
             <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Verified <span className="text-gray-500">Vehicles</span></h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                        {filteredCars.length} Handpicked Results
                    </p>
                </div>
                
                <button 
                    type="button"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-gray-400 transition-all hover:text-[#D4AF37] active:scale-[0.96] sm:w-auto"
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
                className={`grid gap-10 will-change-transform ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'}`}
             >
                <AnimatePresence mode="popLayout" initial={false}>
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
                                <h3 className="text-4xl font-black uppercase tracking-tighter">No Matching <br /> <span className="text-[#D4AF37]">Vehicles</span></h3>
                                <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
                                    Adjust the filters or send us the make, model, and budget you are looking for.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button onClick={clearFilters} className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#D4AF37] hover:scale-105 transition-all">
                                    Clear Filters
                                </button>
                                <a href="https://wa.me/94756363427" className="group flex items-center gap-4 px-10 py-5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-[#D4AF37]/40 transition-all">
                                    Message Us
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
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#D4AF37]">Vehicle <span className="text-white">Filters</span></h3>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-3 bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-12 pb-12">
                            <div className="space-y-10">
                                {/* Manufacturer */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                                        <LayoutList className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Manufacturer
                                    </label>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsMakeOpen(!isMakeOpen)}
                                            className={`w-full bg-white/[0.03] border transition-all rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-between ${
                                                isMakeOpen ? 'border-[#C69320]' : 'border-white/10'
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                {filters.make && (
                                                    <BrandMark
                                                        make={filters.make}
                                                        tone="mono"
                                                        className="size-5 shrink-0 text-white/50"
                                                    />
                                                )}
                                                <span className={`truncate ${filters.make ? 'text-white' : 'text-gray-500'}`}>{filters.make || 'All Makers'}</span>
                                            </span>
                                            <motion.div animate={{ rotate: isMakeOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                <ChevronDown className="w-4 h-4 text-[#D4AF37]/70" strokeWidth={2.5} />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence>
                                            {isMakeOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsMakeOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute left-0 mt-3 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl max-h-60 overflow-y-auto"
                                                    >
                                                        <button onClick={() => { handleFilterChange('make', ''); setIsMakeOpen(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${ filters.make === '' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:bg-white/5' }`}>
                                                            <span className="flex items-center gap-3">
                                                                <span className="size-5 rounded-full border border-white/10 bg-white/[0.04]" />
                                                                All Makers
                                                            </span>
                                                        </button>
                                                        {filterOptions.makes.map(m => (
                                                            <button key={m} onClick={() => { handleFilterChange('make', m); setIsMakeOpen(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${ filters.make === m ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:bg-white/5' }`}>
                                                                <span className="flex items-center gap-3">
                                                                    <BrandMark
                                                                        make={m}
                                                                        tone="mono"
                                                                        className="size-5 shrink-0 text-white/45"
                                                                    />
                                                                    <span className="truncate">{m}</span>
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Body Type */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                                        <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Body Architecture
                                    </label>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsBodyTypeOpen(!isBodyTypeOpen)}
                                            className={`w-full bg-white/[0.03] border transition-all rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-between ${
                                                isBodyTypeOpen ? 'border-[#C69320]' : 'border-white/10'
                                            }`}
                                        >
                                            <span className={filters.bodyType ? 'text-white' : 'text-gray-500'}>{filters.bodyType || 'All Styles'}</span>
                                            <motion.div animate={{ rotate: isBodyTypeOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                <ChevronDown className="w-4 h-4 text-[#D4AF37]/70" strokeWidth={2.5} />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence>
                                            {isBodyTypeOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsBodyTypeOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute left-0 mt-3 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl max-h-60 overflow-y-auto"
                                                    >
                                                        <button onClick={() => { handleFilterChange('bodyType', ''); setIsBodyTypeOpen(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${ filters.bodyType === '' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:bg-white/5' }`}>All Styles</button>
                                                        {filterOptions.bodyTypes.map(m => (
                                                            <button key={m} onClick={() => { handleFilterChange('bodyType', m); setIsBodyTypeOpen(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${ filters.bodyType === m ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/80 hover:bg-white/5' }`}>{m}</button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Fuel Type */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                                        <Fuel className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Fuel Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {FUEL_OPTIONS.map(f => (
                                            <button
                                                key={f}
                                                onClick={() => handleFilterChange('fuel', filters.fuel === f ? '' : f)}
                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    filters.fuel === f ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                                                }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Transmission */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                                        <Settings2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Transmission
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Automatic', 'Manual'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => handleFilterChange('transmission', filters.transmission === t ? '' : t)}
                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    filters.transmission === t ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Threshold */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="inventory-max-price-mobile" className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Max Budget</label>
                                        <span className="text-sm font-black text-[#D4AF37]">LKR {(filters.maxPrice / 1000000).toFixed(0)}M</span>
                                    </div>
                                    <input
                                        id="inventory-max-price-mobile"
                                        type="range"
                                        min="1000000"
                                        max="150000000"
                                        step="5000000"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                                        className="w-full h-2 rounded-full bg-white/10 accent-[#D4AF37] appearance-none"
                                    />
                                    <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                        <span>1M</span>
                                        <span>150M</span>
                                    </div>
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

      </main>

      <Footer />
    </div>
  );
}
