import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Phone, MessageCircle, Calendar, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import carsData from '../data/cars.json';

export default function CarDetail() {
  const { id } = useParams();
  const car = carsData.find(c => c.id === id);

  const [testDriveForm, setTestDriveForm] = useState({ name: '', phone: '', date: '', time: '9:30am' });

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
        <h1 className="text-[36px] font-extrabold mb-4" style={{ color: '#FFFFFF' }}>Vehicle Not Found</h1>
        <Link to="/inventory" className="text-[14px] font-bold" style={{ color: '#D4AF37', borderBottom: '2px solid #D4AF37', paddingBottom: '2px' }}>
          Back to Inventory
        </Link>
      </div>
    );
  }

  const whatsappMessage = `Hi Serendib Trading! I'm interested in the ${car.year} ${car.make} ${car.model}. Could you share more details?`;

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi! I'd like to book a test drive for the ${car.year} ${car.make} ${car.model}. My name is ${testDriveForm.name}, preferred date: ${testDriveForm.date} at ${testDriveForm.time}. My number: ${testDriveForm.phone}`;
    window.open(`https://wa.me/94756363427?text=${encodeURIComponent(text)}`, '_blank');
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    padding: '14px 16px',
    fontSize: '15px',
    width: '100%',
    borderRadius: '10px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111111',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    borderRadius: '16px',
    padding: '32px',
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <Navbar />

      <div className="pt-36 pb-24 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <Link to="/inventory" className="inline-flex items-center gap-2 text-[14px] font-bold mb-10 group transition-colors duration-200" style={{ color: '#FFFFFF' }}>
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Image */}
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={car.image} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-200" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-md text-[13px] font-bold" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37' }}>{car.year}</span>
              <span className="text-[14px] font-semibold" style={{ color: '#A1A1AA' }}>{car.bodyType}</span>
              <span className="text-[11px] px-3 py-1 rounded-md tracking-wider uppercase" style={{ backgroundColor: car.condition === 'New' ? '#D4AF37' : '#000000', color: car.condition === 'New' ? '#000000' : '#FFFFFF', fontWeight: 800 }}>{car.condition}</span>
            </div>

            <h1 className="text-[40px] md:text-[50px] font-extrabold mb-2" style={{ color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {car.make} {car.model}
            </h1>

            <p className="text-[32px] font-extrabold mb-10" style={{ color: '#D4AF37' }}>
              LKR {car.price.toLocaleString()}
            </p>

            {/* Specs Grid */}
            <div style={{ ...cardStyle, marginBottom: '32px' }}>
              <h3 className="text-[18px] font-bold mb-6" style={{ color: '#FFFFFF' }}>Specifications</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                {[
                  { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
                  { label: 'Fuel', value: car.fuel },
                  { label: 'Transmission', value: car.transmission },
                  { label: 'Condition', value: car.condition },
                ].map((spec, i) => (
                  <div key={i} className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="block text-[12px] tracking-widest uppercase mb-1 font-bold" style={{ color: '#A1A1AA' }}>{spec.label}</span>
                    <span className="text-[15px] font-semibold" style={{ color: '#FFFFFF' }}>{spec.value}</span>
                  </div>
                ))}
              </div>

              {car.keyFeatures && car.keyFeatures.length > 0 && (
                <div className="mt-8">
                  <span className="block text-[12px] tracking-widest uppercase mb-4 font-bold" style={{ color: '#A1A1AA' }}>Features</span>
                  <div className="flex flex-wrap gap-2">
                    {car.keyFeatures.map((f, i) => (
                      <span key={i} className="px-4 py-2 text-[13px] font-semibold rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {car.description && (
              <div className="mb-10 px-2">
                <h3 className="text-[18px] font-bold mb-4" style={{ color: '#FFFFFF' }}>Description</h3>
                <p className="text-[15px] leading-relaxed font-medium" style={{ color: '#A1A1AA' }}>{car.description}</p>
              </div>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <a href={`https://wa.me/94756363427?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="py-4 rounded-xl text-center text-[14px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: '#25D366', color: 'white' }}>
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
              <a href="tel:+94756363427" className="py-4 rounded-xl text-center text-[14px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors duration-200" style={{ border: '2px solid rgba(255,255,255,0.1)', color: '#FFFFFF', backgroundColor: 'transparent' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1A1A1A'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}>
                <Phone className="w-5 h-5" /> Call Us
              </a>
            </div>

            {/* Test Drive Card */}
            <div style={cardStyle}>
              <h3 className="text-[20px] font-extrabold mb-6" style={{ color: '#FFFFFF' }}>Book a Test Drive</h3>
              <form onSubmit={handleTestDriveSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-[#A1A1AA] mb-1 pl-1">Name</label>
                    <input type="text" placeholder="John Doe" required value={testDriveForm.name} onChange={e => setTestDriveForm({ ...testDriveForm, name: e.target.value })} className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={inputStyle} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-[#A1A1AA] mb-1 pl-1">Phone</label>
                    <input type="tel" placeholder="07XXXXXXXX" required value={testDriveForm.phone} onChange={e => setTestDriveForm({ ...testDriveForm, phone: e.target.value })} className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col relative w-full">
                    <label className="text-[12px] font-bold text-[#A1A1AA] mb-1 pl-1">Date</label>
                    <div className="relative w-full">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#A1A1AA' }} />
                      <input type="date" required value={testDriveForm.date} onChange={e => setTestDriveForm({ ...testDriveForm, date: e.target.value })} className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full" style={{ ...inputStyle, paddingLeft: '44px' }} />
                    </div>
                  </div>
                  <div className="flex flex-col relative w-full">
                    <label className="text-[12px] font-bold text-[#A1A1AA] mb-1 pl-1">Time</label>
                    <div className="relative w-full">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#A1A1AA' }} />
                      <select required value={testDriveForm.time} onChange={e => setTestDriveForm({ ...testDriveForm, time: e.target.value })} className="appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full" style={{ ...inputStyle, paddingLeft: '44px' }}>
                        <option value="9:30am">9:30 AM</option>
                        <option value="11:00am">11:00 AM</option>
                        <option value="1:00pm">1:00 PM</option>
                        <option value="3:00pm">3:00 PM</option>
                        <option value="5:00pm">5:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 mt-2 rounded-xl text-[14px] font-bold tracking-widest uppercase transition-all duration-200 shadow-md" style={{ backgroundColor: '#D4AF37', color: '#000000' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#CCA429'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#D4AF37'; }}>
                  Book Appointment
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
