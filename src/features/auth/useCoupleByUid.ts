import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * Testing seam: window.__PLAYWRIGHT_COUPLE_EXISTS_MOCK__ may be set by
 * Playwright addInitScript to control whether a couple doc exists for the
 * current uid without hitting Firestore. Never set in production.
 */
declare global {
  interface Window {
    __PLAYWRIGHT_COUPLE_EXISTS_MOCK__?: boolean;
  }
}

/**
 * Checks whether a Couple document exists in Firestore for the given uid.
 *
 * The couples collection uses the Firebase Auth uid as the document id,
 * so a direct doc-get (O(1) read) is all that's needed — no query required.
 *
 * Returns:
 *   isLoading — true while the Firestore request is in flight
 *   coupleExists — true when the doc exists, false when it doesn't
 */
export function useCoupleByUid(uid: string | null) {
  const { data: coupleExists = false, isLoading } = useQuery({
    queryKey: ['couple', uid],
    queryFn: async () => {
      if (!uid) return false;

      // Test seam: return mocked value without hitting Firestore
      if (
        typeof window !== 'undefined' &&
        typeof window.__PLAYWRIGHT_COUPLE_EXISTS_MOCK__ === 'boolean'
      ) {
        return window.__PLAYWRIGHT_COUPLE_EXISTS_MOCK__;
      }

      const snapshot = await getDoc(doc(db, 'couples', uid));
      return snapshot.exists();
    },
    enabled: uid !== null,
    staleTime: 5 * 60 * 1000, // 5 min — couple doc doesn't change mid-session
  });

  return { coupleExists, isLoading };
}
