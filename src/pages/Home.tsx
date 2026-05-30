import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform, cubicBezier, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Trophy, Globe, Gauge, CreditCard, FileCheck } from 'lucide-react';

import CarCard from '../components/CarCard';
import FAQAccordion, { serendibFaqs } from '../components/FAQAccordion';
import InstagramShowcase from '../components/InstagramShowcase';
import Footer from '../components/Footer';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { BrandIcons } from '../components/ui/brand-icons';
import { LocationTag } from '../components/ui/location-tag';
import SEO from '../components/SEO';
import { HERO_SHOWROOM_SLIDES } from '../data/showroomImages';
import { createFAQSchema, createOrganizationSchema, createWebsiteSchema } from '../lib/seo';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'New' | 'Registered'>('Registered');
  const [cars, setCars] = useState<Car[]>(carsData);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const navigate = useNavigate();

  const fetchLiveVehicles = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setCars(data);
      }
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchLiveVehicles();

    // Realtime: re-fetch whenever anything changes
    const channel = supabase
      .channel('home-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, fetchLiveVehicles)
      .subscribe();

    return () => { void channel.unsubscribe(); };
  }, []);

  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const shouldReduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = React.useState(false);
  React.useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % HERO_SHOWROOM_SLIDES.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  const customEase = cubicBezier(0.16, 1, 0.3, 1);

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15], { ease: customEase });
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0], { ease: customEase });
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.12, 0.84]);

  const filteredCars = (cars.length > 0 ? cars : carsData as Car[])
    .filter(car => car.condition === activeTab && !car.is_sold)
    .slice(0, 4);

  const currentHeroSlide = HERO_SHOWROOM_SLIDES[activeHeroSlide];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans" style={{ backgroundColor: '#0d0b09', color: '#FFFFFF' }}>
      <SEO 
        title="Imported Vehicles in Sri Lanka"
        description="Serendib Trading in Dehiwala offers inspected UK and Japan vehicle imports, clear histories, finance support, trade-in help, and showroom viewing for Sri Lankan buyers."
        canonical="/"
        ogImage="/images/showroom/serendib-showroom-floor-02.jpg"
        ogImageAlt="Serendib Trading Dehiwala showroom with imported vehicles"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
        keywords={[
          'Serendib Trading',
          'imported cars Sri Lanka',
          'Dehiwala car showroom',
          'UK Japan vehicle imports',
          'luxury cars Sri Lanka',
        ]}
        structuredData={[
          createOrganizationSchema(),
          createWebsiteSchema(),
          createFAQSchema(serendibFaqs),
        ]}
      />
      <main>

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative flex items-center justify-start"
        style={{
          minHeight: 'min(88svh, 900px)',
          marginTop: 0,
        }}
      >
        {/* Background Image Wrapper (Traps scale overflow) */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div
            className="absolute inset-0 origin-center"
            style={{
              ...(isTouch || shouldReduceMotion ? {} : { scale: bgScale, willChange: "transform" })
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={currentHeroSlide.src}
                src={currentHeroSlide.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover brightness-[0.98] contrast-[1.08] saturate-[1.03]"
                style={{ objectPosition: currentHeroSlide.objectPosition || 'center center' }}
                decoding="async"
                loading={activeHeroSlide === 0 ? 'eager' : 'lazy'}
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.015 }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>
          </motion.div>

          {/* Cinematic gradient overlays with dynamic opacity instead of blur */}
          <motion.div
            className="absolute inset-0 bg-black/45 md:bg-black/35 z-[1]"
            style={(!isTouch && !shouldReduceMotion) ? { opacity: overlayOpacity } : { opacity: 0.38 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/82 via-black/18 to-black/95 z-[2]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/36 to-black/10 z-[2]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,transparent_0%,rgba(0,0,0,0.5)_100%)] z-[2]" />

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

          {/* Logo watermark — upper right, desktop only */}
          <div className="hidden lg:block absolute top-12 right-10 z-[3] pointer-events-none">
            <img
              src="/serendib-logo-192.png"
              alt=""
              aria-hidden="true"
              className="h-20 w-auto opacity-[0.07] select-none"
            />
          </div>

          <div className="absolute bottom-8 right-6 z-[4] hidden max-w-[400px] items-center gap-4 rounded-full border border-white/10 bg-black/35 px-4 py-3 text-white shadow-2xl backdrop-blur-xl md:flex lg:right-10">
            <span className="max-w-[190px] truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
              {currentHeroSlide.caption}
            </span>
            <div className="flex items-center gap-2">
              {HERO_SHOWROOM_SLIDES.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActiveHeroSlide(index)}
                  aria-label={`Show ${slide.caption}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    activeHeroSlide === index ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-28 pb-14 md:pt-36 md:pb-20">
          {/* Ambient Deep Gold Glow (Behind Text) — desktop only */}
          <div className="hidden md:block absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#D4AF37] rounded-full mix-blend-screen opacity-[0.07] blur-[150px] pointer-events-none -translate-y-1/2 z-0" />

          {/* Left-Aligned Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.2 }}
            style={{ opacity: textOpacity }}
            className="flex w-full max-w-[calc(100vw-3rem)] flex-col relative z-10 md:max-w-[920px]"
          >
            {/* Top Status Bar: Eyebrow */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">

              {/* Elegant Eyebrow */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex max-w-full items-center gap-3 px-4 py-2.5 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded-full backdrop-blur-md sm:px-5"
              >
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-[#D4AF37]"></span>
                </span>
                <p className="text-center uppercase tracking-[0.14em] font-black text-[#D4AF37] text-[11px] sm:tracking-[0.2em]">
                  Welcome to Serendib Trading
                </p>
              </motion.div>
            </div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.3
                  }
                }
              }}
              className="mb-6 md:mb-10 flex flex-col uppercase relative"
            >
              <div className="overflow-hidden">
                <motion.span 
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: { y: 0, opacity: 1 }
                  }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.84] tracking-[-0.04em] text-white font-black font-serif italic text-wrap-balance drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                >
                  Drive
                </motion.span>
              </div>
              <div className="overflow-hidden mt-2 lg:mt-4">
                <motion.span 
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: { y: 0, opacity: 1 }
                  }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.84] tracking-[-0.04em] text-white ml-1 sm:ml-8 md:ml-16 font-black font-sans text-wrap-balance drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] md:text-transparent md:bg-clip-text md:bg-gradient-to-r md:from-[#D4AF37] md:via-[#F7E7CE] md:to-[#D4AF37]"
                >
                  Your Way.
                </motion.span>
              </div>
            </motion.h1>

            {/* Premium Description */}
            <motion.p
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.5 }}
              className="relative z-10 mb-11 w-full max-w-[22rem] whitespace-normal break-words text-[16px] font-semibold leading-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:max-w-[34rem] md:max-w-[580px] md:text-xl md:leading-9 md:text-white/82 md:drop-shadow-md"
              style={{ overflowWrap: 'break-word', textWrap: 'wrap' }}
            >
              Inspected vehicles, clear histories, and practical guidance from inquiry to handover. Browse direct UK and Japan imports ready for Sri Lankan roads.
            </motion.p>

            {/* Dual CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex w-full max-w-[21.5rem] flex-col items-stretch gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
            >
              <motion.div className="w-full sm:w-[18rem]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/inventory"
                  className="relative inline-flex h-16 w-full items-center justify-center overflow-hidden rounded-full px-8 text-center text-[15px] font-black uppercase tracking-[0.1em] shadow-[0_0_40px_-10px_rgba(212,175,55,0.6)] group"
                  style={{ background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 100%)', color: '#000000' }}
                >
                  <span className="relative z-10">Explore Collection</span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </Link>
              </motion.div>

              <motion.div className="w-full sm:w-[18rem]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LiquidButton asChild size="xl" className="h-16 w-full !px-0">
                  <Link
                    to="/contact"
                    className="h-full w-full text-[15px] font-black uppercase tracking-[0.1em] text-white"
                  >
                    Contact Us
                  </Link>
                </LiquidButton>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* BROWSE BY BODY TYPE */}
      <div className="w-full max-w-[1400px] mx-auto mt-24 px-6 lg:px-10 pb-20 z-10 relative">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-[1px] bg-white/15" />
            <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Categories</span>
            <div className="w-12 h-[1px] bg-white/15" />
          </motion.div>
          
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">Browse By</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none text-wrap-balance">
              Body Type
            </h2>
          </div>
        </div>

        {/* 6-item grid — perfectly centered */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {[
            { name: 'SUV',      path: '/inventory?bodyType=SUV',      image: '/car-types/suv.png' },
            { name: 'Sedan',    path: '/inventory?bodyType=Sedan',    image: '/car-types/sedan.png' },
            { name: 'Hatchback',path: '/inventory?bodyType=Hatchback',image: '/car-types/hatchback.png' },
            { name: 'Luxury',   path: '/inventory?bodyType=Luxury',   image: '/car-types/rolls-royce.png' },
            { name: 'MPV',      path: '/inventory?bodyType=MPV',      image: '/car-types/car.png' },
            { name: 'Crossover',path: '/inventory?bodyType=Crossover',image: '/car-types/suv.png' },
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
              className="group relative flex h-full min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-5 transition-colors duration-500 hover:border-[#D4AF37]/40 hover:bg-white/[0.05] will-change-transform"
            >
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex w-full flex-col items-center">
                <div className="mb-6 flex h-28 w-full items-center justify-center lg:h-32">
                  <img
                    src={type.image}
                    alt={`${type.name} body type`}
                    width={220}
                    height={132}
                    loading="lazy"
                    className="h-full w-full max-w-[180px] object-contain opacity-45 invert transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 lg:max-w-[210px]"
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
            className="flex items-center gap-3 mb-4"
          >
            <div className="size-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Premier Partners</span>
          </motion.div>
          
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">Browse By</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none text-wrap-balance">
              Make
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { name: 'Toyota', icon: BrandIcons.Toyota },
            { name: 'Honda', icon: BrandIcons.Honda },
            { name: 'Suzuki', icon: BrandIcons.Suzuki },
            { name: 'Nissan', icon: BrandIcons.Nissan },
            { name: 'Mitsubishi', icon: BrandIcons.Mitsubishi },
            { name: 'Mercedes', icon: BrandIcons.Mercedes },
          ].map((brand, i) => (
            <motion.button 
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/inventory?make=${brand.name}`)}
              className="group relative flex h-[166px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-[#D4AF37]/40 hover:bg-white/[0.05] lg:h-[176px]"
            >
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="mb-5 flex h-20 w-full items-center justify-center text-white/40 transition-colors duration-300 group-hover:text-[#D4AF37]">
                  <brand.icon className="size-16 object-contain transition-transform duration-300 group-hover:scale-105 lg:size-20" />
                </div>
                <span className="w-full truncate text-center text-[9px] font-black tracking-[0.22em] uppercase text-white/50 transition-colors group-hover:text-white">
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
            className="group px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all duration-500 flex items-center gap-4 will-change-transform"
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
            <div className="w-12 h-[1px] bg-white/15" />
            <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">The Latest</span>
            <div className="w-12 h-[1px] bg-white/15" />
          </motion.div>
          
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">Explore our</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
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
            {((cars.length > 0 ? [...cars, ...cars] : carsData)).map((car, i) => (
              <motion.div 
                key={`${car.id}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-[320px] md:w-[420px] inline-block flex-shrink-0 group/card bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.05] hover:border-[#D4AF37]/40 transition-[border-color,background-color,opacity,transform] duration-500 cursor-pointer relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                onClick={() => navigate(`/car/${car.id}`)}
              >
                {/* Image Container with Hover Zoom */}
                <div className="w-full h-64 md:h-72 overflow-hidden relative">
                  {/* Premium Year Tag */}
                  <div className="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-xl border border-white/10 text-[#D4AF37] text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                    Model {car.year}
                  </div>
                  
                  <motion.img 
                    src={car.image.includes('unsplash.com') ? `${car.image}&w=600&q=70` : car.image} 
                    alt={`${car.year} ${car.make} ${car.model}`} 
                    width={420}
                    height={288}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                  />
                  
                  {/* Cinematic Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                </div>
                
                {/* Card Content */}
                <div className="p-8 md:p-10 relative">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-5 h-[1px] bg-white/20" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">{car.make}</span>
                   </div>
                   
                   <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-white mb-6 leading-none transition-colors duration-500 group-hover/card:text-[#D4AF37]">
                    {car.model}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-1">Price Guide</span>
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
            <div className="w-12 h-[1px] bg-white/15" />
            <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">The Collection</span>
            <div className="w-12 h-[1px] bg-white/15" />
          </motion.div>
          
          <div className="flex flex-col items-center mb-12">
            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">Discover our</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none text-wrap-balance">
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
                className={`relative z-10 flex-1 px-8 py-4 text-[10px] font-black tracking-[0.4em] uppercase transition-colors duration-500 ${
                  activeTab === tab ? 'text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
          <AnimatePresence mode="wait" initial={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CarCard car={car} />
                </motion.div>
              ))}
              {filteredCars.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full py-20 flex flex-col items-center gap-6 opacity-40"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">No {activeTab} inventory available</p>
                  <LiquidButton asChild>
                     <Link to="/contact">Request Vehicle Sourcing</Link>
                  </LiquidButton>
                </motion.div>
              )}
            </div>
          </AnimatePresence>

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

      {/* ===== TRADE-IN SECTION (DARK) ===== */}
      <section className="py-32 relative overflow-hidden text-center bg-[#0d0b09]">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Exchange & Trade-In</span>
            <div className="w-8 h-[1px] bg-white/20" />
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8">
            Upgrade Your Drive
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-12">
            Planning to upgrade? Share your current vehicle details and our team will review a fair trade-in value against the model you want next.
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
              <div className="w-12 h-[1px] bg-white/20" />
              <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Our Values</span>
              <div className="w-12 h-[1px] bg-white/20" />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8 drop-shadow-2xl">
              Why Choose <span className="text-[#D4AF37]">Serendib</span>
            </h2>
            
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              We deliver uncompromising quality, transparent vehicle histories, and a seamless buying experience from global selection to your driveway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {[
              { title: "Direct UK & Japan Imports", desc: "Sourced through trusted partners with records checked before listing.", icon: Globe },
              { title: "Verified Mileage", desc: "Odometer readings and documents are reviewed before vehicles reach the floor.", icon: Gauge },
              { title: "Finance Support", desc: "Leasing guidance with local finance partners and clear monthly estimates.", icon: CreditCard },
              { title: "RMV Guidance", desc: "Support for clearance, registration, insurance, and handover paperwork.", icon: FileCheck },
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
                  className="group relative flex flex-col items-center text-center p-10 bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-3xl hover:border-[#D4AF37]/40 shadow-2xl transition-[border-color,background-color,opacity,transform] duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
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

      {/* SEO FAQ SECTION */}
      <section className="relative overflow-hidden border-t border-white/5 bg-[#0d0b09] px-6 py-24 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_68%)]" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-12 flex flex-col items-center">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-px w-12 bg-white/15" />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Buyer Questions</span>
              <div className="h-px w-12 bg-white/15" />
            </div>
            <h2 className="text-4xl font-black leading-none tracking-tighter text-white md:text-6xl">
              Vehicle Buying FAQ
            </h2>
          </div>

          <FAQAccordion />
        </div>
      </section>

      <InstagramShowcase />



      {/* ===== CONTACT CTA (CINEMATIC) ===== */}
      <section className="pt-20 pb-16 relative overflow-hidden bg-[#0d0b09] border-t border-white/5">
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-10 md:p-16 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[40px] shadow-2xl overflow-hidden group">
            {/* Animated Light Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] pointer-events-none" />

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-4 drop-shadow-2xl">
                Ready to view <br className="hidden md:block"/> your <span className="text-[#D4AF37]">next car?</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Visit the Dehiwala showroom or message us with the model, budget, and timing you have in mind.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 shrink-0 relative z-10 w-full lg:w-auto">
              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <span className="text-[11px] uppercase tracking-[0.35em] font-bold text-[#D4AF37] mb-3 opacity-70">Expert Consultation</span>
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


      </main>

      <Suspense fallback={<div className="h-60 bg-[#0d0b09]" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
