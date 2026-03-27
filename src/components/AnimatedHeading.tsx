import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
  align?: 'left' | 'center';
}

export default function AnimatedHeading({ children, className = '', eyebrow, align = 'left' }: AnimatedHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-12 ${align === 'center' ? 'flex flex-col items-center text-center' : 'flex flex-col items-start'} ${className}`}
    >
      {eyebrow && (
        <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#D4AF37]/50" />
            <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                {eyebrow}
            </p>
        </div>
      )}
      <h2
        className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.9]"
      >
        {children}
      </h2>
      <div className="w-24 h-[1px] bg-white/5 mt-8" />
    </motion.div>
  );
}
