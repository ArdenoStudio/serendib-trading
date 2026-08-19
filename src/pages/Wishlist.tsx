import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import SEO from '../components/SEO';
import Loader from '../components/Loader';
import { Car } from '../data/types';
import { readStringList, writeStringList } from '../lib/storage';
import { allowDemoInventory, getDemoInventory } from '../lib/inventory';
import { fetchInventoryList } from '../lib/inventoryCache';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Wishlist() {
  const [ids, setIds] = useState<string[]>(() => readStringList('wishlist'));
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setIds(readStringList('wishlist'));
    window.addEventListener('wishlistchange', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('wishlistchange', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        let inventory: Car[] = [];
        if (isSupabaseConfigured) {
          inventory = await fetchInventoryList();
        } else if (allowDemoInventory) {
          inventory = getDemoInventory();
        }
        if (cancelled) return;
        const wanted = new Set(ids);
        setCars(inventory.filter((car) => wanted.has(car.id)));
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const clearWishlist = () => {
    writeStringList('wishlist', []);
    setIds([]);
    window.dispatchEvent(new Event('wishlistchange'));
  };

  const removeMissingIds = () => {
    const valid = new Set(cars.map((car) => car.id));
    const next = ids.filter((id) => valid.has(id));
    if (next.length !== ids.length) {
      writeStringList('wishlist', next);
      setIds(next);
      window.dispatchEvent(new Event('wishlistchange'));
    }
  };

  useEffect(() => {
    if (!loading && ids.length > 0 && cars.length > 0 && cars.length < ids.length) {
      removeMissingIds();
    }
  }, [loading, cars, ids]);

  return (
    <div className="min-h-screen bg-[#0d0b09] text-white font-sans">
      <SEO
        title="Saved Vehicles"
        description="Your saved Serendib Trading vehicles. Compare favourites and open listings from your wishlist."
        canonical="/wishlist"
        noindex
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Wishlist', path: '/wishlist' },
        ]}
      />

      <main className="pt-32 pb-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto space-y-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                <Heart className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[10px]">
                  Saved locally
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                Your <span className="text-[#D4AF37]">Wishlist</span>
              </h1>
              <p className="text-white/55 max-w-xl text-sm md:text-base leading-relaxed">
                Vehicles you heart on inventory cards are stored in this browser. Clear anytime or open a listing to enquire.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
              >
                Browse inventory <ArrowRight className="w-4 h-4" />
              </Link>
              {ids.length > 0 && (
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="rounded-full border border-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/50 transition-colors hover:border-red-400/40 hover:text-red-300"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <Loader fullScreen={false} />
          ) : cars.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-white/10 bg-white/[0.03] px-8 py-20 text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Heart className="h-7 w-7 text-[#D4AF37]/70" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">No saved vehicles yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/50 leading-relaxed">
                Tap the heart on any inventory card to save it here for later comparison or WhatsApp enquiry.
              </p>
              <Link
                to="/inventory"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black"
              >
                Explore stock <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <div key={car.id}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
