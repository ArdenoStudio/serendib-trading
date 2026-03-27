import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator as CalcIcon, 
  TrendingUp, 
  Calendar, 
  Wallet,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { LiquidButton } from './ui/liquid-glass-button';

export default function LoanCalculator() {
  const [price, setPrice] = useState(15000000);
  const [downPayment, setDownPayment] = useState(30);
  const [term, setTerm] = useState(60);
  const [monthly, setMonthly] = useState(0);
  const interestRate = 0.125; // 12.5% Premium Rate

  useEffect(() => {
    const principal = price - (price * (downPayment / 100));
    const monthlyRate = interestRate / 12;
    if (principal > 0 && monthlyRate > 0 && term > 0) {
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
      setMonthly(payment);
    } else setMonthly(0);
  }, [price, downPayment, term]);

  const fmt = (val: number) => new Intl.NumberFormat('en-LK', { 
    style: 'currency', 
    currency: 'LKR', 
    maximumFractionDigits: 0 
  }).format(val);

  return (
    <div className="max-w-[1300px] mx-auto rounded-[40px] overflow-hidden bg-[#0d0b09] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* --- LEFT: CALIBRATION --- */}
        <div className="p-10 md:p-16 space-y-16 border-r border-white/5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                <CalcIcon className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Parameter Calibration</h3>
          </div>

          <div className="space-y-12">
            {/* Price Slider */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Asset Valuation</label>
                <motion.span 
                    key={price}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-black italic text-white"
                >
                    {fmt(price)}
                </motion.span>
              </div>
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="2000000" 
                  max="150000000" 
                  step="1000000" 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))} 
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#D4AF37] bg-white/5" 
                />
                <div className="flex justify-between mt-3 text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
                  <span>2M LKR</span>
                  <span>150M LKR</span>
                </div>
              </div>
            </div>

            {/* Down Payment Slider */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Initial Equity</label>
                    <p className="text-[10px] font-bold text-gray-600 uppercase italic">Min 10% Required</p>
                </div>
                <div className="text-right">
                    <span className="text-xl font-black italic text-[#D4AF37]">{downPayment}%</span>
                    <p className="text-[10px] font-bold text-gray-600 uppercase">{fmt(price * (downPayment / 100))}</p>
                </div>
              </div>
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="10" 
                  max="80" 
                  step="5" 
                  value={downPayment} 
                  onChange={(e) => setDownPayment(Number(e.target.value))} 
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#D4AF37] bg-white/5" 
                />
              </div>
            </div>

            {/* Term Multi-Select */}
            <div className="space-y-6">
              <label className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                Tenure Strategy (Months)
              </label>

              <div className="grid grid-cols-5 gap-3">
                {[12, 24, 36, 48, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`aspect-square md:aspect-auto md:h-20 rounded-[20px] text-[15px] font-black transition-all duration-500 border ${
                      term === t 
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_10px_20px_rgba(212,175,55,0.2)] scale-105' 
                      : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: INVESTMENT SUMMARY --- */}
        <div className="bg-white/[0.02] p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="space-y-12 relative z-10 text-center lg:text-left">
            <div className="space-y-2">
                <span className="text-xs font-black tracking-[0.5em] uppercase text-[#D4AF37]">Estimated Investment</span>
                <p className="text-gray-500 text-[13px] font-medium uppercase tracking-widest italic">Per Calendary Month</p>
            </div>

            <div className="space-y-2">
                <AnimatePresence mode="wait">
                    <div className="flex flex-col gap-1 items-center lg:items-start overflow-hidden">
                        <span className="text-[10px] font-black italic text-[#D4AF37] mb-1">LKR PER MONTH</span>
                        <motion.div
                            key={monthly}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="text-5xl md:text-7xl xl:text-[5.5rem] font-black italic tracking-tighter text-white leading-none whitespace-nowrap"
                        >
                            {Math.round(monthly).toLocaleString()}
                        </motion.div>
                    </div>
                </AnimatePresence>
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                    <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-[#D4AF37]" />
                        <span className="text-[9px] font-black uppercase text-[#D4AF37]">12.5% Base APR</span>
                    </div>
                </div>
            </div>

            {/* Breakdown Mini-Stats */}
            <div className="pt-12 space-y-6">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-600">
                    <span>Principal Amount</span>
                    <span className="text-white">{fmt(price - (price * (downPayment / 100)))}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-600">
                    <span>Finance Charges</span>
                    <span className="text-white">Variable</span>
                </div>
                <div className="w-full h-[1px] bg-white/5" />
            </div>
          </div>

          <div className="pt-20 space-y-6 relative z-10">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <p className="text-xs font-medium leading-relaxed italic text-white/50">
                   Final terms subject to individual appraisal and bank approval.
                 </p>
            </div>
            
            <LiquidButton asChild size="xl" className="w-full">
                <a
                    href="https://wa.me/94756363427"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-4 w-full text-[14px] font-bold tracking-[0.1em] uppercase text-white"
                >
                    <Wallet className="w-4 h-4" />
                    Proceed to Luxury Financing
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </a>
            </LiquidButton>
          </div>

          {/* Bottom Accent */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D4AF37]/5 blur-3xl rounded-full" />
        </div>
      </div>
    </div>
  );
}
