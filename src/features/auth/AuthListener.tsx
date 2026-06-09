import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useAppDispatch } from '../../store';
import { setAuthLoading, setAuthUser, clearAuthUser } from './authSlice';

declare global {
  interface Window {
    __PLAYWRIGHT_AUTH_MOCK__?: {
      uid: string;
      displayName: string | null;
      email: string | null;
      photoURL: string | null;
      coupleId?: string | null;
    } | null;
    __PLAYWRIGHT_AUTH_LOADING__?: boolean;
    // Legacy seam: set to true to simulate a completed onboarding (coupleId = uid)
    __PLAYWRIGHT_COUPLE_EXISTS_MOCK__?: boolean;
  }
}

/**
 * Subscribes to Firebase Auth state and syncs it to Redux.
 * After a user is confirmed, looks up users/{uid} to resolve the coupleId.
 * Status stays 'loading' until both auth and the Firestore lookup complete.
 *
 * Playwright seams:
 *   __PLAYWRIGHT_AUTH_MOCK__         — bypasses Firebase; coupleId optional (null = not onboarded)
 *   __PLAYWRIGHT_COUPLE_EXISTS_MOCK__ — legacy: if true, coupleId defaults to uid in mock
 *   __PLAYWRIGHT_AUTH_LOADING__       — keeps status in 'loading' forever (skeleton tests)
 */
export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__PLAYWRIGHT_AUTH_LOADING__ === true) {
      dispatch(setAuthLoading());
      return;
    }

    if (typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window) {
      const mock = window.__PLAYWRIGHT_AUTH_MOCK__;
      if (mock) {
        const coupleId =
          mock.coupleId !== undefined
            ? mock.coupleId
            : window.__PLAYWRIGHT_COUPLE_EXISTS_MOCK__
              ? mock.uid
              : null;
        dispatch(setAuthUser({ ...mock, coupleId }));
      } else {
        dispatch(clearAuthUser());
      }
      return;
    }

    dispatch(setAuthLoading());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        dispatch(clearAuthUser());
        return;
      }

      // Resolve coupleId from users/{uid} before setting authenticated state
      void getDoc(doc(db, 'users', user.uid)).then((snap) => {
        const coupleId = snap.exists() ? (snap.data().coupleId as string) : null;
        dispatch(
          setAuthUser({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            coupleId,
          }),
        );
      });
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
}
