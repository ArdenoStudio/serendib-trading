import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoanCalculator from '../components/LoanCalculator';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    Coins, 
    TrendingUp, 
    ShieldCheck, 
    ArrowRight,
    CircleDot
} from 'lucide-react';

export default function Calculator() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.1]);

  return (
    <div className="min-h-screen font-sans bg-[#0d0b09] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      
      {/* Cinematic Hero / Background */}
      <section className="relative h-[65vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0">
          <img 
            src="/images/dashboard.png" 
            className="w-full h-full object-cover brightness-[0.3]" 
            alt="Luxury Interior Cockpit" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/80 via-transparent to-[#0d0b09]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09] opacity-80" />
        </motion.div>

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-10"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 backdrop-blur-md">
              <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px]">Financial Engineering</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">
              Capital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10">Bespoke</span>
            </h1>

            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                Architect your acquisition strategy with precision. Adjust parameters to witness the alignment of luxury and logic.
            </p>
          </motion.div>
        </div>
        
        {/* Animated Scroll Visual */}
        <div className="absolute bottom-12 left-1/2 -track-x-1/2 flex flex-col items-center gap-4 opacity-20">
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* --- CALCULATOR SUITE --- */}
      <section className="relative z-20 -mt-24 md:-mt-32 pb-40 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
            >
                <LoanCalculator />
            </motion.div>

            {/* Additional Context Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
                {[
                    { 
                        title: "Premier Banking", 
                        icon: ShieldCheck, 
                        desc: "Direct integration with Sampath Bank, HNB, and Commercial Bank for instant facility approval." 
                    },
                    { 
                        title: "Corporate Leasing", 
                        icon: TrendingUp, 
                        desc: "Tax-efficient acquisition structures for corporate entities and multi-fleet operations." 
                    },
                    { 
                        title: "Flexible Tenure", 
                        icon: CircleDot, 
                        desc: "Agile repayment periods extending up to 7 years with bespoke seasonal balloon payment structures." 
                    }
                ].map((item, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-700 space-y-8 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
                            <item.icon className="w-7 h-7 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter">{item.title}</h4>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
                        </div>
                        <div className="pt-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all">
                            View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-40 text-center space-y-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-[1px] bg-[#D4AF37]/20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Private Consultation</p>
                </div>
                
                <div className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Request a Bespoke Offer</h2>
                    <p className="max-w-xl mx-auto text-gray-500 font-medium">
                        For institutional acquisitions or high-value individual trade-ins, our head of finance will personally architect your facility structure.
                    </p>
                </div>

                <LiquidButton asChild size="xl">
                    <a 
                        href="https://wa.me/94756363427"
                        className="flex items-center gap-6 text-[14px] font-bold tracking-[0.1em] uppercase text-white"
                    >
                        Contact Head of Finance
                    </a>
                </LiquidButton>
            </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
