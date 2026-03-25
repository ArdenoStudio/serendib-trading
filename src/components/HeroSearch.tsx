import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSearch() {
  const [condition, setCondition] = useState<'all' | 'New' | 'Registered' | 'Reconditioned'>('all');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [bodyType, setBodyType] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (condition !== 'all') params.append('condition', condition);
    if (make) params.append('make', make);
    if (model) params.append('model', model);
    if (price) params.append('maxPrice', price);
    if (bodyType) params.append('bodyType', bodyType);
    navigate(`/inventory?${params.toString()}`);
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: isActive ? 700 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: isActive ? '#FFFFFF' : '#A1A1AA',
    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderBottom: isActive ? '3px solid #D4AF37' : '3px solid transparent',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  });

  const selectStyle: React.CSSProperties = {
    padding: '16px 30px 16px 20px', // Added a bit more right padding so text doesn't hit the arrow
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    fontSize: '14px',
    appearance: 'none',
    fontWeight: 600,
    borderRadius: '8px',
    width: '100%',
    cursor: 'pointer'
  };

  const optionClass = "bg-[#111111] text-white";

  return (
    <div className="w-full max-w-[1100px] mx-auto bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex bg-white/5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {(['all', 'New', 'Registered', 'Reconditioned'] as const).map((cond) => (
          <button
            key={cond}
            type="button"
            onClick={() => setCondition(cond)}
            style={tabStyle(condition === cond)}
            className="whitespace-nowrap flex-1 hover:bg-white/10"
          >
            {cond === 'all' ? 'All Vehicles' : cond}
          </button>
        ))}
      </div>

      {/* Form (Responsive 5-Column Grid) */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 p-6 gap-4 items-center">
        {/* Makes */}
        <div className="relative w-full min-w-0">
          <select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full min-w-0 truncate"
            style={selectStyle}
          >
            <option value="" className={optionClass}>All Makes</option>
            <option value="Toyota" className={optionClass}>Toyota</option>
            <option value="Honda" className={optionClass}>Honda</option>
            <option value="Suzuki" className={optionClass}>Suzuki</option>
            <option value="Nissan" className={optionClass}>Nissan</option>
            <option value="Mitsubishi" className={optionClass}>Mitsubishi</option>
            <option value="Hyundai" className={optionClass}>Hyundai</option>
            <option value="Mercedes" className={optionClass}>Mercedes</option>
            <option value="BMW" className={optionClass}>BMW</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
            ▼
          </div>
        </div>

        {/* Models */}
        <div className="relative w-full min-w-0">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full min-w-0 truncate"
            style={selectStyle}
          >
            <option value="" className={optionClass}>All Models</option>
            <option value="Prado" className={optionClass}>Prado</option>
            <option value="Axio" className={optionClass}>Axio</option>
            <option value="Vezel" className={optionClass}>Vezel</option>
            <option value="Civic" className={optionClass}>Civic</option>
            <option value="Wagon R" className={optionClass}>Wagon R</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
            ▼
          </div>
        </div>

        {/* Max Price */}
        <div className="relative w-full min-w-0">
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full min-w-0 truncate"
            style={selectStyle}
          >
            <option value="" className={optionClass}>Max Price</option>
            <option value="5000000" className={optionClass}>5M LKR</option>
            <option value="10000000" className={optionClass}>10M LKR</option>
            <option value="20000000" className={optionClass}>20M LKR</option>
            <option value="50000000" className={optionClass}>50M LKR</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
            ▼
          </div>
        </div>

        {/* Body Types */}
        <div className="relative w-full min-w-0">
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full min-w-0 truncate"
            style={selectStyle}
          >
            <option value="" className={optionClass}>Body Type</option>
            <option value="Sedan" className={optionClass}>Sedan</option>
            <option value="SUV" className={optionClass}>SUV</option>
            <option value="Hatchback" className={optionClass}>Hatchback</option>
            <option value="Van" className={optionClass}>Van</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
            ▼
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, backgroundColor: '#b5952f' }}
          whileTap={{ scale: 0.98 }}
          className="h-full min-h-[52px] w-full min-w-0 bg-[#D4AF37] text-black font-bold rounded-md transition-all duration-300 flex items-center justify-center uppercase tracking-wide text-[14px]"
        >
          <Search className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Search</span>
        </motion.button>
      </form>
    </div>
  );
}