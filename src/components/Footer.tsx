import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArdenoProductionCredit from './ArdenoProductionCredit';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="bg-[#0A0A0A] border-t border-white/10 pt-12 pb-6 text-gray-400"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-8">

          {/* Column 1: Brand */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/serendib-logo-new.svg"
                alt="Serendib Trading"
                className="h-12 w-auto object-contain shrink-0"
              />
              <div>
                <p className="text-white font-extrabold text-lg tracking-widest uppercase leading-tight">
                  SERENDIB
                </p>
                <p className="text-[#D4AF37] font-extrabold text-lg tracking-widest uppercase leading-tight">
                  TRADING
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs font-light">
              Direct imports from the UK and Japan. Every vehicle curated for quality, performance, and prestige.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-[0.25em] mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Inventory', path: '/inventory' },
                { name: 'Financing', path: '/calculator' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center text-sm font-medium transition-colors hover:text-[#D4AF37]"
                  >
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mr-2 text-[#D4AF37]">
                      &rarr;
                    </span>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Showroom */}
          <div className="flex flex-col">
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-[0.25em] mb-6">Showroom</h3>
            <ul className="space-y-4 text-sm font-light">
              <li className="flex flex-col">
                <span className="text-white font-medium mb-1">Address</span>
                <span>47/A S. De S. Jayasinghe Mawatha,</span>
                <span>Dehiwala-Mount Lavinia</span>
              </li>
              <li className="flex flex-col mt-2 tabular-nums">
                <span className="text-white font-medium mb-1">Contact</span>
                <a href="tel:+94756363427" className="hover:text-[#D4AF37] transition-colors active:scale-[0.98] inline-block w-fit">+94 75 636 3427</a>
                <a href="mailto:bilalikras1@gmail.com" className="hover:text-[#D4AF37] transition-colors active:scale-[0.98] inline-block w-fit">bilalikras1@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Opening Hours */}
          <div className="flex flex-col">
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-[0.25em] mb-6">Opening Hours</h3>
            <ul className="space-y-4 text-sm font-light tabular-nums">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Mon - Fri</span>
                <span className="text-white">9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Sat</span>
                <span className="text-white">9:00 AM - 2:00 PM</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Sun</span>
                <span className="text-[#D4AF37]">Closed</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/5 text-xs font-light tabular-nums">
          <p>© {new Date().getFullYear()} Serendib Trading. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-6">
            <Link to="/privacy" className="opacity-50 hover:opacity-100 transition-opacity hover:text-[#D4AF37]">Privacy Policy</Link>
            <Link to="/terms" className="opacity-50 hover:opacity-100 transition-opacity hover:text-[#D4AF37]">Terms of Service</Link>
          </div>
        </div>

        {/* Production Credit */}
        <ArdenoProductionCredit color="#ffffffff" />

      </div>
    </motion.footer>
  );
}
