import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

export let app: FirebaseApp;
export let db: Firestore;
export let auth: Auth;
export let functions: Functions;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  functions = getFunctions(app, 'europe-west1');
} catch {
  // Firebase init fails when env vars are missing — safe to swallow at boot
}

export const googleProvider = new GoogleAuthProvider();

/**
 * Testing seam: window.__PLAYWRIGHT_SIGN_IN_MOCK__ may be set by Playwright
 * addInitScript to stub the popup flow. If set, it is called instead of the
 * real signInWithPopup. This property is never set in production.
 */
declare global {
  interface Window {
    __PLAYWRIGHT_SIGN_IN_MOCK__?: () => Promise<UserCredential>;
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (
    typeof window !== 'undefined' &&
    typeof window.__PLAYWRIGHT_SIGN_IN_MOCK__ === 'function'
  ) {
    return window.__PLAYWRIGHT_SIGN_IN_MOCK__();
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser(): Promise<void> {
  return signOut(auth);
}
