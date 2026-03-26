import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi, I'm ${formData.name}. My phone number is ${formData.phone}. ${formData.message}`;
    window.open(`https://wa.me/94756363427?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen font-sans bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* LUXURY CONTACT HERO */}
      <section className="pt-32 md:pt-48 pb-16 md:pb-24 px-6 lg:px-10 max-w-[1400px] mx-auto text-center space-y-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="space-y-4"
        >
          <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-xs">Personal Concierge</p>
          <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-tight">
            Connect <br /> With <span className="text-[#D4AF37]">Excellence</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 font-medium">
            Whether you are looking to acquire a masterpiece or require a private consultation, our specialists are at your disposal.
          </p>
        </motion.div>
      </section>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Info Side (Col-5) */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Immediate Assistance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                 {[
                   { icon: Phone, label: "Direct Line", val: "075 636 3427", sub: "077 779 7421", href: "tel:0756363427" },
                   { icon: Mail, label: "Official Inquiry", val: "bilalikras1@gmail.com", href: "mailto:bilalikras1@gmail.com" },
                   { icon: MapPin, label: "Our Showroom", val: "47/A S. De S. Jayasinghe Mawatha, Dehiwala", href: "https://maps.google.com" },
                   { icon: Clock, label: "Concierge Hours", val: "Mon – Sun: 9:30 AM – 7:00 PM" },
                 ].map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-start gap-6 group"
                   >
                     <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500">
                       <item.icon className="w-6 h-6" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500">{item.label}</p>
                        <p className="text-[16px] font-bold text-white group-hover:text-[#D4AF37] transition-colors">{item.val}</p>
                        {item.sub && <p className="text-[16px] font-bold text-white group-hover:text-[#D4AF37] transition-colors">{item.sub}</p>}
                     </div>
                   </motion.div>
                 ))}
              </div>
            </div>

            {/* Social / WhatsApp Direct */}
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                  <h4 className="font-black italic uppercase tracking-tighter">Priority WhatsApp</h4>
                </div>
                <p className="text-gray-400 text-sm font-medium">Instant replies for vehicle availability and trade-in valuations through our secure priority line.</p>
                <a href="https://wa.me/94756363427" className="inline-flex items-center gap-3 text-[#D4AF37] font-black uppercase text-xs tracking-widest group">
                  Open Priority Chat <span className="w-8 h-px bg-[#D4AF37] group-hover:w-12 transition-all"></span>
                </a>
            </div>
          </div>

          {/* Form Side (Col-7) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 glass-panel rounded-[40px] p-10 md:p-14 space-y-10"
          >
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">Send Inquiry</h3>
              <p className="text-gray-400 font-medium">Please provide your details for a bespoke response.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Alexander Noble" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[15px] font-medium focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-2">Direct Contact</label>
                    <input 
                      type="tel" 
                      placeholder="07XXXXXXXX" 
                      required 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[15px] font-medium focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-2">Your Requirements / Message</label>
                    <textarea 
                      rows={6} 
                      placeholder="Tell us about the vehicle you are interested in..." 
                      required 
                      value={formData.message} 
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[15px] font-medium focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                    />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-[#D4AF37] text-black font-black uppercase text-[15px] tracking-[0.1em] italic group overflow-hidden relative rounded-2xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Send className="w-5 h-5 shrink-0" /> Proceed via WhatsApp
                  </span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] italic" />
                </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Cinematic Map */}
      <section className="h-[600px] w-full relative">
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_50px_100px_rgba(0,0,0,1)]" />
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.346850239077!2d79.86608731477255!3d6.849007995050114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25b201a0a5555%3A0x7d2862e3d3e21376!2s47%2FA%20S.%20De%20S.%20Jayasinghe%20Mawatha%2C%20Dehiwala-Mount%20Lavinia%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(120%) hue-rotate(180deg) opacity(0.8)' }} 
          allowFullScreen 
          loading="lazy" 
          title="Serendib Showroom"
        />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-3 bg-black/80 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
          Corporate Headquarters ⋅ Showroom ⋅ Dehiwala
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

