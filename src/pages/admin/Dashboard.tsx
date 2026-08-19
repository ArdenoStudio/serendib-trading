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
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invalidateInventoryCache } from '../../lib/inventoryCache';
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

const panel = 'rounded-2xl border border-white/10 bg-white/[0.03]';
const searchField =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]';
const pill = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
    active
      ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
      : 'border-white/10 text-white/70 hover:border-white/25 hover:text-white'
  }`;
const iconBtn =
  'inline-flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition-colors hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]';

function Meter({ pct, barClassName = 'bg-[#D4AF37]' }: { pct: number; barClassName?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${clampPercent(pct)}%` }} />
    </div>
  );
}

function SegmentRows({ items, empty = 'No data' }: { items: AnalyticsSegment[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-white/45">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((segment) => (
        <div key={segment.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-white/60">{segment.label}</span>
            <span className="shrink-0 tabular-nums text-white">{segment.meta ?? segment.count}</span>
          </div>
          <Meter pct={segment.pct} />
        </div>
      ))}
    </div>
  );
}

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
    { label: 'Cars', value: stats.total.toLocaleString('en-LK'), meta: 'Listed', icon: Car },
    { label: 'On website', value: stats.available.toLocaleString('en-LK'), meta: 'Available now', icon: ShieldCheck },
    { label: 'Sold', value: stats.sold.toLocaleString('en-LK'), meta: 'Archived', icon: CheckCircle2 },
    { label: 'Total value', value: formatMillions(stats.totalValue), meta: formatFullLkr(stats.totalValue), icon: WalletCards },
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
    invalidateInventoryCache();
    fetchVehicles();
    setNotice({ type: 'success', message: 'Inventory saved.' });
  };

  return (
    <div className="min-h-dvh bg-[#0d0b09] font-sans text-white">

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0b09]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex min-w-0 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            aria-label="Back to website"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <img src="/serendib-logo-192.png" alt="" className="h-7 w-auto" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">Serendib Trading</span>
              <span className="block text-xs text-white/45">Admin</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 lg:flex" aria-label="Admin sections">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={active}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                    active ? 'bg-[#D4AF37] text-black' : 'text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                  <span className={`tabular-nums ${active ? 'text-black/60' : 'text-white/45'}`}>{item.count}</span>
                  {item.id === 'leads' && newLeadCount > 0 && (
                    <>
                      <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-400" aria-hidden="true" />
                      <span className="sr-only">{newLeadCount} new leads</span>
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] md:inline-flex"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Website
            </button>
            <button
              type="button"
              onClick={handleManualRefresh}
              aria-label="Refresh dashboard data"
              className={iconBtn}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured) await signOut();
                navigate('/admin/login');
              }}
              aria-label="Sign out"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden" aria-label="Admin sections">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                  active
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                    : 'border-white/10 text-white/65'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white text-balance">Dashboard</h1>
            <p className="mt-1 text-sm text-white/55">Add cars, follow up leads, and check traffic.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setModalVehicle(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add vehicle
            </button>
            <button
              type="button"
              onClick={() => setTab('leads')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              {newLeadCount} new lead{newLeadCount === 1 ? '' : 's'}
              <ArrowUpRight className="size-4 text-[#D4AF37]" aria-hidden="true" />
            </button>
          </div>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className={`${panel} p-4`}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-white/55">{card.label}</span>
                  <span className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-[#D4AF37]">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-white">{card.value}</p>
                <p className="mt-1 truncate text-sm text-white/40">{card.meta}</p>
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
              className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
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
            <div className={`${panel} p-5`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Needs attention</h2>
                <p className="text-sm text-white/45">{isSupabaseConfigured ? 'Live data' : 'Local fallback'}</p>
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
                    className={`${panel} p-4 text-left hover:border-[#D4AF37]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-white/55">{label}</span>
                      <Icon className="size-4 text-[#D4AF37]" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-white">{value}</p>
                    <p className="mt-1 truncate text-sm text-white/40">{meta}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                <section className={`${panel} p-5`}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-white">Listing quality</h3>
                    <p className="text-2xl font-semibold tabular-nums text-white">{dashboardHealth.readiness}%</p>
                  </div>
                  <Meter pct={dashboardHealth.readiness} />
                  <div className="mt-4 grid gap-2 text-sm text-white/55 sm:grid-cols-3">
                    <span>{stats.available} on website</span>
                    <span>{dashboardHealth.incompleteListings.length} incomplete</span>
                    <span>{stats.topMake} most listed</span>
                  </div>
                </section>

                <section className={`${panel} p-5`}>
                  <h3 className="mb-4 text-base font-semibold text-white">Today’s traffic</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 p-3">
                      <p className="text-sm text-white/55">Visitors</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                        {dashboardHealth.todayTraffic?.visitor_count || 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 p-3">
                      <p className="text-sm text-white/55">Page views</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                        {dashboardHealth.todayTraffic?.page_views || 0}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-white/45 text-pretty">
                    Last recorded: {formatDate(dashboardHealth.todayTraffic?.date)}. Open Analytics for the week.
                  </p>
                </section>
              </div>
            </div>

            <aside className="grid gap-4">
              <section className={`${panel} p-5`}>
                <h2 className="text-lg font-semibold text-white">Quick actions</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {[
                    { label: 'Add vehicle', icon: Plus, action: () => setModalVehicle(null) },
                    { label: 'Inventory', icon: Car, action: () => setTab('inventory') },
                    { label: 'Leads', icon: Users, action: () => setTab('leads') },
                    { label: 'Analytics', icon: PieChart, action: () => setTab('analytics') },
                    { label: 'View website', icon: ArrowUpRight, action: () => navigate('/inventory') },
                  ].map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-2.5 text-left text-sm text-white/75 hover:border-[#D4AF37]/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    >
                      {label}
                      <Icon className="size-4 text-[#D4AF37]" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </section>

              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Recent leads</h2>
                  <button
                    type="button"
                    onClick={() => setTab('leads')}
                    className="text-sm text-white/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                  >
                    View all
                  </button>
                </div>

                <div className="grid gap-3">
                  {dashboardHealth.recentLeads.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/45">
                      No incoming leads yet
                    </div>
                  ) : (
                    dashboardHealth.recentLeads.map((lead) => {
                      const tone = leadStatusStyles[lead.status] ?? leadStatusStyles.New;
                      return (
                        <article key={lead.id} className="rounded-xl border border-white/10 p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="truncate text-sm font-semibold text-white">{lead.name}</h3>
                            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${tone.badge}`}>
                              <span className={`size-1.5 rounded-full ${tone.dot}`} />
                              {lead.status}
                            </span>
                          </div>
                          <p className="truncate text-sm text-white/50">
                            {lead.vehicle_model || lead.type} · {lead.phone}
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
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold text-white">Cars</h2>

              <label className="relative w-full lg:max-w-md">
                <span className="sr-only">Search inventory</span>
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search make, model, year..."
                  className={searchField}
                />
              </label>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {inventoryFilters.map((filter) => {
                const active = inventoryFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setInventoryFilter(filter)}
                    aria-pressed={active}
                    className={pill(active)}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <div className={`${panel} px-6 py-12 text-center`}>
                  <Car className="mx-auto mb-3 size-8 text-[#D4AF37]" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">No matching vehicles</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                    Try a different search, or add a car.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalVehicle(null)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-black"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add vehicle
                  </button>
                </div>
              ) : (
                filtered.map((vehicle) => {
                  const sold = vehicle.is_sold;
                  const removalDays = sold && vehicle.sold_at ? daysUntilRemoval(vehicle.sold_at) : 0;
                  return (
                    <article
                      key={vehicle.id}
                      className={`grid gap-4 rounded-2xl border p-4 md:grid-cols-[132px_1fr_auto] md:items-center ${
                        sold ? 'border-red-400/20 bg-red-500/[0.04]' : `${panel}`
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/40">
                        <img
                          src={vehicle.image}
                          alt={`${vehicle.year} ${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`}
                          className={`h-full w-full object-cover ${sold ? 'opacity-50 grayscale' : ''}`}
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1.5 text-xs text-white/80">
                          <span>{vehicle.condition}</span>
                          {vehicle.gallery?.length ? (
                            <span className="inline-flex items-center gap-1 text-[#D4AF37]">
                              <ImageIcon className="size-3" aria-hidden="true" />
                              {vehicle.gallery.length}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-[#D4AF37]">
                            <BrandMark make={vehicle.make} tone="mono" className="size-4 shrink-0" />
                            {getBrandLabel(vehicle.make)}
                          </span>
                          <span className="text-white/45">{vehicle.year}</span>
                          {sold && <span className="rounded-full border border-red-400/25 bg-red-500/10 px-2 py-0.5 text-xs text-red-200">Sold</span>}
                        </div>
                        <h3 className="truncate text-lg font-semibold text-white">
                          {getDisplayModel(vehicle.make, vehicle.model)}
                        </h3>
                        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/55">
                          <span className="text-white">{formatMillions(vehicle.price)}</span>
                          <span>{Number(vehicle.mileage) > 0 ? `${Number(vehicle.mileage).toLocaleString('en-LK')} km` : 'Mileage not set'}</span>
                          <span>{vehicle.fuel || 'Fuel not set'}</span>
                          <span>{vehicle.bodyType || vehicle.color || 'Details pending'}</span>
                        </p>
                        {sold && vehicle.sold_at && (
                          <p className="mt-2 flex items-center gap-2 text-sm text-amber-200">
                            <AlertTriangle className="size-3.5" aria-hidden="true" />
                            {removalDays > 0 ? `Hidden from site in ${removalDays} day${removalDays === 1 ? '' : 's'}` : 'Hidden from the website'}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggleSold(vehicle)}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                            sold
                              ? 'border-red-400/25 bg-red-500/10 text-red-200'
                              : 'border-white/10 text-white/70 hover:text-white'
                          }`}
                        >
                          {sold ? 'Relist' : 'Mark sold'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(vehicle)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-white/80 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle)}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {tab === 'leads' && (
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Leads</h2>
                <p className="mt-1 text-sm text-white/50">Newest first. Open WhatsApp from the same row.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ['New', newLeadCount],
                  ['Contacted', contactedLeadCount],
                  ['Closed', closedLeadCount],
                ].map(([label, value]) => (
                  <div key={label} className={`${panel} min-w-[96px] px-3 py-2.5`}>
                    <p className="text-xl font-semibold tabular-nums text-white">{value}</p>
                    <p className="mt-1 text-xs text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {leadFilters.map((filter) => {
                  const active = leadFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLeadFilter(filter)}
                      aria-pressed={active}
                      className={pill(active)}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              <label className="relative w-full xl:max-w-md">
                <span className="sr-only">Search leads</span>
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
                <input
                  value={leadSearch}
                  onChange={(event) => setLeadSearch(event.target.value)}
                  placeholder="Search name, phone, car, or message"
                  className={searchField}
                />
              </label>
            </div>

            <div className="grid gap-3">
              {filteredLeads.length === 0 ? (
                <div className={`${panel} px-6 py-12 text-center`}>
                  <Users className="mx-auto mb-3 size-8 text-[#D4AF37]" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">
                    {leads.length === 0 ? 'No leads yet' : 'No matching leads'}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                    {leads.length === 0
                      ? 'New enquiries, test drives, and vehicle requests will appear here.'
                      : 'Try another filter or search term.'}
                  </p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const tone = leadStatusStyles[lead.status] ?? leadStatusStyles.New;
                  const phoneDigits = lead.phone.replace(/\D/g, '');
                  return (
                    <article key={lead.id} className={`${panel} grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-start`}>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${tone.badge}`}>
                            <span className={`size-1.5 rounded-full ${tone.dot}`} />
                            {lead.status}
                          </span>
                          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/55">
                            {lead.type}
                          </span>
                          <span className="text-xs text-white/40">{formatDate(lead.created_at)}</span>
                        </div>

                        <h3 className="text-base font-semibold text-white">{lead.name}</h3>
                        <div className="mt-3 grid gap-2 text-sm text-white/55 md:grid-cols-2 xl:grid-cols-4">
                          <span className="flex items-center gap-2 text-white">
                            <Phone className="size-3.5 text-[#D4AF37]" aria-hidden="true" />
                            {lead.phone}
                          </span>
                          {lead.vehicle_model && (
                            <span className="flex items-center gap-2">
                              <Car className="size-3.5 text-white/30" aria-hidden="true" />
                              {lead.vehicle_model}
                            </span>
                          )}
                          {lead.date && (
                            <span className="flex items-center gap-2">
                              <CalendarIcon className="size-3.5 text-white/30" aria-hidden="true" />
                              {lead.date}{lead.time ? `, ${lead.time}` : ''}
                            </span>
                          )}
                          {lead.message && (
                            <span className="flex items-center gap-2 truncate">
                              <Mail className="size-3.5 shrink-0 text-white/30" aria-hidden="true" />
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
                              aria-pressed={active}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-default ${
                                active
                                  ? leadStatusStyles[status].active
                                  : 'border-white/10 text-white/50 hover:text-white'
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                        <a
                          href={`https://wa.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-100"
                        >
                          <Phone className="size-3.5" aria-hidden="true" />
                          WhatsApp
                        </a>
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Analytics</h2>
                <p className="mt-1 text-sm text-white/50">Traffic, demand, and listing quality.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/55">
                  {isSupabaseConfigured ? 'Last 30 days' : 'Local fallback'}
                </span>
                <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[#F5D66B]">
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
                <article key={label} className={`${panel} p-4`}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-white/55">{label}</span>
                    <Icon className="size-4 text-[#D4AF37]" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold tabular-nums text-white">{value}</h3>
                  <p className="mt-1 min-h-[20px] text-xs text-white/40">{meta}</p>
                </article>
              ))}
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_1fr]">
              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Vehicle clicks</h3>
                  <Eye className="size-4 text-white/30" aria-hidden="true" />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {stats.topViewed.length === 0 ? (
                    <p className="col-span-full py-8 text-center text-sm text-white/45">Waiting for view data</p>
                  ) : (
                    stats.topViewed.map((vehicle, index) => (
                      <div key={vehicle.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 p-3">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-black/40">
                          <img src={vehicle.image} alt={`${getBrandLabel(vehicle.make)} ${getDisplayModel(vehicle.make, vehicle.model)}`} className="h-full w-full object-cover" />
                          <span className="absolute left-1.5 top-1.5 rounded bg-[#D4AF37] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <BrandMark
                              make={vehicle.make}
                              tone="mono"
                              className="size-5 shrink-0 text-white/50"
                            />
                            <h4 className="truncate text-sm font-medium text-white">
                              {getBrandLabel(vehicle.make)} {getDisplayModel(vehicle.make, vehicle.model)}
                            </h4>
                          </div>
                          <p className="mt-1 text-xs text-white/40">{formatMillions(vehicle.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold tabular-nums text-[#D4AF37]">{vehicle.views || 0}</p>
                          <p className="text-xs text-white/40">Clicks</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">Last 7 days</h3>
                    <BarChart2 className="size-4 text-white/30" aria-hidden="true" />
                  </div>

                  <div className="flex h-40 items-end gap-2">
                    {traffic.length === 0 ? (
                      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-sm text-white/45">
                        Tracking started, waiting for data
                      </div>
                    ) : (
                      traffic
                        .slice()
                        .reverse()
                        .map((item) => (
                          <div key={item.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                            <div className="relative flex min-h-0 flex-1 items-end overflow-hidden rounded-md bg-white/[0.06]">
                              <div
                                className="w-full rounded-md bg-[#D4AF37]/70"
                                style={{ height: `${((item.page_views || 0) / analytics.maxPageViews) * 100}%` }}
                              />
                            </div>
                            <span className="text-center text-[11px] text-white/45">
                              {new Date(item.date).toLocaleDateString('en-LK', { weekday: 'short' })}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="grid gap-3">
                <section className={`${panel} p-5`}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">Body types</h3>
                    <PieChart className="size-4 text-white/30" aria-hidden="true" />
                  </div>
                  {stats.sortedBT.length === 0 ? (
                    <p className="py-8 text-center text-sm text-white/45">No stock data</p>
                  ) : (
                    <SegmentRows
                      items={stats.sortedBT.map(([bodyType, count]) => ({
                        label: bodyType,
                        count,
                        pct: stats.total > 0 ? (count / stats.total) * 100 : 0,
                        meta: `${count} units`,
                      }))}
                    />
                  )}
                </section>

                <section className={`${panel} p-5`}>
                  <p className="text-sm text-white/50">Today</p>
                  <h3 className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {traffic[0]?.visitor_count || 0} visitors
                  </h3>
                  <p className="mt-2 text-sm text-white/45">People who visited the website, plus clicks on cars.</p>
                  <button
                    type="button"
                    onClick={() => setTab('leads')}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                  >
                    Review leads
                    <ArrowUpRight className="size-4 text-[#D4AF37]" aria-hidden="true" />
                  </button>
                </section>
              </aside>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Lead funnel</h3>
                  <Users className="size-4 text-white/30" aria-hidden="true" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                  <div className="grid gap-4">
                    {(['New', 'Contacted', 'Closed'] as Lead['status'][]).map((status) => {
                      const count = analytics.leadStatusCounts[status];
                      const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
                      const tone = leadStatusStyles[status];
                      return (
                        <div key={status}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                            <span className="inline-flex items-center gap-2 text-white/60">
                              <span className={`size-1.5 rounded-full ${tone.dot}`} />
                              {status}
                            </span>
                            <span className="tabular-nums text-white">{count}</span>
                          </div>
                          <Meter pct={pct} barClassName={tone.dot} />
                        </div>
                      );
                    })}

                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { label: 'Follow-up', value: formatPercent(analytics.followUpRate), meta: 'Contacted or closed' },
                        { label: 'Close rate', value: formatPercent(analytics.closedLeadRate), meta: `${closedLeadCount} wins` },
                        { label: 'Lead yield', value: analytics.leadsPerHundredVisitors.toFixed(1), meta: 'Per 100 visitors' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-white/10 p-3">
                          <p className="text-xs text-white/45">{item.label}</p>
                          <p className="mt-2 text-lg font-semibold tabular-nums text-white">{item.value}</p>
                          <p className="mt-1 truncate text-xs text-white/35">{item.meta}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 p-4">
                    <p className="mb-3 text-sm font-medium text-white">Lead types</p>
                    <SegmentRows items={analytics.leadTypeSegments} empty="No lead types yet" />
                  </div>
                </div>
              </section>

              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Action queue</h3>
                  <AlertTriangle className="size-4 text-white/30" aria-hidden="true" />
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
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-left hover:border-[#D4AF37]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">{label}</span>
                        <span className="mt-0.5 block truncate text-xs text-white/40">{meta}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-lg font-semibold tabular-nums text-white">{value}</span>
                        <Icon className="size-4 text-[#D4AF37]" aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr_0.9fr]">
              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Brand concentration</h3>
                  <WalletCards className="size-4 text-white/30" aria-hidden="true" />
                </div>

                {analytics.brandValueSegments.length === 0 ? (
                  <p className="py-8 text-center text-sm text-white/45">No stock data</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.brandValueSegments.slice(0, 6).map((segment) => (
                      <div key={segment.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 text-white/70">
                            <BrandMark make={segment.label} tone="mono" className="size-4 shrink-0 text-[#D4AF37]" />
                            <span className="truncate">{segment.label}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-white">{segment.meta}</span>
                        </div>
                        <Meter pct={segment.pct} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Sold value</p>
                    <p className="mt-2 text-lg font-semibold tabular-nums text-white">{formatMillions(analytics.soldValue)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Avg days live</p>
                    <p className="mt-2 text-lg font-semibold tabular-nums text-white">{formatNumber(analytics.avgDaysLive)}</p>
                  </div>
                </div>
              </section>

              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Stock mix</h3>
                  <PieChart className="size-4 text-white/30" aria-hidden="true" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    { title: 'Body types', segments: analytics.bodyTypeSegments },
                    { title: 'Fuel', segments: analytics.fuelSegments },
                    { title: 'Condition', segments: analytics.conditionSegments },
                    { title: 'Transmission', segments: analytics.transmissionSegments },
                  ].map((group) => (
                    <div key={group.title}>
                      <p className="mb-3 text-sm font-medium text-white">{group.title}</p>
                      <SegmentRows items={group.segments.slice(0, 4)} />
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${panel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Price bands</h3>
                  <TrendingUp className="size-4 text-white/30" aria-hidden="true" />
                </div>

                <SegmentRows
                  items={analytics.priceBands.map((band) => ({
                    ...band,
                    meta: `${band.count} units`,
                  }))}
                />

                <div className="mt-5 grid gap-2">
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Oldest live unit</p>
                    <p className="mt-2 truncate text-lg font-semibold text-white">
                      {analytics.oldestLive ? `${analytics.oldestLive.days} days` : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Total clicks</p>
                    <p className="mt-2 text-lg font-semibold tabular-nums text-white">{formatNumber(analytics.totalViews)}</p>
                  </div>
                </div>
              </section>
            </div>

            <section className={`${panel} mt-3 p-5`}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Listings to fix first</h3>
                <Edit2 className="size-4 text-white/30" aria-hidden="true" />
              </div>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {analytics.highValueIncomplete.length === 0 ? (
                  <p className="col-span-full py-8 text-center text-sm text-white/45">No live quality gaps</p>
                ) : (
                  analytics.highValueIncomplete.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => openEdit(vehicle)}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-left hover:border-[#D4AF37]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{getVehicleName(vehicle)}</span>
                        <span className="mt-1 block text-xs text-white/40">
                          {!vehicle.image ? 'Missing image' : !vehicle.description?.trim() ? 'Missing description' : 'Missing features'}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm text-[#D4AF37]">{formatMillions(vehicle.price)}</span>
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
