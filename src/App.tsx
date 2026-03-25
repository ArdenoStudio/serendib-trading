/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import SplashLoader from './components/SplashLoader';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import CarDetail from './pages/CarDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Calculator from './pages/Calculator';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  return (
    <>
      {showLoader && <SplashLoader onComplete={handleLoaderComplete} />}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </Router>
    </>
  );
}
