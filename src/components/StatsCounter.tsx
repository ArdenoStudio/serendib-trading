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
      className="flex flex-col items-center justify-center p-10 rounded-2xl transition-transform duration-300 hover:-translate-y-2"
      style={{
        backgroundColor: '#111111',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-[52px] font-extrabold mb-2"
        style={{ color: '#D4AF37' }}
      >
        {count}{suffix}
      </motion.div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="text-[14px] tracking-widest uppercase font-bold"
        style={{ color: '#FFFFFF' }}
      >
        {label}
      </motion.div>
    </div>
  );
}
