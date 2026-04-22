import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, CheckCircle2, X, LayoutDashboard, Car, LogOut, Search, Image as ImageIcon, Milestone, Settings2, Fuel as FuelIcon, Gauge, PieChart, TrendingUp, DollarSign, Activity, Users, Mail, Phone, Calendar as CalendarIcon, Clock, Check, ChevronLeft } from 'lucide-react';
import { supabase, signOut } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { Lead } from '../../data/types';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  image: string;
  gallery?: string[];
  condition: string;
  is_sold: boolean;
  description?: string;
  key_features?: string[];
  created_at?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'analytics' | 'leads'>('inventory');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel: 'Hybrid',
    transmission: 'Automatic',
    image: '',
    gallery: [],
    condition: 'New',
    is_sold: false,
    description: '',
    key_features: []
  });

  useEffect(() => {
    fetchVehicles();
    fetchLeads();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setVehicles(data || []);
    setLoading(false);
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setLeads(data || []);
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);
    if (!error) fetchLeads();
  };

  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter(v => !v.is_sold).length;
    const sold = vehicles.filter(v => v.is_sold).length;
    const totalValue = vehicles.reduce((acc, curr) => acc + curr.price, 0);
    const avgPrice = total > 0 ? totalValue / total : 0;
    
    // Most popular make
    const makes = vehicles.map(v => v.make);
    const mostPopularMake = makes.length > 0 ? [...makes].sort((a,b) =>
      makes.filter(v => v === a).length - makes.filter(v => v === b).length
    ).pop() : 'N/A';

    return { total, available, sold, totalValue, avgPrice, mostPopularMake };
  }, [vehicles]);

  if (loading && vehicles.length === 0) return <Loader />;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleDelete = async (id: string, make: string, model: string) => {
    if (window.confirm(`Are you sure you want to remove the ${make} ${model}? This cannot be undone.`)) {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) alert('Error deleting vehicle: ' + error.message);
      else fetchVehicles();
    }
  };

  const handleToggleSold = async (id: string, currentStatus: boolean) => {
     await supabase
       .from('cars')
       .update({ is_sold: !currentStatus, sold_at: !currentStatus ? new Date().toISOString() : null })
       .eq('id', id);
     fetchVehicles();
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({
        make: '', model: '', year: 2024, price: 0, mileage: 0,
        fuel: 'Hybrid', transmission: 'Automatic', image: '',
        gallery: [], condition: 'New', is_sold: false, description: '', key_features: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { id, created_at, ...updateData } = formData;

    if (editingVehicle) {
      const { error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', editingVehicle.id);
      if (error) alert('Error updating: ' + error.message);
      else {
        setIsModalOpen(false);
        fetchVehicles();
      }
    } else {
      const { error } = await supabase
        .from('cars')
        .insert([updateData]);
      if (error) alert('Error adding: ' + error.message);
      else {
        setIsModalOpen(false);
        fetchVehicles();
      }
    }
    setLoading(false);
  };

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = "w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] transition-all";

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col z-50">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Serendib <span className="text-[#D4AF37]">Admin</span></h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Global Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2">
           <button 
             onClick={() => navigate('/')}
             className="w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase tracking-widest text-[11px] italic text-gray-400 hover:text-[#D4AF37] transition-all mb-4 border border-white/5 hover:border-[#D4AF37]/30"
           >
              <ChevronLeft className="w-4 h-4" /> Return to Showroom
           </button>

           <button 
             onClick={() => setActiveTab('inventory')}
             className={`w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase tracking-widest text-[11px] italic transition-all ${
               activeTab === 'inventory' ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-gray-400 hover:text-white'
             }`}
           >
              <LayoutDashboard className="w-4 h-4" /> Portfolio Control
           </button>
           
           <button 
             onClick={() => setActiveTab('leads')}
             className={`w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase tracking-widest text-[11px] italic transition-all relative ${
               activeTab === 'leads' ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-gray-400 hover:text-white'
             }`}
           >
              <Users className="w-4 h-4" /> Lead Records
              {leads.some(l => l.status === 'New') && <div className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
           </button>

           <button 
             onClick={() => setActiveTab('analytics')}
             className={`w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase tracking-widest text-[11px] italic transition-all ${
               activeTab === 'analytics' ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-gray-400 hover:text-white'
             }`}
           >
              <PieChart className="w-4 h-4" /> Market Analytics
           </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="p-4 flex items-center gap-4 text-red-500 font-black uppercase tracking-widest text-[11px] italic hover:bg-red-500/10 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="pl-72 p-10 max-w-[1600px]">
        {activeTab === 'inventory' && (
          <>
            {/* Header Section */}
            <header className="flex items-center justify-between mb-12">
               <div className="space-y-1">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Inventory <span className="text-gray-500">Control</span></h2>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{vehicles.length} Units On Record</p>
               </div>
               
               <button 
                 onClick={() => handleOpenModal()}
                 className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#D4AF37] transition-all shadow-2xl flex items-center gap-3"
               >
                 <Plus className="w-4 h-4" /> Acquisition Details
               </button>
            </header>

            {/* Global Search Bar */}
            <div className="mb-10 relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
               <input 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 placeholder="Search Collection by Make or Model..." 
                 className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all shadow-xl"
               />
            </div>

            {/* Vehicle Record List */}
            <div className="space-y-4">
               {loading && vehicles.length === 0 ? (
                 <div className="py-20 text-center opacity-40 italic tracking-widest uppercase font-black text-xs">Decrypting Inventory...</div>
               ) : filteredVehicles.length === 0 ? (
                 <div className="py-20 text-center opacity-40 italic tracking-widest uppercase font-black text-xs">No Records Found</div>
               ) : filteredVehicles.map((vehicle) => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   key={vehicle.id}
                   className="group flex items-center gap-8 p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-white/10 hover:bg-white/[0.04] transition-all"
                 >
                    <div className="w-32 aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/5 group-hover:scale-105 transition-transform duration-500 relative shrink-0">
                      <img src={vehicle.image} className={`w-full h-full object-cover ${vehicle.is_sold ? 'grayscale opacity-40' : ''}`} alt={vehicle.model} />
                      {vehicle.is_sold && <div className="absolute inset-0 flex items-center justify-center font-black uppercase text-[10px] text-red-500 tracking-widest">Sold</div>}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-2">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{vehicle.make}</span>
                          <span className="w-1 h-1 bg-white/20 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{vehicle.year}</span>
                       </div>
                       <h4 className="text-xl font-black italic uppercase tracking-tighter truncate leading-none">{vehicle.model}</h4>
                       <div className="flex items-center gap-6 mt-3 text-[10px] font-black uppercase tracking-widest text-gray-600">
                          <span className="flex items-center gap-2 text-white italic">LKR {(vehicle.price/1000000).toFixed(1)}M</span>
                          {vehicle.gallery?.length ? <span className="flex items-center gap-2"><ImageIcon className="w-3 h-3 text-[#D4AF37]" /> {vehicle.gallery.length} Images</span> : null}
                       </div>
                    </div>

                    <div className="flex items-center gap-4 pr-4">
                       <button 
                         onClick={() => handleToggleSold(vehicle.id, vehicle.is_sold)}
                         className={`px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border ${
                           vehicle.is_sold ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                         }`}
                       >
                          {vehicle.is_sold ? 'Relist' : 'Mark Sold'}
                       </button>
                       <button onClick={() => handleOpenModal(vehicle)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all">
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(vehicle.id, vehicle.make, vehicle.model)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </motion.div>
               ))}
            </div>
          </>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-12">
             <div className="space-y-1">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Acquisition <span className="text-gray-500">Leads</span></h2>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Management of Showroom Interests</p>
             </div>

             <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="py-20 text-center opacity-40 italic tracking-widest uppercase font-black text-xs">No Active Leads Registered</div>
                ) : leads.map((lead) => (
                  <div key={lead.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] flex items-center gap-8 group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${lead.status === 'New' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
                      {lead.status === 'New' ? <Activity className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-4">
                          <h4 className="text-xl font-black italic uppercase tracking-tighter">{lead.name}</h4>
                          <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${lead.type === 'Test Drive' ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-gray-400'}`}>
                            {lead.type}
                          </span>
                       </div>
                       <div className="flex items-center gap-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                          <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
                          <span className="flex items-center gap-2"><Car className="w-3.5 h-3.5" /> {lead.vehicle_model}</span>
                          {lead.date && <span className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> {lead.date} at {lead.time}</span>}
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       {lead.status === 'New' && (
                         <button onClick={() => handleUpdateLeadStatus(lead.id, 'Contacted')} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all">
                            Resolve Lead
                         </button>
                       )}
                       <button onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\+/g, '')}`, '_blank')} className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all">
                          <Phone className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-12 max-w-[1200px]">
             <div className="space-y-1">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Market <span className="text-gray-500">Pulse</span></h2>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Live Portfolio Intelligence</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] space-y-4 shadow-xl">
                   <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center rounded-2xl text-[#D4AF37]"><Activity className="w-6 h-6" /></div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Portfolio Size</p>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">{stats.total} Units</h3>
                   </div>
                </div>
                
                <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] space-y-4 shadow-xl">
                   <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center rounded-2xl text-green-500"><DollarSign className="w-6 h-6" /></div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Inventory Value</p>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">LKR {(stats.totalValue/1000000).toFixed(1)}M</h3>
                   </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] space-y-4 shadow-xl">
                   <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-2xl text-blue-500"><TrendingUp className="w-6 h-6" /></div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Average Unit</p>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">LKR {(stats.avgPrice/1000000).toFixed(1)}M</h3>
                   </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] space-y-4 shadow-xl">
                   <div className="w-12 h-12 bg-purple-500/10 flex items-center justify-center rounded-2xl text-purple-500"><Car className="w-6 h-6" /></div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Top Brand</p>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">{stats.mostPopularMake}</h3>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 bg-white/[0.02] border border-white/10 rounded-[40px] shadow-2xl">
                   <h4 className="text-lg font-black italic uppercase tracking-widest text-[#D4AF37] mb-8">Asset Allocation</h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest"><span className="text-gray-400">Available Stock</span><span>{stats.available} ({((stats.available/stats.total)*100).toFixed(0)}%)</span></div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.available/stats.total)*100}%` }} className="h-full bg-white transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest"><span className="text-gray-400">Sold Records</span><span>{stats.sold} ({((stats.sold/stats.total)*100).toFixed(0)}%)</span></div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.sold/stats.total)*100}%` }} className="h-full bg-[#D4AF37] transition-all" />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-10 bg-[#D4AF37] text-black rounded-[40px] shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-white/20 rounded-full blur-[60px] group-hover:scale-125 transition-transform duration-1000" />
                   <Activity className="w-12 h-12 mb-8" />
                   <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-none">Operational <br /> Intelligence</h4>
                   <p className="text-xs font-bold leading-relaxed opacity-70 mb-8 max-w-xs uppercase tracking-wide">Sync status: <span className="text-black/50">Online</span>. Real-time lead detection enabled.</p>
                   <button onClick={() => setActiveTab('leads')} className="px-8 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:scale-105 transition-all">Review Active Leads</button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Modal is kept same but with improved responsiveness */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border border-white/10 rounded-[40px] shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="p-12 space-y-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{editingVehicle ? 'Modify' : 'New'} <span className="text-[#D4AF37]">Acquisition</span></h3>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Showroom Entry Details</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Manufacturer</label><input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className={inputStyle} placeholder="Toyota" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Model Name</label><input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className={inputStyle} placeholder="Land Cruiser" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Year</label><input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} className={inputStyle} /></div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Condition</label>
                      <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className={inputStyle}>
                         <option className="bg-black" value="New">New</option>
                         <option className="bg-black" value="Registered">Registered</option>
                         <option className="bg-black" value="Reconditioned">Reconditioned</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Price (LKR)</label><input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className={inputStyle} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Mileage (KM)</label><input required type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})} className={inputStyle} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Fuel</label><input required value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})} className={inputStyle} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Transmission</label><input required value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} className={inputStyle} /></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Hero Image URL</label>
                       <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className={inputStyle} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Gallery URLs (Comma Separated)</label>
                       <input value={formData.gallery?.join(', ')} onChange={e => setFormData({...formData, gallery: e.target.value.split(',').map(s => s.trim())})} className={inputStyle} placeholder="url1, url2, url3..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Description</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle + " resize-none"} />
                  </div>
                  <div className="flex justify-end pt-8 border-t border-white/5 gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[11px] text-gray-500 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="px-12 py-4 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[11px] italic rounded-2xl hover:scale-105 transition-all shadow-2xl">
                       {loading ? 'Processing...' : (editingVehicle ? 'Update Entry' : 'Log Acquisition')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
