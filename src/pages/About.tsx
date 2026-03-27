import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Award, 
  Truck, 
  Globe2, 
  Zap, 
  History,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatsCounter from '../components/StatsCounter';
import FAQAccordion from '../components/FAQAccordion';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0b09] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      {/* --- CINEMATIC HERO --- */}
      <section ref={heroRef} className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y, scale, opacity }} className="absolute inset-0 z-0">
          <img 
            src="/images/showroom.png" 
            alt="Serendib Showroom" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/60 via-transparent to-[#0d0b09]" />
        </motion.div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 backdrop-blur-md">
              <History className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px]">Excellence Since 2010</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase">
              The <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10">Serendib</span> <br /> 
              Legacy
            </h1>

            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                Defining the pinnacle of automotive trading in Sri Lanka for over a decade through absolute transparency.
            </p>
          </motion.div>
        </div>

        {/* Floating Auth Badge */}
        <motion.div 
            initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center gap-2 p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl rotate-[5deg]"
        >
            <Award className="w-10 h-10 text-[#D4AF37]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-center">Verified <br /> Premium Origin</span>
        </motion.div>
      </section>

      {/* --- FOUNDER'S PHILOSOPHY --- */}
      <section className="py-20 relative px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
            <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-2xl md:text-4xl font-light leading-relaxed italic text-white/90"
            >
              "True luxury isn't just in the vehicle itself, but in the peace of mind that comes with its acquisition. Transparency is our only standard."
            </motion.p>
            <div className="mt-12 flex flex-col items-center">
                <div className="w-12 h-[1px] bg-[#D4AF37] mb-6" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">The Serendib Philosophy</span>
            </div>
        </div>
      </section>

      {/* --- PERFORMANCE METRICS --- */}
      <section className="py-32 relative overflow-hidden bg-white/[0.01]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#D4AF37]/5 opacity-40 blur-[120px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCounter end={16} label="Years of Pure Heritage" suffix="+" />
            <StatsCounter end={6200} label="Curated Masterpieces Delivered" suffix="+" />
            <StatsCounter end={100} label="Transparency Milestone" suffix="%" />
          </div>
        </div>
      </section>

      {/* --- THE GLOBAL SOURCING NETWORK --- */}
      <section className="py-40 px-6 lg:px-10 border-t border-b border-white/5">
        <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 space-y-10">
                <div className="space-y-4">
                    <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-xs">Global Acquisitions</p>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-[0.9]">
                        The World <br /> <span className="text-gray-500">Is Our Showroom</span>
                    </h2>
                </div>
                
                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                    We maintain exclusive direct-access partnerships with premier auction houses in the **UK** and **Japan**. Our specialists are on the ground in Tokyo and London, handpicking only the finest specimens for arrival on Sri Lankan soil.
                </p>

                <div className="grid grid-cols-2 gap-8">
                    {[
                        { title: "Japan Selection", icon: Globe2, list: ["USS Tokyo Direct", "Auction Verification", "Original Mileage Logs"] },
                        { title: "UK Collection", icon: Zap, list: ["Bespoke Luxury Imports", "HPI Clear Certs", "Direct Logistic Link"] },
                    ].map((hub, idx) => (
                        <div key={idx} className="space-y-4 p-8 rounded-3xl bg-white/5 border border-white/5">
                            <hub.icon className="w-6 h-6 text-[#D4AF37]" />
                            <h4 className="text-sm font-black uppercase tracking-widest">{hub.title}</h4>
                            <ul className="space-y-2">
                                {hub.list.map(l => <li key={l} className="text-[10px] text-gray-500 font-bold uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                                    {l}
                                </li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:w-1/2 relative aspect-square w-full max-w-xl group">
                <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-[40px] transform rotate-3 translate-x-4 transition-transform group-hover:rotate-0" />
                <div className="absolute inset-0 border border-white/10 rounded-[40px]" />
                <img 
                    src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200" 
                    alt="Inspection Detail" 
                    className="w-full h-full object-cover rounded-[40px] relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
            </div>
        </div>
      </section>

      {/* --- THE SERENDIB STANDARD - PROCESS --- */}
      <section className="py-40 px-6 lg:px-10">
        <div className="max-auto max-w-[1300px] mx-auto space-y-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-xs">Excellence Manifested</p>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-[0.85]">The Serendib <br /> Standard</h2>
            </div>
            <div className="space-y-6 max-w-md">
                <p className="text-gray-400 font-medium leading-relaxed">
                We believe that every vehicle deserves a second history. Our rigorous verification process ensures that the one you receive is nothing short of perfection.
                </p>
                <div className="flex items-center gap-4 text-[#D4AF37] font-black uppercase tracking-widest text-[10px]">
                    <span className="w-10 h-[1px] bg-[#D4AF37]" />
                    Read Our Inspection Protocol
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Sourcing Intelligence", icon: Target, desc: "Direct integration with global auctions for zero-proxy acquisition." },
              { title: "Protocol X Inspection", icon: ShieldCheck, desc: "A 180-point mechanical and digital health evaluation." },
              { title: "Heritage Certification", icon: Award, desc: "Verified JAAI/HPI certificates and authentic digital history." },
              { title: "Concierge Arrival", icon: Truck, desc: "Turnkey delivery including RMV registration and custom trim detailing." },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 rounded-[40px] space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <step.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{step.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">{step.desc}</p>
                </div>
                <div className="pt-6">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/40 group-hover:text-[#D4AF37] transition-colors">
                        Protocol Step 0{i+1} <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SHOWROOM MOMENTS - BENTO --- */}
      <section className="py-40 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center mb-24 text-center space-y-4">
            <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px]">Visual Storytelling</p>
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter">The Serendib <span className="text-gray-500">Gallery</span></h2>
            <div className="w-24 h-[1px] bg-[#D4AF37] mt-8" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[1000px]">
          <div className="md:col-span-8 overflow-hidden rounded-[40px] border border-white/10 group cursor-pointer relative bg-white/5">
              <img 
                src="https://images.unsplash.com/photo-1562141961-b5d189fa4e18?auto=format&fit=crop&q=80&w=1200" 
                alt="Showroom One" 
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10 space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Location: Colombo, SL</span>
                <h4 className="text-3xl font-black italic uppercase italic uppercase">Flagship Showroom</h4>
              </div>
          </div>
          <div className="md:col-span-4 overflow-hidden rounded-[40px] border border-white/10 group cursor-pointer relative bg-white/5">
              <img 
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200" 
                alt="Showroom Two" 
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" 
              />
          </div>
          <div className="md:col-span-12 md:row-span-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200",
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200",
                "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200",
              ].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-[40px] border border-white/10 group cursor-pointer aspect-square md:aspect-auto h-[300px] bg-white/5">
                    <img src={src} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-40 px-6 lg:px-10 max-w-[1000px] mx-auto">
        <div className="text-center space-y-6 mb-24">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
            <CheckCircle2 className="w-4 h-4" /> Clarity in Every Aspect
          </div>
          <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">Common <br /> <span className="text-gray-500">Inquiries</span></h2>
        </div>
        <FAQAccordion />
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
