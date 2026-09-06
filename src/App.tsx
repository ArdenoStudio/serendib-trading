import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ComparisonTray from './components/ComparisonTray';
import WhatsAppFloat from './components/WhatsAppFloat';
import WelcomeGuide from './components/WelcomeGuide';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';
import { logPageView } from './lib/supabase';

const Home = lazy(() => import('./pages/Home'));
const Inventory = lazy(() => import('./pages/Inventory'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const About = lazy(() => import('./pages/About'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Calculator = lazy(() => import('./pages/Calculator'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

export default function App() {
  const location = useLocation();
  const pathname = location.pathname;
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Always log page views for Core analytics (lightweight, throttled server-side)
    logPageView().catch(() => undefined);

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isAdmin = pathname.startsWith('/admin');
    if (isTouch || shouldReduceMotion || isAdmin) {
      window.scrollTo(0, 0);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      if (!document.hidden) lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    lenis.scrollTo(0, { immediate: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname, shouldReduceMotion]);

  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-5 focus:py-3 focus:rounded-xl focus:bg-[#D4AF37] focus:text-black focus:text-sm focus:font-black focus:uppercase focus:tracking-widest"
      >
        Skip to content
      </a>
      {!isAdmin && <Navbar />}
      {!isAdmin && <ComparisonTray />}
      {/* Main landmark: skip-link target, not animated to avoid LCP delay */}
      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/wishlist" element={<Wishlist />} />

              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && <WhatsAppFloat />}
      {!isAdmin && <WelcomeGuide />}
    </>
  );
}
