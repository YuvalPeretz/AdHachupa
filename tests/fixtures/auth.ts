/**
 * Playwright auth mock fixtures.
 *
 * Use `mockAuthenticated` / `mockUnauthenticated` / `mockAuthenticatedWithCouple`
 * / `mockAuthenticatedWithCoupleId` in `page.addInitScript` BEFORE calling
 * `page.goto` to control the auth state seen by the app.
 *
 * These work by setting window-level properties that the app's AuthListener,
 * useCoupleByUid, and signInWithGoogle check before touching real Firebase —
 * the seam is declared in those modules and is never active in production.
 */

/** Injects an authenticated user state (no couple doc by default). */
export async function mockAuthenticated(
  page: import('playwright/test').Page,
  options?: {
    uid?: string;
    displayName?: string;
    email?: string;
    coupleExists?: boolean;
  },
) {
  const uid = options?.uid ?? 'test-uid-123';
  const displayName = options?.displayName ?? 'Test User';
  const email = options?.email ?? 'test@example.com';
  const coupleExists = options?.coupleExists ?? false;

  await page.addInitScript(
    ({ uid, displayName, email, coupleExists }) => {
      window.__PLAYWRIGHT_AUTH_MOCK__ = {
        uid,
        displayName,
        email,
        photoURL: null,
      };
      window.__PLAYWRIGHT_COUPLE_EXISTS_MOCK__ = coupleExists;
      // Mock signInWithGoogle to resolve immediately
      window.__PLAYWRIGHT_SIGN_IN_MOCK__ = () =>
        Promise.resolve({} as import('firebase/auth').UserCredential);
    },
    { uid, displayName, email, coupleExists },
  );
}

/** Injects an authenticated user WITH an existing couple doc (returning user). */
export async function mockAuthenticatedWithCouple(
  page: import('playwright/test').Page,
) {
  return mockAuthenticated(page, { coupleExists: true });
}

/**
 * Injects an authenticated user WITH an explicit coupleId.
 * Use this when the user must already belong to a couple at page load
 * (e.g. testing the JoinCouple "already in couple" guard, or Settings invite).
 */
export async function mockAuthenticatedWithCoupleId(
  page: import('playwright/test').Page,
  coupleId: string,
  options?: { uid?: string; displayName?: string; email?: string },
) {
  const uid = options?.uid ?? 'test-uid-123';
  const displayName = options?.displayName ?? 'Test User';
  const email = options?.email ?? 'test@example.com';

  await page.addInitScript(
    ({ uid, displayName, email, coupleId }) => {
      window.__PLAYWRIGHT_AUTH_MOCK__ = { uid, displayName, email, photoURL: null, coupleId };
      window.__PLAYWRIGHT_SIGN_IN_MOCK__ = () =>
        Promise.resolve({} as import('firebase/auth').UserCredential);
    },
    { uid, displayName, email, coupleId },
  );
}

/** Injects unauthenticated state. Also mocks signInWithGoogle to fire a sign-in mock. */
export async function mockUnauthenticated(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_AUTH_MOCK__ = null;
    // Mock signInWithGoogle to record a call without opening a real popup
    let callCount = 0;
    window.__PLAYWRIGHT_SIGN_IN_MOCK__ = () => {
      callCount++;
      (window as Record<string, unknown>).__PLAYWRIGHT_SIGN_IN_CALL_COUNT__ = callCount;
      return Promise.resolve({} as import('firebase/auth').UserCredential);
    };
  });
}
