import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  DollarSign,
  Edit2,
  Eye,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase, signOut } from '../../lib/supabase';
import Loader from '../../components/Loader';
import { Lead } from '../../data/types';
import VehicleModal, { VehicleFormData } from './VehicleModal';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  image: string;
  gallery?: string[];
  condition: string;
  is_sold: boolean;
  sold_at?: string | null;
  description?: string;
  key_features?: string[];
  created_at?: string;
  views?: number;
}

type DashboardTab = 'inventory' | 'analytics' | 'leads';
type Notice = { type: 'success' | 'error'; message: string };

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
const daysUntilRemoval = (iso: string) => Math.max(0, 14 - daysSince(iso));
const formatMillions = (value: number) => `LKR ${(value / 1_000_000).toFixed(1)}M`;
const formatFullLkr = (value: number) => `LKR ${Math.round(value).toLocaleString('en-LK')}`;
const formatDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const leadStatusStyles: Record<Lead['status'], { badge: string; dot: string; active: string }> = {
  New: {
    badge: 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F5D66B]',
    dot: 'bg-[#D4AF37]',
    active: 'border-[#D4AF37] bg-[#D4AF37] text-black',
  },
  Contacted: {
    badge: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    dot: 'bg-sky-300',
    active: 'border-sky-300 bg-sky-300 text-black',
  },
  Closed: {
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    dot: 'bg-emerald-300',
    active: 'border-emerald-300 bg-emerald-300 text-black',
  },
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<DashboardTab>('inventory');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<{ date: string; visitor_count: number; page_views: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVehicle, setModalVehicle] = useState<VehicleFormData | null | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    if (!isSupabaseConfigured) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (!error) setVehicles(data ?? []);
    setLoading(false);
  };

  const fetchLeads = async () => {
    if (!isSupabaseConfigured) {
      setLeads([]);
      return;
    }
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (!error) setLeads(data ?? []);
  };

  const fetchTraffic = async () => {
    if (!isSupabaseConfigured) {
      setTraffic([]);
      return;
    }
    const { data, error } = await supabase.from('site_traffic').select('*').order('date', { ascending: false }).limit(7);
    if (!error) setTraffic(data ?? []);
  };

  useEffect(() => {
    fetchVehicles();
    fetchLeads();
    fetchTraffic();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('dashboard-cars')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, fetchVehicles)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((v) => !v.is_sold).length;
    const sold = vehicles.filter((v) => v.is_sold).length;
    const totalValue = vehicles.reduce((sum, v) => sum + Number(v.price || 0), 0);
    const avgPrice = total > 0 ? totalValue / total : 0;
    const makes = vehicles.reduce<Record<string, number>>((acc, v) => {
      const make = v.make || 'Unknown';
      acc[make] = (acc[make] || 0) + 1;
      return acc;
    }, {});
    const makeEntries = Object.entries(makes) as [string, number][];
    const topMake = makeEntries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
    const bodyTypes = vehicles.reduce<Record<string, number>>((acc, v) => {
      const bodyType = v.bodyType || 'Unknown';
      acc[bodyType] = (acc[bodyType] || 0) + 1;
      return acc;
    }, {});
    const sortedBT = (Object.entries(bodyTypes) as [string, number][]).sort((a, b) => b[1] - a[1]);
    const topViewed = [...vehicles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

    return { total, available, sold, totalValue, avgPrice, topMake, sortedBT, topViewed };
  }, [vehicles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vehicles;

    return vehicles.filter((v) =>
      [v.make, v.model, String(v.year), v.bodyType, v.condition, v.color]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [vehicles, search]);

  if (loading && vehicles.length === 0) return <Loader />;

  const newLeadCount = leads.filter((lead) => lead.status === 'New').length;
  const contactedLeadCount = leads.filter((lead) => lead.status === 'Contacted').length;
  const closedLeadCount = leads.filter((lead) => lead.status === 'Closed').length;
  const maxPageViews = Math.max(1, ...traffic.map((item) => item.page_views || 0));

  const tabs = [
    { id: 'inventory' as const, label: 'Inventory', icon: LayoutDashboard, count: stats.total },
    { id: 'leads' as const, label: 'Leads', icon: Users, count: newLeadCount },
    { id: 'analytics' as const, label: 'Analytics', icon: PieChart, count: traffic.length },
  ];

  const summaryCards = [
    { label: 'Total stock', value: stats.total.toLocaleString('en-LK'), meta: 'All listed units', icon: Car },
    { label: 'Available', value: stats.available.toLocaleString('en-LK'), meta: 'Visible inventory', icon: ShieldCheck },
    { label: 'Sold', value: stats.sold.toLocaleString('en-LK'), meta: 'Archive queue', icon: CheckCircle2 },
    { label: 'Portfolio value', value: formatMillions(stats.totalValue), meta: formatFullLkr(stats.totalValue), icon: WalletCards },
  ];

  const handleDelete = async (v: Vehicle) => {
    if (!isSupabaseConfigured) {
      setNotice({ type: 'error', message: 'Supabase is not configured for admin actions.' });
      return;
    }
    if (!window.confirm(`Remove ${v.year} ${v.make} ${v.model} permanently? This cannot be undone.`)) return;
    const { error } = await supabase.from('cars').delete().eq('id', v.id);
    if (error) {
      setNotice({ type: 'error', message: `Delete failed: ${error.message}` });
      return;
    }
    setNotice({ type: 'success', message: `${v.make} ${v.model} removed from inventory.` });
    fetchVehicles();
  };

  const handleToggleSold = async (v: Vehicle) => {
    if (!isSupabaseConfigured) {
      setNotice({ type: 'error', message: 'Supabase is not configured for admin actions.' });
      return;
    }
    const nowSold = !v.is_sold;
    const { error } = await supabase
      .from('cars')
      .update({
        is_sold: nowSold,
        sold_at: nowSold ? new Date().toISOString() : null,
      })
      .eq('id', v.id);

    if (error) {
      setNotice({ type: 'error', message: `Status update failed: ${error.message}` });
      return;
    }

    setNotice({ type: 'success', message: nowSold ? 'Vehicle marked as sold.' : 'Vehicle returned to live inventory.' });
    fetchVehicles();
  };

  const handleLeadStatus = async (id: string, status: Lead['status']) => {
    if (!isSupabaseConfigured) {
      setNotice({ type: 'error', message: 'Supabase is not configured for admin actions.' });
      return;
    }
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) {
      setNotice({ type: 'error', message: `Lead update failed: ${error.message}` });
      return;
    }
    setNotice({ type: 'success', message: `Lead marked ${status.toLowerCase()}.` });
    fetchLeads();
  };

  const openEdit = (v: Vehicle) => {
    setModalVehicle({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      price: v.price,
      mileage: v.mileage,
      fuel: v.fuel,
      transmission: v.transmission,
      bodyType: v.bodyType ?? '',
      color: v.color ?? '',
      image: v.image,
      gallery: v.gallery ?? [],
      condition: v.condition,
      is_sold: v.is_sold,
      description: v.description ?? '',
      key_features: v.key_features ?? [],
    });
  };

  const handleManualRefresh = async () => {
    setNotice(null);
    await Promise.all([fetchVehicles(), fetchLeads(), fetchTraffic()]);
    setNotice({ type: 'success', message: 'Dashboard data refreshed.' });
  };

  const handleSaved = () => {
    fetchVehicles();
    setNotice({ type: 'success', message: 'Inventory saved.' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0d0b09] text-white font-sans">
      <div className="pointer-events-none fixed inset-0 opacity-[0.32] bg-[linear-gradient(120deg,rgba(255,255,255,0.055)_0,transparent_22%,transparent_72%,rgba(212,175,55,0.08)_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-noise" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0b09]/85 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[88px] w-full max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex min-w-0 items-center gap-4 text-left"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 transition-colors group-hover:border-[#D4AF37]/50">
              <img src="/serendib-logo-new.svg" alt="Serendib Trading" className="h-9 w-auto" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Serendib Trading</span>
              <span className="block truncate text-lg font-black uppercase leading-none tracking-normal text-white sm:text-xl">
                Admin Control Room
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] p-1 lg:flex" aria-label="Admin sections">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={active}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    active ? 'bg-[#D4AF37] text-black' : 'text-white/45 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span className={`tabular-nums ${active ? 'text-black/60' : 'text-[#D4AF37]'}`}>{item.count}</span>
                  {item.id === 'leads' && newLeadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/55 transition-all hover:border-[#D4AF37]/35 hover:text-white md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
              Showroom
            </button>
            <button
              type="button"
              onClick={handleManualRefresh}
              aria-label="Refresh dashboard data"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/60 transition-all hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured) await signOut();
                navigate('/admin/login');
              }}
              aria-label="Sign out"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/15 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1500px] gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:hidden">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                  active
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                    : 'border-white/10 bg-white/[0.035] text-white/55'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(13,11,9,0.82), rgba(13,11,9,0.55)), url('/images/showroom/serendib-showroom-floor-02.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),transparent_42%,rgba(255,255,255,0.05))]" />
          <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_420px] lg:p-10">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                Live inventory command
              </div>
              <h1 className="max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Showroom <span className="font-serif italic text-[#D4AF37]">operations</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-white/60 md:text-base">
                Manage high-value stock, buyer enquiries, and site interest from one Serendib-grade console.
              </p>
            </div>

            <div className="grid content-end gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => setModalVehicle(null)}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-[#D4AF37] px-5 py-4 text-left text-black transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-black/60">Inventory action</span>
                  <span className="mt-1 block text-lg font-black uppercase leading-none tracking-tight">Add vehicle</span>
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-[#D4AF37] transition-transform group-hover:rotate-90">
                  <Plus className="h-5 w-5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab('leads')}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-left text-white transition-all hover:border-[#D4AF37]/40 hover:bg-black/50"
              >
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Attention needed</span>
                  <span className="mt-1 flex items-baseline gap-2 text-lg font-black uppercase leading-none tracking-tight">
                    <span className="tabular-nums">{newLeadCount}</span>
                    <span>new lead{newLeadCount === 1 ? '' : 's'}</span>
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-[#D4AF37] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="group border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-[#D4AF37]/35 hover:bg-white/[0.055]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/38">{card.label}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-[#D4AF37]">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-3xl font-black uppercase leading-none tracking-tight text-white tabular-nums">{card.value}</p>
                <p className="mt-3 truncate text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">{card.meta}</p>
              </article>
            );
          })}
        </section>

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mt-5 flex items-center gap-3 border px-4 py-3 text-sm font-bold ${
                notice.type === 'error'
                  ? 'border-red-400/30 bg-red-500/10 text-red-200'
                  : 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F5D66B]'
              }`}
              role="status"
            >
              {notice.type === 'error' ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {notice.message}
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'inventory' && (
          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-10 bg-white/15" />
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Fleet ledger</p>
                </div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                  Inventory control
                </h2>
              </div>

              <label className="relative w-full lg:max-w-md">
                <span className="sr-only">Search inventory</span>
                <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search make, model, year, body..."
                  className="w-full rounded-full border border-white/10 bg-white/[0.04] py-4 pl-13 pr-5 text-sm font-bold text-white placeholder:text-white/28 transition-all focus:outline-none focus:border-[#D4AF37]"
                />
              </label>
            </div>

            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <div className="border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                  <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#D4AF37]" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">No matching vehicles</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-white/45">
                    Adjust the search term or add a new unit to the live inventory.
                  </p>
                </div>
              ) : (
                filtered.map((vehicle) => {
                  const sold = vehicle.is_sold;
                  const removalDays = sold && vehicle.sold_at ? daysUntilRemoval(vehicle.sold_at) : 0;
                  return (
                    <motion.article
                      key={vehicle.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group grid gap-5 border p-4 transition-all md:grid-cols-[150px_1fr_auto] md:items-center md:p-5 ${
                        sold
                          ? 'border-red-400/20 bg-red-500/[0.045]'
                          : 'border-white/10 bg-white/[0.035] hover:border-[#D4AF37]/28 hover:bg-white/[0.055]'
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                        <img
                          src={vehicle.image}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className={`h-full w-full object-cover transition-transform duration-700 ${
                            sold ? 'grayscale opacity-45' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8">
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">{vehicle.condition}</span>
                          {vehicle.gallery?.length ? (
                            <span className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[9px] font-black text-[#D4AF37]">
                              <ImageIcon className="h-3 w-3" />
                              {vehicle.gallery.length}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                            {vehicle.make}
                          </span>
                          <span className="border border-white/10 bg-white/[0.035] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                            {vehicle.year}
                          </span>
                          {sold && (
                            <span className="border border-red-400/25 bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-red-200">
                              Sold
                            </span>
                          )}
                        </div>
                        <h3 className="truncate text-2xl font-black uppercase leading-none tracking-tight text-white md:text-3xl">
                          {vehicle.model}
                        </h3>
                        <div className="mt-4 grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 sm:grid-cols-2 xl:grid-cols-4">
                          <span className="flex items-center gap-2 text-white">
                            <DollarSign className="h-3.5 w-3.5 text-[#D4AF37]" />
                            {formatMillions(vehicle.price)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Gauge className="h-3.5 w-3.5 text-white/25" />
                            {vehicle.mileage.toLocaleString('en-LK')} km
                          </span>
                          <span>{vehicle.fuel || 'Fuel not set'}</span>
                          <span>{vehicle.bodyType || vehicle.color || 'Details pending'}</span>
                        </div>
                        {sold && vehicle.sold_at && (
                          <p className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {removalDays > 0 ? `Public archive removal in ${removalDays} day${removalDays === 1 ? '' : 's'}` : 'Hidden from public site'}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggleSold(vehicle)}
                          className={`rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                            sold
                              ? 'border-red-400/25 bg-red-500/10 text-red-200 hover:bg-red-500/20'
                              : 'border-white/10 bg-white/[0.035] text-white/55 hover:border-[#D4AF37]/35 hover:text-white'
                          }`}
                        >
                          {sold ? 'Relist' : 'Mark sold'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(vehicle)}
                          aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55 transition-all hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle)}
                          aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/15 bg-red-500/10 text-red-200 transition-all hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {tab === 'leads' && (
          <section className="mt-8">
            <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-10 bg-white/15" />
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Buyer pipeline</p>
                </div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                  Lead concierge
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ['New', newLeadCount],
                  ['Contacted', contactedLeadCount],
                  ['Closed', closedLeadCount],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-[105px] border border-white/10 bg-white/[0.035] px-4 py-3">
                    <p className="text-2xl font-black leading-none tabular-nums">{value}</p>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {leads.length === 0 ? (
                <div className="border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                  <Users className="mx-auto mb-4 h-8 w-8 text-[#D4AF37]" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">No leads yet</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-white/45">
                    New enquiries, test drives, and acquisition requests will appear here.
                  </p>
                </div>
              ) : (
                leads.map((lead) => {
                  const tone = leadStatusStyles[lead.status] ?? leadStatusStyles.New;
                  const phoneDigits = lead.phone.replace(/\D/g, '');
                  return (
                    <article key={lead.id} className="grid gap-5 border border-white/10 bg-white/[0.035] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-2 border px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${tone.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                            {lead.status}
                          </span>
                          <span className="border border-white/10 bg-white/[0.035] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/45">
                            {lead.type}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/28">
                            {formatDate(lead.created_at)}
                          </span>
                        </div>

                        <h3 className="text-2xl font-black uppercase leading-none tracking-tight text-white">{lead.name}</h3>
                        <div className="mt-4 grid gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/45 md:grid-cols-2 xl:grid-cols-4">
                          <span className="flex items-center gap-2 text-white">
                            <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                            {lead.phone}
                          </span>
                          {lead.vehicle_model && (
                            <span className="flex items-center gap-2">
                              <Car className="h-3.5 w-3.5 text-white/25" />
                              {lead.vehicle_model}
                            </span>
                          )}
                          {lead.date && (
                            <span className="flex items-center gap-2">
                              <CalendarIcon className="h-3.5 w-3.5 text-white/25" />
                              {lead.date}{lead.time ? `, ${lead.time}` : ''}
                            </span>
                          )}
                          {lead.message && (
                            <span className="flex items-center gap-2 truncate normal-case tracking-normal">
                              <Mail className="h-3.5 w-3.5 text-white/25" />
                              {lead.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {(['New', 'Contacted', 'Closed'] as const).map((status) => {
                          const active = lead.status === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={active}
                              onClick={() => handleLeadStatus(lead.id, status)}
                              className={`rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all disabled:cursor-default ${
                                active
                                  ? leadStatusStyles[status].active
                                  : 'border-white/10 bg-white/[0.035] text-white/45 hover:border-[#D4AF37]/35 hover:text-white'
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => window.open(`https://wa.me/${phoneDigits}`, '_blank', 'noopener,noreferrer')}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-200 transition-all hover:bg-emerald-500/20"
                          aria-label={`Open WhatsApp chat with ${lead.name}`}
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {tab === 'analytics' && (
          <section className="mt-8">
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-10 bg-white/15" />
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Market signal</p>
              </div>
              <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                Analytics cockpit
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: Activity, label: 'Portfolio', value: `${stats.total} units`, meta: `${stats.available} available` },
                { icon: DollarSign, label: 'Total value', value: formatMillions(stats.totalValue), meta: formatFullLkr(stats.totalValue) },
                { icon: TrendingUp, label: 'Average unit', value: formatMillions(stats.avgPrice), meta: 'Across all listed stock' },
                { icon: Car, label: 'Top brand', value: stats.topMake, meta: 'Highest inventory share' },
              ].map(({ icon: Icon, label, value, meta }) => (
                <article key={label} className="border border-white/10 bg-white/[0.035] p-5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-[#D4AF37]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{label}</p>
                  <h3 className="mt-2 truncate text-2xl font-black uppercase leading-none tracking-tight text-white tabular-nums">{value}</h3>
                  <p className="mt-3 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">{meta}</p>
                </article>
              ))}
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_1fr]">
              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Top interests</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Vehicle clicks</h3>
                  </div>
                  <Eye className="h-5 w-5 text-white/28" />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {stats.topViewed.length === 0 ? (
                    <p className="col-span-full py-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
                      Waiting for view data
                    </p>
                  ) : (
                    stats.topViewed.map((vehicle, index) => (
                      <div key={vehicle.id} className="grid grid-cols-[74px_1fr_auto] items-center gap-4 border border-white/10 bg-black/25 p-3">
                        <div className="relative aspect-square overflow-hidden bg-black/40">
                          <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2 bg-[#D4AF37] px-1.5 py-0.5 text-[9px] font-black text-black">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black uppercase tracking-tight text-white">
                            {vehicle.make} {vehicle.model}
                          </h4>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                            {formatMillions(vehicle.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black leading-none text-[#D4AF37] tabular-nums">{vehicle.views || 0}</p>
                          <p className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/35">Clicks</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Traffic evolution</p>
                      <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Last 7 days</h3>
                    </div>
                    <BarChart2 className="h-5 w-5 text-white/28" />
                  </div>

                  <div className="flex h-44 items-end gap-2">
                    {traffic.length === 0 ? (
                      <div className="flex h-full w-full items-center justify-center border border-dashed border-white/10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
                        Tracking started, waiting for data
                      </div>
                    ) : (
                      traffic
                        .slice()
                        .reverse()
                        .map((item) => (
                          <div key={item.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                            <div className="relative flex min-h-0 flex-1 items-end bg-white/[0.04]">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${((item.page_views || 0) / maxPageViews) * 100}%` }}
                                className="w-full bg-[#D4AF37]/45 transition-colors hover:bg-[#D4AF37]"
                              />
                            </div>
                            <span className="text-center text-[9px] font-black uppercase tracking-tight text-white/35">
                              {new Date(item.date).toLocaleDateString('en-LK', { weekday: 'short' })}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="grid gap-3">
                <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Fleet composition</p>
                      <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Body types</h3>
                    </div>
                    <PieChart className="h-5 w-5 text-white/28" />
                  </div>

                  <div className="space-y-4">
                    {stats.sortedBT.length === 0 ? (
                      <p className="py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white/35">No stock data</p>
                    ) : (
                      stats.sortedBT.map(([bodyType, count]) => {
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                          <div key={bodyType}>
                            <div className="mb-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.16em]">
                              <span className="truncate text-white/48">{bodyType}</span>
                              <span className="text-white">{count} units</span>
                            </div>
                            <div className="h-2 overflow-hidden bg-white/[0.06]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className="h-full bg-[#D4AF37]"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="border border-[#D4AF37]/35 bg-[#D4AF37] p-6 text-black">
                  <div className="mb-8 flex items-center justify-between">
                    <Sparkles className="h-8 w-8" />
                    <Clock3 className="h-5 w-5 opacity-60" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/55">Today signal</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight">
                    {traffic[0]?.visitor_count || 0} visitors
                  </h3>
                  <p className="mt-4 text-sm font-bold leading-6 text-black/65">
                    Latest traffic record from the public showroom, paired with inventory click interest.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab('leads')}
                    className="mt-8 inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5"
                  >
                    Review leads
                    <ArrowUpRight className="h-4 w-4 text-[#D4AF37]" />
                  </button>
                </section>
              </aside>
            </div>
          </section>
        )}
      </main>

      <AnimatePresence>
        {modalVehicle !== undefined && (
          <VehicleModal
            initial={modalVehicle}
            onClose={() => setModalVehicle(undefined)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
