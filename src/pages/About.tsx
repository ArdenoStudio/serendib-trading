import { motion } from 'framer-motion';
import { ShieldCheck, Target, Award, Truck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedHeading from '../components/AnimatedHeading';
import StatsCounter from '../components/StatsCounter';
import FAQAccordion from '../components/FAQAccordion';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans bg-black text-white">
      <Navbar />

      {/* LUXURY HERO */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/showroom.png" 
            alt="Serendib Showroom" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        </div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-xs">Excellence Since 2010</p>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D4AF37] to-white/20">Serendib</span> <br /> Legacy
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Brand Intro */}
      <section className="py-24 px-6 lg:px-10 max-w-[1200px] mx-auto text-center">
        <p className="text-xl md:text-3xl font-light leading-relaxed max-w-4xl mx-auto italic">
          "For more than a decade, we have redefined the automotive landscape in Sri Lanka, sourcing the world’s finest vehicles with a commitment to absolute transparency."
        </p>
      </section>

      {/* Stats Section with better aura */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <StatsCounter end={14} label="Years of Heritage" suffix="+" />
            <StatsCounter end={5000} label="Curated Deliveries" suffix="+" />
            <StatsCounter end={100} label="Client Satisfaction" suffix="%" />
          </div>
        </div>
      </section>

      {/* THE SERENDIB STANDARD - PROCESS SECTION */}
      <section className="py-32 px-6 lg:px-10 bg-white/[0.02] border-t border-b border-white/5">
        <div className="max-auto max-w-[1300px] mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-xs">Unmatched Quality</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">The Serendib <br /> Standard</h2>
            </div>
            <p className="text-gray-400 max-w-md font-medium leading-relaxed">
              Every vehicle in our collection undergoes a rigorous multi-point inspection and restoration process before it reaches your driveway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "World-Class Curation", icon: Target, desc: "We source strictly from prime markets in UK & Japan through certified auctions." },
              { title: "Elite Inspection", icon: ShieldCheck, desc: "Documented history and multi-point mechanical verification." },
              { title: "Serendib Certified", icon: Award, desc: "Garanteed mileage and transparency on every diagnostic report." },
              { title: "Luxury Delivery", icon: Truck, desc: "Full RMV processing and door-to-door concierge arrival." },
            ].map((step, i) => (
              <div key={i} className="group p-10 bg-white/[0.01] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 rounded-3xl space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-500">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black italic">{step.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom Moments */}
      <section className="py-32 px-6 lg:px-10 max-w-[1300px] mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">The <span className="text-[#D4AF37]">Experience</span></h2>
          <div className="w-20 h-1 bg-[#D4AF37] mt-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            "https://images.unsplash.com/photo-1562141961-b5d189fa4e18?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
          ].map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl relative group bg-white/5 border border-white/10"
            >
              <img src={src} alt="Showroom Detail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Overlay Section */}
      <section className="py-32 px-6 lg:px-10 max-w-[1000px] mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Frequently Asked <br /> Questions</h2>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Clarity in Every Aspect</p>
        </div>
        <FAQAccordion />
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

