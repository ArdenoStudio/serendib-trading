import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedUserIcon } from './ui/animated-user-icon';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/inventory', label: 'Vehicles' },
  { to: '/about', label: 'About' },
  { to: '/calculator', label: 'Finance' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
          scrolled
            ? 'bg-[#0d0b09]/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent border-b border-transparent'
        }`}
        aria-label="Main navigation"
      >
        <div className={`max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between relative transition-[height] duration-500 ${scrolled ? 'h-[72px]' : 'h-[88px]'}`}>

          {/* ── Logo ── */}
          <Link to="/" onClick={closeMobile} className="flex items-center shrink-0 group">
            <img
              src="/serendib-logo-new.svg"
              alt="Serendib Trading"
              className={`w-auto object-contain transition-all duration-500 group-hover:opacity-85 ${scrolled ? 'h-[44px]' : 'h-[68px] md:h-[78px]'}`}
            />
          </Link>

          {/* ── Desktop nav (true center) ── */}
          <ul className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = link.to === '/'
                ? location.pathname === '/'
                : location.pathname === link.to || location.pathname.startsWith(link.to + '/');
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex flex-col items-center gap-[3px] text-[11px] font-bold uppercase tracking-[0.15em] py-1 transition-colors duration-200"
                    style={{ color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
                  >
                    {link.label}
                    <motion.span
                      animate={{ width: isActive ? '100%' : '0%' }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="block h-px bg-[#D4AF37] rounded-full"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Right CTAs ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all duration-300 active:scale-95"
              aria-label="Admin Dashboard"
            >
              <AnimatedUserIcon size={16} className="text-[#D4AF37]" strokeWidth={2} />
            </Link>
            <a
              href="https://wa.me/94756363427"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] text-black active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg,#E5C158 0%,#D4AF37 100%)' }}
            >
              Get In Touch
            </a>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X className="w-6 h-6 text-[#D4AF37]" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu className="w-6 h-6 text-white/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

        </div>
      </nav>

      {/* ── Full-screen Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 flex flex-col bg-[#0d0b09] md:hidden"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D4AF37]/8 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img src="/serendib-logo-new.svg" alt="" aria-hidden="true" className="w-64 opacity-[0.04]" />
            </div>

            <div className="relative z-10 flex flex-col h-full px-8 pt-24 pb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37]/60 mb-10">Navigation</p>

              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <motion.li
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.055, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={link.to}
                          onClick={closeMobile}
                          className="flex items-baseline justify-between py-4 border-b border-white/5 group active:opacity-60 transition-opacity"
                        >
                          <span
                            className="text-4xl font-black uppercase tracking-tight leading-none transition-colors duration-200"
                            style={{ color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}
                          >
                            {link.label}
                          </span>
                          <span className="text-[#D4AF37]/30 text-lg group-hover:text-[#D4AF37] transition-colors">→</span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.4 }}
                className="mt-auto flex flex-col gap-3 pt-8"
              >
                <a
                  href="https://wa.me/94756363427"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className="w-full py-4 text-center text-[13px] font-black uppercase tracking-[0.12em] rounded-2xl text-black active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg,#E5C158 0%,#D4AF37 100%)' }}
                >
                  Get In Touch
                </a>
                <Link
                  to="/admin/login"
                  onClick={closeMobile}
                  className="w-full py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 border border-white/10 rounded-2xl active:scale-[0.98] transition-transform"
                >
                  Admin
                </Link>
              </motion.div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 text-center">
                Serendib Trading &bull; Est. 2010
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
