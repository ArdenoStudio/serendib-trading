import { useEffect, useState, useRef } from 'react';
import { useInView, motion } from 'framer-motion';

interface StatsCounterProps {
  end: number;
  label: string;
  suffix?: string;
}

export default function StatsCounter({ end, label, suffix = '' }: StatsCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center p-12 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl transition-all duration-700 hover:border-[#D4AF37]/30 group relative overflow-hidden h-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-6xl md:text-8xl font-black italic tracking-tighter text-[#D4AF37] mb-4 group-hover:scale-105 transition-transform duration-700"
      >
        {count}{suffix}
      </motion.div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="text-[10px] md:text-[12px] tracking-[0.4em] uppercase font-black text-gray-500 group-hover:text-white transition-colors duration-700 text-center"
      >
        {label}
      </motion.div>
    </div>
  );
}
