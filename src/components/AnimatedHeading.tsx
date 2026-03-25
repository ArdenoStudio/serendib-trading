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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-10 ${align === 'center' ? 'text-center' : ''} ${className}`}
    >
      {eyebrow && (
        <p className="text-[14px] font-bold mb-2 uppercase tracking-wide" style={{ color: '#D4AF37' }}>
          {eyebrow}
        </p>
      )}
      <h2
        className="text-[36px] md:text-[46px] font-extrabold"
        style={{ color: '#0A1128', letterSpacing: '-0.02em', lineHeight: 1.15 }}
      >
        {children}
      </h2>
    </motion.div>
  );
}
