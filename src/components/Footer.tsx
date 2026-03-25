import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative pt-16 pb-8 overflow-hidden"
      style={{
        backgroundColor: '#0A1128', // Dark Navy Blue
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          {/* Logo + Description */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-block mb-5">
              <img
                src="/serendib-logo-new.svg"
                alt="Serendib Trading"
                className="h-[56px] w-auto object-contain rounded-md"
              />
            </Link>
            <p className="text-[13px] leading-relaxed max-w-[320px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Established with a commitment to excellence, Serendib Trading offers a curated selection of premium vehicles. Our dedicated team ensures every client drives away with an exceptional experience.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="text-[15px] font-semibold mb-5 font-sans" style={{ color: '#FFFFFF' }}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/inventory', label: 'Listings' },
                { to: '/about', label: 'About us' },
                { to: '/calculator', label: 'Loan Calculator' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[14px] transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D4AF37'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    • {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-[15px] font-semibold mb-5 font-sans" style={{ color: '#FFFFFF' }}>Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0" style={{ color: '#D4AF37' }} />
                <span className="text-[14px] leading-relaxed pt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  47/A S. De S. Jayasinghe Mawatha,<br />Dehiwala-Mount Lavinia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 mx-0.5" style={{ color: '#D4AF37' }} />
                <a href="mailto:bilalikras1@gmail.com" className="text-[14px] transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  bilalikras1@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Phone + Hours */}
          <div className="md:col-span-3 md:text-right">
            <div className="mb-6">
              <a href="tel:+94756363427" className="block text-[24px] font-bold mb-1 transition-colors duration-200 hover:opacity-80" style={{ color: '#D4AF37' }}>
                +94-75-636-3427
              </a>
              <a href="tel:+94777797421" className="block text-[15px] transition-colors duration-200 hover:opacity-80" style={{ color: 'rgba(255,255,255,0.7)' }}>
                +94-77-779-7421
              </a>
            </div>
            <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Mon – Sun: 9:30 AM – 7:00 PM
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Copyright © {new Date().getFullYear()} Serendib Trading
          </p>
          <a
            href="https://ardenostudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-medium transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D4AF37'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
          >
            Developed & Designed By Ardeno Studio
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
