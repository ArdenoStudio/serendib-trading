import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loader from './Loader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Define allowed emails (whitelist)
  const allowedEmails = [
    'bilalikras1@gmail.com',
    'ardenostudio@gmail.com' // Replace with your studio email if different
  ];

  if (!allowedEmails.includes(session.user.email)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-sans">
        <div className="space-y-6">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-red-500">Access Restricted</h1>
          <p className="text-gray-400 max-w-sm font-medium">Your email ({session.user.email}) is not authorized for the command center.</p>
          <a href="/" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]">Return to Showroom</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
