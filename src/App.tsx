import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import CarDetail from './pages/CarDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Calculator from './pages/Calculator';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ComparisonTray from './components/ComparisonTray';
import { Analytics } from "@vercel/analytics/react";

import { logPageView } from './lib/supabase';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    logPageView();

    // Disable Lenis on touch devices — native scroll is already smooth
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) {
      window.scrollTo(0, 0);
      return;
    }

    // Lenis Smooth Scroll (desktop only)
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
  }, [location.pathname]);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Analytics />
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      {!isAdmin && <ComparisonTray />}
      <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.key}
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.995 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
          opacity: { duration: 0.15 }
        }}
        style={{ willChange: 'transform, opacity' }}
      >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/calculator" element={<Calculator />} />
        
        {/* Legal Pages */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </motion.div>
      </AnimatePresence>
    </>
  );
}


