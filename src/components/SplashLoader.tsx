import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "lucide-react";

// --- Styles & Data ---
const SERENDIB_STYLES = `
  .serendib-root { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    min-height: 100vh; 
    overflow: hidden; 
    background: #0d0b09;
    position: relative;
  }
  
  .serendib-noise {
    position: absolute;
    inset: 0;
    opacity: 0.015;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Ffilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
  }

  .serendib-wrap { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 10; }
  
  .serendib-mesh-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.15;
    pointer-events: none;
  }

  .serendib-logo-container { position: relative; width: 440px; height: 260px; display: flex; align-items: center; justify-content: center; }
  .serendib-logo-container img { width: 100%; height: 100%; object-fit: contain; brightness: 1.1; filter: drop-shadow(0 0 30px rgba(212,175,55,0.15)); }
  
  .serendib-tagline { 
    font-family: 'Outfit', 'Inter', sans-serif; 
    font-weight: 900; 
    font-size: 14px; 
    letter-spacing: 0.6em; 
    text-transform: uppercase; 
    color: #D4AF37; 
    margin-top: 32px; 
    text-align: center; 
    text-shadow: 0 0 20px rgba(212,175,55,0.2);
  }
  
  .serendib-sub { 
    font-family: 'Outfit', 'Inter', sans-serif; 
    font-weight: 700; 
    font-size: 10px; 
    letter-spacing: 0.4em; 
    text-transform: uppercase; 
    color: rgba(255,255,255,0.25); 
    margin-top: 14px; 
  }
  
  .serendib-track-container { 
    position: relative; 
    margin-top: 80px; 
    width: 280px; 
    height: 4px; 
  }
  
  .serendib-track { 
    position: absolute; 
    inset: 0; 
    background: rgba(212,175,55,0.05); 
    overflow: visible; 
    border-radius: 2px;
  }
  
  .serendib-track-tick {
    position: absolute;
    top: 6px;
    width: 1px;
    height: 4px;
    background: rgba(212,175,55,0.2);
  }

  .serendib-fill { 
    position: absolute; 
    inset: 0; 
    width: 0; 
    background: linear-gradient(90deg, transparent, #D4AF37); 
    box-shadow: 0 0 15px rgba(212,175,55,0.5); 
    border-radius: 2px;
  }

  .serendib-car { 
    position: absolute; 
    bottom: 8px; 
    left: 0; 
    transform: translateX(-50%); 
    color: #D4AF37; 
    filter: drop-shadow(0 0 12px rgba(212,175,55,0.6)); 
    pointer-events: none; 
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export default function SplashLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const fillRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s2 = document.createElement("style"); 
    s2.textContent = SERENDIB_STYLES; 
    document.head.appendChild(s2);
    
    let start: number | null = null;
    let serendibRaf: number;
    
    const timer = setTimeout(() => {
        const step = (ts: number) => {
            if (!start) start = ts;
            const duration = 2400;
            const t = Math.min((ts - start) / duration, 1);
            
            // Premium custom easing for acceleration feel
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            
            setProgress(ease);
            
            if (fillRef.current) fillRef.current.style.width = `${ease * 100}%`;
            if (carRef.current) carRef.current.style.left = `${ease * 100}%`;
            
            if (t < 1) {
                serendibRaf = requestAnimationFrame(step);
            } else {
                setTimeout(() => { onComplete(); }, 1000);
            }
        };
        serendibRaf = requestAnimationFrame(step);
    }, 800);
    
    return () => {
        s2.remove();
        clearTimeout(timer);
        cancelAnimationFrame(serendibRaf);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(40px)" }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#0d0b09" }}
      className="serendib-root"
      role="status"
      aria-live="polite"
      aria-label="Loading Serendib Trading Premium Automotive"
    >
      <div className="serendib-noise" />
      
      {/* Mesh Orbs */}
      <motion.div 
        animate={{ 
          x: [-20, 20, -20], 
          y: [-20, 20, -20],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="serendib-mesh-orb w-[600px] h-[600px] bg-[#D4AF37]/5 top-[-10%] left-[-10%]" 
      />
      <motion.div 
        animate={{ 
          x: [20, -20, 20], 
          y: [20, -20, 20],
          scale: [1.1, 1, 1.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="serendib-mesh-orb w-[500px] h-[500px] bg-[#D4AF37]/5 bottom-[-10%] right-[-10%]" 
      />

      <div className="serendib-wrap">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="serendib-logo-container"
        >
          <motion.img 
            animate={{ 
              filter: ["brightness(1) drop-shadow(0 0 20px rgba(212,175,55,0.1))", "brightness(1.2) drop-shadow(0 0 40px rgba(212,175,55,0.3))", "brightness(1) drop-shadow(0 0 20px rgba(212,175,55,0.1))"] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src="/serendib-logo-new.svg" 
            alt="Serendib Trading" 
          />
          
          <motion.div 
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg]"
          />
        </motion.div>

        <motion.div className="flex flex-col items-center">
            <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em', y: 20 }}
            animate={{ opacity: 1, letterSpacing: '0.6em', y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="serendib-tagline"
            >
            Premium Automotive
            </motion.p>
            
            <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="serendib-sub"
            >
            Excellence Since 2010
            </motion.div>
        </motion.div>

        <div className="serendib-track-container">
          {/* Tick Marks */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <div 
              key={tick} 
              className="serendib-track-tick" 
              style={{ left: `${tick}%`, opacity: progress > tick / 100 ? 0.8 : 0.2 }} 
            />
          ))}

          <motion.div
            ref={carRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                rotateZ: progress * 8 - 4 // Light vibration
            }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="serendib-car"
          >
            <Car size={32} strokeWidth={1.5} />
            {/* Minimal Leading Glow */}
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-[#D4AF37]/20 blur-md rounded-full -z-10"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="serendib-track"
          >
            <div className="serendib-fill" ref={fillRef} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
