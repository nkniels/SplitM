import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" aria-label="Loading" />
        <p className="text-slate-400 text-sm">Verifying session...</p>
        {showSlowNotice && (
          <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
            <p className="text-xs text-slate-500 max-w-xs">
              Authentication response is delayed. You can wait or proceed directly to login.
            </p>
            <Link
              to="/login"
              className="text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-md border border-primary/30"
            >
              Continue to Login &rarr;
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

