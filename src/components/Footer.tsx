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
      className="bg-[#0A0A0A] border-t border-white/10 pt-20 pb-8 text-gray-400"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col">
            <h2 className="text-white font-extrabold text-2xl tracking-widest mb-6 uppercase">
              SERENDIB <span className="text-[#D4AF37]">TRADING</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs font-light">
              Sri Lanka's premier destination for luxury and performance vehicles. Direct imports from the UK and Japan with unmatched quality.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Quick Links</h3>
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
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Showroom</h3>
            <ul className="space-y-4 text-sm font-light">
              <li className="flex flex-col">
                <span className="text-white font-medium mb-1">Address</span>
                <span>47/A S. De S. Jayasinghe Mawatha,</span>
                <span>Dehiwala-Mount Lavinia</span>
              </li>
              <li className="flex flex-col mt-2">
                <span className="text-white font-medium mb-1">Contact</span>
                <a href="tel:+94756363427" className="hover:text-[#D4AF37] transition-colors">+94 75 636 3427</a>
                <a href="mailto:bilalikras1@gmail.com" className="hover:text-[#D4AF37] transition-colors">bilalikras1@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Opening Hours */}
          <div className="flex flex-col">
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Opening Hours</h3>
            <ul className="space-y-4 text-sm font-light">
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
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs font-light">
          <p>© {new Date().getFullYear()} Serendib Trading. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-6">
            <p className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">Privacy Policy</p>
            <p className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">Terms of Service</p>
          </div>
        </div>

        {/* Production Credit */}
        <ArdenoProductionCredit color="#D4AF37" />

      </div>
    </motion.footer>
  );
}

