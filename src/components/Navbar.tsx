import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiquidButton } from './ui/liquid-glass-button';
import { AnimatedUserIcon } from './ui/animated-user-icon';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/inventory', label: 'Vehicles' },
  { to: '/about', label: 'About us' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass transition-colors duration-300"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[90px] flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 shrink-0"
          onClick={() => {
            setMobileOpen(false);
            scrollToTop();
          }}
        >
          <img
            src="/serendib-logo-new.svg"
            alt="Serendib Trading"
            className="h-[50px] md:h-[80px] w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={scrollToTop}
                className="relative py-2 text-[13px] font-bold font-sans transition-colors duration-200"
                style={{
                  color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.7)';
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/admin/login" 
            className="group flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all duration-300"
            aria-label="Admin Dashboard Login"
          >
            <span className="sr-only">Admin Dashboard Login</span>
            <AnimatedUserIcon size={20} className="text-[#D4AF37]" strokeWidth={2} />
          </Link>
          <LiquidButton asChild size="lg">
            <a 
              href="https://wa.me/94756363427" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 text-[12px] font-bold tracking-[0.1em] uppercase text-white"
            >
              + Get In Touch
            </a>
          </LiquidButton>
        </div>


        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          style={{ color: '#D4AF37' }}
        >
          {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-8 pb-10 space-y-1 animate-in fade-in slide-in-from-top-4 duration-300"
          style={{ backgroundColor: '#000000', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="py-8 border-b border-white/5 mb-4">
             <h2 className="text-white font-extrabold text-xl tracking-widest uppercase">
               SERENDIB <span className="text-[#D4AF37]">TRADING</span>
             </h2>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Established 2010</p>
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setMobileOpen(false);
                  scrollToTop();
                }}
                className="block py-3 text-[14px] font-medium transition-colors duration-200"
                style={{
                  color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/admin/login"
            onClick={() => setMobileOpen(false)}
            className="block py-4 text-center text-[12px] font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/20 rounded-lg mt-4"
          >
            Dashboard
          </Link>
          <a
            href="https://wa.me/94756363427"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 py-4 text-center text-[12px] font-semibold tracking-wide rounded-lg"
            style={{
              backgroundColor: '#D4AF37',
              color: '#000000',
            }}
          >
            + Get In Touch
          </a>
        </div>

      )}
    </nav>
  );
}
