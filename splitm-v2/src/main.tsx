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
initSyncListeners();

createRoot(document.getElementById('root')!).render(
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
