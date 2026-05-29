import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import LoanCalculator from '../components/LoanCalculator';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { 
    Coins, 
    TrendingUp, 
    ShieldCheck, 
    ArrowRight,
    CircleDot
} from 'lucide-react';
import SEO from '../components/SEO';

export default function Calculator() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.1]);

  const shouldReduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const noParallax = isTouch || shouldReduceMotion;

  return (
    <div className="min-h-screen font-sans bg-[#0d0b09] text-white selection:bg-[#D4AF37] selection:text-black">
      <SEO 
        title="Vehicle Finance Calculator Sri Lanka"
        description="Estimate monthly vehicle finance and leasing payments in Sri Lanka before requesting a Serendib Trading finance quote."
        canonical="/calculator"
        ogImage="/images/dashboard.png"
        ogImageAlt="Vehicle dashboard used for finance calculator preview"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Finance Calculator', path: '/calculator' },
        ]}
        keywords={[
          'vehicle finance calculator Sri Lanka',
          'car leasing calculator Sri Lanka',
          'Serendib Trading finance',
          'monthly car payment estimator',
        ]}
      />
      
      {/* Cinematic Hero / Background */}
      <section className="relative h-[65vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        <motion.div style={noParallax ? { opacity } : { opacity, scale }} className="absolute inset-0 z-0">
          <img 
            src="/images/dashboard.png" 
            className="w-full h-full object-cover brightness-[0.3]" 
            alt="Luxury Interior Cockpit"
            decoding="async"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/80 via-transparent to-[#0d0b09]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09] via-transparent to-[#0d0b09] opacity-80" />
        </motion.div>

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-10"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 backdrop-blur-md">
              <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px]">Finance Calculator</span>
            </div>

            <h1 className="text-5xl md:text-9xl font-black tracking-[-0.08em] uppercase leading-[0.8]">
              Estimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]">Payments</span>
            </h1>

            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                Adjust price, down payment, rate, and term to understand a realistic monthly range before you visit the showroom.
            </p>
          </motion.div>
        </div>
        
        {/* Animated Scroll Visual */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20">
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* --- CALCULATOR SUITE --- */}
      <section className="relative z-20 -mt-24 md:-mt-32 pb-24 md:pb-28 px-6 lg:px-10">
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
                        title: "Bank Leasing",
                        icon: ShieldCheck,
                        desc: "Compare sample leasing numbers before speaking with Sampath Bank, HNB, Commercial Bank, or your preferred lender."
                    },
                    {
                        title: "Business Purchases",
                        icon: TrendingUp,
                        desc: "Estimate vehicle costs for company directors, small fleets, and owner-managed businesses."
                    },
                    {
                        title: "Flexible Terms",
                        icon: CircleDot,
                        desc: "Review different down payments and repayment periods before requesting a formal quote."
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
                            <h4 className="text-xl font-black uppercase tracking-tighter">{item.title}</h4>
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
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Request a Finance Quote</h2>
                    <p className="max-w-xl mx-auto text-gray-500 font-medium">
                        Send us the vehicle, budget, down payment, and preferred term. We will guide you through the next finance steps.
                    </p>
                </div>

                <LiquidButton asChild size="xl">
                    <a 
                        href="https://wa.me/94756363427"
                        className="flex items-center gap-6 text-[14px] font-bold tracking-[0.1em] uppercase text-white"
                    >
                        Message Finance Team
                    </a>
                </LiquidButton>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
