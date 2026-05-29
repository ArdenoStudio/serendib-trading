import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import SEO from '../components/SEO';
import { SHOWROOM_IMAGES } from '../data/showroomImages';
import { createOrganizationSchema } from '../lib/seo';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi, I'm ${formData.name}. My phone number is ${formData.phone}. ${formData.message}`;
    window.open(`https://wa.me/94756363427?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans bg-[#0d0b09] text-white selection:bg-[#D4AF37] selection:text-black">
      <SEO 
        title="Contact Serendib Trading Dehiwala"
        description="Contact Serendib Trading for imported vehicle inquiries, trade-in evaluations, showroom visits, finance questions, and WhatsApp support in Sri Lanka."
        canonical="/contact"
        pageType="ContactPage"
        ogImage={SHOWROOM_IMAGES[1].src}
        ogImageAlt="Serendib Trading showroom contact and viewing location"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
        keywords={[
          'contact Serendib Trading',
          'Dehiwala vehicle showroom contact',
          'car dealer WhatsApp Sri Lanka',
          'vehicle trade-in Sri Lanka',
        ]}
        structuredData={createOrganizationSchema()}
      />
      {/* --- CINEMATIC AMBIANCE --- */}
      <div className="absolute inset-x-0 top-0 z-0 h-[760px] overflow-hidden pointer-events-none">
        <img
          src={SHOWROOM_IMAGES[1].src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[#0d0b09]/58" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0d0b09] via-transparent to-[#0d0b09]" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/3 rounded-full blur-[160px] animate-pulse delay-1000" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* --- MINIMAL HERO --- */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 backdrop-blur-xl"
            >
                <div className="size-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px]">Visit or Message Us</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl lg:text-8xl font-black tracking-[-0.08em] uppercase leading-[0.9]"
            >
              Contact <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]">Serendib</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 font-bold uppercase tracking-[0.1em] text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            >
              Ask about an available vehicle, trade-in value, finance option, or showroom viewing. We reply fastest through WhatsApp.
            </motion.p>
          </div>

          {/* --- THE CONCIERGE CARD --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white/[0.02] backdrop-blur-[40px] border border-white/10 rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] grid grid-cols-1 lg:grid-cols-12"
          >
            
            {/* Sidebar (Details) */}
            <div className="lg:col-span-4 p-10 md:p-14 bg-white/[0.02] border-r border-white/10 space-y-14">
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">Contact Details</p>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Quick <br/> Response</h3>
              </div>

              <div className="space-y-10">
                {[
                  { icon: Phone, label: "Direct Support", val: "075 636 3427", sub: "077 779 7421", href: "tel:+94756363427" },
                  { icon: Mail, label: "Inquiries", val: "bilalikras1@gmail.com", href: "mailto:bilalikras1@gmail.com" },
                  { icon: MapPin, label: "Visit Showroom", val: "Dehiwala HQ, Colombo", href: "https://maps.google.com/?q=Dehiwala-Mount+Lavinia" },
                ].map((item, i) => (
                  <motion.a 
                    key={i}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    whileHover={{ x: 5 }}
                    className="flex gap-6 group"
                  >
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/50 transition-all shadow-2xl">
                      <item.icon className="size-6 text-[#D4AF37]/70 group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                    <div className="space-y-1 py-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 group-hover:text-[#D4AF37]/70 transition-colors">{item.label}</p>
                      <p className="text-base font-black tracking-tight text-white group-hover:text-[#D4AF37] transition-colors leading-none">{item.val}</p>
                      {item.sub && <p className="text-base font-black tracking-tight text-white group-hover:text-[#D4AF37] transition-colors leading-none">{item.sub}</p>}
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="pt-10 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-[#D4AF37]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Private Inquiry</span>
                </div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                  We use your details only to respond to your vehicle inquiry and coordinate the next step.
                </p>
              </div>
            </div>

            {/* Main Section (Form) */}
            <div className="lg:col-span-8 p-10 md:p-20 space-y-16 bg-gradient-to-br from-white/[0.01] to-transparent">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Send an <span className="text-gray-500">Inquiry</span></h2>
                <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">Response window: same business day.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="relative group">
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      className="w-full bg-transparent border-b border-white/10 py-5 text-white font-black tracking-tighter text-xl focus:outline-none focus:border-[#D4AF37] transition-all peer placeholder-transparent"
                      id="name"
                      placeholder="Full Name"
                    />
                    <label 
                      htmlFor="name" 
                      className="absolute left-0 -top-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] transition-all peer-placeholder-shown:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#D4AF37]"
                    >
                      Full Name
                    </label>
                  </div>
                  <div className="relative group">
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} 
                      className="w-full bg-transparent border-b border-white/10 py-5 text-white font-black tracking-tighter text-xl focus:outline-none focus:border-[#D4AF37] transition-all peer placeholder-transparent"
                      id="phone"
                      placeholder="Contact No"
                    />
                    <label 
                      htmlFor="phone" 
                      className="absolute left-0 -top-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] transition-all peer-placeholder-shown:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#D4AF37]"
                    >
                      Contact Number
                    </label>
                  </div>
                </div>

                <div className="relative group">
                  <textarea 
                    rows={4} 
                    required 
                    value={formData.message} 
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                    className="w-full bg-transparent border-b border-white/10 py-5 text-white font-black tracking-tighter text-xl focus:outline-none focus:border-[#D4AF37] transition-all peer placeholder-transparent resize-none"
                    id="message"
                    placeholder="Message"
                  />
                  <label 
                    htmlFor="message" 
                    className="absolute left-0 -top-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] transition-all peer-placeholder-shown:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:top-10 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#D4AF37]"
                  >
                    Your Requirements
                  </label>
                </div>

                <div className="pt-6">
                  <LiquidButton asChild size="xxl" className="w-full md:w-auto">
                    <button type="submit" className="w-full md:w-auto px-16 flex items-center justify-center gap-6 text-[11px] font-black tracking-[0.4em] uppercase">
                      Send via WhatsApp <ArrowRight className="size-5" />
                    </button>
                  </LiquidButton>
                </div>
              </form>
            </div>
          </motion.div>

          {/* --- MAP SECTION --- */}
          <section className="space-y-12 pt-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Showroom Location</p>
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Dehiwala <span className="text-gray-600">Showroom</span></h3>
              </div>
              <div className="h-px bg-white/5 flex-1 mx-16 hidden md:block" />
            </div>
            <div className="h-[600px] w-full relative rounded-[48px] overflow-hidden border border-white/10 shadow-2xl group">
               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black via-transparent to-black/40 mix-blend-multiply" 
               />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.346850239077!2d79.86608731477255!3d6.849007995050114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25b201a0a5555%3A0x7d2862e3d3e21376!2s47%2FA%20S.%20De%20S.%20Jayasinghe%20Mawatha%2C%20Dehiwala-Mount%20Lavinia%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(100%) invert(95%) contrast(110%) hue-rotate(180deg) brightness(0.6)' }} 
                allowFullScreen 
                loading="lazy" 
                title="Serendib Showroom"
              />
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

