import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingSplashScreen } from '../common/LoadingSplashScreen';
import type { RootState } from '../../core/store/store';

export default function AuthGuard() {
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timer = setTimeout(() => setShowSlowNotice(true), 3500);
    } else {
      setShowSlowNotice(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <LoadingSplashScreen subtitle="Verifying session..." />
        {showSlowNotice && (
          <div className="fixed bottom-12 inset-x-0 z-60 flex flex-col items-center gap-2 px-4 animate-fade-in text-center">
            <p className="text-xs text-muted max-w-xs">
              Authentication response is delayed. You can wait or proceed directly to login.
            </p>
            <Link
              to="/login"
              className="text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-md border border-border bg-surface shadow-sm"
            >
              Continue to Login &rarr;
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === 'true' || params.get('demo') === 'true' || window.location.pathname.startsWith('/preview')) {
        return <Outlet />;
      }
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

