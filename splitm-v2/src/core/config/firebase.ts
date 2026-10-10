import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const isConfigured = Boolean(apiKey && authDomain && projectId);

if (!isConfigured) {
  console.warn(
    '[SplitM] Firebase configuration is incomplete. ' +
    'Running with offline fallback. ' +
    'Ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and ' +
    'VITE_FIREBASE_PROJECT_ID are configured in .env or CI secrets.'
  );
}

const firebaseConfig = {
  apiKey: apiKey || 'dummy-api-key-offline',
  authDomain: authDomain || 'splitm-offline.firebaseapp.com',
  projectId: projectId || 'splitm-offline',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'splitm-offline.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:dummy'
};

let appInstance;
try {
  appInstance = initializeApp(firebaseConfig);
} catch (e) {
  console.error('[SplitM] initializeApp failed:', e);
  // Re-attempt with minimal dummy config to prevent cascading export errors
  appInstance = initializeApp({
    apiKey: 'dummy-api-key',
    projectId: 'splitm-offline',
    appId: '1:1:web:dummy'
  }, 'splitm-fallback');
}

export const app = appInstance;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const hasValidFirebaseConfig = isConfigured;

