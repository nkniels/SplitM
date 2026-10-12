import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './core/store/store';
import { ToastProvider } from './components/ui/Toast';
import { initSyncListeners } from './modules/sync/sync.service';
import App from './App.tsx';
import './index.css';

// Register online/offline sync event listeners once at startup
try {
  initSyncListeners();
} catch (e) {
  console.warn('[SplitM] initSyncListeners failed:', e);
}

// Service worker registration & legacy cache cleanup
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== 'splitm-v2-cache-v3') {
            console.log('[SplitM] Purging obsolete cache:', key);
            caches.delete(key);
          }
        });
      });
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update();
        console.log('[SplitM] SW registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SplitM] SW registration skipped or failed:', err);
      });
  });
}

const rootEl = document.getElementById('root')!;

try {
  createRoot(rootEl).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
  // Mark app as mounted to prevent 5-second failure fallback trigger
  (window as unknown as { __splitm_mounted: boolean }).__splitm_mounted = true;
} catch (e) {
  console.error('[SplitM] Failed to mount app:', e);
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#090d16' : '#f8fafc';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const text = isDark ? '#f8fafc' : '#0f172a';
  const border = isDark ? '#1f293d' : '#e2e8f0';

  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:${bg};color:${text};font-family:system-ui,sans-serif;text-align:center;padding:2rem;">
      <div style="background:${cardBg};border:1px solid ${border};border-radius:16px;padding:2rem;max-width:540px;width:100%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
        <h1 style="font-size:1.4rem;font-weight:700;margin-bottom:0.75rem;">SplitM encountered an error</h1>
        <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem;">The application could not render. Please check network connection or reload.</p>
        <pre style="background:rgba(0,0,0,0.2);padding:1rem;border-radius:8px;font-size:0.75rem;color:#f87171;text-align:left;overflow-x:auto;margin-bottom:1.5rem;">An error occurred while loading the application.</pre>
        <button onclick="window.location.reload(true)" style="background:#6366f1;color:#fff;border:none;padding:0.6rem 1.25rem;border-radius:8px;font-weight:600;cursor:pointer;">Reload SplitM</button>
      </div>
    </div>
  `;
}

