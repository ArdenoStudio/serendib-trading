import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashLoader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onComplete(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? null : null}
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'exit' ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#0A1128', pointerEvents: phase === 'exit' ? 'none' : 'all' }}
      >
        {/* Logo */}
        <motion.img
          src="/serendib-logo-new.svg"
          alt="Serendib Trading"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '120px', width: 'auto' }}
          className="relative z-10 rounded-xl"
        />

        {/* Animated line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase === 'text' || phase === 'exit' ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 origin-center"
          style={{ width: '60px', height: '1px', backgroundColor: '#D4AF37' }}
        />

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === 'text' || phase === 'exit' ? 1 : 0, y: phase === 'text' || phase === 'exit' ? 0 : 10 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 relative z-10 font-sans"
          style={{
            fontSize: '10px',
            letterSpacing: '0.5em',
            color: 'rgba(212,175,55,0.8)',
            textTransform: 'uppercase',
          }}
        >
          Premium Automotive
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
