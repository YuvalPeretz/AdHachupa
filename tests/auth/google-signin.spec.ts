/**
 * Tests for 0.5 Firebase Auth — Google Sign-In
 *
 * All Firebase interactions are mocked via window.__PLAYWRIGHT_*__ properties
 * injected with page.addInitScript before navigation (the test seam). This means
 * no real Google OAuth popup, no real Firestore reads, no CI secrets needed.
 */
import { test, expect } from 'playwright/test';
import {
  mockAuthenticated,
  mockAuthenticatedWithCouple,
  mockUnauthenticated,
} from '../fixtures/auth';

// ─── 1. Welcome CTA and login link both call signInWithGoogle ─────────────────

test.describe('Welcome — sign-in entry points', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/onboarding/welcome');
    await page.waitForLoadState('networkidle');
  });

  test('CTA button calls signInWithGoogle when tapped', async ({ page }) => {
    await page.getByTestId('welcome-cta').click();
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_SIGN_IN_CALL_COUNT__ as number ?? 0,
    );
    expect(callCount).toBeGreaterThan(0);
  });

  test('login link calls signInWithGoogle when tapped', async ({ page }) => {
    await page.getByTestId('welcome-login-link').click();
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_SIGN_IN_CALL_COUNT__ as number ?? 0,
    );
    expect(callCount).toBeGreaterThan(0);
  });
});

// ─── 2. Authenticated + onboarded → redirects from / and /welcome to /dashboard ─

test.describe('RedirectIfAuthed — returning couple', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
  });

  test('authenticated+onboarded user visiting / is redirected to /dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/dashboard');
  });

  test('authenticated+onboarded user visiting /onboarding/welcome is redirected to /dashboard', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    await expect(page).toHaveURL('/dashboard');
  });
});

// ─── 3. Unauthenticated → redirected from main-app routes to /welcome ─────────

test.describe('RequireAuth — unauthenticated visitor', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticated(page);
  });

  test('unauthenticated visitor hitting /dashboard is redirected to /onboarding/welcome', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/onboarding/welcome');
  });

  test('unauthenticated visitor hitting /onboarding/events is redirected to /onboarding/welcome', async ({
    page,
  }) => {
    await page.goto('/onboarding/events');
    await expect(page).toHaveURL('/onboarding/welcome');
  });

  test('unauthenticated visitor hitting /guests is redirected to /onboarding/welcome', async ({
    page,
  }) => {
    await page.goto('/guests');
    await expect(page).toHaveURL('/onboarding/welcome');
  });

  test('unauthenticated visitor hitting /tasks is redirected to /onboarding/welcome', async ({
    page,
  }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL('/onboarding/welcome');
  });

  test('unauthenticated visitor hitting /budget is redirected to /onboarding/welcome', async ({
    page,
  }) => {
    await page.goto('/budget');
    await expect(page).toHaveURL('/onboarding/welcome');
  });
});

// ─── 4. New authenticated user (no couple doc) → wizard at /onboarding/events ─

test.describe('RedirectIfAuthed — new user (authenticated, no couple doc)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticated but no couple document exists yet
    await mockAuthenticated(page, { coupleExists: false });
  });

  test('new user visiting / is redirected to /onboarding/events', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/onboarding/events');
  });

  test('new user visiting /onboarding/welcome is redirected to /onboarding/events', async ({
    page,
  }) => {
    await page.goto('/onboarding/welcome');
    await expect(page).toHaveURL('/onboarding/events');
  });
});

// ─── 5. Loading state shows skeleton, not wrong screen ────────────────────────

test.describe('Loading skeleton — no auth flash', () => {
  test('auth-loading-skeleton is shown while auth is resolving', async ({ page }) => {
    // Use the __PLAYWRIGHT_AUTH_LOADING__ seam: AuthListener dispatches
    // setAuthLoading() and then never resolves, keeping status at 'loading'
    // indefinitely. RequireAuth (and RedirectIfAuthed) both render the skeleton
    // for 'idle' and 'loading' states.
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_AUTH_LOADING__ = true;
    });

    await page.goto('/dashboard');

    const skeleton = page.getByTestId('auth-loading-skeleton');
    await expect(skeleton).toBeVisible({ timeout: 5000 });

    // Crucially: the AppShell (bottom nav) content is NOT visible during loading
    await expect(page.getByTestId('bottom-nav')).not.toBeVisible();
  });
});

// ─── 6. Authenticated user can access onboarding wizard steps ─────────────────

test.describe('RequireAuth — authenticated wizard access', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
  });

  test('authenticated user can access /onboarding/events', async ({ page }) => {
    await page.goto('/onboarding/events');
    await expect(page.getByTestId('event-card-wedding')).toBeVisible();
  });

  test('authenticated+onboarded user can access /dashboard', async ({ page }) => {
    // Re-mock with couple to reach dashboard
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_AUTH_MOCK__ = {
        uid: 'test-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: null,
      };
      window.__PLAYWRIGHT_COUPLE_EXISTS_MOCK__ = true;
    });
    await page.goto('/dashboard');
    // Dashboard (AppShell) renders — bottom nav visible
    await expect(page.getByText('בית')).toBeVisible();
  });
});
