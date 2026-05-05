import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Target,
  Award,
  Truck,
  MapPin,
  Heart,
  CheckCircle2
} from 'lucide-react';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import SEO from '../components/SEO';

export default function About() {
  const shouldReduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const noParallax = isTouch || shouldReduceMotion;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0b09] text-white selection:bg-[#D4AF37] selection:text-black">
      <SEO
        title="About Us"
        description="Serendib Trading - Sri Lanka's fresh face in luxury automotive. Premium vehicles, transparent service, since 2025."
        canonical="/about"
      />
      <main>

      {/* --- SIMPLE HERO --- */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 z-0 ${noParallax ? '' : ''}`}>
          <img
            src="/images/showroom.png"
            alt="Serendib Showroom"
            className="w-full h-full object-cover brightness-[0.5]"
            decoding="async"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/60 via-transparent to-[#0d0b09]" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10">
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px]">New Beginnings 2025</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.05em] leading-[0.95] uppercase">
              Driven By <span className="text-[#D4AF37]">Passion</span>
            </h1>

            <p className="max-w-2xl mx-auto text-gray-300 text-base md:text-lg leading-relaxed">
              Serendib Trading is Sri Lanka's newest destination for premium vehicles. 
              We're here to redefine automotive excellence with transparency, quality, and service you can trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- OUR STORY --- */}
      <section className="py-20 md:py-32 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[11px]">Our Story</p>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-white/80">
              Founded in 2025, Serendib Trading was born from a simple belief: 
              buying a premium vehicle should be an experience, not a transaction.
            </p>
            <p className="text-white/60 leading-relaxed">
              Every car in our collection is handpicked, thoroughly inspected, and presented with complete transparency. 
              No hidden histories. No surprises. Just exceptional vehicles and honest service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- WHAT WE STAND FOR --- */}
      <section className="py-20 md:py-32 px-6 lg:px-10 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[11px] mb-4">Our Promise</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">What We Stand For</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Handpicked Quality", desc: "Every vehicle personally selected and verified." },
              { icon: ShieldCheck, title: "Full Transparency", desc: "Complete history, inspection reports, and documentation." },
              { icon: Award, title: "Premium Standards", desc: "Only the best make it to our showroom." },
              { icon: Truck, title: "End-to-End Service", desc: "From sourcing to delivery, we handle everything." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4 hover:border-[#D4AF37]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SHOWROOM --- */}
      <section className="py-20 md:py-32 px-6 lg:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 space-y-6">
            <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[11px]">Visit Us</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">The Showroom</h2>
            <p className="text-white/60 leading-relaxed">
              Located in the heart of Colombo, our showroom is designed to showcase each vehicle 
              in the best light. No pressure, no rush—just browse at your own pace.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white/80">Dehiwala, Colombo, Sri Lanka</span>
            </div>
          </div>
          <div className="lg:w-1/2 aspect-video rounded-3xl overflow-hidden border border-white/10">
            <img
              src="/images/showroom.png"
              alt="Serendib Trading Showroom"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-20 md:py-32 px-6 lg:px-10 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[11px] mb-4">Trust</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Why Choose Serendib?</h2>
          </div>

          <div className="space-y-6">
            {[
              { title: "Verified Vehicles", desc: "Every car comes with complete inspection reports and authentic documentation." },
              { title: "Fair Pricing", desc: "Transparent pricing with no hidden fees or surprise charges." },
              { title: "Personal Service", desc: "We're a small team that cares—every customer gets our full attention." },
              { title: "After-Sale Support", desc: "Our relationship doesn't end when you drive off. We're here for the long haul." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-2xl"
              >
                <CheckCircle2 className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-black mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
