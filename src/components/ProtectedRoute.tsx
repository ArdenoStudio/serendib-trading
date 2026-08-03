import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : { session: null }))
      .then((data) => {
        if (isMounted) {
          setSession(data.session || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const allowedEmails = [
    'bilalikras1@gmail.com',
    'ardenostudio@gmail.com',
    'suvenseoras@gmail.com',
  ];
  const userEmail = session.user?.email?.toLowerCase() || '';

  if (!allowedEmails.includes(userEmail)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-sans">
        <div className="space-y-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-red-500">Access Restricted</h1>
          <p className="text-gray-400 max-w-sm font-medium">Your email ({session.user?.email}) is not authorized for the dashboard.</p>
          <a href="/" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]">Return to Showroom</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
