import { Routes, Route, Outlet } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/config/firebase';
import { setUser, setAuthLoading } from './modules/auth/auth.slice';
import AuthGuard from './components/layout/AuthGuard';
import AppShell from './components/layout/AppShell';
import { LoadingSplashScreen } from './components/common/LoadingSplashScreen';

// Lazy loading route components for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Nested layout: wraps authenticated pages in the app shell
function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // 5-second fallback: never leave UI permanently stuck in loading if auth state hangs
    const authTimeout = setTimeout(() => {
      dispatch(setAuthLoading(false));
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(authTimeout);
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        }));
      } else {
        dispatch(setUser(null));
      }
      dispatch(setAuthLoading(false));
    });

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, [dispatch]);


  return (
    <div className="font-sans">
      <Suspense fallback={<LoadingSplashScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/splash" element={<LoadingSplashScreen />} />
          <Route path="/preview" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<AuthGuard />}>
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<DashboardPage />} />
              {/* <Route path="/groups" element={<GroupsPage />} /> */}
              <Route path="*" element={<DashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
