import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, cubicBezier } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Trophy, Globe, Gauge, CreditCard, FileCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSearch from '../components/HeroSearch';
import BrandLogoStrip from '../components/BrandLogoStrip';
import CarCard from '../components/CarCard';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';

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
        className="relative flex items-center justify-center"
        style={{
          minHeight: '85vh',
          marginTop: '72px', // Offset for Navbar
        }}
      >
        {/* Background Image Wrapper (Traps scale overflow) */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {/* Background Image with Dark Overlay */}
          <motion.div
            className="absolute inset-0 origin-center"
            style={{
              backgroundImage: 'url("/images/hero_hq.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              scale: bgScale,
              filter: bgBlur,
              imageRendering: 'crisp-edges'
            }}
          >
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#000000]" />
          </motion.div>

        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col pt-16 pb-[260px] md:pb-[280px]">
          {/* Ambient Deep Gold Glow (Behind Text) */}
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#D4AF37] rounded-full mix-blend-screen opacity-[0.07] blur-[150px] pointer-events-none -translate-y-1/2 z-0" />

          {/* Left-Aligned Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.2 }}
            style={{ y: textY, opacity: textOpacity }}
            className="flex flex-col max-w-[800px] relative z-10"
          >
            {/* Elegant Eyebrow */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-10 h-[2px] bg-[#D4AF37]"></div>
              <p className="uppercase tracking-[0.25em] font-bold text-[#D4AF37] text-xs md:text-sm">
                Welcome to Serendib Trading
              </p>
            </motion.div>

            {/* Massive Cinematic Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8 text-4xl sm:text-6xl md:text-[80px] lg:text-[100px] font-black tracking-[-0.04em] text-white leading-[1.05] drop-shadow-2xl"
              style={{ textShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              Drive <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-[#D4AF37]/50">
                your way.
              </span>
            </motion.h1>

            {/* Premium Description */}
            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-10 max-w-[500px] text-lg md:text-xl font-light leading-relaxed text-gray-300"
            >
              We help you find the absolute best. Check our reviews, compare high-end models, and secure your dream car today.
            </motion.p>

            {/* Dual CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/inventory"
                  className="relative overflow-hidden inline-flex items-center justify-center px-8 py-4 text-[14px] font-bold tracking-[0.1em] uppercase group rounded-none shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)]"
                  style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                >
                  <span className="relative z-10">View Vehicles</span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="relative overflow-hidden inline-flex items-center justify-center px-8 py-4 text-[14px] font-bold tracking-[0.1em] uppercase text-white border border-white/20 bg-white/5 backdrop-blur-md rounded-none hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-32 md:bottom-24 left-6 lg:left-10 flex flex-col items-center gap-2 pointer-events-none hidden md:flex z-10"
        >
          <span className="text-[10px] text-gray-500 uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"
          />
        </motion.div>

        {/* Absolute bottom — search bar + category selector stacked */}
        <div className="absolute bottom-0 left-0 right-0 px-6 transform translate-y-1/2 z-20 flex flex-col items-center gap-0">
          <HeroSearch />
        </div>
      </section>

      {/* INFINITE BRAND MARQUEE */}
      <div className="w-full mt-32 md:mt-40 border-t border-b border-white/5 py-10 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />
        
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex items-center gap-20 whitespace-nowrap px-10"
        >
          {Array(2).fill(['MERCEDES-BENZ', 'RANGE ROVER', 'BMW', 'AUDI SPORT', 'TOYOTA GAZOO', 'LAND CRUISER', 'ROLLS-ROYCE', 'PORSCHE']).flat().map((brand, i) => (
            <span key={i} className="text-4xl md:text-6xl font-black italic tracking-tighter text-white/10 hover:text-[#D4AF37] transition-colors duration-500 cursor-default uppercase">
              {brand}
            </span>
          ))}
        </motion.div>
      </div>

      {/* BROWSE BY BODY TYPE */}
      <div className="w-full max-w-[1100px] mx-auto mt-24 px-4 pb-20 z-10 relative">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Browse by <span className="text-[#D4AF37]">Body Type</span>
          </h2>
        </div>

        {/* 4-item grid — perfectly centered */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'SUV',      path: '/inventory?bodyType=SUV',      image: '/car-types/suv.png' },
            { name: 'Sedan',    path: '/inventory?bodyType=Sedan',    image: '/car-types/sedan.png' },
            { name: 'Hatchback',path: '/inventory?bodyType=Hatchback',image: '/car-types/hatchback.png' },
            { name: 'Luxury',   path: '/inventory?bodyType=Luxury',   image: '/car-types/rolls-royce.png' },
          ].map((type) => (
            <button
              key={type.name}
              onClick={() => navigate(type.path)}
              className="group flex flex-col items-center justify-between p-5 md:p-6 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.08] hover:border-[#D4AF37]/50 hover:shadow-[0_8px_25px_-8px_rgba(212,175,55,0.3)] h-full min-h-[140px]"
            >
              <div className="flex-1 w-full flex items-center justify-center mb-4">
                <img
                  src={type.image}
                  alt={`${type.name} icon`}
                  className="max-h-16 max-w-full object-contain opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 invert"
                />
              </div>
              <span className="text-gray-300 font-medium text-xs md:text-sm tracking-widest uppercase group-hover:text-[#D4AF37] transition-colors">
                {type.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BROWSE BY MAKE */}
      <div className="w-full max-w-[1100px] mx-auto mt-8 px-4 pb-20 z-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Browse by <span className="text-[#D4AF37]">Make</span>
          </h2>
          <button className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-semibold flex items-center justify-center sm:justify-start gap-2">
            View All <span className="text-[#D4AF37]">&rarr;</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { name: 'Toyota', path: '/inventory?make=Toyota', image: '/brand-logos/toyota.png' },
            { name: 'Honda', path: '/inventory?make=Honda', image: '/brand-logos/honda.jpg' },
            { name: 'Suzuki', path: '/inventory?make=Suzuki', image: '/brand-logos/suzuki.jpg' },
            { name: 'Nissan', path: '/inventory?make=Nissan', image: '/brand-logos/nissan.jpg' },
            { name: 'Mitsubishi', path: '/inventory?make=Mitsubishi', image: '/brand-logos/mitsubishi.png' },
            { name: 'Mercedes', path: '/inventory?make=Mercedes-Benz', image: '/brand-logos/mercedes.jpg' },
            { name: 'BMW', path: '/inventory?make=BMW', image: '/brand-logos/bmw.jpg' },
            { name: 'Land Rover', path: '/inventory?make=Land Rover', image: '/brand-logos/land-rover.png' },
          ].map((brand) => (
            <button 
              key={brand.name}
              onClick={() => navigate(brand.path)}
              className="group flex flex-col items-center justify-center p-3 h-[110px] bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex-1 flex items-center justify-center w-full mb-1">
                <img 
                  src={brand.image} 
                  alt={`${brand.name} logo`} 
                  className="max-h-10 max-w-[80%] object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-gray-500 group-hover:text-[#D4AF37] transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED ARRIVALS CAROUSEL */}
      <div className="w-full max-w-[1200px] mx-auto mt-24 px-4 pb-20 z-10 relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Featured <span className="text-[#D4AF37]">Arrivals</span>
          </h2>
          <button onClick={() => navigate('/inventory')} className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-semibold flex items-center gap-2">
            View Inventory <span className="text-[#D4AF37]">&rarr;</span>
          </button>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {carsData.slice(0, 6).map((car) => (
            <div 
              key={car.id}
              className="min-w-[85vw] md:min-w-[360px] flex-shrink-0 snap-center group bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all duration-500 cursor-pointer"
              onClick={() => navigate(`/car/${car.id}`)}
            >
              {/* Image Container with Hover Zoom */}
              <div className="w-full h-56 overflow-hidden relative">
                <div className="absolute top-3 left-3 z-10 bg-[#111111]/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {car.year}
                </div>
                <img 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient Overlay for seamless blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80"></div>
              </div>
              
              {/* Card Content */}
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {car.make} {car.model}
                </h3>
                
                {/* Specs Row */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 mt-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {car.mileage.toLocaleString()} km
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>{car.fuel}</span>
                </div>
                
                {/* Price and Action Row */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-lg font-extrabold text-[#D4AF37] tracking-tight">LKR {car.price.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-white uppercase tracking-wider opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    View &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ===== FEATURED LISTINGS (MOVED UP) ===== */}

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24"
        style={{ backgroundColor: '#000000' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-[14px] font-bold uppercase tracking-wide mb-2" style={{ color: '#D4AF37' }}>
                Your Dream Car Awaits
              </p>
              <h2
                className="text-[36px] md:text-[46px] font-extrabold"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.15 }}
              >
                Available Inventory
              </h2>
            </div>
            <div className="flex gap-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['Registered', 'New'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-8 py-3 text-[14px] font-bold transition-all duration-200 uppercase tracking-wide"
                  style={{
                    backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                    color: activeTab === tab ? '#000000' : '#A1A1AA',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              to="/inventory"
              className="px-10 py-4 text-[14px] font-bold tracking-wide transition-colors duration-200 uppercase"
              style={{
                backgroundColor: '#111111',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1A1A1A'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#111111'; }}
            >
              View Full Collection
            </Link>
          </div>
        </div>
      </motion.section>

      {/* STORY / HERITAGE SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 border-t-2 border-l-2 border-[#D4AF37]/30" />
            <img 
              src="/images/heritage.png" 
              alt="Serendib Trading Heritage" 
              className="w-full h-[500px] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-[#D4AF37] p-8 hidden lg:block">
              <p className="text-black font-black text-4xl uppercase tracking-tighter">EST. 2010</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8"
          >
            <div className="space-y-4">
              <p className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase text-sm">Our Legacy</p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Crafting the Ultimate <br /> Automotive Experience</h2>
            </div>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              For over a decade, Serendib Trading has been the beacon of excellence in Sri Lanka's automotive landscape. We don't just sell cars; we curate masterpieces that define your journey. 
            </p>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              Our direct-import model from the UK and Japan ensures that every vehicle meets rigorous international standards, bringing global luxury to your doorstep with uncompromising transparency.
            </p>
            <div className="pt-4">
              <Link to="/about" className="inline-flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm group">
                Discover More <span className="w-12 h-[1px] bg-[#D4AF37] group-hover:w-16 transition-all duration-300"></span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRADE-IN SECTION (DARK) ===== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 relative overflow-hidden text-center"
        style={{ backgroundColor: '#020617' }}
      >
        <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <p className="text-[14px] font-bold uppercase tracking-wide mb-4" style={{ color: '#D4AF37' }}>
            Exchange & Trade-In
          </p>
          <h2
            className="text-[36px] md:text-[50px] font-extrabold mb-6"
            style={{ color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Upgrade Your Drive
          </h2>
          <p className="mb-10 text-gray-400" style={{ fontSize: '18px', lineHeight: 1.6 }}>
            Considering an upgrade? We offer competitive, fair evaluation for your current vehicle against our premium collection.
          </p>
          <motion.a
            href={`https://wa.me/94756363427?text=${encodeURIComponent("Hi Serendib Trading! I'm interested in trading in my current vehicle. Can we arrange an evaluation?")}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden inline-flex items-center justify-center px-10 py-4 text-[15px] font-bold uppercase tracking-wide group rounded-lg shadow-md"
            style={{
              backgroundColor: '#D4AF37',
              color: '#000000',
            }}
          >
            <span className="relative z-10">Get Evaluation via WhatsApp</span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
          </motion.a>
        </div>
      </motion.section>

      {/* WHY CHOOSE US - TRUST PILLARS (MOVED) */}
      <div className="w-full max-w-[1200px] mx-auto mt-24 md:mt-32 px-4 pb-24 z-10 relative">
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-white tracking-wide mb-4"
          >
            Why Choose <span className="text-[#D4AF37]">Serendib</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-[600px] text-sm md:text-base font-light"
          >
            We deliver uncompromising quality, transparent vehicle histories, and a seamless buying experience from global selection to your driveway.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group flex flex-col items-center text-center p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#D4AF37]/5 group-hover:border-[#D4AF37]/40 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-all duration-500">
                  <Icon className="w-7 h-7 text-gray-400 group-hover:text-[#D4AF37] transition-colors duration-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>


      {/* ===== CONTACT CTA (GOLD) ===== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-16"
        style={{ backgroundColor: '#D4AF37' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left" style={{ color: '#000000' }}>
          <div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Ready to find your dream car?
            </h2>
            <p className="font-semibold mt-2 text-[16px]" style={{ color: 'rgba(0,0,0,0.8)' }}>Visit our showroom or contact us today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center shrink-0">
            <div className="text-right flex flex-col sm:items-end items-center">
              <span className="text-[12px] tracking-widest uppercase font-extrabold mb-1" style={{ opacity: 0.7 }}>Call Us</span>
              <a href="tel:0756363427" className="text-[26px] font-extrabold hover:opacity-80 transition-opacity duration-200 leading-none">075 636 3427</a>
            </div>
            <div className="w-px h-12 hidden sm:block" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
            <Link
              to="/contact"
              className="px-10 py-4 text-[14px] tracking-wide font-bold transition-colors duration-200 uppercase"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1A1A1A'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#000000'; }}
            >
              Get Directions
            </Link>
          </div>
        </div>
      </motion.section>


      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
