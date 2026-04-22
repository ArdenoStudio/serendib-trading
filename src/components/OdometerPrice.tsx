import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface OdometerPriceProps {
  price: number;
  className?: string;
}

export default function OdometerPrice({ price, className = '' }: OdometerPriceProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1500;
      const increment = price / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= price) { setDisplayValue(price); clearInterval(timer); }
        else setDisplayValue(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, price]);

  return (
    <div ref={ref} className={`font-bold ${className}`} style={{ color: '#D4AF37' }}>
      LKR {displayValue.toLocaleString()}
    </div>
  );
}
