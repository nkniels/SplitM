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
} catch (e) {
  console.error('[SplitM] Failed to mount app:', e);
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f1117;color:#f1f5f9;font-family:sans-serif;text-align:center;padding:2rem;">
      <div>
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;">SplitM failed to load</h1>
        <p style="color:#94a3b8;margin-bottom:1rem;">Firebase configuration may be missing.</p>
        <pre style="background:#1a1d27;padding:1rem;border-radius:8px;font-size:0.75rem;color:#f87171;text-align:left;max-width:600px;">${e}</pre>
      </div>
    </div>
  `;
}
