import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ComparisonTray from './components/ComparisonTray';
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

export default function App() {
  const location = useLocation();
  const pathname = location.pathname;
  const shouldReduceMotion = useReducedMotion();
  const enableAnalytics = !['localhost', '127.0.0.1'].includes(window.location.hostname);

  useEffect(() => {
    logPageView();

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch || shouldReduceMotion) {
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
      lenis.raf(time);
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
  const pageInitial = shouldReduceMotion
    ? {}
    : { opacity: 0, y: 8, scale: 0.995 };

  return (
    <>
      {enableAnalytics && <Analytics />}
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      {!isAdmin && <ComparisonTray />}
      <motion.div
        key={pathname}
        initial={pageInitial}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
          opacity: { duration: 0.15 },
        }}
        style={{ willChange: shouldReduceMotion ? 'auto' : 'transform, opacity' }}
      >
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calculator" element={<Calculator />} />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </>
  );
}
