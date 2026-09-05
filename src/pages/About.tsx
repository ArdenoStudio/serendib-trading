import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  MapPin,
  Heart,
  Globe,
  Gauge,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import FAQAccordion, { serendibFaqs } from '../components/FAQAccordion';
import { SHOWROOM_IMAGES } from '../data/showroomImages';
import { createFAQSchema, createOrganizationSchema } from '../lib/seo';

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
        title="About Serendib Trading Dehiwala"
        description="Learn about Serendib Trading, our Dehiwala showroom, and how we source inspected UK and Japan vehicle imports for Sri Lankan buyers."
        canonical="/about"
        pageType="AboutPage"
        ogImage={SHOWROOM_IMAGES[0].src}
        ogImageAlt="Serendib Trading showroom vehicle display"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
        keywords={[
          'Serendib Trading Dehiwala',
          'Dehiwala car dealership',
          'imported vehicle showroom Sri Lanka',
          'Sri Lanka premium vehicle dealer',
        ]}
        structuredData={[
          createOrganizationSchema(),
          createFAQSchema(serendibFaqs),
        ]}
      />
      <main>

      {/* --- SIMPLE HERO --- */}
      <section className="relative min-h-[70dvh] flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 z-0 ${noParallax ? '' : ''}`}>
          <img
            src={SHOWROOM_IMAGES[0].src}
            alt="Serendib Trading showroom vehicle display"
            className="w-full h-full object-cover brightness-[0.68] contrast-[1.05]"
            decoding="async"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09]/45 via-[#0d0b09]/15 to-[#0d0b09]" />
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
              <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px]">New Beginnings 2026</span>
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
              Founded in 2026, Serendib Trading was born from a simple belief: 
              buying a premium vehicle should be an experience, not a transaction.
            </p>
            <p className="text-white/60 leading-relaxed">
              Every car in our collection is handpicked, thoroughly inspected, and presented with complete transparency. 
              No hidden histories. No surprises. Just exceptional vehicles and honest service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SHOWROOM --- */}
      <section className="py-20 md:py-32 px-6 lg:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 space-y-6">
            <p className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[11px]">Visit Us</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">The Showroom</h2>
            <p className="text-white/60 leading-relaxed">
              Located in Dehiwala, just minutes from Colombo, our showroom is designed to showcase each vehicle 
              in the best light. No pressure, no rush—just browse at your own pace.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white/80">Dehiwala, Colombo, Sri Lanka</span>
            </div>
          </div>
          <div className="lg:w-1/2 aspect-video rounded-3xl overflow-hidden border border-white/10">
            <img
              src={SHOWROOM_IMAGES[5].src}
              alt="Illuminated Serendib Trading logo wall inside the showroom"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - TRUST PILLARS */}
      <section className="relative overflow-hidden border-t border-white/5 px-6 py-24 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)]" />

        <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center">
          <div className="mb-20 flex max-w-4xl flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-4 flex items-center gap-4"
            >
              <div className="h-px w-12 bg-white/20" />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Our Values</span>
              <div className="h-px w-12 bg-white/20" />
            </motion.div>

            <h2 className="mb-8 text-balance text-4xl font-black leading-none text-white md:text-6xl">
              Why Choose <span className="text-[#D4AF37]">Serendib</span>
            </h2>

            <p className="max-w-2xl text-pretty text-lg font-light leading-relaxed text-gray-400 md:text-xl">
              We deliver uncompromising quality, transparent vehicle histories, and a seamless buying experience from global selection to your driveway.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Direct UK & Japan Imports", desc: "Sourced through trusted partners with records checked before listing.", icon: Globe },
              { title: "Verified Mileage", desc: "Odometer readings and documents are reviewed before vehicles reach the floor.", icon: Gauge },
              { title: "Finance Support", desc: "Leasing guidance with local finance partners and clear monthly estimates.", icon: CreditCard },
              { title: "RMV Guidance", desc: "Support for clearance, registration, insurance, and handover paperwork.", icon: FileCheck },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="group relative flex flex-col items-center rounded-3xl border border-white/5 bg-white/[0.03] p-10 text-center transition-[border-color,background-color] duration-200 hover:border-[#D4AF37]/40 hover:bg-white/[0.05]"
                >
                  <div className="relative mb-8 flex size-20 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] transition-colors duration-200 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10">
                    <Icon className="size-8 text-white/40 transition-colors duration-200 group-hover:text-[#D4AF37]" aria-hidden="true" />
                  </div>

                  <h3 className="mb-3 text-lg font-bold text-white transition-colors duration-200 group-hover:text-[#F3D67E]">
                    {feature.title}
                  </h3>

                  <p className="max-w-[220px] text-pretty text-[13px] font-light leading-relaxed text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

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
            <h2 className="text-balance text-4xl font-black leading-none text-white md:text-6xl">
              Vehicle Buying FAQ
            </h2>
          </div>

          <FAQAccordion />
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
