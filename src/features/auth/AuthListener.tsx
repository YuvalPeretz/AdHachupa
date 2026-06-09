import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAppDispatch } from '../../store';
import { setAuthLoading, setAuthUser, clearAuthUser } from './authSlice';

/**
 * Shape of the test-only auth mock injected via page.addInitScript in Playwright.
 * window.__PLAYWRIGHT_AUTH_MOCK__ is only set by tests — never in production.
 */
declare global {
  interface Window {
    __PLAYWRIGHT_AUTH_MOCK__?: {
      uid: string;
      displayName: string | null;
      email: string | null;
      photoURL: string | null;
    } | null;
    /**
     * Set to true by Playwright tests to keep auth permanently in 'loading' state.
     * Useful for verifying that loading skeletons are shown before auth resolves.
     */
    __PLAYWRIGHT_AUTH_LOADING__?: boolean;
  }
}

/**
 * Mounts once near the top of the app tree (inside <Provider store>).
 * Subscribes to Firebase Auth state and syncs it to the Redux auth slice.
 * Renders nothing — purely a side-effect component.
 *
 * Testing seam: if window.__PLAYWRIGHT_AUTH_MOCK__ is defined (set by
 * page.addInitScript in Playwright), the real onAuthStateChanged listener
 * is bypassed and the mock value is dispatched directly. This keeps
 * production code clean — the window property is never set outside tests.
 */
export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Test seam: keep auth permanently in 'loading' state (for skeleton tests)
    if (typeof window !== 'undefined' && window.__PLAYWRIGHT_AUTH_LOADING__ === true) {
      dispatch(setAuthLoading());
      return; // Never resolves — skeleton stays visible
    }

    // Test seam: use mock state injected by Playwright when present
    if (typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window) {
      const mock = window.__PLAYWRIGHT_AUTH_MOCK__;
      if (mock) {
        dispatch(setAuthUser(mock));
      } else {
        dispatch(clearAuthUser());
      }
      return;
    }

    // Mark as loading until the first auth callback fires
    dispatch(setAuthLoading());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setAuthUser({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          }),
        );
      } else {
        dispatch(clearAuthUser());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
}
