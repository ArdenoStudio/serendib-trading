import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import AnimatedHeading from '../components/AnimatedHeading';
import WhatsAppFloat from '../components/WhatsAppFloat';
import carsData from '../data/cars.json';

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState(carsData);

  const [filters, setFilters] = useState({
    condition: searchParams.get('condition') || 'all',
    make: searchParams.get('make') || '',
    bodyType: '',
    fuel: '',
    maxPrice: 50000000
  });

  useEffect(() => {
    let result = carsData;
    if (filters.condition !== 'all') result = result.filter(c => c.condition.toLowerCase() === filters.condition.toLowerCase());
    if (filters.make) result = result.filter(c => c.make === filters.make);
    if (filters.bodyType) result = result.filter(c => c.bodyType === filters.bodyType);
    if (filters.fuel) result = result.filter(c => c.fuel === filters.fuel);
    result = result.filter(c => c.price <= filters.maxPrice);
    setCars(result);
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    padding: '12px 14px',
    fontSize: '14px',
    width: '100%',
    fontWeight: 500,
    borderRadius: '8px'
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <Navbar />

      <div className="pt-32 pb-24 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <AnimatedHeading eyebrow="Browse Our Collection">Our Vehicles</AnimatedHeading>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Filters Sidebar */}
          <div
            className="lg:col-span-1 space-y-8 p-6 h-fit lg:sticky lg:top-28 rounded-xl"
            style={{
              backgroundColor: '#111111',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.4)'
            }}
          >
            <div>
              <label className="block text-[12px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Condition</label>
              <div className="flex flex-col gap-2">
                {['all', 'New', 'Registered', 'Reconditioned'].map(cond => (
                  <button
                    key={cond}
                    onClick={() => handleFilterChange('condition', cond)}
                    className="text-left py-2.5 px-4 text-[14px] font-semibold transition-colors duration-200 rounded-lg"
                    style={{
                      backgroundColor: filters.condition.toLowerCase() === cond.toLowerCase() ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      color: filters.condition.toLowerCase() === cond.toLowerCase() ? '#D4AF37' : '#6C757D',
                    }}
                  >
                    {cond === 'all' ? 'All' : cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px opacity-10" style={{ backgroundColor: '#FFFFFF' }} />

            <div>
              <label className="block text-[12px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Make</label>
              <select value={filters.make} onChange={(e) => handleFilterChange('make', e.target.value)} className="appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={selectStyle}>
                <option value="" className="bg-[#111111] text-white">All Makes</option>
                <option value="Toyota" className="bg-[#111111] text-white">Toyota</option>
                <option value="Honda" className="bg-[#111111] text-white">Honda</option>
                <option value="Suzuki" className="bg-[#111111] text-white">Suzuki</option>
                <option value="Nissan" className="bg-[#111111] text-white">Nissan</option>
                <option value="Mitsubishi" className="bg-[#111111] text-white">Mitsubishi</option>
                <option value="Hyundai" className="bg-[#111111] text-white">Hyundai</option>
              </select>
            </div>

            <div className="h-px opacity-10" style={{ backgroundColor: '#FFFFFF' }} />

            <div>
              <label className="block text-[12px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Body Type</label>
              <select value={filters.bodyType} onChange={(e) => handleFilterChange('bodyType', e.target.value)} className="appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={selectStyle}>
                <option value="" className="bg-[#111111] text-white">All Types</option>
                <option value="Sedan" className="bg-[#111111] text-white">Sedan</option>
                <option value="SUV" className="bg-[#111111] text-white">SUV</option>
                <option value="Hatchback" className="bg-[#111111] text-white">Hatchback</option>
                <option value="Van" className="bg-[#111111] text-white">Van</option>
                <option value="Pick-up" className="bg-[#111111] text-white">Pick-up</option>
              </select>
            </div>

            <div className="h-px opacity-10" style={{ backgroundColor: '#FFFFFF' }} />

            <div>
              <label className="block text-[12px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#D1D5DB' }}>Fuel Type</label>
              <select value={filters.fuel} onChange={(e) => handleFilterChange('fuel', e.target.value)} className="appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={selectStyle}>
                <option value="" className="bg-[#111111] text-white">All Fuels</option>
                <option value="Petrol" className="bg-[#111111] text-white">Petrol</option>
                <option value="Diesel" className="bg-[#111111] text-white">Diesel</option>
                <option value="Hybrid" className="bg-[#111111] text-white">Hybrid</option>
                <option value="Electric" className="bg-[#111111] text-white">Electric</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-4">
            <p className="text-[14px] font-medium mb-8" style={{ color: '#A1A1AA' }}>
              Showing <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{cars.length}</span> vehicles
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CarCard car={car} />
                </motion.div>
              ))}
            </div>
            {cars.length === 0 && (
              <div className="text-center py-24 shadow-md rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#111111' }}>
                <p className="text-[18px] font-bold mb-4" style={{ color: '#FFFFFF' }}>No vehicles found.</p>
                <p className="text-[15px] mb-6" style={{ color: '#A1A1AA' }}>Try adjusting your search criteria.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilters({ condition: 'all', make: '', bodyType: '', fuel: '', maxPrice: 50000000 })}
                  className="mt-4 px-8 py-3 text-[14px] font-bold text-gray-400 hover:text-white transition-all duration-200 rounded-lg uppercase tracking-wide border border-white/10"
                  style={{ backgroundColor: 'transparent' }}
                >
                  Clear Filters
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
