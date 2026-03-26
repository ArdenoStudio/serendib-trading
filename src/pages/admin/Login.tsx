import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldAlert } from 'lucide-react';
import { signInWithGoogle } from '../../lib/supabase';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
             <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-2xl">
                <ShieldAlert className="w-10 h-10 text-[#D4AF37]" />
             </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Concierge <span className="text-gray-500">Access</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Admin Control Terminal</p>
          </div>
        </div>

        <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[40px] shadow-2xl space-y-8 backdrop-blur-xl">
          <div className="space-y-2 text-center">
             <p className="text-sm font-medium text-gray-400">Restricted to Serendib Trading personnel.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            disabled={loading}
            onClick={handleLogin}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-4 hover:bg-[#D4AF37] transition-all disabled:opacity-50 group overflow-hidden relative shadow-2xl"
          >
            <span className="relative z-10 flex items-center gap-4">
               {loading ? 'Initializing...' : (
                 <>
                   <LogIn className="w-5 h-5" />
                   Login with Google
                 </>
               )}
            </span>
          </button>
          
          <div className="pt-4 text-center">
             <a href="/" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Return to Showroom</a>
          </div>
        </div>

        <p className="text-center text-[9px] font-bold text-gray-700 uppercase tracking-widest">
          Secured by Supabase Identity Protocol
        </p>
      </motion.div>
    </div>
  );
}
