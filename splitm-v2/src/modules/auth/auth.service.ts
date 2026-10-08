import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider } from '../../core/config/firebase';
import { store } from '../../core/store/store';
import { setUser, setAuthError, setAuthLoading } from './auth.slice';

// Email & Password Auth
export const loginWithEmail = async (email: string, pass: string) => {
  store.dispatch(setAuthLoading(true));
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  } finally {
    store.dispatch(setAuthLoading(false));
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  store.dispatch(setAuthLoading(true));
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  } finally {
    store.dispatch(setAuthLoading(false));
  }
};

// Google Auth
export const loginWithGoogle = async () => {
  store.dispatch(setAuthLoading(true));
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  } finally {
    store.dispatch(setAuthLoading(false));
  }
};

// Phone Auth
// Initialize RecaptchaVerifier on a DOM element (e.g., 'recaptcha-container')
export const setupRecaptcha = (containerId: string) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (_response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }
  return window.recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
  store.dispatch(setAuthLoading(true));
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  } finally {
    store.dispatch(setAuthLoading(false));
  }
};

export const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
  store.dispatch(setAuthLoading(true));
  try {
    const userCredential = await confirmationResult.confirm(otp);
    return userCredential.user;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  } finally {
    store.dispatch(setAuthLoading(false));
  }
};

export const logout = async () => {
  await signOut(auth);
  store.dispatch(setUser(null));
};

// Add typescript globals for window object
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}
