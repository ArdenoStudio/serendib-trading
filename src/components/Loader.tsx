import React from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center">
        {/* Minimal Logo Display */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-t-2 border-r-2 border-[#D4AF37]/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-b-2 border-l-2 border-[#D4AF37]/10 rounded-full"
          />
          
          <motion.img 
            src="/serendib-logo-new.svg"
            alt="Serendib"
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-24 w-auto relative z-10 brightness-110 drop-shadow-2xl"
          />
        </div>

        {/* Text Animation */}
        <div className="text-center space-y-3">
          <motion.h2 
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            className="text-white font-black text-xs uppercase italic tracking-[0.5em]"
          >
            Serendib
          </motion.h2>
          <motion.p 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.3em]"
          >
            Orchestrating Excellence
          </motion.p>
        </div>

        {/* Loading Progress Bar Mockup */}
        <div className="mt-12 w-48 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
