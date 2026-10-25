import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';

export const isConfigured = Boolean(apiKey && apiKey.startsWith('AIzaSy'));

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: 'G-K6Y9M1XXP1'
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

