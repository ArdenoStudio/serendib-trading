import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0b09] text-white font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <SEO
        title="Page Not Found"
        description="The page you are looking for doesn't exist. Return to Serendib Trading's vehicle collection."
        canonical="/404"
        noindex
      />
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_60%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center gap-8 max-w-lg"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Error 404</span>
            <div className="w-8 h-[1px] bg-white/20" />
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-[-0.06em] font-serif italic text-white leading-none">
            Lost<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] font-sans not-italic">the road.</span>
          </h1>

          <p className="text-white/60 text-base md:text-lg font-normal leading-relaxed max-w-sm">
            This page doesn't exist or was moved. Let us guide you back to our collection.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              to="/inventory"
              className="relative overflow-hidden inline-flex items-center justify-center px-10 py-4 text-[13px] font-black tracking-[0.08em] uppercase rounded-full active:scale-[0.96] transition-transform"
              style={{ background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 100%)', color: '#000000' }}
            >
              Browse Collection
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 text-[13px] font-bold tracking-wide text-white/60 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
