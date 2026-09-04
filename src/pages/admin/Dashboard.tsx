import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Calendar as CalendarIcon,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  DollarSign,
  Edit2,
  ExternalLink,
  Eye,
  Filter,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
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
  Zap,
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
type AnalyticsDays = 1 | 7 | 30 | 90;
type ChartMetric = 'all' | 'views' | 'visitors' | 'clicks';

interface AnalyticsDetail {
  days: number;
  daily?: { date: string; visitor_count: number; page_views: number; cta_clicks?: number; car_views?: number }[];
  topPages: { path: string; count: number }[];
  topCtas: { name: string; count: number }[];
  topCars: {
    car_id: string;
    count: number;
    car?: {
      id?: string;
      make: string;
      model: string;
      year: number;
      price?: number;
      image?: string;
      is_sold?: boolean;
    };
  }[];
  referrers: { referrer: string; count: number }[];
  recent: {
    event_type: string;
    path: string;
    cta_name?: string;
    car_id?: string;
    referrer?: string;
    created_at: string;
    metadata?: any;
  }[];
  uniques: number;
}

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

const formatRelativeTime = (isoString?: string | null) => {
  if (!isoString) return 'just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return 'just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getSafeDaysSince = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
};

function formatCtaLabel(name?: string) {
  if (!name) return 'Inquiry';
  const map: Record<string, string> = {
    whatsapp_car: 'WhatsApp (Vehicle)',
    whatsapp_float: 'WhatsApp (Floating)',
    whatsapp_nav: 'WhatsApp (Navbar)',
    call: 'Direct Phone Call',
    call_car: 'Direct Phone (Car)',
    test_drive: 'Booked Test Drive',
    finance_calculator: 'Finance Calculator',
    contact_form: 'Contact Inquiry Form',
    car_card: 'Vehicle Card Click',
    wishlist_add: 'Saved to Wishlist',
    wishlist_remove: 'Removed from Wishlist',
    instagram: 'Instagram Profile',
    share: 'Vehicle Link Shared',
  };
  return map[name] || name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getEventBadgeColor(type: string) {
  switch (type) {
    case 'cta_click':
      return 'border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#F5D66B]';
    case 'car_view':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-200';
    case 'lead_submission':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
    default:
      return 'border-white/10 bg-white/[0.04] text-white/70';
  }
}

const leadStatusStyles: Record<Lead['status'], { badge: string; dot: string; active: string }> = {
  New: {
    badge: 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F5D66B]',
    dot: 'bg-[#D4AF37]',
    active: 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20',
  },
  Contacted: {
    badge: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    dot: 'bg-sky-300',
    active: 'border-sky-300 bg-sky-300 text-black shadow-lg shadow-sky-400/20',
  },
  Closed: {
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    dot: 'bg-emerald-300',
    active: 'border-emerald-300 bg-emerald-300 text-black shadow-lg shadow-emerald-400/20',
  },
};

