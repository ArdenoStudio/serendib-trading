import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform, cubicBezier } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Trophy, Globe, Gauge, CreditCard, FileCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroSearch from '../components/HeroSearch';
import BrandLogoStrip from '../components/BrandLogoStrip';
import CarCard from '../components/CarCard';
import WhatsAppFloat from '../components/WhatsAppFloat';
const TestimonialsSection = lazy(() => import('../components/ui/testimonial-v2').then(m => ({ default: m.TestimonialsSection })));
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { BrandIcons } from '../components/ui/brand-icons';
import { LocationTag } from '../components/ui/location-tag';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'New' | 'Registered'>('Registered');
  const [cars, setCars] = useState<Car[]>(carsData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveVehicles = async () => {
      const { data, error } = await supabase.from('cars').select('*');
      if (!error && data) {
        setCars(data);
      }
    };
    fetchLiveVehicles();
  }, []);

  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const customEase = cubicBezier(0.16, 1, 0.3, 1);

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15], { ease: customEase });
  const bgBlur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(12px)"], { ease: customEase });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150], { ease: customEase });
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0], { ease: customEase });

  const filteredCars = (cars.length > 0 ? cars : carsData as Car[])
    .filter(car => car.condition === activeTab && !car.is_sold)
    .slice(0, 4);

  return (
    <div className="min-h-screen overflow-x-hidden font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative flex flex-col pt-10"
        style={{
          minHeight: '100dvh',
          marginTop: '72px',
        }}
      >
        {/* Background Image Wrapper (Traps scale overflow) */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {/* Background Image with Dark Overlay */}
          <motion.div
            className="absolute inset-0 origin-center"
            style={{
              backgroundImage: 'url("/images/hero_bg-v2.webp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              scale: bgScale,
              filter: bgBlur,
              willChange: "transform, filter",
              imageRendering: 'auto'
            }}
          >
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black z-[1]" />
            
            {/* Luxury Noise Grain Overlay */}
            <div className="absolute inset-0 bg-noise z-[2]" />

            {/* Luxury Subtle Grid Overlay */}
            <div 
               className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-[3]" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px' 
               }} 
            />
          </motion.div>

        </div>

        <div className="relative z-10 flex flex-col justify-start w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 lg:pt-14 shrink-0">
          {/* Ambient Deep Gold Glow (Behind Text) */}
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#D4AF37] rounded-full mix-blend-screen opacity-[0.07] blur-[150px] pointer-events-none -translate-y-1/2 z-0" />

          {/* Left-Aligned Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.2 }}
            style={{ opacity: textOpacity }}
            className="flex flex-col max-w-[800px] relative z-10"
          >
            {/* Top Status Bar: Eyebrow */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">

              {/* Elegant Eyebrow */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-3 px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded-full backdrop-blur-md w-max"
              >
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-[#D4AF37]"></span>
                </span>
                <p className="uppercase tracking-[0.2em] font-bold text-[#D4AF37] text-[10px] md:text-xs">
                  Welcome to Serendib Trading
                </p>
              </motion.div>
            </div>

            {/* Massive Cinematic Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 md:mb-8 flex flex-col uppercase relative"
              style={{ textShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
            >
              <span className="text-5xl sm:text-[90px] md:text-[110px] lg:text-[140px] leading-[0.8] tracking-[-0.06em] text-white font-serif italic pr-4 drop-shadow-2xl">
                Drive
              </span>
              <span className="text-3xl sm:text-[70px] md:text-[90px] lg:text-[110px] leading-[0.85] tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-[#C69320] via-[#E5C158] to-[#C69320] ml-1 sm:ml-8 md:ml-16 font-sans font-black mt-2 lg:mt-4 drop-shadow-lg">
                Your Way.
              </span>
            </motion.h1>

            {/* Premium Description */}
            <motion.p
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-10 max-w-[500px] text-[15px] md:text-lg font-medium leading-relaxed text-white/80 drop-shadow-md text-pretty relative z-10"
            >
              The pinnacle of automotive excellence. Discover outclass performance, unparalleled luxury, and a curated selection of the world's most desired vehicles.
            </motion.p>

            {/* Dual CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-5"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/inventory"
                  className="relative overflow-hidden inline-flex items-center justify-center px-10 py-4 text-[14px] font-black tracking-[0.1em] uppercase group rounded-full shadow-[0_0_40px_-10px_rgba(212,175,55,0.6)]"
                  style={{ background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 100%)', color: '#000000' }}
                >
                  <span className="relative z-10">Explore Collection</span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LiquidButton asChild size="xl">
                  <Link
                    to="/contact"
                    className="text-[14px] font-bold tracking-[0.1em] uppercase text-white"
                  >
                    Contact Us
                  </Link>
                </LiquidButton>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle Scroll Indicator */}

        {/* Search bar — Docked at bottom of hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 mt-6 lg:mt-10 shrink-0"
        >
          <HeroSearch />
        </motion.div>
      </section>

      {/* INFINITE BRAND MARQUEE */}
      <div className="w-full mt-4 border-t border-b border-white/5 py-10 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />
        
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex items-center gap-20 whitespace-nowrap px-10"
        >
          {Array(2).fill(['MERCEDES-BENZ', 'RANGE ROVER', 'BMW', 'AUDI SPORT', 'TOYOTA GAZOO', 'LAND CRUISER', 'ROLLS-ROYCE', 'PORSCHE']).flat().map((brand, i) => (
            <span key={i} className="text-4xl md:text-6xl font-black italic tracking-tighter text-white/20 hover:text-[#D4AF37] transition-colors duration-500 cursor-default uppercase">
              {brand}
            </span>
          ))}
        </motion.div>
      </div>

      {/* BROWSE BY BODY TYPE */}
      <div className="w-full max-w-[1400px] mx-auto mt-32 px-6 lg:px-10 pb-20 z-10 relative">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">Categories</span>
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
          </motion.div>
          
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">Browse By</span>
            <h2 className="text-5xl md:text-8xl font-serif italic text-white tracking-tight leading-none drop-shadow-2xl">
              Body Type
            </h2>
          </div>
        </div>

        {/* 4-item grid — perfectly centered */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'SUV',      path: '/inventory?bodyType=SUV',      image: '/car-types/suv.png' },
            { name: 'Sedan',    path: '/inventory?bodyType=Sedan',    image: '/car-types/sedan.png' },
            { name: 'Hatchback',path: '/inventory?bodyType=Hatchback',image: '/car-types/hatchback.png' },
            { name: 'Luxury',   path: '/inventory?bodyType=Luxury',   image: '/car-types/rolls-royce.png' },
          ].map((type, idx) => (
            <motion.button
              key={type.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              onClick={() => navigate(type.path)}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Browse ${type.name} vehicles`}
              className="group relative flex flex-col items-center justify-center p-8 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl transition-all duration-500 hover:bg-white/[0.05] hover:border-[#D4AF37]/40 h-full min-h-[220px] overflow-hidden"
            >
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full flex items-center justify-center mb-8">
                  <img
                    src={type.image}
                    alt={`${type.name} body type`}
                    width={160}
                    height={80}
                    loading="lazy"
                    className="max-h-20 w-auto object-contain opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 invert"
                  />
                </div>
                
                <span className="text-white/60 font-black text-[11px] tracking-[0.3em] uppercase group-hover:text-white transition-colors">
                  {type.name}
                </span>

                {/* Sub-indicator */}
                <motion.div 
                  className="mt-4 w-0 h-[2px] bg-[#D4AF37] rounded-full group-hover:w-8 transition-all duration-500"
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* BROWSE BY MAKE */}
      <div className="w-full max-w-[1400px] mx-auto mt-24 px-6 lg:px-10 pb-20 z-10 relative">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">Partners</span>
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
          </motion.div>
          
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">Browse By</span>
            <h2 className="text-5xl md:text-8xl font-serif italic text-white tracking-tight leading-none drop-shadow-2xl">
              Make
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { name: 'Toyota', icon: BrandIcons.Toyota },
            { name: 'Honda', icon: BrandIcons.Honda },
            { name: 'Suzuki', icon: BrandIcons.Suzuki },
            { name: 'Nissan', icon: BrandIcons.Nissan },
            { name: 'Mitsubishi', icon: BrandIcons.Mitsubishi },
            { name: 'Mercedes', icon: BrandIcons.Mercedes },
            { name: 'BMW', icon: BrandIcons.BMW },
            { name: 'Land Rover', icon: BrandIcons.LandRover },
            { name: 'Mazda', icon: BrandIcons.Mazda },
            { name: 'Hyundai', icon: BrandIcons.Hyundai },
          ].map((brand, i) => (
            <motion.button 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/inventory?make=${brand.name}`)}
              className="group relative flex flex-col items-center justify-center p-8 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl transition-all duration-500 hover:bg-white/[0.05] hover:border-[#D4AF37]/40 h-[180px] overflow-hidden"
            >
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="flex items-center justify-center w-full mb-6 text-white/40 group-hover:text-[#D4AF37] transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  <brand.icon className="w-12 h-12 object-contain transition-transform duration-700 group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50 group-hover:text-white transition-colors">
                  {brand.name}
                </span>

                {/* Sub-indicator */}
                <motion.div 
                  className="mt-4 w-0 h-[2px] bg-[#D4AF37] rounded-full group-hover:w-8 transition-all duration-500"
                />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <button 
            aria-label="View all vehicle makes"
            onClick={() => navigate('/inventory')}
            className="group px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all duration-500 flex items-center gap-4"
          >
            <span>View All Makes</span>
            <span className="text-[#D4AF37] group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
          </button>
        </div>
      </div>

      {/* FEATURED ARRIVALS CAROUSEL */}
      <div className="w-full mt-32 z-10 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">The Latest</span>
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
          </motion.div>
          
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">Explore our</span>
            <h2 className="text-5xl md:text-8xl font-serif italic text-white tracking-tight leading-none drop-shadow-2xl">
              Featured Arrivals
            </h2>
          </div>
        </div>
        
        {/* Horizontal Marquee Container */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] +mr-[50vw] overflow-hidden group py-12">
          <motion.div 
            className="flex gap-8 whitespace-nowrap px-10"
            animate={{ x: [0, -1800] }}
            transition={{ 
              repeat: Infinity, 
              duration: 30, 
              ease: "linear",
            }}
            whileHover={{ transition: { duration: 1000000 } }} // "Pause" trick
          >
            {[...carsData, ...carsData].map((car, i) => (
              <motion.div 
                key={`${car.id}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-[320px] md:w-[420px] inline-block flex-shrink-0 group/card bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[40px] overflow-hidden hover:bg-white/[0.04] hover:border-[#D4AF37]/40 transition-all duration-700 cursor-pointer relative"
                onClick={() => navigate(`/car/${car.id}`)}
              >
                {/* Image Container with Hover Zoom */}
                <div className="w-full h-64 md:h-72 overflow-hidden relative">
                  {/* Premium Year Tag */}
                  <div className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-xl border border-white/10 text-[#D4AF37] text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em]">
                    Model {car.year}
                  </div>
                  
                  <motion.img 
                    src={`${car.image}&w=600&q=70`} 
                    alt={`${car.year} ${car.make} ${car.model}`} 
                    width={420}
                    height={288}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                  />
                  
                  {/* Cinematic Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                </div>
                
                {/* Card Content */}
                <div className="p-8 md:p-10 relative">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-[1px] bg-[#D4AF37]/50" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">{car.make}</span>
                   </div>
                   
                   <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none transition-colors duration-500 group-hover/card:text-[#D4AF37]">
                    {car.model}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-1">Price Guide</span>
                      <span className="text-2xl font-black text-white tracking-tighter">
                        LKR {(car.price/1000000).toFixed(1)}M
                      </span>
                    </div>
                    
                    <motion.div 
                      whileHover={{ x: 5 }}
                      aria-label="View car details"
                      className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]"
                    >
                      <span className="hidden md:block">Details</span>
                      <div className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover/card:bg-[#D4AF37] group-hover/card:text-black transition-all duration-500">
                        &rarr;
                      </div>
                    </motion.div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-[#D4AF37]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* ===== FEATURED LISTINGS (MOVED UP) ===== */}

      <div className="w-full mt-32 z-10 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">The Collection</span>
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
          </motion.div>
          
          <div className="flex flex-col items-center mb-12">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">Discover our</span>
            <h2 className="text-5xl md:text-8xl font-serif italic text-white tracking-tight leading-none drop-shadow-2xl">
              Available Inventory
            </h2>
          </div>

          {/* Premium Tab Switcher */}
          <div className="flex p-1 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full mb-20 relative overflow-hidden w-full max-w-[400px]">
            <div 
              className="absolute inset-y-1 bg-white shadow-xl rounded-full transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)]"
              style={{
                width: 'calc(50% - 4px)',
                left: activeTab === 'Registered' ? '4px' : 'calc(50%)',
              }}
            />
            
            {(['Registered', 'New'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-label={`View ${tab} inventory`}
                className={`relative z-10 flex-1 px-8 py-4 text-[11px] font-black tracking-[0.3em] uppercase transition-colors duration-500 ${
                  activeTab === tab ? 'text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>

          <div className="mt-24 flex justify-center">
            <Link
              to="/inventory"
              className="group relative px-12 py-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-[#D4AF37]/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="flex items-center gap-6">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 group-hover:text-white transition-colors">
                  View Full Collection
                </span>
                <span className="text-[#D4AF37] text-xl group-hover:translate-x-2 transition-transform duration-500">&rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* STORY / HERITAGE SECTION */}
      <section className="py-32 mt-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col items-center">
          {/* Centered Heading */}
          <div className="flex flex-col items-center text-center mb-16 max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">The Heritage</span>
              <div className="w-12 h-[1px] bg-[#D4AF37]" />
            </motion.div>
            
            <h2 className="text-4xl md:text-7xl font-serif italic text-white tracking-tight leading-none drop-shadow-2xl">
              Crafting the Ultimate <br /> <span className="text-white">Automotive Experience</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
              {/* Refined Bracket Accents */}
              <div className="absolute -top-6 -left-6 w-32 h-32 border-t border-l border-[#D4AF37]/30" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b border-r border-[#D4AF37]/30" />
              
              <img 
                src="/images/heritage.png" 
                alt="Serendib Trading Heritage" 
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-[600px] object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5"
              />
              
              {/* EST. 2010 Badge */}
              <div className="absolute -bottom-4 left-10 bg-[#D4AF37] p-10 shadow-2xl">
                <p className="text-black font-black text-5xl uppercase tracking-tighter leading-none">EST.<br />2010</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-10"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-[#D4AF37]" />
                  <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-xs">Our Legacy</p>
                </div>
                <p className="text-gray-300 text-xl font-light leading-relaxed">
                  For over a decade, <span className="text-white font-medium italic">Serendib Trading</span> has been the beacon of excellence in Sri Lanka's automotive landscape. We don't just sell cars; we curate masterpieces that define your journey. 
                </p>
                <p className="text-gray-400 text-lg font-light leading-relaxed">
                  Our direct-import model from the UK and Japan ensures that every vehicle meets rigorous international standards, bringing global luxury to your doorstep with uncompromising transparency and performance.
                </p>
              </div>

              <div className="pt-6">
                <Link to="/about" className="group relative inline-flex items-center px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center gap-4">
                    Learn History <span className="text-[#D4AF37] group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRADE-IN SECTION (DARK) ===== */}
      {/* ===== TRADE-IN SECTION (DARK) ===== */}
      <section className="py-32 relative overflow-hidden text-center bg-[#020617]">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">Exchange & Trade-In</span>
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
          </motion.div>

          <h2 className="text-4xl md:text-7xl font-serif italic text-white tracking-tight leading-none mb-8">
            Upgrade Your Drive
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-12">
            Considering an upgrade? We offer competitive, fair evaluation for your current vehicle against our premium collection.
          </p>

          <motion.a
            href={`https://wa.me/94756363427?text=${encodeURIComponent("Hi Serendib Trading! I'm interested in trading in my current vehicle. Can we arrange an evaluation?")}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-12 py-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-[#D4AF37]/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] text-white/70 group-hover:text-white transition-colors">
              Get Evaluation via WhatsApp
            </span>
          </motion.a>
        </div>
      </section>

      {/* WHY CHOOSE US - TRUST PILLARS */}
      <div className="w-full mt-40 pb-40 z-10 relative overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.03)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col items-center">
          {/* Centered Heading */}
          <div className="flex flex-col items-center text-center mb-24 max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-12 h-[1px] bg-[#D4AF37]" />
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-[#D4AF37]">Our Values</span>
              <div className="w-12 h-[1px] bg-[#D4AF37]" />
            </motion.div>
            
            <h2 className="text-4xl md:text-7xl font-serif italic text-white tracking-tight leading-none mb-8 drop-shadow-2xl">
              Why Choose <span className="text-[#D4AF37]">Serendib</span>
            </h2>
            
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              We deliver uncompromising quality, transparent vehicle histories, and a seamless buying experience from global selection to your driveway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {[
              { title: "Direct Global Imports", desc: "Sourced strictly from trusted, certified partners in the UK & Japan.", icon: Globe },
              { title: "100% Verified Mileage", desc: "Guaranteed authentic mileage with full documented international history.", icon: Gauge },
              { title: "Premium Finance", desc: "Exclusive leasing and flexible financing packages tailored to you.", icon: CreditCard },
              { title: "Hassle-Free RMV", desc: "We professionally handle all clearance, registration, and documentation.", icon: FileCheck },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative flex flex-col items-center text-center p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[40px] hover:border-[#D4AF37]/40 shadow-2xl transition-all duration-700"
                >
                  {/* Decorative Icon Glow */}
                  <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 relative transition-all duration-500 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                    <Icon className="w-8 h-8 text-white/40 group-hover:text-[#D4AF37] transition-colors duration-500" />
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-3 tracking-wide transition-colors duration-500 group-hover:text-[#F3D67E]">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 text-[13px] font-light leading-relaxed max-w-[220px]">
                    {feature.desc}
                  </p>

                  {/* Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>


      {/* ===== TESTIMONIALS (Lazy Loaded) ===== */}
      <Suspense fallback={<div className="h-40 bg-black/20" />}>
        <TestimonialsSection />
      </Suspense>

      {/* ===== CONTACT CTA (CINEMATIC) ===== */}
      <section className="py-24 relative overflow-hidden bg-[#020617] border-t border-white/5">
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-10 md:p-16 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[40px] shadow-2xl overflow-hidden group">
            {/* Animated Light Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] pointer-events-none" />

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
                Ready to find <br className="hidden md:block"/> your <span className="text-[#D4AF37]">dream car?</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Visit our showroom or contact our specialists for a personalized consultation today.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 shrink-0 relative z-10 w-full lg:w-auto">
              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37] mb-3 opacity-70">Expert Consultation</span>
                <a 
                  href="tel:0756363427" 
                  className="text-3xl md:text-5xl font-black text-white hover:text-[#F3D67E] transition-all duration-500 tracking-tighter drop-shadow-lg"
                >
                  075 636 3427
                </a>
              </div>

              {/* Elegant Vertical Divider */}
              <div className="w-px h-16 bg-white/10 hidden md:block" />
              <div className="h-px w-full bg-white/10 md:hidden" />

              <div 
                className="flex items-center"
                style={{
                  '--color-foreground': '#000000',
                  '--color-secondary': '#D4AF37',
                  '--color-border': 'rgba(212,175,55,0.3)',
                } as any}
              >
                <LocationTag />
              </div>
            </div>
          </div>
        </div>
      </section>


      <Suspense fallback={<div className="h-60 bg-black" />}>
        <Footer />
      </Suspense>
      <WhatsAppFloat />
    </div>
  );
}
