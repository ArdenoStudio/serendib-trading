import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  
  // Outer ring utilizes spring physics for that buttery smooth trailing delay
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothRingX = useSpring(ringX, springConfig);
  const smoothRingY = useSpring(ringY, springConfig);

  // Inner dot tracks exactly 1:1 with the mouse
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  useEffect(() => {
    // Add global class to hide the native cursor on desktop to prevent visual doubling
    document.documentElement.classList.add('hide-native-cursor');

    const manageMouseMove = (e: MouseEvent) => {
      // Center the 32x32 outer ring (-16 offset)
      ringX.set(e.clientX - 16);
      ringY.set(e.clientY - 16);
      
      // Center the 8x8 inner dot (-4 offset)
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Triggers interactive expanded state
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('select') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', manageMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', manageMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.classList.remove('hide-native-cursor');
    };
  }, [ringX, ringY, dotX, dotY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] hidden lg:block"
        style={{
          x: smoothRingX,
          y: smoothRingY,
          backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
          border: isHovering ? '1px solid rgba(212, 175, 55, 0)' : '1px solid rgba(212, 175, 55, 0.6)',
          scale: isHovering ? 1.6 : 1,
        }}
        transition={{ scale: { duration: 0.3, ease: 'easeOut' }, backgroundColor: { duration: 0.3 } }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#D4AF37] rounded-full pointer-events-none z-[10000] hidden lg:block"
        style={{
          x: dotX,
          y: dotY,
          opacity: isHovering ? 0 : 1,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
      />
    </>
  );
}
