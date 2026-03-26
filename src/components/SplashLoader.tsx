import React, { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Styles & Data ---
const ARDENO_STYLES = `
  @keyframes avl-breathe {
    0%,100% { opacity:0.3; transform:scale(1); filter: blur(20px); }
    50%      { opacity:0.6;  transform:scale(1.15); filter: blur(30px); }
  }
  @keyframes avl-drawPath {
    from { stroke-dashoffset: 2000; filter: drop-shadow(0 0 2px rgba(212,175,55,0)); }
    to   { stroke-dashoffset: 0; filter: drop-shadow(0 0 12px rgba(212,175,55,0.6)); }
  }
  @keyframes avl-fillFade {
    from { opacity: 0; filter: blur(4px); transform: scale(0.95); }
    to   { opacity: 1; filter: blur(0px); transform: scale(1); }
  }
  @keyframes avl-charIn {
    from { opacity:0; transform: translateY(20px) scale(1.15); filter:blur(12px) brightness(2); letter-spacing: 0.05em; }
    to   { opacity:1; transform: translateY(0) scale(1); filter:blur(0) brightness(1);  letter-spacing: 0.18em; }
  }
  @keyframes avl-charInUp {
    from { opacity:0; transform: translateY(15px) scale(0.9); filter:blur(8px); }
    to   { opacity:1; transform: translateY(0) scale(1); filter:blur(0); }
  }
  @keyframes avl-crownReveal {
    from { opacity:0; transform:translateY(-20px) scale(0.9); filter: blur(10px); }
    to   { opacity:1; transform:translateY(0) scale(1); filter: blur(0px); }
  }
  @keyframes avl-fadeInPhase { from { opacity: 0; } to { opacity: 1; } }
  @keyframes avl-fadeOutPhase {
    from { opacity:1; transform:scale(1); filter: blur(0px); }
    to   { opacity:0; transform:scale(1.05); filter: blur(14px); }
  }
  @keyframes avl-flashGold {
    0%   { opacity:0; }
    40%  { opacity:1; filter: blur(10px); }
    100% { opacity:0; filter: blur(0px); }
  }
  .glass-overlay {
    backdrop-filter: blur(8px);
    background: radial-gradient(circle at 50% 50%, rgba(13,11,9,0.4) 0%, rgba(13,11,9,0.95) 100%);
  }
`;

const SERENDIB_STYLES = `
  .serendib-root { display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
  .serendib-wrap { display: flex; flex-direction: column; align-items: center; position: relative; }
  .serendib-glow { position: absolute; top: 1/2; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 500px; background: radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%); opacity: 0; filter: blur(60px); animation: serendibFadeIn 2s 0.5s ease forwards; }
  .serendib-logo-container { position: relative; width: 440px; height: 260px; display: flex; align-items: center; justify-content: center; }
  .serendib-logo-container img { width: 100%; height: 100%; object-fit: contain; brightness: 1.1; }
  .serendib-tagline { font-family: sans-serif; font-weight: 900; font-size: 14px; letter-spacing: 0.6em; text-transform: uppercase; color: #D4AF37; margin-top: 24px; text-align: center; opacity: 0; }
  .serendib-sub { font-family: sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-top: 12px; opacity: 0; }
  .serendib-track-container { position: relative; margin-top: 60px; width: 220px; height: 2px; }
  .serendib-track { position: absolute; inset: 0; background: rgba(212,175,55,0.1); overflow: hidden; }
  .serendib-fill { position: absolute; inset: 0; width: 0; background: #D4AF37; box-shadow: 0 0 10px rgba(212,175,55,0.4); }
  .serendib-car { position: absolute; bottom: 4px; left: 0; width: 60px; height: auto; transform: translateX(-50%); color: #D4AF37; filter: drop-shadow(0 0 8px rgba(212,175,55,0.4)); pointer-events: none; }
  @keyframes serendibFadeIn { to { opacity: 1; } }
`;

const A_MARK_PATH =
  "M 514.300781 878.699219 L 434.792969 718.777344 " +
  "C 411.382812 739.714844 390.78125 776.453125 391.929688 806.554688 " +
  "L 415.984375 853.996094 " +
  "C 416.851562 855.699219 418.324219 857.015625 420.113281 857.679688 " +
  "L 504.851562 889.203125 " +
  "C 511.304688 891.605469 517.367188 884.867188 514.300781 878.699219 Z " +
  "M 371.617188 791.304688 " +
  "C 371.410156 791.605469 371.222656 791.925781 371.054688 792.265625 " +
  "L 340.871094 853.445312 " +
  "C 340.011719 855.183594 338.523438 856.527344 336.707031 857.207031 " +
  "L 250.40625 889.308594 " +
  "C 243.988281 891.699219 237.9375 885.042969 240.917969 878.878906 " +
  "L 369.019531 614.007812 " +
  "C 371.769531 608.324219 379.851562 608.277344 382.664062 613.929688 " +
  "L 432.074219 713.316406 " +
  "C 404.980469 732.679688 383.765625 759.746094 371.617188 791.304688";

const FULL_COVER: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
const CENTER_FLEX: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" };

const LuxuryCarSilhouette = () => (
  <svg viewBox="0 0 160 55" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="currentColor" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
      </linearGradient>
      <filter id="car-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Ambient Floor Shadow */}
    <ellipse cx="80" cy="48" rx="85" ry="5" fill="rgba(212,175,55,0.18)" filter="blur(6px)" />
    
    {/* Sleek High-End GT Silhouette Body */}
    <path 
      d="M10,42 L10,30 C10,26 12,24 18,24 L45,24 C50,24 58,15 75,12 L115,12 C135,12 150,18 160,35 L160,42 L10,42 Z" 
      fill="url(#body-grad)" 
      filter="url(#car-glow)"
    />
    
    {/* Cabin/Windows with heavy tint */}
    <path 
      d="M75,15 L112,15 C125,15 138,20 148,32 L150,38 L75,38 Z" 
      fill="#0d0b09" 
      opacity="0.95" 
    />
    
    {/* Window Highlights (Reflections) */}
    <path d="M85,18 L110,18" stroke="white" strokeWidth="0.5" opacity="0.15" />
    <path d="M120,18 C130,18 140,23 145,30" stroke="white" strokeWidth="0.5" opacity="0.1" />
    
    {/* Luxury Multi-Spoke Rims */}
    <g>
      {/* Front Wheel */}
      <circle cx="42" cy="40" r="11" fill="#0d0b09" stroke="black" strokeWidth="0.5" />
      <circle cx="42" cy="40" r="9" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M42,30 L42,50 M32,40 L52,40 M35,33 L49,47 M49,33 L35,47" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <circle cx="42" cy="40" r="2.5" fill="currentColor" />
      
      {/* Rear Wheel */}
      <circle cx="132" cy="40" r="11" fill="#0d0b09" stroke="black" strokeWidth="0.5" />
      <circle cx="132" cy="40" r="9" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <path d="M132,30 L132,50 M122,40 L142,40 M125,33 L139,47 M139,33 L125,47" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <circle cx="132" cy="40" r="2.5" fill="currentColor" />
    </g>
    
    {/* Lighting Signature Features */}
    <g>
      {/* Xenon Headlight Signature */}
      <rect x="10" y="32" width="6" height="3" rx="1.5" fill="white" opacity="0.7" style={{ filter: "blur(0.5px)" }} />
      {/* OLED Rear Taillight Signature */}
      <path d="M154,35 L160,35 L160,37 L154,37 Z" fill="#D4AF37" opacity="0.9" style={{ filter: "blur(0.3px)" }} />
    </g>

    {/* Body Line Polish */}
    <path d="M15,24 L40,24" stroke="white" strokeWidth="0.2" opacity="0.1" />
  </svg>
);

const StaggerWord = memo<{ text: string; baseDelay: number; charStyle: React.CSSProperties; animName?: string }>(
    ({ text, baseDelay, charStyle, animName = "avl-charIn" }) => (
      <span style={{ display: "inline-block", overflow: "hidden" }}>
        {text.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              ...charStyle,
              display: "inline-block",
              opacity: 0,
              animation: `${animName} 0.7s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * 0.06}s forwards`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </span>
    )
);

const ArdenoPhase = memo<{ exiting: boolean; flashGold: boolean; progress: number }>(({ exiting, flashGold, progress }) => (
  <div
    className="glass-overlay"
    style={{
      ...FULL_COVER,
      animation: exiting ? "avl-fadeOutPhase 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards" : "avl-fadeInPhase 1s ease-out forwards",
      zIndex: 3,
      perspective: "1000px",
      background: "#0d0b09"
    }}
  >
    <div style={{ ...FULL_COVER, background: "radial-gradient(circle at 50% 45%, rgba(212,175,55,0.08) 0%, transparent 50%)", animation: "avl-breathe 5s ease-in-out infinite", pointerEvents: "none" }} />
    <div style={CENTER_FLEX}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative", zIndex: 2, transform: "translateY(-4vh)" }}>
        <div style={{ width: 120, height: 120, marginBottom: 8, opacity: 0, animation: "avl-crownReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s forwards" }}>
          <svg viewBox="200 580 340 340" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
                <linearGradient id="avl-aGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#ad8f2d" />
                </linearGradient>
                <filter id="avl-aGlow">
                    <feGaussianBlur stdDeviation="8" result="g" />
                    <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d={A_MARK_PATH} fill="none" stroke="rgba(212,175,55,0.05)" strokeWidth="1" />
            <path d={A_MARK_PATH} fill="none" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" style={{ strokeDasharray: 2000, animation: "avl-drawPath 2.2s cubic-bezier(0.2,1,0.4,1) 0.4s forwards" }} />
            <path d={A_MARK_PATH} fill="url(#avl-aGrad)" filter="url(#avl-aGlow)" style={{ opacity: 0, transformOrigin: "center", animation: "avl-fillFade 1.4s cubic-bezier(0.16,1,0.3,1) 1.8s forwards" }} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
           <StaggerWord text="ARDENO" baseDelay={0.8} charStyle={{ fontFamily: "serif", fontSize: "48px", fontWeight: 600, color: "#ffffff", letterSpacing: "0.22em" }} />
           <StaggerWord text="STUDIO" baseDelay={1.4} charStyle={{ fontFamily: "serif", fontSize: "20px", fontWeight: 300, fontStyle: "italic", color: "#D4AF37", letterSpacing: "0.6em" }} animName="avl-charInUp" />
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", width: 280, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{progress < 100 ? "LOADING" : "INITIALIZING"}</p>
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
        <motion.div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, transparent, #D4AF37)", transformOrigin: "left" }} initial={{ scaleX: 0 }} animate={{ scaleX: progress / 100 }} transition={{ ease: "easeOut", duration: 0.1 }} />
      </div>
    </div>
    {flashGold && <div style={{ ...FULL_COVER, background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.18) 0%, transparent 80%)", animation: "avl-flashGold 0.6s cubic-bezier(0.16,1,0.3,1) forwards", pointerEvents: "none", zIndex: 10 }} />}
  </div>
));

export default function SplashLoader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"ardeno" | "serendib">("ardeno");
  const [ardenoExiting, setArdenoExiting] = useState(false);
  const [flashGold, setFlashGold] = useState(false);
  const [progress, setProgress] = useState(0);
  const fillRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const s1 = document.createElement("style"); s1.textContent = ARDENO_STYLES; document.head.appendChild(s1);
    const s2 = document.createElement("style"); s2.textContent = SERENDIB_STYLES; document.head.appendChild(s2);
    
    // Smooth Progress with rAF
    const start = Date.now();
    const duration = 2400;
    const tick = () => {
      const raw = Math.min(((Date.now() - start) / duration) * 100, 100);
      setProgress(Math.round(raw));
      if (raw < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Sequence
    const t1 = setTimeout(() => setFlashGold(true), 2800);
    const t2 = setTimeout(() => setArdenoExiting(true), 2900);
    const t3 = setTimeout(() => setPhase("serendib"), 3400);

    return () => {
        s1.remove(); s2.remove();
        cancelAnimationFrame(rafRef.current);
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, []);

  // Serendib Phase Animation
  useEffect(() => {
    if (phase === "serendib") {
        let start: number | null = null;
        let serendibRaf: number;
        
        const timer = setTimeout(() => {
            const step = (ts: number) => {
                if (!start) start = ts;
                const t = Math.min((ts - start) / 2200, 1);
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                
                if (fillRef.current) fillRef.current.style.width = `${ease * 100}%`;
                if (carRef.current) carRef.current.style.left = `${ease * 100}%`;
                
                if (t < 1) {
                    serendibRaf = requestAnimationFrame(step);
                } else {
                    setTimeout(() => { onComplete(); }, 800);
                }
            };
            serendibRaf = requestAnimationFrame(step);
        }, 1200);
        
        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(serendibRaf);
        };
    }
  }, [phase, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#0d0b09" }}
    >
      <AnimatePresence mode="wait">
        {phase === "ardeno" ? (
          <ArdenoPhase key="ardeno" exiting={ardenoExiting} flashGold={flashGold} progress={progress} />
        ) : (
          <motion.div
            key="serendib"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="serendib-root"
          >
            <div className="serendib-wrap">
              <div className="serendib-glow" />
              
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="serendib-logo-container"
              >
                <img src="/serendib-logo-new.svg" alt="Serendib Trading" />
                
                {/* Sweep Animation */}
                <motion.div 
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                  className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.2em', y: 20 }}
                animate={{ opacity: 1, letterSpacing: '0.6em', y: 0 }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="serendib-tagline"
              >
                Premium Automotive
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="serendib-sub"
              >
                Excellence Since 2010
              </motion.div>

              <div className="serendib-track-container">
                <motion.div
                  ref={carRef}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="serendib-car"
                >
                  <LuxuryCarSilhouette />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="serendib-track"
                >
                  <div className="serendib-fill" ref={fillRef} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


