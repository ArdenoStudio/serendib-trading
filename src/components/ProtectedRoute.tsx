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

  // Allowlist is enforced when the session cookie is issued and on every
  // admin API call. Do not duplicate emails in the client bundle.
  return <>{children}</>;
}
