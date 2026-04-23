import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, CheckCircle2, LayoutDashboard, Car, LogOut,
  Search, Image as ImageIcon, PieChart, TrendingUp, DollarSign,
  Activity, Users, Phone, Calendar as CalendarIcon, ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import { supabase, signOut } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { Lead } from '../../data/types';
import VehicleModal, { VehicleFormData } from './VehicleModal';


interface Vehicle {
  id: string; make: string; model: string; year: number; price: number;
  mileage: number; fuel: string; transmission: string; bodyType: string;
  color: string; image: string; gallery?: string[]; condition: string;
  is_sold: boolean; sold_at?: string | null; description?: string;
  key_features?: string[]; created_at?: string;
}

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
const daysUntilRemoval = (iso: string) => Math.max(0, 14 - daysSince(iso));

export default function AdminDashboard() {
  const [tab, setTab] = useState<'inventory'|'analytics'|'leads'>('inventory');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVehicle, setModalVehicle] = useState<VehicleFormData | null | undefined>(undefined);
  // undefined = closed, null = new, VehicleFormData = edit
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (!error) setVehicles(data ?? []);
    setLoading(false);
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (!error) setLeads(data ?? []);
  };

  useEffect(() => {
    fetchVehicles();
    fetchLeads();

    // Realtime subscription — any change to 'cars' re-fetches list
    const channel = supabase.channel('dashboard-cars')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, fetchVehicles)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter(v => !v.is_sold).length;
    const sold = vehicles.filter(v => v.is_sold).length;
    const totalValue = vehicles.reduce((a, v) => a + v.price, 0);
    const avgPrice = total > 0 ? totalValue / total : 0;
    const makes = vehicles.map(v => v.make);
    const topMake = makes.length > 0
      ? [...makes].sort((a,b) => makes.filter(x=>x===b).length - makes.filter(x=>x===a).length)[0]
      : 'N/A';
    
    // Distribution by Body Type
    const bodyTypes = vehicles.reduce((acc: any, v) => {
      const bt = v.bodyType || 'Unknown';
      acc[bt] = (acc[bt] || 0) + 1;
      return acc;
    }, {});
    const sortedBT = Object.entries(bodyTypes).sort((a: any, b: any) => b[1] - a[1]);

    return { total, available, sold, totalValue, avgPrice, topMake, sortedBT };
  }, [vehicles]);

  if (loading && vehicles.length === 0) return <Loader />;

  const handleDelete = async (v: Vehicle) => {
    if (!window.confirm(`Remove ${v.year} ${v.make} ${v.model} permanently? This cannot be undone.`)) return;
    const { error } = await supabase.from('cars').delete().eq('id', v.id);
    if (error) alert('Delete failed: ' + error.message);
    else fetchVehicles();
  };

  const handleToggleSold = async (v: Vehicle) => {
    const nowSold = !v.is_sold;
    await supabase.from('cars').update({
      is_sold: nowSold,
      sold_at: nowSold ? new Date().toISOString() : null,
    }).eq('id', v.id);
    fetchVehicles();
  };

  const handleLeadStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    fetchLeads();
  };

  const openEdit = (v: Vehicle) => {
    setModalVehicle({
      id: v.id, make: v.make, model: v.model, year: v.year, price: v.price,
      mileage: v.mileage, fuel: v.fuel, transmission: v.transmission,
      bodyType: v.bodyType ?? '', color: v.color ?? '', image: v.image,
      gallery: v.gallery ?? [], condition: v.condition, is_sold: v.is_sold,
      description: v.description ?? '', key_features: v.key_features ?? [],
    });
  };

  const filtered = vehicles.filter(v =>
    `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const navBtn = (target: typeof tab, label: string, Icon: any) => (
    <button onClick={() => setTab(target)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase tracking-widest text-[11px] italic transition-all ${
        tab === target ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'text-gray-400 hover:text-white'
      }`}>
      <Icon className="w-4 h-4" />{label}
      {target === 'leads' && leads.some(l=>l.status==='New') && (
        <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col z-50">
        <div className="mb-10">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Serendib <span className="text-[#D4AF37]">Admin</span></h1>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Fleet Dashboard</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase tracking-widest text-[10px] italic text-gray-500 hover:text-[#D4AF37] transition-all mb-4 border border-white/5 hover:border-[#D4AF37]/20">
            <ChevronLeft className="w-4 h-4"/>Return to Showroom
          </button>
          {navBtn('inventory', 'Inventory', LayoutDashboard)}
          {navBtn('leads', 'Leads', Users)}
          {navBtn('analytics', 'Analytics', PieChart)}
        </nav>
        <button onClick={async () => { await signOut(); navigate('/admin/login'); }}
          className="p-4 flex items-center gap-4 text-red-500 font-black uppercase tracking-widest text-[10px] italic hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut className="w-4 h-4"/>Sign Out
        </button>
      </aside>

      <main className="pl-64 p-10 max-w-[1600px]">

        {/* ── INVENTORY TAB ── */}
        {tab === 'inventory' && (
          <>
            <header className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  Inventory <span className="text-gray-500">Control</span>
                </h2>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mt-1">
                  {vehicles.length} Units · {stats.available} Available · {stats.sold} Sold
                </p>
              </div>
              <button onClick={() => setModalVehicle(null)}
                className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#D4AF37] transition-all shadow-xl flex items-center gap-2">
                <Plus className="w-4 h-4"/>Add Vehicle
              </button>
            </header>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search by make or model..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-[#D4AF37]/40 transition-all"/>
            </div>

            {/* Vehicle List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="py-20 text-center text-xs font-black uppercase tracking-widest text-gray-600 italic">No vehicles found</div>
              ) : filtered.map(v => {
                const sold = v.is_sold;
                const soldDays = sold && v.sold_at ? daysSince(v.sold_at) : 0;
                const removalDays = sold && v.sold_at ? daysUntilRemoval(v.sold_at) : 0;
                return (
                  <motion.div key={v.id} layout initial={{opacity:0}} animate={{opacity:1}}
                    className={`group flex items-center gap-6 p-5 rounded-[24px] border transition-all ${
                      sold ? 'bg-red-500/[0.02] border-red-500/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                    }`}>

                    {/* Thumbnail */}
                    <div className="w-28 aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 relative">
                      <img src={v.image} alt={v.model} className={`w-full h-full object-cover transition-all ${sold ? 'grayscale opacity-40' : 'group-hover:scale-105 duration-500'}`}/>
                      {sold && <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-black uppercase tracking-widest text-red-400">Sold</span></div>}
                      {v.gallery?.length ? <div className="absolute bottom-1 right-1 bg-black/70 rounded-md px-1.5 py-0.5 text-[8px] font-black text-[#D4AF37] flex items-center gap-1"><ImageIcon className="w-2.5 h-2.5"/>{v.gallery.length}</div> : null}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{v.make}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full"/>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{v.year}</span>
                        {v.bodyType && <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">· {v.bodyType}</span>}
                      </div>
                      <h4 className="text-lg font-black italic uppercase tracking-tighter truncate">{v.model}</h4>
                      <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                        <span className="text-white italic">LKR {(v.price/1_000_000).toFixed(1)}M</span>
                        <span>{v.mileage.toLocaleString()} km</span>
                        <span>{v.fuel}</span>
                        {v.color && <span>{v.color}</span>}
                      </div>
                      {/* Sold countdown */}
                      {sold && v.sold_at && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3 h-3 text-amber-400"/>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                            {removalDays > 0 ? `Removed from site in ${removalDays} day${removalDays!==1?'s':''}` : 'Hidden from site'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggleSold(v)}
                        className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border ${
                          sold ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                        }`}>
                        {sold ? 'Relist' : 'Mark Sold'}
                      </button>
                      <button onClick={() => openEdit(v)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all">
                        <Edit2 className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleDelete(v)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* ── LEADS TAB ── */}
        {tab === 'leads' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Acquisition <span className="text-gray-500">Leads</span></h2>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mt-1">{leads.length} Records</p>
            </div>
            <div className="space-y-4">
              {leads.length === 0 ? (
                <div className="py-20 text-center text-xs font-black uppercase tracking-widest text-gray-600 italic">No leads yet</div>
              ) : leads.map(lead => (
                <div key={lead.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[28px] flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lead.status==='New' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
                    {lead.status==='New' ? <Activity className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black italic uppercase tracking-tighter">{lead.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${lead.type==='Test Drive' ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-gray-400'}`}>{lead.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/>{lead.phone}</span>
                      {lead.vehicle_model && <span className="flex items-center gap-1.5"><Car className="w-3 h-3"/>{lead.vehicle_model}</span>}
                      {lead.date && <span className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3"/>{lead.date} at {lead.time}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.status==='New' && (
                      <button onClick={()=>handleLeadStatus(lead.id,'Contacted')}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all">
                        Resolve
                      </button>
                    )}
                    <button onClick={()=>window.open(`https://wa.me/${lead.phone.replace(/\D/g,'')}`, '_blank')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all">
                      <Phone className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div className="space-y-10 max-w-[1200px]">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Market <span className="text-gray-500">Pulse</span></h2>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mt-1">Live Portfolio Intelligence</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Activity, color:'text-[#D4AF37]', bg:'bg-[#D4AF37]/10', label:'Portfolio', value:`${stats.total} Units` },
                { icon: DollarSign, color:'text-green-400', bg:'bg-green-500/10', label:'Total Value', value:`LKR ${(stats.totalValue/1_000_000).toFixed(1)}M` },
                { icon: TrendingUp, color:'text-blue-400', bg:'bg-blue-500/10', label:'Avg Unit', value:`LKR ${(stats.avgPrice/1_000_000).toFixed(1)}M` },
                { icon: Car, color:'text-purple-400', bg:'bg-purple-500/10', label:'Top Brand', value:stats.topMake },
              ].map(({ icon:Icon, color, bg, label, value }) => (
                <div key={label} className="p-6 bg-white/[0.02] border border-white/10 rounded-[28px]">
                  <div className={`w-10 h-10 ${bg} flex items-center justify-center rounded-xl ${color} mb-4`}><Icon className="w-5 h-5"/></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{value}</h3>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px]">
                <h4 className="text-sm font-black italic uppercase tracking-widest text-[#D4AF37] mb-8">Asset Allocation</h4>
                <div className="space-y-6">
                  {[
                    { label:'Available Stock', count:stats.available, pct:stats.total>0?(stats.available/stats.total)*100:0, color:'bg-white' },
                    { label:'Sold Records', count:stats.sold, pct:stats.total>0?(stats.sold/stats.total)*100:0, color:'bg-[#D4AF37]' },
                  ].map(({ label, count, pct, color }) => (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400">{label}</span>
                        <span>{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1,ease:[0.16,1,0.3,1]}} className={`h-full ${color} rounded-full`}/ >
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Type Distribution */}
              <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px]">
                <h4 className="text-sm font-black italic uppercase tracking-widest text-[#D4AF37] mb-8">Fleet Composition</h4>
                <div className="space-y-5">
                  {stats.sortedBT.map(([bt, count]: any) => {
                    const pct = (count / stats.total) * 100;
                    return (
                      <div key={bt} className="group">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                          <span className="text-gray-400">{bt}</span>
                          <span>{count} Units</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{width:0}} animate={{width:`${pct}%`}} className="h-full bg-[#D4AF37]"/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-8 bg-[#D4AF37] text-black rounded-[32px] relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"/>
                <Activity className="w-10 h-10 mb-6 relative z-10"/>
                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-3 leading-tight relative z-10">Operational<br/>Intelligence</h4>
                <p className="text-xs font-bold opacity-60 mb-6 max-w-xs uppercase tracking-wide relative z-10">Real-time sync active. All changes reflect instantly on the showroom site.</p>
                <button onClick={()=>setTab('leads')} className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all relative z-10">
                  View Leads
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Vehicle Modal */}
      <AnimatePresence>
        {modalVehicle !== undefined && (
          <VehicleModal
            initial={modalVehicle}
            onClose={() => setModalVehicle(undefined)}
            onSaved={fetchVehicles}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
