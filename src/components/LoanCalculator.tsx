import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoanCalculator() {
  const [price, setPrice] = useState(10000000);
  const [downPayment, setDownPayment] = useState(20);
  const [term, setTerm] = useState(60);
  const [monthly, setMonthly] = useState(0);
  const interestRate = 0.12;

  useEffect(() => {
    const principal = price - (price * (downPayment / 100));
    const monthlyRate = interestRate / 12;
    if (principal > 0 && monthlyRate > 0 && term > 0) {
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
      setMonthly(payment);
    } else setMonthly(0);
  }, [price, downPayment, term]);

  const fmt = (val: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div
      className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Controls Section */}
        <div className="p-10 md:p-14 space-y-12">
          <div>
            <label className="block text-[13px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Vehicle Price</label>
            <input 
              type="range" 
              min="1000000" 
              max="100000000" 
              step="1000000" 
              value={price} 
              onChange={(e) => setPrice(Number(e.target.value))} 
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#D4AF37]" 
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} 
            />
            <div className="mt-4 text-[32px] font-black" style={{ color: '#D4AF37' }}>{fmt(price)}</div>
          </div>
          <div>
            <label className="block text-[13px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Down Payment</label>
            <input 
              type="range" 
              min="10" 
              max="80" 
              step="5" 
              value={downPayment} 
              onChange={(e) => setDownPayment(Number(e.target.value))} 
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#D4AF37]" 
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} 
            />
            <div className="mt-4 flex justify-between items-end">
              <span className="text-[28px] font-black" style={{ color: '#D4AF37' }}>{downPayment}%</span>
              <span className="text-[14px] font-bold text-gray-500">{fmt(price * (downPayment / 100))}</span>
            </div>
          </div>
          <div>
            <label className="block text-[13px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Repayment Period (Months)</label>

            <div className="flex flex-wrap gap-3">
              {[12, 24, 36, 48, 60].map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  className="w-16 h-16 rounded-2xl text-[16px] transition-all duration-200"
                  style={{
                    border: `2px solid ${term === t ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: term === t ? '#D4AF37' : '#1A1A1A',
                    color: term === t ? '#000000' : '#A1A1AA',
                    fontWeight: term === t ? 800 : 600,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div
          className="p-10 md:p-14 flex flex-col justify-center items-center text-center"
          style={{ backgroundColor: '#0A0A0A', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-[13px] tracking-widest uppercase font-bold mb-6" style={{ color: '#A1A1AA' }}>Estimated Monthly Payment</span>
          <motion.div
            key={monthly}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[48px] md:text-[60px] font-extrabold mb-4 leading-none"
            style={{ color: '#D4AF37' }}
          >
            {fmt(monthly)}
          </motion.div>
          <p className="text-[15px] mb-12 font-medium" style={{ color: 'rgba(161,161,170,0.7)' }}>Based on 12% annual interest rate.</p>

          <a
            href="https://wa.me/94756363427"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-sm py-5 rounded-xl text-center text-[15px] font-bold uppercase tracking-wide transition-all duration-200"
            style={{ backgroundColor: '#D4AF37', color: '#000000' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#CCA429'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#D4AF37'; }}
          >
            Apply for Finance
          </a>
        </div>
      </div>
    </div>
  );
}