const glassCard = 'rounded-2xl border border-white/[0.08] bg-[#121110]/80 backdrop-blur-xl shadow-xl shadow-black/40';
const glassCardHover = `${glassCard} transition-all duration-300 hover:border-white/[0.16] hover:bg-[#151413]/90`;
const searchField =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] transition-all';
const pill = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
    active
      ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
      : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white'
  }`;

function Meter({ pct, barClassName = 'bg-[#D4AF37]' }: { pct: number; barClassName?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barClassName}`}
        style={{ width: `${clampPercent(pct)}%` }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<{ date: string; visitor_count: number; page_views: number; cta_clicks?: number; car_views?: number }[]>([]);
  const [analyticsDetail, setAnalyticsDetail] = useState<AnalyticsDetail | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState<AnalyticsDays>(30);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchTraffic = async (daysOverride?: number) => {
    const d = daysOverride ?? analyticsDays;
    try {
      const res = await fetch(`/api/db/analytics?format=detailed&days=${d}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.daily)) {
          setTraffic(data.daily);
          setAnalyticsDetail({
            days: data.days || d,
            daily: data.daily,
            topPages: data.topPages || [],
            topCtas: data.topCtas || [],
            topCars: data.topCars || [],
            referrers: data.referrers || [],
            recent: data.recent || [],
            uniques: data.uniques || 0,
          });
        } else if (Array.isArray(data)) {
          setTraffic(data);
          setAnalyticsDetail(null);
        } else {
          setTraffic([]);
          setAnalyticsDetail(null);
        }
      }
    } catch {
      try {
        const fallbackRes = await fetch('/api/db/analytics');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setTraffic(Array.isArray(fallbackData) ? fallbackData : []);
        }
      } catch {
        setTraffic([]);
      }
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
  }, [analyticsDays]);

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
    const availableValue = vehicles.filter((v) => !v.is_sold).reduce((sum, v) => sum + Number(v.price || 0), 0);
    const avgPrice = total > 0 ? totalValue / total : 0;
    const makes = vehicles.reduce<Record<string, number>>((acc, v) => {
      const make = getBrandLabel(v.make) || 'Unknown';
      acc[make] = (acc[make] || 0) + 1;
      return acc;
    }, {});
    const sortedMakes = Object.entries(makes).sort((a, b) => b[1] - a[1]);
    const topMake = sortedMakes[0]?.[0] ?? 'N/A';
    const bodyTypes = vehicles.reduce<Record<string, number>>((acc, v) => {
      const bodyType = v.bodyType || 'Unknown';
      acc[bodyType] = (acc[bodyType] || 0) + 1;
      return acc;
    }, {});
    const sortedBT = (Object.entries(bodyTypes) as [string, number][]).sort((a, b) => b[1] - a[1]);
    const topViewed = [...vehicles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

    return { total, available, sold, totalValue, availableValue, avgPrice, topMake, sortedBT, topViewed };
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
    const missingImages = vehicles.filter((v) => !v.image);
    const incompleteListings = vehicles.filter((v) => !v.description || !(v.key_features?.length));
    const archiveReady = vehicles.filter((v) => v.is_sold && v.sold_at && daysUntilRemoval(v.sold_at) === 0);
    const staleNewLeads = leads.filter((lead) => lead.status === 'New' && daysSince(lead.created_at) > 1);
    const readiness = vehicles.length > 0 ? Math.round(((vehicles.length - incompleteListings.length) / vehicles.length) * 100) : 100;

    return {
      archiveReady,
      incompleteListings,
      missingImages,
      recentLeads: leads.slice(0, 3),
      readiness,
      staleNewLeads,
      todayTraffic: traffic[traffic.length - 1] || traffic[0],
    };
  }, [vehicles, leads, traffic]);

  const analytics = useMemo(() => {
    const totalPageViews = traffic.reduce((sum, item) => sum + Number(item.page_views || 0), 0);
    const totalCtaClicks = traffic.reduce((sum, item) => sum + Number(item.cta_clicks || 0), 0);
    const totalCarViews = traffic.reduce((sum, item) => sum + Number(item.car_views || 0), 0);
    const totalVisitors = analyticsDetail?.uniques || traffic.reduce((sum, item) => sum + Number(item.visitor_count || 0), 0);

    const conversionRate = totalVisitors > 0 ? clampPercent(((totalCtaClicks + leads.length) / totalVisitors) * 100) : 0;
    const avgDailyViews = traffic.length > 0 ? Math.round(totalPageViews / Math.max(1, traffic.length)) : 0;

    const maxChartValue = Math.max(
      1,
      ...traffic.map((item) =>
        Math.max(
          chartMetric === 'clicks' ? 0 : Number(item.page_views || 0),
          chartMetric === 'views' ? 0 : Number(item.visitor_count || 0),
          chartMetric === 'visitors' ? 0 : Number(item.cta_clicks || 0),
        ),
      ),
    );

    // Funnel Steps
    const funnel = [
      {
        stage: 'Discovery',
        desc: 'Page Views across Website',
        count: totalPageViews,
        pct: 100,
        color: 'from-amber-400 to-[#D4AF37]',
      },
      {
        stage: 'Interest',
        desc: 'Vehicle Detail Views & Card Clicks',
        count: totalCarViews,
        pct: totalPageViews > 0 ? (totalCarViews / totalPageViews) * 100 : 0,
        color: 'from-sky-400 to-blue-500',
      },
      {
        stage: 'Engagement',
        desc: 'WhatsApp, Phone & Finance Clicks',
        count: totalCtaClicks,
        pct: totalCarViews > 0 ? (totalCtaClicks / totalCarViews) * 100 : 0,
        color: 'from-yellow-400 to-amber-500',
      },
      {
        stage: 'Conversion',
        desc: 'Qualified Inquiries & Test Drives',
        count: leads.length,
        pct: totalCtaClicks > 0 ? (leads.length / totalCtaClicks) * 100 : 0,
        color: 'from-emerald-400 to-teal-500',
      },
    ];

    return {
      totalPageViews,
      totalCtaClicks,
      totalCarViews,
      totalVisitors,
      conversionRate,
      avgDailyViews,
      maxChartValue,
      funnel,
    };
  }, [traffic, analyticsDetail, leads, chartMetric]);

  const handleCopySummary = async () => {
    const periodLabel = analyticsDays === 1 ? 'Last 24 Hours' : `Last ${analyticsDays} Days`;
    const topCarName = analyticsDetail?.topCars?.[0]?.car
      ? `${analyticsDetail.topCars[0].car.year} ${analyticsDetail.topCars[0].car.make} ${analyticsDetail.topCars[0].car.model}`
      : 'N/A';
    const text = `📊 SERENDIB TRADING — EXECUTIVE ANALYTICS (${periodLabel})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total Page Views: ${formatNumber(analytics.totalPageViews)}
• Unique Visitors: ${formatNumber(analytics.totalVisitors)}
• Vehicle Views & Clicks: ${formatNumber(analytics.totalCarViews)}
• High-Intent Inquiries (CTAs): ${formatNumber(analytics.totalCtaClicks)}
• Conversion Rate: ${analytics.conversionRate.toFixed(1)}%
• Active Lot Fleet Value: ${formatMillions(stats.availableValue)} (${stats.available} vehicles)
• Top Demand Car: ${topCarName} (${analyticsDetail?.topCars?.[0]?.count || 0} views)
• Primary Acquisition Source: ${analyticsDetail?.referrers?.[0]?.referrer || 'Direct'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report Generated: ${new Date().toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    } catch {
      // Fallback if clipboard permission denied
    }
  };

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
        ? `Mark ${vehicleName} as sold? It will be archived from the public showroom.`
        : `Return ${vehicleName} to the live showroom inventory?`,
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
    setNotice({ type: 'success', message: `Lead status updated to ${status.toLowerCase()}.` });
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
    setRefreshing(true);
    setNotice(null);
    await Promise.all([fetchVehicles(), fetchLeads(), fetchTraffic()]);
    setRefreshing(false);
    setNotice({ type: 'success', message: 'All inventory, leads & analytics data synchronized.' });
  };

  const handleSaved = () => {
    invalidateInventoryCache();
    fetchVehicles();
    setNotice({ type: 'success', message: 'Vehicle saved successfully to live inventory.' });
  };

  if (loading && vehicles.length === 0) return <Loader />;

  const newLeadCount = leads.filter((lead) => lead.status === 'New').length;
  const contactedLeadCount = leads.filter((lead) => lead.status === 'Contacted').length;
  const closedLeadCount = leads.filter((lead) => lead.status === 'Closed').length;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, count: dashboardHealth.staleNewLeads.length + newLeadCount },
    { id: 'inventory' as const, label: 'Inventory', icon: Car, count: stats.total },
    { id: 'analytics' as const, label: 'Analytics Studio', icon: BarChart2, count: analytics.totalPageViews > 0 ? analytics.totalPageViews : undefined, highlight: true },
    { id: 'leads' as const, label: 'Leads Pipeline', icon: Users, count: newLeadCount },
  ];

  return (
    <div className="min-h-dvh bg-[#09090b] font-sans text-white antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Modern Frosted Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#09090b]/85 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo & Status Indicator */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-xl"
              aria-label="Back to Serendib Trading website"
            >
              <span className="flex size-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] transition-all group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/10">
                <img src="/serendib-logo-192.png" alt="Serendib Trading" className="h-6 w-auto" />
              </span>
              <div>
                <span className="block text-sm font-bold tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">
                  Serendib Trading
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Admin Console
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Segmented Pill */}
          <nav className="hidden items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 md:flex" aria-label="Admin tabs">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                    active ? 'text-black' : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#e5c05b] shadow-lg shadow-[#D4AF37]/25"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                          active
                            ? 'bg-black/20 text-black'
                            : item.id === 'leads' && newLeadCount > 0
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalVehicle(null)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-bold text-black transition-all hover:bg-[#e5c05b] active:scale-95 shadow-md shadow-[#D4AF37]/20"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add Vehicle</span>
            </button>

            <button
              type="button"
              onClick={() => window.open('/', '_blank')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/70 hover:border-white/20 hover:text-white transition-all"
              title="Open public showroom website"
            >
              <span>Showroom</span>
              <ExternalLink className="size-3" />
            </button>

            <button
              type="button"
              onClick={handleManualRefresh}
              className={`inline-flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all ${
                refreshing ? 'animate-spin text-[#D4AF37]' : ''
              }`}
              title="Refresh database records"
            >
              <RefreshCw className="size-4" />
            </button>

            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured) await signOut();
                navigate('/admin/login');
              }}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-500/40 hover:bg-red-500/20 transition-all"
              title="Sign out from admin console"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scroll */}
        <div className="flex w-full gap-2 overflow-x-auto border-t border-white/[0.05] px-4 py-2 md:hidden">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/70'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className={`text-[10px] ${active ? 'text-black/70' : 'text-white/40'}`}>{item.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Notice Alert Banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`mb-6 flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-sm font-medium ${
                notice.type === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-200'
                  : 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D66B]'
              }`}
            >
              <div className="flex items-center gap-3">
                {notice.type === 'error' ? <AlertTriangle className="size-5 shrink-0 text-red-400" /> : <CheckCircle2 className="size-5 shrink-0 text-[#D4AF37]" />}
                <span>{notice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-white/50 hover:text-white text-xs font-semibold uppercase tracking-wider"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: ANALYTICS STUDIO (Deep Detailed Analytics Suite)
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'analytics' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="space-y-6"
          >
            {/* Analytics Header & Range Controls */}
            <div className={`${glassCard} p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between`}>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                    <Sparkles className="size-4" />
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-white">Executive Analytics Studio</h1>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Live Stream
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Comprehensive audience reach, customer intention, vehicle impressions & conversion metrics.
                </p>
              </div>

              {/* Time Range Horizon & Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  {([1, 7, 30, 90] as AnalyticsDays[]).map((d) => {
                    const active = analyticsDays === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setAnalyticsDays(d)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          active
                            ? 'bg-[#D4AF37] text-black shadow-sm font-bold'
                            : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {d === 1 ? '24 Hours' : `${d} Days`}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white/80 hover:border-[#D4AF37]/40 hover:text-white transition-all"
                  title="Copy formatted text report for executive review"
                >
                  {copiedSummary ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-[#D4AF37]" />}
                  <span>{copiedSummary ? 'Copied Report!' : 'Export Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchTraffic()}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 hover:text-white hover:border-white/20 transition-all"
                  title="Refresh analytics data"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 6 Executive Bento KPI Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                {
                  label: 'Page Views',
                  value: formatNumber(analytics.totalPageViews),
                  meta: `${formatNumber(analytics.avgDailyViews)} / day avg`,
                  icon: BarChart2,
                  accent: 'text-[#D4AF37]',
                  bg: 'bg-[#D4AF37]/10',
                },
                {
                  label: 'Unique Visitors',
                  value: formatNumber(analytics.totalVisitors),
                  meta: `${analyticsDays === 1 ? '24h' : `${analyticsDays}d`} audience reach`,
                  icon: Users,
                  accent: 'text-sky-400',
                  bg: 'bg-sky-400/10',
                },
                {
                  label: 'Vehicle Views',
                  value: formatNumber(analytics.totalCarViews),
                  meta: `${stats.total > 0 ? (analytics.totalCarViews / stats.total).toFixed(1) : 0} avg / car`,
                  icon: Eye,
                  accent: 'text-purple-400',
                  bg: 'bg-purple-400/10',
                },
                {
                  label: 'High-Intent CTAs',
                  value: formatNumber(analytics.totalCtaClicks),
                  meta: 'WhatsApp & Call inquiries',
                  icon: Zap,
                  accent: 'text-emerald-400',
                  bg: 'bg-emerald-400/10',
                },
                {
                  label: 'Conversion Rate',
                  value: `${analytics.conversionRate.toFixed(1)}%`,
                  meta: 'Visitors → Inquiries',
                  icon: TrendingUp,
                  accent: 'text-amber-400',
                  bg: 'bg-amber-400/10',
                },
                {
                  label: 'Active Fleet Value',
                  value: formatMillions(stats.availableValue),
                  meta: `${stats.available} vehicles available`,
                  icon: WalletCards,
                  accent: 'text-[#D4AF37]',
                  bg: 'bg-[#D4AF37]/10',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`${glassCardHover} p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-white/50">{card.label}</span>
                      <span className={`flex size-8 items-center justify-center rounded-lg border border-white/[0.08] ${card.bg} ${card.accent}`}>
                        <Icon className="size-4" />
                      </span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums text-white">{card.value}</div>
                    <p className="mt-1 text-[11px] text-white/40 truncate">{card.meta}</p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Trend Chart Section */}
            <div className={`${glassCard} p-6`}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight text-white">Audience Activity Timeline</h2>
                    <span className="text-xs text-white/40">
                      ({analyticsDays === 1 ? 'Hourly breakdown over last 24h' : `Daily trend over last ${analyticsDays} days`})
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/50">
                    Hover over any point to inspect granular views, unique visitors, and customer actions.
                  </p>
                </div>

                {/* Series Metric Filter */}
                <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 text-xs">
                  {[
                    { id: 'all', label: 'All Series', dot: 'bg-white' },
                    { id: 'views', label: 'Views', dot: 'bg-[#D4AF37]' },
                    { id: 'visitors', label: 'Visitors', dot: 'bg-sky-400' },
                    { id: 'clicks', label: 'Clicks', dot: 'bg-emerald-400' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setChartMetric(m.id as ChartMetric)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                        chartMetric === m.id ? 'bg-white/10 text-white font-semibold' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${m.dot}`} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive SVG Chart */}
              {traffic.length === 0 ? (
                <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
                  <BarChart2 className="size-8 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/60">No traffic recorded in this timeframe yet</p>
                  <p className="text-xs text-white/40 mt-1">Browse the public site or share vehicle links to start aggregating metrics.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="h-64 w-full">
                    <svg
                      viewBox="0 0 800 240"
                      className="h-full w-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        {/* Gold Gradient */}
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                        </linearGradient>
                        {/* Sky Blue Gradient */}
                        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                        </linearGradient>
                        {/* Emerald Gradient */}
                        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = 200 - ratio * 180;
                        return (
                          <line
                            key={ratio}
                            x1="0"
                            y1={y}
                            x2="800"
                            y2={y}
                            stroke="rgba(255,255,255,0.06)"
                            strokeDasharray="4 4"
                          />
                        );
                      })}

                      {/* Render Lines & Areas based on traffic series */}
                      {(() => {
                        const count = traffic.length;
                        const stepX = count > 1 ? 800 / (count - 1) : 400;

                        const pointsViews = traffic.map((item, i) => {
                          const x = count > 1 ? i * stepX : 400;
                          const y = 200 - (Number(item.page_views || 0) / analytics.maxChartValue) * 180;
                          return { x, y };
                        });

                        const pointsVisitors = traffic.map((item, i) => {
                          const x = count > 1 ? i * stepX : 400;
                          const y = 200 - (Number(item.visitor_count || 0) / analytics.maxChartValue) * 180;
                          return { x, y };
                        });

                        const pointsClicks = traffic.map((item, i) => {
                          const x = count > 1 ? i * stepX : 400;
                          const y = 200 - (Number(item.cta_clicks || 0) / analytics.maxChartValue) * 180;
                          return { x, y };
                        });

                        const makePath = (pts: { x: number; y: number }[]) =>
                          pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

                        const makeArea = (pts: { x: number; y: number }[]) => {
                          if (pts.length === 0) return '';
                          const line = makePath(pts);
                          const first = pts[0];
                          const last = pts[pts.length - 1];
                          return `${line} L ${last.x} 200 L ${first.x} 200 Z`;
                        };

                        return (
                          <>
                            {/* Page Views Area & Line (Gold) */}
                            {(chartMetric === 'all' || chartMetric === 'views') && (
                              <>
                                <path d={makeArea(pointsViews)} fill="url(#goldGrad)" />
                                <path
                                  d={makePath(pointsViews)}
                                  fill="none"
                                  stroke="#D4AF37"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </>
                            )}

                            {/* Visitors Area & Line (Sky Blue) */}
                            {(chartMetric === 'all' || chartMetric === 'visitors') && (
                              <>
                                <path d={makeArea(pointsVisitors)} fill="url(#skyGrad)" />
                                <path
                                  d={makePath(pointsVisitors)}
                                  fill="none"
                                  stroke="#38bdf8"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </>
                            )}

                            {/* Clicks Area & Line (Emerald) */}
                            {(chartMetric === 'all' || chartMetric === 'clicks') && (
                              <>
                                <path d={makeArea(pointsClicks)} fill="url(#emeraldGrad)" />
                                <path
                                  d={makePath(pointsClicks)}
                                  fill="none"
                                  stroke="#34d399"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </>
                            )}

                            {/* Hover Vertical Guide Indicator */}
                            {hoveredPointIndex !== null && hoveredPointIndex < traffic.length && (
                              <line
                                x1={count > 1 ? hoveredPointIndex * stepX : 400}
                                y1="10"
                                x2={count > 1 ? hoveredPointIndex * stepX : 400}
                                y2="200"
                                stroke="#D4AF37"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Interactive Hover Columns Overlay */}
                  <div className="absolute inset-0 flex">
                    {traffic.map((item, idx) => (
                      <div
                        key={item.date}
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        className="flex-1 cursor-pointer"
                      />
                    ))}
                  </div>

                  {/* Floating Inspection Tooltip */}
                  {hoveredPointIndex !== null && traffic[hoveredPointIndex] && (
                    <div
                      className="pointer-events-none absolute -top-4 rounded-xl border border-white/20 bg-black/90 p-3 shadow-2xl backdrop-blur-md transition-all text-xs"
                      style={{
                        left: `${((hoveredPointIndex + 0.5) / traffic.length) * 100}%`,
                        transform: 'translate(-50%, -100%)',
                      }}
                    >
                      <p className="font-bold text-white border-b border-white/10 pb-1 mb-1.5 whitespace-nowrap">
                        {analyticsDays === 1
                          ? new Date(traffic[hoveredPointIndex].date).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
                          : new Date(traffic[hoveredPointIndex].date).toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="space-y-1 tabular-nums whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-[#D4AF37]" />
                          <span className="text-white/60">Page Views:</span>
                          <span className="font-bold text-white ml-auto">{traffic[hoveredPointIndex].page_views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-sky-400" />
                          <span className="text-white/60">Unique Visitors:</span>
                          <span className="font-bold text-white ml-auto">{traffic[hoveredPointIndex].visitor_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-400" />
                          <span className="text-white/60">CTA Clicks:</span>
                          <span className="font-bold text-white ml-auto">{traffic[hoveredPointIndex].cta_clicks || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* X-Axis Date Labels */}
                  <div className="mt-3 flex justify-between text-[11px] text-white/40 tabular-nums">
                    <span>
                      {analyticsDays === 1
                        ? '24 Hours Ago'
                        : new Date(traffic[0]?.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}
                    </span>
                    {traffic.length > 2 && (
                      <span>
                        {new Date(traffic[Math.floor(traffic.length / 2)]?.date).toLocaleDateString('en-LK', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <span>
                      {analyticsDays === 1
                        ? 'Now'
                        : new Date(traffic[traffic.length - 1]?.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2-Column: 4-Stage Conversion Funnel & High-Intent Action Breakdown */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 4-Stage Funnel Card */}
              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-white">4-Stage Conversion Funnel</h2>
                    <p className="text-xs text-white/50">Audience flow from initial visit to qualified sales leads.</p>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                    <Layers className="size-4" />
                  </span>
                </div>

                <div className="space-y-4">
                  {analytics.funnel.map((step, idx) => (
                    <div key={step.stage} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-md bg-white/[0.08] text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-white">{step.stage}</span>
                          <span className="text-white/40 hidden sm:inline">• {step.desc}</span>
                        </div>
                        <span className="font-bold tabular-nums text-white text-sm">
                          {formatNumber(step.count)}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-700`}
                          style={{ width: `${Math.max(4, clampPercent(step.pct))}%` }}
                        />
                      </div>
                      {idx > 0 && (
                        <div className="mt-1.5 flex justify-end text-[10px] text-white/45">
                          {step.pct.toFixed(1)}% conversion from previous stage
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Intent Customer Actions */}
              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-white">Customer Inquiries & Intent</h2>
                    <p className="text-xs text-white/50">Direct sales inquiries, phone calls, and calculator clicks.</p>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                    <MessageCircle className="size-4" />
                  </span>
                </div>

                {!analyticsDetail || analyticsDetail.topCtas.length === 0 ? (
                  <p className="py-12 text-center text-xs text-white/40">No customer CTA interactions logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analyticsDetail.topCtas.slice(0, 7).map((cta) => {
                      const maxCta = Math.max(1, analyticsDetail.topCtas[0].count);
                      const pct = (cta.count / maxCta) * 100;
                      return (
                        <div key={cta.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium text-white/80">{formatCtaLabel(cta.name)}</span>
                            <span className="font-bold tabular-nums text-[#D4AF37]">{cta.count} clicks</span>
                          </div>
                          <Meter pct={pct} barClassName="bg-gradient-to-r from-[#D4AF37] to-amber-300" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top Performing Vehicles Leaderboard */}
            <div className={`${glassCard} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white">Showroom Vehicles Demand Leaderboard</h2>
                  <p className="text-xs text-white/50">Most explored and clicked vehicles ranked by buyer interest.</p>
                </div>
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Car className="size-4" />
                </span>
              </div>

              {!analyticsDetail || analyticsDetail.topCars.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40">
                  Vehicle view tracking initialized. Explore car listings to see top performers.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {analyticsDetail.topCars.slice(0, 4).map((item, idx) => {
                    const car = item.car;
                    const maxCarViews = Math.max(1, analyticsDetail.topCars[0].count);
                    const sharePct = (item.count / maxCarViews) * 100;
                    return (
                      <div
                        key={item.car_id}
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 transition-all hover:border-[#D4AF37]/40 hover:bg-white/[0.04]"
                      >
                        {/* Rank Badge */}
                        <div className="absolute top-5 left-5 z-10">
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-bold shadow-md ${
                            idx === 0
                              ? 'bg-[#D4AF37] text-black'
                              : 'bg-black/80 text-white/90 border border-white/20'
                          }`}>
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Image Thumbnail */}
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black/50 mb-3">
                          <img
                            src={car?.image || '/images/showroom/serendib-showroom-floor-02.webp'}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold text-[#D4AF37] border border-white/10">
                            {car?.price ? formatMillions(car.price) : 'Price on request'}
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                            {car ? `${car.year} ${car.make} ${car.model}` : item.car_id.slice(0, 16)}
                          </h3>
                          <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                            <span>{item.count} total clicks</span>
                            <button
                              type="button"
                              onClick={() => window.open(`/car/${item.car_id}`, '_blank')}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:underline"
                            >
                              <span>View</span>
                              <ArrowUpRight className="size-3" />
                            </button>
                          </div>
                          <div className="mt-2">
                            <Meter pct={sharePct} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3-Column: Traffic Referrers, Top Visited Pages & Real-time Live Feed */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Traffic Referrer Channels */}
              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-tight text-white">Acquisition Referrers</h3>
                  <span className="text-[11px] text-white/40">Sources</span>
                </div>
                {!analyticsDetail || analyticsDetail.referrers.length === 0 ? (
                  <p className="py-8 text-center text-xs text-white/40">Direct visits only</p>
                ) : (
                  <div className="space-y-3">
                    {analyticsDetail.referrers.slice(0, 5).map((r) => (
                      <div key={r.referrer} className="rounded-xl border border-white/[0.06] p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="truncate font-medium text-white/80">{r.referrer}</span>
                          <span className="font-bold tabular-nums text-white">{r.count}</span>
                        </div>
                        <Meter pct={(r.count / Math.max(1, analyticsDetail.referrers[0].count)) * 100} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Pages Visited */}
              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-tight text-white">Top Routes & Pages</h3>
                  <span className="text-[11px] text-white/40">Views</span>
                </div>
                {!analyticsDetail || analyticsDetail.topPages.length === 0 ? (
                  <p className="py-8 text-center text-xs text-white/40">No page views recorded</p>
                ) : (
                  <div className="space-y-3">
                    {analyticsDetail.topPages.slice(0, 5).map((p) => (
                      <div key={p.path} className="rounded-xl border border-white/[0.06] p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="truncate font-medium text-white/80">{p.path}</span>
                          <span className="font-bold tabular-nums text-[#D4AF37]">{p.count}</span>
                        </div>
                        <Meter pct={(p.count / Math.max(1, analyticsDetail.topPages[0].count)) * 100} barClassName="bg-sky-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-time Live Event Feed */}
              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-sm font-bold tracking-tight text-white">Live Activity Stream</h3>
                  </div>
                  <span className="text-[11px] text-white/40">Latest 15</span>
                </div>

                {!analyticsDetail || analyticsDetail.recent.length === 0 ? (
                  <p className="py-8 text-center text-xs text-white/40">Waiting for live activity...</p>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {analyticsDetail.recent.slice(0, 15).map((r, i) => (
                      <div
                        key={`${r.created_at}-${i}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getEventBadgeColor(r.event_type)}`}>
                              {r.event_type}
                            </span>
                            <span className="truncate text-white/50 text-[10px]">{r.path}</span>
                          </div>
                          <p className="truncate font-medium text-white/90">
                            {r.cta_name ? formatCtaLabel(r.cta_name) : r.car_id ? `Car #${r.car_id.slice(0, 8)}` : 'Visitor Browsing'}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-white/40 tabular-nums">
                          {formatRelativeTime(r.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="space-y-6"
          >
            {/* Top Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Listed Vehicles', value: stats.total, meta: 'Total in showroom system', icon: Car },
                { label: 'Live on Website', value: stats.available, meta: 'Available for purchase', icon: ShieldCheck },
                { label: 'Sold Units', value: stats.sold, meta: 'Archived inventory', icon: CheckCircle2 },
                { label: 'Fleet Inventory Value', value: formatMillions(stats.totalValue), meta: formatFullLkr(stats.totalValue), icon: WalletCards },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`${glassCardHover} p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-white/50">{card.label}</span>
                      <span className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#D4AF37]">
                        <Icon className="size-4" />
                      </span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white tabular-nums">{card.value}</div>
                    <p className="mt-1 text-xs text-white/40 truncate">{card.meta}</p>
                  </div>
                );
              })}
            </div>

            {/* Needs Attention Alert Queue */}
            <div className={`${glassCard} p-6`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white">Showroom Action Queue</h2>
                  <p className="text-xs text-white/50">Items needing manager response or listing review.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  {dashboardHealth.readiness}% Catalog Readiness
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: 'New Customer Leads',
                    value: newLeadCount,
                    meta: 'Awaiting customer response',
                    icon: Users,
                    action: () => setTab('leads'),
                  },
                  {
                    label: 'Stale Leads (>24h)',
                    value: dashboardHealth.staleNewLeads.length,
                    meta: 'Follow-up overdue',
                    icon: Clock3,
                    action: () => setTab('leads'),
                  },
                  {
                    label: 'Missing Hero Photos',
                    value: dashboardHealth.missingImages.length,
                    meta: 'Listings need photos',
                    icon: ImageIcon,
                    action: () => setTab('inventory'),
                  },
                  {
                    label: 'Archived Sold Ready',
                    value: dashboardHealth.archiveReady.length,
                    meta: 'Sold over 14 days ago',
                    icon: CheckCircle2,
                    action: () => setTab('inventory'),
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className="group flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-[#D4AF37]/40 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xs font-semibold text-white/60">{item.label}</span>
                        <Icon className="size-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-white tabular-nums">{item.value}</div>
                      <p className="mt-1 text-[11px] text-white/40">{item.meta}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Analytics & Recent Leads Previews */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-tight text-white">Recent Customer Inquiries</h3>
                  <button
                    type="button"
                    onClick={() => setTab('leads')}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline"
                  >
                    View All Leads &rarr;
                  </button>
                </div>
                {leads.length === 0 ? (
                  <p className="py-8 text-center text-xs text-white/40">No customer inquiries recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {leads.slice(0, 4).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{lead.name}</span>
                            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${leadStatusStyles[lead.status]?.badge}`}>
                              {lead.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{lead.phone} • {lead.type}</p>
                        </div>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20"
                        >
                          <Phone className="size-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`${glassCard} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-tight text-white">Inventory Brand Breakdown</h3>
                  <button
                    type="button"
                    onClick={() => setTab('inventory')}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline"
                  >
                    Manage Cars &rarr;
                  </button>
                </div>
                {stats.sortedBT.length === 0 ? (
                  <p className="py-8 text-center text-xs text-white/40">No vehicles in stock.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.sortedBT.slice(0, 5).map(([bodyType, count]) => (
                      <div key={bodyType} className="rounded-xl border border-white/[0.06] p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-white/80">{bodyType}</span>
                          <span className="font-bold tabular-nums text-white">{count} units</span>
                        </div>
                        <Meter pct={stats.total > 0 ? (count / stats.total) * 100 : 0} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: INVENTORY MANAGEMENT
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'inventory' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="space-y-6"
          >
            {/* Search & Filter Bar */}
            <div className={`${glassCard} p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by make, model, year, body type, or color..."
                  className={searchField}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {inventoryFilters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setInventoryFilter(f)}
                    className={pill(inventoryFilter === f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicles Listing Grid */}
            {filtered.length === 0 ? (
              <div className={`${glassCard} p-12 text-center`}>
                <Car className="mx-auto size-10 text-white/20 mb-3" />
                <h3 className="text-base font-bold text-white">No Matching Vehicles Found</h3>
                <p className="mt-1 text-xs text-white/50 max-w-md mx-auto">
                  Try adjusting your search criteria or add a new vehicle listing to the showroom lot.
                </p>
                <button
                  type="button"
                  onClick={() => setModalVehicle(null)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black"
                >
                  <Plus className="size-3.5 stroke-[3]" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((vehicle) => {
                  const sold = vehicle.is_sold;
                  return (
                    <div
                      key={vehicle.id}
                      className={`group relative overflow-hidden rounded-2xl border p-4 transition-all ${
                        sold
                          ? 'border-red-500/20 bg-red-500/[0.02]'
                          : 'border-white/[0.08] bg-[#121110]/80 hover:border-white/[0.18]'
                      } flex flex-col gap-4 sm:flex-row sm:items-center`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[16/10] w-full sm:w-48 shrink-0 overflow-hidden rounded-xl bg-black/60">
                        <img
                          src={vehicle.image || '/images/showroom/serendib-showroom-floor-02.webp'}
                          alt=""
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            sold ? 'opacity-40 grayscale' : ''
                          }`}
                        />
                        {sold && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <span className="rounded-lg bg-red-500/90 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                              Sold
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
                          {vehicle.condition}
                        </div>
                      </div>

                      {/* Info & Specs */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#D4AF37]">
                            {getBrandLabel(vehicle.make)}
                          </span>
                          <span className="text-xs text-white/40">• {vehicle.year}</span>
                          {vehicle.views ? (
                            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/60">
                              {vehicle.views} views
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-base font-bold text-white truncate">
                          {getDisplayModel(vehicle.make, vehicle.model)}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                          <span className="font-bold text-white text-sm">{formatMillions(vehicle.price)}</span>
                          <span>{vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString('en-LK')} km` : 'Mileage N/A'}</span>
                          <span>{vehicle.fuel || 'Fuel N/A'}</span>
                          <span>{vehicle.transmission || 'Transmission N/A'}</span>
                          <span>{vehicle.bodyType || 'Body N/A'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSold(vehicle)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                            sold
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'
                              : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {sold ? 'Relist' : 'Mark Sold'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(vehicle)}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/80 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle)}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:border-red-500/40 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: LEADS PIPELINE
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'leads' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="space-y-6"
          >
            {/* Lead Status Metric Chips */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'New Enquiries', count: newLeadCount, style: leadStatusStyles.New },
                { label: 'Contacted in Progress', count: contactedLeadCount, style: leadStatusStyles.Contacted },
                { label: 'Closed / Finalized', count: closedLeadCount, style: leadStatusStyles.Closed },
              ].map((item) => (
                <div key={item.label} className={`${glassCard} p-4 flex items-center justify-between`}>
                  <div>
                    <span className="text-xs text-white/50">{item.label}</span>
                    <div className="text-2xl font-bold tracking-tight text-white tabular-nums mt-0.5">{item.count}</div>
                  </div>
                  <span className={`size-3 rounded-full ${item.style.dot}`} />
                </div>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <div className={`${glassCard} p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search buyer name, contact number, requested car, or inquiry note..."
                  className={searchField}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {leadFilters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLeadFilter(f)}
                    className={pill(leadFilter === f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Cards */}
            {filteredLeads.length === 0 ? (
              <div className={`${glassCard} p-12 text-center`}>
                <Users className="mx-auto size-10 text-white/20 mb-3" />
                <h3 className="text-base font-bold text-white">No Customer Leads Found</h3>
                <p className="mt-1 text-xs text-white/50 max-w-md mx-auto">
                  New vehicle inquiries, test drive requests, and contact submissions will populate here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredLeads.map((lead) => {
                  const phoneDigits = lead.phone.replace(/\D/g, '');
                  const statusStyle = leadStatusStyles[lead.status] || leadStatusStyles.New;
                  return (
                    <div
                      key={lead.id}
                      className={`${glassCard} p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}
                    >
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-white">{lead.name}</span>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusStyle.badge}`}>
                            {lead.status}
                          </span>
                          <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/60">
                            {lead.type}
                          </span>
                          <span className="text-xs text-white/40 tabular-nums">
                            {formatDate(lead.created_at)} ({formatRelativeTime(lead.created_at)})
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
                          <span className="text-white font-medium flex items-center gap-1">
                            <Phone className="size-3 text-[#D4AF37]" />
                            {lead.phone}
                          </span>
                          {lead.vehicle_model && (
                            <span className="flex items-center gap-1">
                              <Car className="size-3 text-white/40" />
                              {lead.vehicle_model}
                            </span>
                          )}
                          {lead.date && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="size-3 text-white/40" />
                              {lead.date} {lead.time ? `at ${lead.time}` : ''}
                            </span>
                          )}
                        </div>

                        {lead.message && (
                          <p className="text-xs text-white/70 bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5 mt-2">
                            "{lead.message}"
                          </p>
                        )}
                      </div>

                      {/* Status Buttons & Direct WhatsApp Action */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {(['New', 'Contacted', 'Closed'] as const).map((s) => {
                          const active = lead.status === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={active}
                              onClick={() => handleLeadStatus(lead.id, s)}
                              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                                active
                                  ? statusStyle.active
                                  : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/20'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}

                        <a
                          href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                            `Hi ${lead.name}, regarding your inquiry with Serendib Trading for ${lead.vehicle_model || 'a vehicle'}:`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-400/20 shadow-sm transition-all"
                        >
                          <Phone className="size-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </main>

      {/* Vehicle Add/Edit Modal */}
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
