import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full h-full min-h-[52px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select ${placeholder}`}
        aria-expanded={isOpen}
        className={`w-full h-full min-h-[56px] flex items-center justify-between px-6 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border transition-all duration-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 active:scale-[0.98] ${isOpen ? 'border-[#C69320] shadow-[0_0_20px_rgba(198,147,32,0.15)] ring-1 ring-[#C69320]/20' : 'border-white/10 hover:border-white/20'}`}
      >
        <span className={`truncate text-[14px] font-semibold ${selectedOption ? 'text-white' : 'text-white/80'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="ml-2 flex-shrink-0"
        >
          <ChevronDown className="size-4 text-[#D4AF37]/70" strokeWidth={2.5} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ 
              type: "spring",
              duration: 0.4,
              bounce: 0.3
            }}
            className="absolute z-50 w-full mt-3 bg-[#0a0a0a] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] py-3 max-h-72 overflow-y-auto overscroll-contain no-scrollbar"
            style={{ 
              transformOrigin: 'top center'
            }}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.03
                  }
                }
              }}
            >
              <motion.button
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  show: { opacity: 1, x: 0 }
                }}
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-[14px] font-bold transition-colors ${
                  value === "" ? "text-[#D4AF37] bg-[#D4AF37]/10" : "text-white hover:bg-white/5 hover:text-[#D4AF37]"
                }`}
              >
                {placeholder}
              </motion.button>
              {options.map((opt) => (
                <motion.button
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0 }
                  }}
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-[14px] font-medium transition-colors ${
                    value === opt.value ? "text-[#D4AF37] bg-[#D4AF37]/10" : "text-white/80 hover:bg-white/5 hover:text-[#D4AF37]"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HeroSearch() {
  const [condition, setCondition] = useState<'all' | 'New' | 'Registered' | 'Reconditioned'>('all');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [cars, setCars] = useState<Car[]>(carsData);
  const navigate = useNavigate();
  const [isSearchHovered, setIsSearchHovered] = useState(false);

  useEffect(() => {
    const fetchLiveVehicles = async () => {
      const { data, error } = await supabase.from('cars').select('*');
      if (!error && data) {
        setCars(data);
      }
    };
    fetchLiveVehicles();
  }, []);

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

    return { 
      makes: makes.map(m => ({ label: m, value: m })), 
      models: models.map(m => ({ label: m, value: m })), 
      bodyTypes: bodyTypes.map(bt => ({ label: bt, value: bt }))
    };
  }, [condition, make, cars]);

  const priceOptions = [
    { label: "5M LKR", value: "5000000" },
    { label: "10M LKR", value: "10000000" },
    { label: "20M LKR", value: "20000000" },
    { label: "50M LKR", value: "50000000" },
    { label: "100M LKR", value: "100000000" },
  ];

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

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-[32px] relative z-20">
      {/* Search Header / Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center px-8 py-6 gap-6 border-b border-white/5 bg-white/[0.02] rounded-t-[32px]">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Vehicle Search</span>
        </div>
        <div className="flex overflow-x-auto gap-2 no-scrollbar">
        {(['all', 'New', 'Registered', 'Reconditioned'] as const).map((cond) => {
          const isActive = condition === cond;
          return (
            <button
              key={cond}
              type="button"
              aria-label={`Switch to ${cond === 'all' ? 'all vehicles' : cond} search`}
              onClick={() => {
                setCondition(cond);
                setMake('');
                setModel('');
              }}
              className={`relative whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                isActive 
                  ? 'text-black' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabSearch"
                  className="absolute inset-0 bg-[#D4AF37] rounded-full z-0"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{cond === 'all' ? 'All Vehicles' : cond}</span>
            </button>
          );
        })}
      </div>
    </div>

      {/* Form (Responsive 5-Column Grid) */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_56px] p-8 gap-5 items-center bg-black/20 rounded-b-[32px]">
        {/* Makes */}
        <CustomSelect 
          value={make} 
          onChange={(val) => {
            setMake(val);
            setModel('');
          }} 
          options={options.makes} 
          placeholder="All Makes" 
        />

        {/* Models */}
        <CustomSelect 
          value={model} 
          onChange={setModel} 
          options={options.models} 
          placeholder="All Models" 
        />

        {/* Max Price */}
        <CustomSelect 
          value={price} 
          onChange={setPrice} 
          options={priceOptions} 
          placeholder="Max Price" 
        />

        {/* Body Types */}
        <CustomSelect 
          value={bodyType} 
          onChange={setBodyType} 
          options={options.bodyTypes} 
          placeholder="Body Type" 
        />

        {/* Search Button */}
        <motion.button
          type="submit"
          aria-label="Search vehicles"
          onMouseEnter={() => setIsSearchHovered(true)}
          onMouseLeave={() => setIsSearchHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="lg:size-14 h-14 w-full font-black rounded-2xl transition-all duration-300 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] sm:col-span-2 md:col-span-4 lg:col-span-1 group/btn relative overflow-hidden ring-1 ring-[#D4AF37]/50"
          style={{ background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 100%)', color: '#000000' }}
        >
          {/* Internal Button Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 relative z-10"
            animate={{
              scale: isSearchHovered ? 1.15 : 1,
              rotate: isSearchHovered ? -12 : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 15 
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <motion.line
              x1="21" y1="21" x2="16.65" y2="16.65"
              animate={{
                x1: isSearchHovered ? 22 : 21,
                y1: isSearchHovered ? 22 : 21,
                x2: isSearchHovered ? 17.65 : 16.65,
                y2: isSearchHovered ? 17.65 : 16.65
              }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 15 
              }}
            />
          </motion.svg>
        </motion.button>
      </form>
    </div>
  );
}