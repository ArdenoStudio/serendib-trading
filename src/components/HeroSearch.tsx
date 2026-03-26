import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';

export default function HeroSearch() {
  const [condition, setCondition] = useState<'all' | 'New' | 'Registered' | 'Reconditioned'>('all');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [cars, setCars] = useState<Car[]>(carsData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveVehicles = async () => {
      const { data, error } = await supabase.from('cars').select('*');
      if (!error && data) {
        setCars(data);
      }
    };
    fetchLiveVehicles();
  }, []);

  // Dynamically get unique values from live cars state (Available only)
  const options = useMemo(() => {
    const availableCars = (cars.length > 0 ? cars : carsData as Car[]).filter(car => !car.is_sold);

    const filteredByCondition = condition === 'all' 
      ? availableCars 
      : availableCars.filter(car => car.condition === condition);

    const makes = Array.from(new Set(filteredByCondition.map(car => car.make))).sort();
    
    const models = Array.from(new Set(
      filteredByCondition
        .filter(car => !make || car.make === make)
        .map(car => car.model)
    )).sort();

    const bodyTypes = Array.from(new Set(filteredByCondition.map(car => car.bodyType))).sort();

    return { makes, models, bodyTypes };
  }, [condition, make]);

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
    padding: window.innerWidth < 640 ? '12px 14px' : '16px 24px',
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
    padding: '16px 30px 16px 20px',
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
            onClick={() => {
              setCondition(cond);
              setMake('');
              setModel('');
            }}
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
            onChange={(e) => {
              setMake(e.target.value);
              setModel('');
            }}
            className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full min-w-0 truncate"
            style={selectStyle}
          >
            <option value="" className={optionClass}>All Makes</option>
            {options.makes.map(m => (
              <option key={m} value={m} className={optionClass}>{m}</option>
            ))}
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
            {options.models.map(m => (
              <option key={m} value={m} className={optionClass}>{m}</option>
            ))}
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
            <option value="100000000" className={optionClass}>100M LKR</option>
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
            {options.bodyTypes.map(bt => (
              <option key={bt} value={bt} className={optionClass}>{bt}</option>
            ))}
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