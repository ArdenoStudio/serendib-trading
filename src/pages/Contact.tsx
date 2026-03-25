import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedHeading from '../components/AnimatedHeading';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi, I'm ${formData.name}. My phone number is ${formData.phone}. ${formData.message}`;
    window.open(`https://wa.me/94756363427?text=${encodeURIComponent(text)}`, '_blank');
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    padding: '16px 20px',
    fontSize: '15px',
    width: '100%',
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111111',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.4)',
    borderRadius: '24px',
    padding: '40px',
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <Navbar />

      <div className="pt-40 pb-24 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <AnimatedHeading eyebrow="We'd Love to Hear From You" align="center">Contact Us</AnimatedHeading>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 max-w-6xl mx-auto">
          {/* Info Card */}
          <div style={cardStyle}>
            <h3 className="text-[28px] font-extrabold mb-10" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>Get in Touch</h3>
            <ul className="space-y-8">
              {[
                { icon: <Phone className="w-6 h-6" />, label: 'Phone', content: <><a href="tel:0756363427" className="block text-[18px] font-bold hover:text-[#D4AF37] transition-colors">075 636 3427</a><a href="tel:0777797421" className="block text-[18px] font-bold hover:text-[#D4AF37] transition-colors">077 779 7421</a></> },
                { icon: <Mail className="w-6 h-6" />, label: 'Email', content: <a href="mailto:bilalikras1@gmail.com" className="hover:text-[#D4AF37] transition-colors text-[16px] font-medium">bilalikras1@gmail.com</a> },
                { icon: <MapPin className="w-6 h-6" />, label: 'Address', content: <span className="text-[16px] font-medium leading-relaxed">47/A S. De S. Jayasinghe Mawatha,<br />Dehiwala-Mount Lavinia</span> },
                { icon: <Clock className="w-6 h-6" />, label: 'Hours', content: <span className="text-[16px] font-medium">Mon – Sun: 9:30 AM – 7:00 PM</span> },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-6">
                  <div className="w-14 h-14 flex items-center justify-center shrink-0 rounded-2xl" style={{ backgroundColor: '#1A1A1A', color: '#D4AF37' }}>
                    {item.icon}
                  </div>
                  <div className="pt-1">
                    <span className="block text-[12px] tracking-widest uppercase mb-1 font-bold" style={{ color: '#A1A1AA' }}>{item.label}</span>
                    <div style={{ color: '#FFFFFF' }}>{item.content}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={cardStyle}
          >
            <h3 className="text-[28px] font-extrabold mb-10" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[13px] tracking-wide font-bold mb-2 ml-1" style={{ color: '#A1A1AA' }}>Full Name</label>
                <input type="text" placeholder="John Doe" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[13px] tracking-wide font-bold mb-2 ml-1" style={{ color: '#A1A1AA' }}>Phone Number</label>
                <input type="tel" placeholder="07XXXXXXXX" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[13px] tracking-wide font-bold mb-2 ml-1" style={{ color: '#A1A1AA' }}>Message</label>
                <textarea required rows={5} placeholder="How can we help you?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none" style={inputStyle} />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden w-full py-5 flex items-center justify-center gap-3 text-[15px] font-bold tracking-wide uppercase mt-8 rounded-xl shadow-md group"
                style={{ backgroundColor: '#D4AF37', color: '#000000' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3"><Send className="w-5 h-5" /> Send via WhatsApp</span>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Map */}
      <section className="h-[400px] w-full mt-10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.346850239077!2d79.86608731477255!3d6.849007995050114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25b201a0a5555%3A0x7d2862e3d3e21376!2s47%2FA%20S.%20De%20S.%20Jayasinghe%20Mawatha%2C%20Dehiwala-Mount%20Lavinia%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
          width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) invert(90%) hue-rotate(180deg) opacity(0.8)' }} allowFullScreen loading="lazy" title="Location"
        />
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
