import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, CheckCircle2, X, LayoutDashboard, Car, LogOut, Search, Image as ImageIcon, Milestone, Settings2, Fuel as FuelIcon, Gauge } from 'lucide-react';
import { supabase, signOut } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

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
  condition: string;
  is_sold: boolean;
  description?: string;
  key_features?: string[];
  created_at?: string;
}

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
    condition: 'New',
    is_sold: false,
    description: '',
    key_features: []
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  if (loading && vehicles.length === 0) return <Loader />;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleDelete = async (id: string, make: string, model: string) => {
    if (window.confirm(`Are you sure you want to remove the ${make} ${model}? This cannot be undone.`)) {
      const { data, error } = await supabase.from('cars').delete().eq('id', id).select();
      if (error) alert('Error deleting vehicle: ' + error.message);
      else if (!data || data.length === 0) alert('SECURITY BLOCK: You do not have permission to delete this record.');
      else fetchVehicles();
    }
  };


  const handleToggleSold = async (id: string, currentStatus: boolean) => {
     const { data, error } = await supabase
       .from('cars')
       .update({ is_sold: !currentStatus, sold_at: !currentStatus ? new Date().toISOString() : null })
       .eq('id', id)
       .select();
       
     if (error) {
       alert('Error updating status: ' + error.message);
     } else if (!data || data.length === 0) {
       alert('SECURITY BLOCK: Dashboard cannot save changes. You need to enable RLS Policies in Supabase (See Setup Guide).');
     } else {
       fetchVehicles();
     }
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
        condition: 'New', is_sold: false, description: '', key_features: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data (exclude id and created_at if they exist)
    const { id, created_at, ...updateData } = formData;

    if (editingVehicle) {
      const { data, error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', editingVehicle.id)
        .select();
        
      if (error) {
        alert('Error updating: ' + error.message);
      } else if (!data || data.length === 0) {
        alert('SECURITY BLOCK: Dashboard cannot save changes. You need to enable RLS Policies in Supabase (See Setup Guide).');
      } else {
        alert('Showroom Updated Successfully!');
        setIsModalOpen(false);
        fetchVehicles();
      }
    } else {
      const { data, error } = await supabase
        .from('cars')
        .insert([updateData])
        .select();
        
      if (error) {
        alert('Error adding: ' + error.message);
      } else if (!data || data.length === 0) {
        alert('SECURITY BLOCK: Dashboard cannot save changes. You need to enable RLS Policies in Supabase.');
      } else {
        alert('Vehicle Added Successfully!');
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

        <nav className="flex-1 space-y-4">
           <div className="flex items-center gap-4 p-4 bg-[#D4AF37] text-black rounded-2xl font-black uppercase tracking-widest text-[11px] italic">
              <LayoutDashboard className="w-4 h-4" /> Inventory Management
           </div>
           {/* Add dummy nav for looks */}
           <div className="flex items-center gap-4 p-4 text-gray-400 hover:text-white transition-colors rounded-2xl font-black uppercase tracking-widest text-[11px] italic opacity-40 cursor-not-allowed">
              <Plus className="w-4 h-4" /> Analytics
           </div>
        </nav>

        <button 
          onClick={handleLogout}
          className="p-4 flex items-center gap-4 text-red-500 font-black uppercase tracking-widest text-[11px] italic hover:bg-red-500/10 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="pl-72 p-10 max-w-[1600px]">
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
             <div className="py-20 text-center opacity-40 italic tracking-widest uppercase font-black">Decrypting Inventory...</div>
           ) : filteredVehicles.length === 0 ? (
             <div className="py-20 text-center opacity-40 italic tracking-widest uppercase font-black">No Records Found</div>
           ) : filteredVehicles.map((vehicle) => (
             <motion.div 
               layout
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
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
                      <span className="flex items-center gap-2"><Gauge className="w-3 h-3" /> {vehicle.mileage.toLocaleString()} KM</span>
                      <span className="flex items-center gap-2 text-white italic">LKR {(vehicle.price/1000000).toFixed(1)}M</span>
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
                   <button 
                     onClick={() => handleOpenModal(vehicle)}
                     className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all"
                   >
                      <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(vehicle.id, vehicle.make, vehicle.model)}
                     className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-all"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </main>

      {/* ACQUISITION MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border border-white/10 rounded-[40px] shadow-2xl relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>

              <div className="p-12 space-y-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{editingVehicle ? 'Modify' : 'New'} <span className="text-[#D4AF37]">Acquisition</span></h3>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Official Showroom Entry Form</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Manufacturer</label>
                      <input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className={inputStyle} placeholder="e.g. Toyota" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Model Name</label>
                      <input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className={inputStyle} placeholder="e.g. Land Cruiser" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Production Year</label>
                      <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} className={inputStyle} />
                    </div>
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Investment Price (LKR)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Current Mileage (KM)</label>
                      <input required type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})} className={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Engine / Fuel</label>
                      <input required value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})} className={inputStyle} placeholder="eV / Hybrid / Petrol" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Transmission</label>
                      <input required value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} className={inputStyle} placeholder="Automatic / Manual" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Direct Portfolio Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className={inputStyle + " pl-12"} placeholder="Paste URL here..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Acquisition Narrative (Description)</label>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle + " resize-none"} placeholder="Describe the vehicle's unique value proposition..." />
                  </div>

                  <div className="flex justify-end pt-8 border-t border-white/5 gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[11px] text-gray-500 hover:text-white transition-colors">Cancel</button>
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
