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
import { isSupabaseConfigured, signOut } from '../../lib/supabase';
import Loader from '../../components/Loader';
import { Lead } from '../../data/types';
import VehicleModal, { VehicleFormData } from './VehicleModal';
import { BrandMark, getBrandLabel, getDisplayModel } from '../../components/brand/BrandMark';

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

type DashboardTab = 'overview' | 'inventory' | 'analytics' | 'leads';
type InventoryFilter = 'All' | 'Available' | 'Sold' | 'New' | 'Registered' | 'Reconditioned';
type LeadFilter = 'All' | Lead['status'];
type Notice = { type: 'success' | 'error'; message: string };
type AnalyticsSegment = { label: string; count: number; pct: number; value?: number; meta?: string };

const inventoryFilters: InventoryFilter[] = ['All', 'Available', 'Sold', 'New', 'Registered', 'Reconditioned'];
const leadFilters: LeadFilter[] = ['All', 'New', 'Contacted', 'Closed'];

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
const daysUntilRemoval = (iso: string) => Math.max(0, 14 - daysSince(iso));
const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
const formatNumber = (value: number) => Math.round(value).toLocaleString('en-LK');
const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatMillions = (value: number) => `LKR ${(value / 1_000_000).toFixed(1)}M`;
const formatFullLkr = (value: number) => `LKR ${Math.round(value).toLocaleString('en-LK')}`;
const formatDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};
const getSafeDaysSince = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
};
const getVehicleName = (vehicle: Pick<Vehicle, 'year' | 'make' | 'model'>) =>
  `${vehicle.year} ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`;

