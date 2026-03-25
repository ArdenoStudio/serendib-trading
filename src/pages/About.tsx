import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedHeading from '../components/AnimatedHeading';
import StatsCounter from '../components/StatsCounter';
import FAQAccordion from '../components/FAQAccordion';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 lg:px-10 max-w-[1400px] mx-auto text-center" style={{ backgroundColor: '#000000' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/serendib-logo-new.svg" alt="Serendib Trading" className="mx-auto mb-8 rounded-xl" style={{ height: '96px', objectFit: 'contain' }} />
          <h1 className="text-[44px] md:text-[60px] font-extrabold mb-8" style={{ color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Our Legacy
          </h1>
          <p className="text-[16px] md:text-[18px] max-w-3xl mx-auto leading-relaxed font-medium" style={{ color: '#A1A1AA' }}>
            Serendib Trading is a Dehiwala-based vehicle dealership offering a curated selection of brand new, registered, and reconditioned vehicles. We believe every Sri Lankan deserves to drive their way — on their terms, at the right price.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 relative" style={{ zIndex: 10 }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCounter end={15} label="Years Active" suffix="+" />
            <StatsCounter end={5000} label="Cars Sold" suffix="+" />
            <StatsCounter end={98} label="Happy Clients" suffix="%" />
          </div>
        </div>
      </section>

      {/* Gallery - 2x2 Uniform Grid */}
      <section className="py-24 px-6 lg:px-10 max-w-[1200px] mx-auto">
        <AnimatedHeading eyebrow="Inside Our Showroom" align="center">The Showroom</AnimatedHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {[
            "https://images.unsplash.com/photo-1562141961-b5d189fa4e18?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200",
          ].map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <img src={src} alt={`Showroom ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <AnimatedHeading eyebrow="Common Questions" align="center">Frequently Asked Questions</AnimatedHeading>
        <div className="mt-12 flex justify-center">
          <FAQAccordion />
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
