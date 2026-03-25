import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass transition-colors duration-300"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[80px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/serendib-logo-new.svg"
            alt="Serendib Trading"
            className="h-[70px] w-auto object-contain py-1"
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

        {/* CTA */}
        <motion.a
          href="https://wa.me/94756363427"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden hidden md:flex items-center justify-center px-6 py-2.5 text-[12px] font-bold tracking-wide font-sans group rounded-md shadow-md"
          style={{
            backgroundColor: '#D4AF37',
            color: '#000000',
          }}
        >
          <span className="relative z-10">+ Get In Touch</span>
          {/* Gradient Sweep Layer */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
        </motion.a>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: '#D4AF37' }}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6 space-y-1"
          style={{ backgroundColor: '#000000' }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
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
          <a
            href="https://wa.me/94756363427"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 py-3 text-center text-[12px] font-semibold tracking-wide"
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
