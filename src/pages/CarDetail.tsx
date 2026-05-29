import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Phone, MessageCircle, Calendar, Clock, Gauge, Fuel, Settings, ShieldCheck, MapPin, Share2, Award, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import CarCard from '../components/CarCard';
import { isSupabaseConfigured, logCarView, supabase } from '../lib/supabase';
import { Car } from '../data/types';
import carsData from '../data/cars.json';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import ImageLightbox from '../components/ImageLightbox';
import { createVehicleSchema } from '../lib/seo';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
        if (!error && data) {
          setCar(data);
          setLoading(false);
          return;
        }
      }

      const fallback = (carsData as Car[]).find(c => c.id === id);
      setCar(fallback || null);
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  const [testDriveForm, setTestDriveForm] = useState({ name: '', phone: '', date: '', time: '9:30am' });
  const [leadError, setLeadError] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [activeImage, setActiveImage] = useState(car?.image || '');
  const [copyToast, setCopyToast] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Track active image updates and Log View
  useEffect(() => {
    if (car?.image) {
      setActiveImage(car.image);
      logCarView(car.id);
    }
  }, [car]);

  // Similar Vehicles Logic - Pull from live or fallback
  const similarVehicles = useMemo(() => {
    if (!car) return [];
    return (carsData as Car[])
      .filter(c => c.id !== car.id && (c.make === car.make || c.bodyType === car.bodyType) && !c.is_sold)
      .slice(0, 3);
  }, [car]);


  if (loading) return <Loader />;

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#0d0b09] text-white">
        <SEO
          title="Vehicle Not Found"
          description="This Serendib Trading vehicle listing is no longer available. Browse the current inspected vehicle inventory."
          canonical={id ? `/car/${id}` : '/inventory'}
          noindex
        />
        <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Vehicle Not Found</h1>
        <Link to="/inventory" className="text-[#D4AF37] font-black uppercase tracking-widest text-xs border-b-2 border-[#D4AF37] pb-1 hover:text-white hover:border-white transition-all">
          Back to Inventory
        </Link>
      </div>
    );
  }

  const whatsappMessage = `Hi Serendib Trading! I'm interested in the ${car.year} ${car.make} ${car.model}. Could you share more details?`;

  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = testDriveForm.name.trim().replace(/\s+/g, ' ');
    const phone = testDriveForm.phone.trim();
    const phonePattern = /^[0-9+() -]{7,20}$/;
    const requestedDate = new Date(`${testDriveForm.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (name.length < 2 || name.length > 120) {
      setLeadError('Enter a valid full name.');
      return;
    }
    if (!phonePattern.test(phone)) {
      setLeadError('Enter a valid contact number.');
      return;
    }
    if (Number.isNaN(requestedDate.getTime()) || requestedDate < today) {
      setLeadError('Choose today or a future date.');
      return;
    }

    setLeadError('');
    setSubmittingLead(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('leads').insert([{
        type: 'Test Drive',
        vehicle_id: car.id,
        vehicle_model: `${car.year} ${car.make} ${car.model}`,
        name,
        phone,
        date: testDriveForm.date,
        time: testDriveForm.time,
        status: 'New'
      }]);

      if (error) {
        console.error('Lead capture failed:', error);
      }
    }

    const text = `Hi! I'd like to book a test drive for the ${car.year} ${car.make} ${car.model}. My name is ${name}, preferred date: ${testDriveForm.date} at ${testDriveForm.time}. My number: ${phone}`;
    window.open(`https://wa.me/94756363427?text=${encodeURIComponent(text)}`, '_blank');
    setSubmittingLead(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#0d0b09] text-white overflow-x-hidden">
      <SEO 
        title={`${car.year} ${car.make} ${car.model} for Sale`}
        description={`Explore the ${car.year} ${car.make} ${car.model} at Serendib Trading in Sri Lanka. LKR ${car.price.toLocaleString()}. ${car.condition} condition, ${car.mileage.toLocaleString()} KM.`}
        ogImage={car.image}
        ogImageAlt={`${car.year} ${car.make} ${car.model} listed by Serendib Trading`}
        canonical={`/car/${car.id}`}
        pageType="ItemPage"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Inventory', path: '/inventory' },
          { name: `${car.year} ${car.make} ${car.model}`, path: `/car/${car.id}` },
        ]}
        keywords={[
          `${car.make} ${car.model} Sri Lanka`,
          `${car.year} ${car.make} ${car.model} for sale`,
          `${car.bodyType} for sale Sri Lanka`,
          `${car.condition} cars Sri Lanka`,
        ]}
        structuredData={createVehicleSchema(car)}
      />
      <main className="pt-40 pb-20 px-6 lg:px-10 max-w-[1400px] mx-auto">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-16">
          <Link 
            to="/inventory" 
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-[#D4AF37] transition-all group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Collection
          </Link>
          <div className="flex items-center gap-4 relative">
            {copyToast && (
              <span className="absolute right-14 px-3 py-1.5 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-[11px] font-bold text-white/80 whitespace-nowrap">
                Link copied
              </span>
            )}
            <button 
              onClick={handleShare}
              aria-label="Share this vehicle"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-[0.96]"
            >
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* LEFT: VISUALS SECTION (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              layoutId={`car-image-${car.id}`}
              onClick={() => setLightboxImage(activeImage)}
              className="aspect-[16/11] bg-[#0d0b09] rounded-3xl overflow-hidden border border-white/5 relative group shadow-2xl cursor-zoom-in"
            >
              <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    src={activeImage} 
                    alt={car.model} 
                    className="w-full h-full object-cover will-change-transform"
                  />
              </AnimatePresence>
              {/* Zoom indicator on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest">
                  Click to zoom
                </div>
              </div>
              
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <span className="px-5 py-2 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                  {car.condition}
                </span>
              </div>

              <div className="absolute bottom-8 right-8">
                 <div className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4">
                    <Award className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Serendib <br/> Certified</span>
                 </div>
              </div>
              {/* Image Depth Outline */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-[40px]" />
            </motion.div>

            {/* Thumbnails Gallery */}
            <div className="grid grid-cols-4 gap-6">
              {[car.image, ...(car.gallery || [])].map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(img)}
                  onDoubleClick={() => setLightboxImage(img)}
                  className={`aspect-[4/3] rounded-[24px] overflow-hidden border transition-all duration-500 relative group cursor-zoom-in ${
                    activeImage === img ? 'border-[#D4AF37] p-1' : 'border-white/5 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Gallery ${i+1}`} className="w-full h-full object-cover rounded-[20px] group-hover:scale-110 transition-transform duration-700" />
                  {activeImage === img && <div className="absolute inset-0 bg-[#D4AF37]/10" />}
                  {/* Zoom hint on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/40">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">Double-click to zoom</span>
                  </div>
                </button>
              ))}
            </div>

            {/* In-depth Narrative */}
            <div className="hidden lg:block space-y-16 pt-16 border-t border-white/5">
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">The <span className="text-[#D4AF37]">Experience</span></h3>
                <p className="text-gray-400 text-xl leading-relaxed font-light">
                  "{car.description || "A carefully checked vehicle with clear photos, listed specifications, and support available for finance, viewing, and handover questions."}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Premium Features</h4>
                    <div className="space-y-4">
                      {((car as any).key_features || car.keyFeatures || ['Harman Kardon Audio', 'Adaptive Matrix LEDs', 'Panoramic Sunroof', 'Blind Spot Monitoring']).map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                          <span className="text-sm font-bold text-gray-300">{f}</span>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Our Evaluation</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      This unit has been reviewed against its available documents, visible condition, mileage, and listed specifications before being published.
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS SECTION (5 cols) */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6 sticky top-32">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px]">{car.make} ⋅ {car.year} Edition</span>
                </div>
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-[-0.08em] uppercase text-wrap-balance">
                  {car.model}
                </h1>
                <div className="flex items-end gap-3 pt-4 border-t border-white/5 mt-6 pt-6">
                  <div className="space-y-1 tabular-nums">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Listed Price</span>
                    <p className="text-4xl md:text-5xl font-black text-[#D4AF37] tracking-tighter leading-none">LKR {car.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Odometer', value: `${car.mileage.toLocaleString()} KM`, icon: Gauge },
                  { label: 'Fuel Type', value: car.fuel, icon: Fuel },
                  { label: 'Transmission', value: car.transmission, icon: Settings },
                  { label: 'Location', value: 'Dehiwala Showroom', icon: MapPin },
                ].map((spec, i) => (
                  <div key={i} className="group p-6 bg-white/[0.03] border border-white/5 rounded-[32px] hover:bg-white/[0.05] transition-all duration-500 tabular-nums">
                    <div className="flex items-center gap-3 mb-3">
                       <spec.icon className="w-4 h-4 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{spec.label}</span>
                    </div>
                    <p className="text-[17px] font-black text-white tracking-tight">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Acquisition Pathways */}
              <div className="space-y-4 pt-4">
                <button 
                  disabled={car.is_sold}
                  onClick={() => window.open(`https://wa.me/94756363427?text=${encodeURIComponent(whatsappMessage)}`, '_blank')}
                  className={`w-full py-5 text-black font-black uppercase tracking-widest text-[13px] rounded-2xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group active:scale-[0.96] ${
                    car.is_sold ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#D4AF37] shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02]'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 shrink-0" /> {car.is_sold ? 'Vehicle Sold' : 'Reserve via WhatsApp'}
                  </span>
                  {!car.is_sold && <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-[800ms]" />}
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={car.is_sold ? '#' : "tel:+94756363427"}
                    className={`py-4 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.96] ${
                       car.is_sold ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-[#D4AF37]" /> Call
                  </a>
                  <button 
                    onClick={() => window.print()}
                    disabled={car.is_sold}
                    className={`py-4 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.96] ${
                       car.is_sold ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-[#D4AF37]" /> Print
                  </button>
                </div>
              </div>

              {/* Viewing Booking Form */}
              <div className={`p-10 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-8 relative overflow-hidden group ${car.is_sold ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Calendar className="w-24 h-24" />
                </div>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Private Viewing</h3>
                  <p className="text-[13px] text-gray-500 font-medium">Coordinate a personalized showroom experience.</p>
                </div>
                
                <form onSubmit={handleTestDriveSubmit} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="sr-only" htmlFor="test-drive-name">Your Full Name</label>
                    <input id="test-drive-name" type="text" placeholder="Your Full Name" required minLength={2} maxLength={120} value={testDriveForm.name} onChange={e => setTestDriveForm({ ...testDriveForm, name: e.target.value })} className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:border-[#D4AF37] transition-all" />
                    <label className="sr-only" htmlFor="test-drive-phone">Contact Number</label>
                    <input id="test-drive-phone" type="tel" placeholder="Contact Number" required maxLength={20} pattern="[0-9+() -]{7,20}" value={testDriveForm.phone} onChange={e => setTestDriveForm({ ...testDriveForm, phone: e.target.value })} className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:border-[#D4AF37] transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                      <label className="sr-only" htmlFor="test-drive-date">Preferred date</label>
                      <input id="test-drive-date" type="date" required value={testDriveForm.date} onChange={e => setTestDriveForm({ ...testDriveForm, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-[#D4AF37] transition-all" />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                      <label className="sr-only" htmlFor="test-drive-time">Preferred time</label>
                      <select id="test-drive-time" value={testDriveForm.time} onChange={e => setTestDriveForm({ ...testDriveForm, time: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-[#D4AF37] transition-all appearance-none cursor-pointer">
                        <option className="bg-[#0d0b09]" value="9:30am">9:30 AM</option>
                        <option className="bg-[#0d0b09]" value="1:00pm">1:00 PM</option>
                        <option className="bg-[#0d0b09]" value="4:30pm">4:30 PM</option>
                      </select>
                    </div>
                  </div>
                  {leadError && (
                    <p className="text-xs font-bold text-red-300" role="alert">
                      {leadError}
                    </p>
                  )}
                  <button type="submit" disabled={submittingLead} className="w-full py-5 mt-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-[#D4AF37] transition-all shadow-xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-60">
                    {submittingLead ? 'Sending Request' : 'Request Appointment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Vehicles Section */}
        {similarVehicles.length > 0 && (
          <div className="mt-48 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 text-center md:text-left">
                <p className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-[10px]">Similar Options</p>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-wrap-balance">Similar <span className="text-gray-500">Vehicles</span></h2>
              </div>
              <Link to="/inventory" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#D4AF37] transition-colors border-b border-transparent hover:border-[#D4AF37] pb-1">View Collection &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {similarVehicles.map(v => (
                <div key={v.id}>
                  <CarCard car={v} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>



      <Footer />
      <WhatsAppFloat />
      
      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage || ''}
        alt={`${car.year} ${car.make} ${car.model}`}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
