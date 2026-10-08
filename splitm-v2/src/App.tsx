import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/config/firebase';
import { setUser, setAuthLoading } from './modules/auth/auth.slice';
import AuthGuard from './components/layout/AuthGuard';

// Lazy loading route components for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans">
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<DashboardPage />} />
            {/* <Route path="/groups" element={<GroupsPage />} /> */}
            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
