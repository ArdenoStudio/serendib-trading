import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoanCalculator from '../components/LoanCalculator';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { motion } from 'framer-motion';

export default function Calculator() {
  return (
    <div className="min-h-screen font-sans bg-black text-white relative overflow-hidden">
      <Navbar />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-40 pointer-events-none">
        <img src="/images/dashboard.png" className="w-full h-full object-cover" alt="Luxury Interior" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      <div className="relative z-10 pt-32 md:pt-40 pb-24 md:pb-32 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 space-y-6"
        >
          <div className="space-y-2">
            <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-xs">Financial Planning</p>
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Investment <br /> <span className="text-[#D4AF37]">Calculator</span>
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-gray-400 font-medium leading-relaxed">
            Tailor your acquisition strategy with our bespoke financial tool. Estimate monthly investments based on your preferred parameters.
          </p>
        </motion.div>

        <div className="glass-panel rounded-[40px] overflow-hidden">
          <LoanCalculator />
        </div>

        <div className="mt-24 text-center space-y-8">
            <div className="h-px w-40 bg-[#D4AF37]/30 mx-auto" />
            <div className="space-y-4">
                <h3 className="text-2xl font-black italic uppercase">Bespoke Financing</h3>
                <p className="text-gray-500 max-w-lg mx-auto font-medium">
                    Corporate leasing, individual packages, and seasonal offers are available through our premier banking partners. Visit us for a private consultation.
                </p>
            </div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

