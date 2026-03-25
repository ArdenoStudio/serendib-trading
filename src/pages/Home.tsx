import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, cubicBezier } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSearch from '../components/HeroSearch';
import BrandLogoStrip from '../components/BrandLogoStrip';
import CarCard from '../components/CarCard';
import WhatsAppFloat from '../components/WhatsAppFloat';
import carsData from '../data/cars.json';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'New' | 'Registered'>('Registered');
  const navigate = useNavigate();
  
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

  const filteredCars = carsData
    .filter(car => car.condition === activeTab)
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
              backgroundImage: 'url("https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2000")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              scale: bgScale,
              filter: bgBlur
            }}
          >
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#000000]" />
          </motion.div>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col pt-16 pb-[200px] md:pb-[280px]">
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
              className="mb-8 text-6xl md:text-[80px] lg:text-[100px] font-black tracking-[-0.04em] text-white leading-[1.05] drop-shadow-2xl"
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

      {/* BROWSE BY BODY TYPE */}
      <div className="w-full max-w-[1100px] mx-auto mt-32 md:mt-40 lg:mt-48 px-4 pb-20 z-10 relative">
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Browse by <span className="text-[#D4AF37]">Make</span>
          </h2>
          <button className="text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-semibold flex items-center gap-2">
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

      {/* Adjusting spacing before next section */}
      <div className="h-12 bg-black" />

      {/* ===== FEATURED LISTINGS ===== */}
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
                Featured Listings
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
              View All {activeTab}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ===== TRADE-IN SECTION (DARK) ===== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 relative overflow-hidden text-center"
        style={{ backgroundColor: '#0A1128' }}
      >
        <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <p className="text-[14px] font-bold uppercase tracking-wide mb-4" style={{ color: '#D4AF37' }}>
            Exchange & Trade-In
          </p>
          <h2
            className="text-[36px] md:text-[50px] font-extrabold mb-6"
            style={{ color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Got a car to exchange?
          </h2>
          <p className="mb-10" style={{ color: '#A1A1AA', fontSize: '18px', lineHeight: 1.6 }}>
            Bring in your current car and drive away in a new one today. We offer competitive evaluations.
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
            <span className="relative z-10">WhatsApp Us About Your Car</span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
          </motion.a>
        </div>
      </motion.section>

      {/* ===== WHY CHOOSE US ===== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-28"
        style={{ backgroundColor: '#000000' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-20">
            <h2 className="text-[36px] md:text-[46px] font-extrabold" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Why choose us?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Wide range of brands",
                desc: "Explore our diverse selection of vehicles, from sedans to SUVs, ensuring you find your perfect match."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Trusted by our clients",
                desc: "Years of impeccable service have earned us the trust and loyalty of countless satisfied customers."
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Best deals in the market",
                desc: "Experience unbeatable prices and promotions, ensuring you get the best value for your money."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: '#111111', color: '#D4AF37', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {item.icon}
                </div>
                <h3
                  className="text-[20px] font-extrabold mb-3"
                  style={{ color: '#FFFFFF' }}
                >
                  {item.title}
                </h3>
                <p className="max-w-[300px] font-medium" style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

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