function buildCountSegments<T>(items: T[], getLabel: (item: T) => string, totalCount = items.length): AnalyticsSegment[] {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const label = getLabel(item) || 'Unknown';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      pct: totalCount > 0 ? (count / totalCount) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

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
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<{ date: string; visitor_count: number; page_views: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVehicle, setModalVehicle] = useState<VehicleFormData | null | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('All');
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('All');
  const [leadSearch, setLeadSearch] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/db/vehicles?view=full');
      if (res.ok) {
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/db/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch {
      setLeads([]);
    }
  };

  const fetchTraffic = async () => {
    try {
      const res = await fetch('/api/db/analytics');
      if (res.ok) {
        const data = await res.json();
        setTraffic(Array.isArray(data) ? data : []);
      }
    } catch {
      setTraffic([]);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchLeads();
    fetchTraffic();

    const interval = setInterval(() => {
      fetchVehicles();
      fetchLeads();
      fetchTraffic();
    }, 60_000);

    return () => clearInterval(interval);
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
      const make = getBrandLabel(v.make) || 'Unknown';
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
    let result = vehicles;
    if (inventoryFilter === 'Available') result = result.filter((v) => !v.is_sold);
    if (inventoryFilter === 'Sold') result = result.filter((v) => v.is_sold);
    if (['New', 'Registered', 'Reconditioned'].includes(inventoryFilter)) {
      result = result.filter((v) => v.condition === inventoryFilter);
    }

    const query = search.trim().toLowerCase();
    if (!query) return result;

    return result.filter((v) =>
      [getBrandLabel(v.make), v.model, getDisplayModel(v.make, v.model), String(v.year), v.bodyType, v.condition, v.color]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [vehicles, search, inventoryFilter]);

  const filteredLeads = useMemo(() => {
    const query = leadSearch.trim().toLowerCase();
    return leads.filter((lead) => {
      if (leadFilter !== 'All' && lead.status !== leadFilter) return false;
      if (!query) return true;
      return [lead.name, lead.phone, lead.type, lead.vehicle_model, lead.message, lead.date, lead.time, lead.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [leads, leadFilter, leadSearch]);

  const dashboardHealth = useMemo(() => {
    const missingImages = vehicles.filter((vehicle) => !vehicle.image);
    const incompleteListings = vehicles.filter((vehicle) =>
      !vehicle.description || !(vehicle.key_features?.length)
    );
    const archiveReady = vehicles.filter((vehicle) =>
      vehicle.is_sold && vehicle.sold_at && daysUntilRemoval(vehicle.sold_at) === 0
    );
    const staleNewLeads = leads.filter((lead) => lead.status === 'New' && daysSince(lead.created_at) > 1);
    const readiness = vehicles.length > 0
      ? Math.round(((vehicles.length - incompleteListings.length) / vehicles.length) * 100)
      : 100;

    return {
      archiveReady,
      incompleteListings,
      missingImages,
      recentLeads: leads.slice(0, 3),
      readiness,
      staleNewLeads,
      todayTraffic: traffic[0],
    };
  }, [vehicles, leads, traffic]);

  const analytics = useMemo(() => {
    const liveVehicles = vehicles.filter((vehicle) => !vehicle.is_sold);
    const soldVehicles = vehicles.filter((vehicle) => vehicle.is_sold);
    const totalViews = vehicles.reduce((sum, vehicle) => sum + Number(vehicle.views || 0), 0);
    const viewedVehicles = vehicles.filter((vehicle) => Number(vehicle.views || 0) > 0);
    const trafficSeries = traffic.slice().reverse();
    const totalVisitors = traffic.reduce((sum, item) => sum + Number(item.visitor_count || 0), 0);
    const totalPageViews = traffic.reduce((sum, item) => sum + Number(item.page_views || 0), 0);
    const latestTraffic = traffic[0];
    const previousTraffic = traffic[1];
    const visitorDelta = latestTraffic
      ? Number(latestTraffic.visitor_count || 0) - Number(previousTraffic?.visitor_count || 0)
      : 0;
    const pageViewDelta = latestTraffic
      ? Number(latestTraffic.page_views || 0) - Number(previousTraffic?.page_views || 0)
      : 0;
    const bestTrafficDay = traffic.length > 0
      ? traffic.slice().sort((a, b) => Number(b.page_views || 0) - Number(a.page_views || 0))[0]
      : null;

    const leadStatusCounts = leads.reduce<Record<Lead['status'], number>>(
      (acc, lead) => {
        acc[lead.status] += 1;
        return acc;
      },
      { New: 0, Contacted: 0, Closed: 0 },
    );
    const leadTypeSegments = buildCountSegments<Lead>(leads, (lead) => lead.type);
    const closedLeadRate = leads.length > 0 ? (leadStatusCounts.Closed / leads.length) * 100 : 0;
    const followUpRate = leads.length > 0
      ? ((leadStatusCounts.Contacted + leadStatusCounts.Closed) / leads.length) * 100
      : 0;
    const leadsPerHundredVisitors = totalVisitors > 0 ? (leads.length / totalVisitors) * 100 : 0;

    const brandValue = vehicles.reduce<Record<string, { label: string; count: number; value: number }>>((acc, vehicle) => {
      const label = getBrandLabel(vehicle.make) || 'Unknown';
      if (!acc[label]) acc[label] = { label, count: 0, value: 0 };
      acc[label].count += 1;
      acc[label].value += Number(vehicle.price || 0);
      return acc;
    }, {});
    const brandValueSegments = (Object.values(brandValue) as Array<{ label: string; count: number; value: number }>)
      .map((item) => ({
        label: item.label,
        count: item.count,
        value: item.value,
        pct: stats.totalValue > 0 ? (item.value / stats.totalValue) * 100 : 0,
        meta: formatMillions(item.value),
      }))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const conditionSegments = buildCountSegments<Vehicle>(vehicles, (vehicle) => vehicle.condition || 'Unknown', vehicles.length);
    const bodyTypeSegments = buildCountSegments<Vehicle>(vehicles, (vehicle) => vehicle.bodyType || 'Unknown', vehicles.length);
    const fuelSegments = buildCountSegments<Vehicle>(vehicles, (vehicle) => vehicle.fuel || 'Unknown', vehicles.length);
    const transmissionSegments = buildCountSegments<Vehicle>(vehicles, (vehicle) => vehicle.transmission || 'Unknown', vehicles.length);

    const priceBands = [
      { label: '< LKR 10M', count: liveVehicles.filter((vehicle) => Number(vehicle.price || 0) < 10_000_000).length },
      { label: 'LKR 10M-20M', count: liveVehicles.filter((vehicle) => Number(vehicle.price || 0) >= 10_000_000 && Number(vehicle.price || 0) < 20_000_000).length },
      { label: 'LKR 20M-35M', count: liveVehicles.filter((vehicle) => Number(vehicle.price || 0) >= 20_000_000 && Number(vehicle.price || 0) < 35_000_000).length },
      { label: 'LKR 35M+', count: liveVehicles.filter((vehicle) => Number(vehicle.price || 0) >= 35_000_000).length },
    ].map((band) => ({
      ...band,
      pct: liveVehicles.length > 0 ? (band.count / liveVehicles.length) * 100 : 0,
    }));

    const incompleteLive = liveVehicles.filter((vehicle) =>
      !vehicle.image || !vehicle.description?.trim() || !(vehicle.key_features?.length)
    );
    const highValueIncomplete = incompleteLive
      .slice()
      .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 4);
    const quietStock = liveVehicles
      .filter((vehicle) => Number(vehicle.views || 0) === 0)
      .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 4);
    const vehicleAges = liveVehicles
      .map((vehicle) => ({ vehicle, days: getSafeDaysSince(vehicle.created_at) }))
      .filter((item): item is { vehicle: Vehicle; days: number } => item.days !== null);
    const oldestLive = vehicleAges.slice().sort((a, b) => b.days - a.days)[0] ?? null;
    const avgDaysLive = vehicleAges.length > 0
      ? vehicleAges.reduce((sum, item) => sum + item.days, 0) / vehicleAges.length
      : 0;

    const availableValue = liveVehicles.reduce((sum, vehicle) => sum + Number(vehicle.price || 0), 0);
    const soldValue = soldVehicles.reduce((sum, vehicle) => sum + Number(vehicle.price || 0), 0);
    const demandCoverage = vehicles.length > 0 ? (viewedVehicles.length / vehicles.length) * 100 : 0;
    const readinessValueAtRisk = incompleteLive.reduce((sum, vehicle) => sum + Number(vehicle.price || 0), 0);
    const maxPageViews = Math.max(1, ...traffic.map((item) => Number(item.page_views || 0)));

    return {
      avgDaysLive,
      availableValue,
      bestTrafficDay,
      bodyTypeSegments,
      brandValueSegments,
      closedLeadRate,
      conditionSegments,
      demandCoverage,
      followUpRate,
      fuelSegments,
      highValueIncomplete,
      incompleteLive,
      latestTraffic,
      leadStatusCounts,
      leadTypeSegments,
      leadsPerHundredVisitors,
      maxPageViews,
      oldestLive,
      pageViewDelta,
      priceBands,
      quietStock,
      readinessValueAtRisk,
      soldValue,
      totalPageViews,
      totalViews,
      totalVisitors,
      trafficSeries,
      transmissionSegments,
      visitorDelta,
      viewedVehicles,
    };
  }, [vehicles, leads, traffic, stats.totalValue]);

  if (loading && vehicles.length === 0) return <Loader />;

  const newLeadCount = leads.filter((lead) => lead.status === 'New').length;
  const contactedLeadCount = leads.filter((lead) => lead.status === 'Contacted').length;
  const closedLeadCount = leads.filter((lead) => lead.status === 'Closed').length;
  const attentionCount =
    newLeadCount +
    dashboardHealth.staleNewLeads.length +
    dashboardHealth.missingImages.length +
    dashboardHealth.archiveReady.length;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Activity, count: attentionCount },
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
    const vehicleName = `${v.year} ${getBrandLabel(v.make)} ${getDisplayModel(v.make, v.model)}`;
    if (!window.confirm(`Remove ${vehicleName} permanently? This cannot be undone.`)) return;
    const res = await fetch(`/api/db/vehicles?id=${encodeURIComponent(v.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setNotice({ type: 'error', message: `Delete failed: ${err.error || 'Server error'}` });
      return;
    }
    setNotice({ type: 'success', message: `${getBrandLabel(v.make)} ${getDisplayModel(v.make, v.model)} removed from inventory.` });
    fetchVehicles();
  };

  const handleToggleSold = async (v: Vehicle) => {
    const nowSold = !v.is_sold;
    const vehicleName = `${v.year} ${getBrandLabel(v.make)} ${getDisplayModel(v.make, v.model)}`;
    const confirmed = window.confirm(
      nowSold
        ? `Mark ${vehicleName} as sold? It will be hidden from the public website.`
        : `Put ${vehicleName} back on the website?`,
    );
    if (!confirmed) return;

    const res = await fetch('/api/db/vehicles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v.id, is_sold: nowSold, sold_at: nowSold ? new Date().toISOString() : null }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setNotice({ type: 'error', message: `Status update failed: ${err.error || 'Server error'}` });
      return;
    }

    setNotice({ type: 'success', message: nowSold ? 'Vehicle marked as sold.' : 'Vehicle returned to live inventory.' });
    fetchVehicles();
  };

  const handleLeadStatus = async (id: string, status: Lead['status']) => {
    const res = await fetch('/api/db/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setNotice({ type: 'error', message: `Lead update failed: ${err.error || 'Server error'}` });
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
    void import('../../lib/inventoryCache').then(({ invalidateInventoryCache }) => {
      invalidateInventoryCache();
    });
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
              <img src="/serendib-logo-192.png" alt="Serendib Trading" className="h-9 w-auto" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Serendib Trading</span>
              <span className="block truncate text-lg font-black uppercase leading-none tracking-normal text-white sm:text-xl">
                Dashboard
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
              Website
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
                "linear-gradient(90deg, rgba(13,11,9,0.82), rgba(13,11,9,0.55)), url('/images/showroom/serendib-showroom-floor-02.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),transparent_42%,rgba(255,255,255,0.05))]" />
          <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_420px] lg:p-10">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                Live listings
              </div>
              <h1 className="max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Manage cars and leads
              </h1>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-white/60 md:text-base">
                Add or edit vehicles, follow up buyer enquiries, and check site traffic.
              </p>
            </div>

            <div className="grid content-end gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => setModalVehicle(null)}
                aria-label="Add a new vehicle to inventory"
                className="group flex items-center justify-between gap-4 rounded-2xl bg-[#D4AF37] px-5 py-4 text-left text-black transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-black/60">New listing</span>
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

        {tab === 'overview' && (
          <section className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-px w-10 bg-white/15" />
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Today</p>
                  </div>
                  <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white text-balance md:text-5xl">
                    Overview
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  {isSupabaseConfigured ? 'Listings and photos' : 'Local fallback mode'}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'New buyer leads',
                    value: newLeadCount,
                    meta: 'Waiting for follow-up',
                    icon: Users,
                    action: () => setTab('leads'),
                  },
                  {
                    label: 'Stale leads',
                    value: dashboardHealth.staleNewLeads.length,
                    meta: 'New for over 24 hours',
                    icon: Clock3,
                    action: () => setTab('leads'),
                  },
                  {
                    label: 'Missing photos',
                    value: dashboardHealth.missingImages.length,
                    meta: 'Listings need hero images',
                    icon: ImageIcon,
                    action: () => setTab('inventory'),
                  },
                  {
                    label: 'Archive ready',
                    value: dashboardHealth.archiveReady.length,
                    meta: 'Sold units past 14 days',
                    icon: CheckCircle2,
                    action: () => setTab('inventory'),
                  },
                ].map(({ label, value, meta, icon: Icon, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    className="group border border-white/10 bg-black/25 p-4 text-left transition-all hover:border-[#D4AF37]/35 hover:bg-black/40"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{label}</span>
                      <Icon className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <p className="text-3xl font-black leading-none text-white tabular-nums">{value}</p>
                    <p className="mt-3 truncate text-[10px] font-black uppercase tracking-[0.16em] text-white/32">{meta}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                <section className="border border-white/10 bg-black/20 p-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Listing quality</p>
                      <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Readiness score</h3>
                    </div>
                    <p className="text-4xl font-black leading-none text-white tabular-nums">{dashboardHealth.readiness}%</p>
                  </div>
                  <div className="h-3 overflow-hidden bg-white/[0.06]">
                    <div className="h-full bg-[#D4AF37]" style={{ width: `${dashboardHealth.readiness}%` }} />
                  </div>
                  <div className="mt-5 grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/42 sm:grid-cols-3">
                    <span>{stats.available} live units</span>
                    <span>{dashboardHealth.incompleteListings.length} incomplete</span>
                    <span>{stats.topMake} leads stock mix</span>
                  </div>
                </section>

                <section className="border border-white/10 bg-black/20 p-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Traffic pulse</p>
                      <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Latest signal</h3>
                    </div>
                    <BarChart2 className="h-5 w-5 text-white/28" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Visitors</p>
                      <p className="mt-3 text-3xl font-black leading-none text-white tabular-nums">
                        {dashboardHealth.todayTraffic?.visitor_count || 0}
                      </p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Page views</p>
                      <p className="mt-3 text-3xl font-black leading-none text-white tabular-nums">
                        {dashboardHealth.todayTraffic?.page_views || 0}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium leading-6 text-white/45 text-pretty">
                    Last tracked day: {formatDate(dashboardHealth.todayTraffic?.date)}. Use the analytics tab for the full 7-day view.
                  </p>
                </section>
              </div>
            </div>

            <aside className="grid gap-4">
              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Quick actions</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {[
                    { label: 'Add vehicle', icon: Plus, action: () => setModalVehicle(null) },
                    { label: 'Manage inventory', icon: Car, action: () => setTab('inventory') },
                    { label: 'Review leads', icon: Users, action: () => setTab('leads') },
                    { label: 'Open analytics', icon: PieChart, action: () => setTab('analytics') },
                    { label: 'View public showroom', icon: ArrowUpRight, action: () => navigate('/inventory') },
                  ].map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="flex items-center justify-between gap-4 border border-white/10 bg-black/25 px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] text-white/55 transition-all hover:border-[#D4AF37]/35 hover:text-white"
                    >
                      {label}
                      <Icon className="h-4 w-4 text-[#D4AF37]" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Recent leads</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Buyer inbox</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('leads')}
                    className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/45 transition-all hover:border-[#D4AF37]/35 hover:text-white"
                  >
                    View all
                  </button>
                </div>

                <div className="grid gap-3">
                  {dashboardHealth.recentLeads.length === 0 ? (
                    <div className="border border-dashed border-white/10 px-4 py-8 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/35">
                      No incoming leads yet
                    </div>
                  ) : (
                    dashboardHealth.recentLeads.map((lead) => {
                      const tone = leadStatusStyles[lead.status] ?? leadStatusStyles.New;
                      return (
                        <article key={lead.id} className="border border-white/10 bg-black/25 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h4 className="truncate text-sm font-black uppercase tracking-tight text-white">{lead.name}</h4>
                            <span className={`inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${tone.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                              {lead.status}
                            </span>
                          </div>
                          <p className="truncate text-[11px] font-bold uppercase tracking-[0.13em] text-white/45">
                            {lead.vehicle_model || lead.type} - {lead.phone}
                          </p>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            </aside>
          </section>
        )}

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

            <div className="mb-5 flex flex-wrap gap-2">
              {inventoryFilters.map((filter) => {
                const active = inventoryFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setInventoryFilter(filter)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                      active
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                        : 'border-white/10 bg-white/[0.035] text-white/45 hover:border-[#D4AF37]/35 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <div className="border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                  <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#D4AF37]" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">No matching vehicles</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-white/45">
                    Adjust the search term or add a new unit to the live inventory.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalVehicle(null)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black transition-transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add vehicle
                  </button>
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
                          alt={`${vehicle.year} ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`}
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
                          <span className="inline-flex items-center gap-2 border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                            <BrandMark
                              make={vehicle.make}
                              tone="mono"
                              className="size-4 shrink-0 text-[#D4AF37]"
                            />
                            {getBrandLabel(vehicle.make)}
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
                          {getDisplayModel(vehicle.make, vehicle.model)}
                        </h3>
                        <div className="mt-4 grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 sm:grid-cols-2 xl:grid-cols-4">
                          <span className="flex items-center gap-2 text-white">
                            <DollarSign className="h-3.5 w-3.5 text-[#D4AF37]" />
                            {formatMillions(vehicle.price)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Gauge className="h-3.5 w-3.5 text-white/25" />
                            {Number(vehicle.mileage) > 0 ? `${Number(vehicle.mileage).toLocaleString('en-LK')} km` : 'Mileage not set'}
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
                          aria-label={
                            sold
                              ? `Relist ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`
                              : `Mark ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)} as sold`
                          }
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
                          aria-label={`Edit ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55 transition-all hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle)}
                          aria-label={`Delete ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`}
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
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Enquiries</p>
                </div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                  Buyer messages
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

            <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_420px] xl:items-center">
              <div className="flex flex-wrap gap-2">
                {leadFilters.map((filter) => {
                  const active = leadFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLeadFilter(filter)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                        active
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                          : 'border-white/10 bg-white/[0.035] text-white/45 hover:border-[#D4AF37]/35 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              <label className="relative w-full">
                <span className="sr-only">Search leads</span>
                <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={leadSearch}
                  onChange={(event) => setLeadSearch(event.target.value)}
                  placeholder="Search buyer, phone, vehicle..."
                  className="w-full rounded-full border border-white/10 bg-white/[0.04] py-4 pl-13 pr-5 text-sm font-bold text-white placeholder:text-white/28 transition-all focus:outline-none focus:border-[#D4AF37]"
                />
              </label>
            </div>

            <div className="grid gap-3">
              {filteredLeads.length === 0 ? (
                <div className="border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                  <Users className="mx-auto mb-4 h-8 w-8 text-[#D4AF37]" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                    {leads.length === 0 ? 'No leads yet' : 'No matching leads'}
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-white/45">
                    {leads.length === 0
                      ? 'New enquiries, test drives, and vehicle requests will appear here.'
                      : 'Adjust the status filter or search term to widen the buyer queue.'}
                  </p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
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
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-10 bg-white/15" />
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Traffic</p>
                </div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
                  Site analytics
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-white/45">
                  {isSupabaseConfigured ? 'Last 30 days' : 'Local fallback mode'}
                </span>
                <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-[#F5D66B]">
                  Updated {formatDate(analytics.latestTraffic?.date)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              {[
                { icon: Activity, label: '7D visitors', value: formatNumber(analytics.totalVisitors), meta: analytics.visitorDelta || traffic.length > 1 ? `${analytics.visitorDelta >= 0 ? '+' : ''}${formatNumber(analytics.visitorDelta)} prior day` : 'No prior day' },
                { icon: BarChart2, label: '7D page views', value: formatNumber(analytics.totalPageViews), meta: analytics.pageViewDelta || traffic.length > 1 ? `${analytics.pageViewDelta >= 0 ? '+' : ''}${formatNumber(analytics.pageViewDelta)} prior day` : 'No prior day' },
                { icon: Users, label: 'Lead close rate', value: formatPercent(analytics.closedLeadRate), meta: `${closedLeadCount} closed of ${leads.length}` },
                { icon: Eye, label: 'Demand coverage', value: formatPercent(analytics.demandCoverage), meta: `${analytics.viewedVehicles.length}/${stats.total} units viewed` },
                { icon: CheckCircle2, label: 'Readiness', value: `${dashboardHealth.readiness}%`, meta: `${analytics.incompleteLive.length} live gaps` },
                { icon: DollarSign, label: 'Live value', value: formatMillions(analytics.availableValue), meta: `${stats.available} available units` },
              ].map(({ icon: Icon, label, value, meta }) => (
                <article key={label} className="border border-white/10 bg-white/[0.035] p-5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-[#D4AF37]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{label}</p>
                  <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white tabular-nums">{value}</h3>
                  <p className="mt-3 min-h-[28px] text-[10px] font-bold uppercase tracking-[0.12em] leading-4 text-white/38">{meta}</p>
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
                          <img src={vehicle.image} alt={`${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`} className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2 bg-[#D4AF37] px-1.5 py-0.5 text-[9px] font-black text-black">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <BrandMark
                              make={vehicle.make}
                              tone="mono"
                              className="size-6 shrink-0 rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-white/50"
                            />
                            <h4 className="truncate text-sm font-black uppercase tracking-tight text-white">
                              {getBrandLabel(vehicle.make)} {getDisplayModel(vehicle.make, vehicle.model)}
                            </h4>
                          </div>
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
                                animate={{ height: `${((item.page_views || 0) / analytics.maxPageViews) * 100}%` }}
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

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Leads</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Recent enquiries</h3>
                  </div>
                  <Users className="h-5 w-5 text-white/28" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                  <div className="grid gap-4">
                    {(['New', 'Contacted', 'Closed'] as Lead['status'][]).map((status) => {
                      const count = analytics.leadStatusCounts[status];
                      const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
                      const tone = leadStatusStyles[status];
                      return (
                        <div key={status}>
                          <div className="mb-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.16em]">
                            <span className="inline-flex items-center gap-2 text-white/55">
                              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                              {status}
                            </span>
                            <span className="text-white">{count}</span>
                          </div>
                          <div className="h-2 overflow-hidden bg-white/[0.06]">
                            <div className={`h-full ${tone.dot}`} style={{ width: `${clampPercent(pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Follow-up', value: formatPercent(analytics.followUpRate), meta: 'Contacted or closed' },
                        { label: 'Close rate', value: formatPercent(analytics.closedLeadRate), meta: `${closedLeadCount} wins` },
                        { label: 'Lead yield', value: analytics.leadsPerHundredVisitors.toFixed(1), meta: 'Per 100 visitors' },
                      ].map((item) => (
                        <div key={item.label} className="border border-white/10 bg-black/25 p-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">{item.label}</p>
                          <p className="mt-3 text-2xl font-black leading-none text-white tabular-nums">{item.value}</p>
                          <p className="mt-3 truncate text-[10px] font-black uppercase tracking-[0.12em] text-white/32">{item.meta}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-white/10 bg-black/25 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">Lead types</p>
                    <div className="mt-5 space-y-4">
                      {analytics.leadTypeSegments.length === 0 ? (
                        <p className="py-8 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/35">No lead types yet</p>
                      ) : (
                        analytics.leadTypeSegments.map((segment) => (
                          <div key={segment.label}>
                            <div className="mb-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.14em]">
                              <span className="truncate text-white/48">{segment.label}</span>
                              <span className="text-white">{segment.count}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden bg-white/[0.06]">
                              <div className="h-full bg-[#D4AF37]" style={{ width: `${clampPercent(segment.pct)}%` }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Listing quality</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Action queue</h3>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-white/28" />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: 'New leads', value: analytics.leadStatusCounts.New, meta: 'Need first response', icon: Users, action: () => setTab('leads') },
                    { label: 'Stale leads', value: dashboardHealth.staleNewLeads.length, meta: 'Over 24 hours new', icon: Clock3, action: () => setTab('leads') },
                    { label: 'Missing photos', value: dashboardHealth.missingImages.length, meta: 'Hero image gaps', icon: ImageIcon, action: () => setTab('inventory') },
                    { label: 'Incomplete live', value: analytics.incompleteLive.length, meta: formatMillions(analytics.readinessValueAtRisk), icon: CheckCircle2, action: () => setTab('inventory') },
                    { label: 'Quiet stock', value: analytics.quietStock.length, meta: 'No recorded clicks', icon: Eye, action: () => setTab('inventory') },
                    { label: 'Archive ready', value: dashboardHealth.archiveReady.length, meta: 'Sold past 14 days', icon: Trash2, action: () => setTab('inventory') },
                  ].map(({ label, value, meta, icon: Icon, action }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 border border-white/10 bg-black/25 px-4 py-3 text-left transition-all hover:border-[#D4AF37]/35 hover:bg-black/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-black uppercase tracking-[0.16em] text-white/58">{label}</span>
                        <span className="mt-1 block truncate text-[10px] font-black uppercase tracking-[0.12em] text-white/32">{meta}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-2xl font-black leading-none text-white tabular-nums">{value}</span>
                        <Icon className="h-4 w-4 text-[#D4AF37]" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr_0.9fr]">
              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Portfolio value</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Brand concentration</h3>
                  </div>
                  <WalletCards className="h-5 w-5 text-white/28" />
                </div>

                <div className="space-y-4">
                  {analytics.brandValueSegments.length === 0 ? (
                    <p className="py-8 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/35">No stock data</p>
                  ) : (
                    analytics.brandValueSegments.slice(0, 6).map((segment) => (
                      <div key={segment.label}>
                        <div className="mb-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.15em]">
                          <span className="flex min-w-0 items-center gap-2 text-white/58">
                            <BrandMark make={segment.label} tone="mono" className="size-5 shrink-0 text-[#D4AF37]" />
                            <span className="truncate">{segment.label}</span>
                          </span>
                          <span className="shrink-0 text-white">{segment.meta}</span>
                        </div>
                        <div className="h-2 overflow-hidden bg-white/[0.06]">
                          <div className="h-full bg-[#D4AF37]" style={{ width: `${clampPercent(segment.pct)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="border border-white/10 bg-black/25 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Sold value</p>
                    <p className="mt-3 text-2xl font-black leading-none text-white tabular-nums">{formatMillions(analytics.soldValue)}</p>
                  </div>
                  <div className="border border-white/10 bg-black/25 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Avg days live</p>
                    <p className="mt-3 text-2xl font-black leading-none text-white tabular-nums">{formatNumber(analytics.avgDaysLive)}</p>
                  </div>
                </div>
              </section>

              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Fleet composition</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Stock mix</h3>
                  </div>
                  <PieChart className="h-5 w-5 text-white/28" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    { title: 'Body types', segments: analytics.bodyTypeSegments },
                    { title: 'Fuel', segments: analytics.fuelSegments },
                    { title: 'Condition', segments: analytics.conditionSegments },
                    { title: 'Transmission', segments: analytics.transmissionSegments },
                  ].map((group) => (
                    <div key={group.title}>
                      <p className="mb-3 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{group.title}</p>
                      <div className="space-y-3">
                        {group.segments.length === 0 ? (
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/28">No data</p>
                        ) : (
                          group.segments.slice(0, 4).map((segment) => (
                            <div key={segment.label}>
                              <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em]">
                                <span className="truncate text-white/48">{segment.label}</span>
                                <span className="text-white">{segment.count}</span>
                              </div>
                              <div className="h-1.5 overflow-hidden bg-white/[0.06]">
                                <div className="h-full bg-[#D4AF37]" style={{ width: `${clampPercent(segment.pct)}%` }} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Pricing lanes</p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Available bands</h3>
                  </div>
                  <TrendingUp className="h-5 w-5 text-white/28" />
                </div>

                <div className="space-y-4">
                  {analytics.priceBands.map((band) => (
                    <div key={band.label}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.14em]">
                        <span className="truncate text-white/48">{band.label}</span>
                        <span className="text-white">{band.count} units</span>
                      </div>
                      <div className="h-2 overflow-hidden bg-white/[0.06]">
                        <div className="h-full bg-[#D4AF37]" style={{ width: `${clampPercent(band.pct)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="border border-white/10 bg-black/25 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Oldest live unit</p>
                    <p className="mt-3 truncate text-2xl font-black uppercase leading-none text-white">
                      {analytics.oldestLive ? `${analytics.oldestLive.days} days` : 'N/A'}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-black/25 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Total click pool</p>
                    <p className="mt-3 text-2xl font-black uppercase leading-none text-white tabular-nums">{formatNumber(analytics.totalViews)}</p>
                  </div>
                </div>
              </section>
            </div>

            <section className="mt-3 border border-white/10 bg-white/[0.035] p-5 md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">High-value gaps</p>
                  <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Listings to fix first</h3>
                </div>
                <Edit2 className="h-5 w-5 text-white/28" />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {analytics.highValueIncomplete.length === 0 ? (
                  <p className="col-span-full py-8 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/35">No live quality gaps</p>
                ) : (
                  analytics.highValueIncomplete.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => openEdit(vehicle)}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 border border-white/10 bg-black/25 px-4 py-4 text-left transition-all hover:border-[#D4AF37]/35"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black uppercase tracking-tight text-white">{getVehicleName(vehicle)}</span>
                        <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                          {!vehicle.image ? 'Missing image' : !vehicle.description?.trim() ? 'Missing description' : 'Missing features'}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-[#D4AF37]">{formatMillions(vehicle.price)}</span>
                    </button>
                  ))
                )}
              </div>
            </section>
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
