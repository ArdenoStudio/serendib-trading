import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform, cubicBezier, AnimatePresence, useReducedMotion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import InstagramShowcase from '../components/InstagramShowcase';
import Footer from '../components/Footer';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Car } from '../data/types';
import { getInitialInventory } from '../lib/inventory';
import { fetchInventoryList, invalidateInventoryCache } from '../lib/inventoryCache';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { BrandMark, getBrandLabel, getDisplayModel } from '../components/brand/BrandMark';
import { LocationTag } from '../components/ui/location-tag';
import SEO from '../components/SEO';
import { HERO_SHOWROOM_SLIDES } from '../data/showroomImages';
import { createOrganizationSchema, createWebsiteSchema } from '../lib/seo';
import { optimizeImageUrl } from '../lib/images';

export default function Home() {
  const [cars, setCars] = useState<Car[]>(getInitialInventory);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const navigate = useNavigate();

  const fetchLiveVehicles = async (force = false) => {
    if (!isSupabaseConfigured) return;
    try {
      if (force) invalidateInventoryCache();
      setCars(await fetchInventoryList({ force }));
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void fetchLiveVehicles(false);

    // Realtime: re-fetch whenever anything changes
    const channel = supabase
      .channel('home-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, () => {
        void fetchLiveVehicles(true);
      })
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

  // Featured-arrivals marquee: measure one card set so the loop wraps seamlessly
  // at any card count / breakpoint instead of relying on a magic pixel offset.
  const marqueeSetRef = useRef<HTMLDivElement>(null);
  const [marqueeSetWidth, setMarqueeSetWidth] = useState(0);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const marqueeX = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      if (marqueeSetRef.current) {
        setMarqueeSetWidth(marqueeSetRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [cars.length]);

  // Drive the marquee manually so speed stays constant and hover pauses instantly.
  useAnimationFrame((_, delta) => {
    if (marqueePaused || shouldReduceMotion || marqueeSetWidth === 0) return;
    const speed = 55; // px per second
    let next = marqueeX.get() - (speed * delta) / 1000;
    if (next <= -marqueeSetWidth) next += marqueeSetWidth; // seamless wrap by one set
    marqueeX.set(next);
  });

  const customEase = cubicBezier(0.16, 1, 0.3, 1);

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15], { ease: customEase });
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0], { ease: customEase });
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.12, 0.84]);

  const currentHeroSlide = HERO_SHOWROOM_SLIDES[activeHeroSlide];

  const marqueeCars = cars;

  const renderFeaturedCard = (car: Car, key: string) => (
    <motion.div
      key={key}
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
          src={
            car.image?.includes('unsplash.com')
              ? `${car.image}&w=600&q=70`
              : optimizeImageUrl(car.image, 'card') || car.image
          }
          alt={`${car.year} ${getBrandLabel(car.make)} ${getDisplayModel(car.make, car.model)}`}
          width={420}
          height={288}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
          onError={(e) => {
            // Fall back to the raw storage URL if a transform URL ever 403s.
            const el = e.currentTarget;
            if (car.image && el.src !== car.image) el.src = car.image;
          }}
        />

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Card Content */}
      <div className="p-8 md:p-10 relative">
         <div className="flex items-center gap-3 mb-3">
            <BrandMark
              make={car.make}
              tone="mono"
              className="size-8 shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-white/45 transition-colors duration-500 group-hover/card:border-[#D4AF37]/35 group-hover/card:text-[#D4AF37]"
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">{getBrandLabel(car.make)}</span>
         </div>

         <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-white mb-6 leading-none transition-colors duration-500 group-hover/card:text-[#D4AF37]">
          {getDisplayModel(car.make, car.model)}
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
  );

  return (
    <div className="min-h-screen overflow-x-hidden font-sans" style={{ backgroundColor: '#0d0b09', color: '#FFFFFF' }}>
      <SEO 
        title="Imported Vehicles in Sri Lanka"
        description="Serendib Trading in Dehiwala offers inspected UK and Japan vehicle imports, clear histories, finance support, trade-in help, and showroom viewing for Sri Lankan buyers."
        canonical="/"
        ogImage="/images/showroom/serendib-showroom-floor-02.webp"
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
              className="flex w-full max-w-[19.5rem] flex-col items-stretch gap-3.5 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <motion.div className="w-full sm:w-[15.75rem]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/inventory"
                  className="relative inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-full px-7 text-center text-[13px] font-black uppercase tracking-[0.09em] shadow-[0_0_32px_-12px_rgba(212,175,55,0.58)] group"
                  style={{ background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 100%)', color: '#000000' }}
                >
                  <span className="relative z-10">Explore Collection</span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </Link>
              </motion.div>

              <motion.div className="w-full sm:w-[15.75rem]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <LiquidButton asChild size="xl" className="h-14 w-full !px-0">
                  <Link
                    to="/contact"
                    className="h-full w-full text-[13px] font-black uppercase tracking-[0.09em] text-white"
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
            { name: 'SUV',      path: '/inventory?bodyType=SUV',      image: '/car-types/suv.webp' },
            { name: 'Sedan',    path: '/inventory?bodyType=Sedan',    image: '/car-types/sedan.webp' },
            { name: 'Hatchback',path: '/inventory?bodyType=Hatchback',image: '/car-types/hatchback.webp' },
            { name: 'Luxury',   path: '/inventory?bodyType=Luxury',   image: '/car-types/rolls-royce.webp' },
            { name: 'MPV',      path: '/inventory?bodyType=MPV',      image: '/car-types/car.webp' },
            { name: 'Crossover',path: '/inventory?bodyType=Crossover',image: '/car-types/crossover.webp' },
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
                <div className="mb-5 flex h-24 w-full items-center justify-center px-1 lg:h-28">
                  <img
                    src={type.image}
                    alt={`${type.name} body type`}
                    width={220}
                    height={90}
                    loading="lazy"
                    className="h-full w-full max-w-[190px] object-contain object-center mix-blend-normal transition-transform duration-500 group-hover:scale-[1.06] lg:max-w-[220px]"
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
            { label: 'Toyota', make: 'Toyota', logo: '/brand-logos/toyota.svg' },
            { label: 'Honda', make: 'Honda', logo: '/brand-logos/honda.svg' },
            { label: 'Suzuki', make: 'Suzuki', logo: '/brand-logos/suzuki.svg' },
            { label: 'Nissan', make: 'Nissan', logo: '/brand-logos/nissan.svg' },
            { label: 'Mitsubishi', make: 'Mitsubishi', logo: '/brand-logos/mitsubishi.svg' },
            { label: 'Mercedes', make: 'Mercedes-Benz', logo: '/brand-logos/mercedes.svg' },
          ].map((brand, i) => (
            <motion.button 
              key={brand.make}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/inventory?make=${encodeURIComponent(brand.make)}`)}
              className="group relative flex h-[166px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-[#D4AF37]/40 hover:bg-white/[0.05] lg:h-[176px]"
            >
              <div className="relative z-10 flex w-full flex-col items-center">
                <div className="mb-4 flex h-[92px] w-full items-center justify-center px-2 lg:h-[100px]">
                  <img
                    src={brand.logo}
                    alt={`${brand.label} logo`}
                    width={180}
                    height={96}
                    loading="lazy"
                    className="max-h-[68px] w-auto max-w-[126px] object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-[74px] sm:max-w-[138px] lg:max-h-[80px] lg:max-w-[150px]"
                  />
                </div>
                <span className="w-full truncate text-center text-[9px] font-black tracking-[0.22em] uppercase text-white/50 transition-colors group-hover:text-white">
                  {brand.label}
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
        <div
          className="w-screen relative left-1/2 right-1/2 -ml-[50vw] +mr-[50vw] overflow-hidden py-12"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
        >
          <motion.div className="flex w-max" style={{ x: marqueeX }}>
            {/* Two identical sets; the first is measured so we wrap by exactly one set width */}
            <div ref={marqueeSetRef} className="flex gap-8 pr-8 shrink-0">
              {marqueeCars.map((car, i) => renderFeaturedCard(car, `set1-${car.id}-${i}`))}
            </div>
            <div className="flex gap-8 pr-8 shrink-0" aria-hidden="true">
              {marqueeCars.map((car, i) => renderFeaturedCard(car, `set2-${car.id}-${i}`))}
            </div>
          </motion.div>
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
                  href="tel:+94756363427"
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
