/**
 * JoinCouple page — all states
 *
 * The /join/:token page handles partner invite acceptance. It has 8 distinct
 * render states: loading, invalid token, expired, already used, user already
 * in a couple, unauthenticated join prompt, authenticated join button, and
 * success. Each is driven by a combination of auth state and invite data.
 *
 * All Firebase calls are intercepted via window seams injected with
 * page.addInitScript before navigation.
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticated, mockUnauthenticated, mockAuthenticatedWithCoupleId } from '../fixtures/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_INVITE = {
  coupleId: 'couple-abc123',
  coupleNames: 'יובל ושיר',
  expired: false,
  alreadyUsed: false,
};

async function mockInvite(
  page: import('playwright/test').Page,
  invite: typeof VALID_INVITE | { coupleId: string; coupleNames: string; expired: boolean; alreadyUsed: boolean } | null | 'loading',
) {
  await page.addInitScript((inv) => {
    (window as Record<string, unknown>).__PLAYWRIGHT_JOIN_INVITE__ = inv;
  }, invite as Record<string, unknown> | null | string);
}

async function mockAcceptInvite(
  page: import('playwright/test').Page,
  result: { coupleId: string } | 'error',
) {
  await page.addInitScript((res) => {
    (window as Record<string, unknown>).__PLAYWRIGHT_ACCEPT_INVITE__ = res;
  }, result as Record<string, unknown> | string);
}

// ─── 1. Loading state ─────────────────────────────────────────────────────────

test.describe('JoinCouple — loading state', () => {
  test('shows spinner while invite is loading', async ({ page }) => {
    await mockAuthenticated(page);
    await mockInvite(page, 'loading');
    await page.goto('/join/some-token');
    await expect(page.locator('.ant-spin')).toBeVisible({ timeout: 5000 });
  });

  test('shows spinner while auth is resolving', async ({ page }) => {
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_AUTH_LOADING__ = true;
    });
    await page.goto('/join/some-token');
    await expect(page.locator('.ant-spin')).toBeVisible({ timeout: 5000 });
  });
});

// ─── 2. Invalid token ─────────────────────────────────────────────────────────

test.describe('JoinCouple — invalid token', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockInvite(page, null);
    await page.goto('/join/nonexistent-token');
  });

  test('shows "קישור לא תקין" heading', async ({ page }) => {
    await expect(page.locator('text=קישור לא תקין')).toBeVisible({ timeout: 5000 });
  });

  test('shows guidance to request a new link', async ({ page }) => {
    await expect(page.locator('text=בקשו מבן/בת הזוג לשלוח קישור חדש')).toBeVisible({ timeout: 5000 });
  });

  test('does not show the join button', async ({ page }) => {
    await expect(page.getByTestId('join-couple-btn')).not.toBeVisible();
  });
});

// ─── 3. Expired token ─────────────────────────────────────────────────────────

test.describe('JoinCouple — expired token', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockInvite(page, { ...VALID_INVITE, expired: true });
    await page.goto('/join/expired-token');
  });

  test('shows "הקישור פג תוקף" heading', async ({ page }) => {
    await expect(page.locator('text=הקישור פג תוקף')).toBeVisible({ timeout: 5000 });
  });

  test('mentions the 7-day validity', async ({ page }) => {
    await expect(page.locator('text=7 ימים')).toBeVisible();
  });

  test('does not show join button', async ({ page }) => {
    await expect(page.getByTestId('join-couple-btn')).not.toBeVisible();
  });
});

// ─── 4. Already used token ────────────────────────────────────────────────────

test.describe('JoinCouple — already used token', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockInvite(page, { ...VALID_INVITE, alreadyUsed: true });
    await page.goto('/join/used-token');
  });

  test('shows "קישור כבר שומש" heading', async ({ page }) => {
    await expect(page.locator('text=קישור כבר שומש')).toBeVisible({ timeout: 5000 });
  });

  test('does not show join button', async ({ page }) => {
    await expect(page.getByTestId('join-couple-btn')).not.toBeVisible();
  });
});

// ─── 5. User already belongs to a couple ─────────────────────────────────────

test.describe('JoinCouple — user already in a couple', () => {
  test.beforeEach(async ({ page }) => {
    // User arrives already belonging to a couple
    await mockAuthenticatedWithCoupleId(page, 'existing-couple-xyz');
    await mockInvite(page, VALID_INVITE);
    await page.goto('/join/valid-token');
  });

  test('shows "כבר מחוברים לחשבון" heading', async ({ page }) => {
    await expect(page.locator('text=כבר מחוברים לחשבון')).toBeVisible({ timeout: 5000 });
  });

  test('shows "חזרה לאפליקציה" button', async ({ page }) => {
    await expect(page.locator('text=חזרה לאפליקציה')).toBeVisible({ timeout: 5000 });
  });

  test('does not show the join button', async ({ page }) => {
    await expect(page.getByTestId('join-couple-btn')).not.toBeVisible();
  });
});

// ─── 6. Valid invite + unauthenticated (sign-in prompt) ──────────────────────

test.describe('JoinCouple — unauthenticated, valid invite', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticated(page);
    await mockInvite(page, VALID_INVITE);
    await page.goto('/join/valid-token');
    await expect(page.getByTestId('join-couple-page')).toBeVisible({ timeout: 5000 });
  });

  test('shows couple names from invite', async ({ page }) => {
    await expect(page.locator('text=יובל ושיר')).toBeVisible();
  });

  test('shows sign-in button instead of join button', async ({ page }) => {
    await expect(page.getByTestId('join-sign-in-btn')).toBeVisible();
    await expect(page.getByTestId('join-couple-btn')).not.toBeVisible();
  });

  test('sign-in button label is "התחברות עם Google"', async ({ page }) => {
    await expect(page.getByTestId('join-sign-in-btn')).toContainText('התחברות עם Google');
  });

  test('clicking sign-in calls signInWithGoogle mock', async ({ page }) => {
    await page.getByTestId('join-sign-in-btn').click();
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_SIGN_IN_CALL_COUNT__ as number ?? 0,
    );
    expect(callCount).toBeGreaterThan(0);
  });

  test('shows note about invitation context', async ({ page }) => {
    await expect(page.locator('text=הוזמנתם לנהל את האירוע')).toBeVisible();
  });
});

// ─── 7. Valid invite + authenticated (join button) ───────────────────────────

test.describe('JoinCouple — authenticated, valid invite', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page, { coupleExists: false });
    await mockInvite(page, VALID_INVITE);
    await mockAcceptInvite(page, { coupleId: 'couple-abc123' });
    await page.goto('/join/valid-token');
    await expect(page.getByTestId('join-couple-page')).toBeVisible({ timeout: 5000 });
  });

  test('shows "הצטרפות לתכנון" join button', async ({ page }) => {
    await expect(page.getByTestId('join-couple-btn')).toBeVisible();
    await expect(page.getByTestId('join-couple-btn')).toContainText('הצטרפות לתכנון');
  });

  test('does not show the sign-in button', async ({ page }) => {
    await expect(page.getByTestId('join-sign-in-btn')).not.toBeVisible();
  });

  test('shows couple names from invite', async ({ page }) => {
    await expect(page.locator('text=יובל ושיר')).toBeVisible();
  });

  test('join button increments __PLAYWRIGHT_ACCEPT_INVITE_CALLED__', async ({ page }) => {
    await page.getByTestId('join-couple-btn').click();
    await page.waitForTimeout(200);
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_ACCEPT_INVITE_CALLED__ as number ?? 0,
    );
    expect(callCount).toBe(1);
  });
});

// ─── 8. Join success ──────────────────────────────────────────────────────────

test.describe('JoinCouple — join success', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page, { coupleExists: false });
    await mockInvite(page, VALID_INVITE);
    await mockAcceptInvite(page, { coupleId: 'couple-abc123' });
    await page.goto('/join/valid-token');
    await expect(page.getByTestId('join-couple-page')).toBeVisible({ timeout: 5000 });
    // Click join to trigger the success state
    await page.getByTestId('join-couple-btn').click();
  });

  test('shows "ברוכים הבאים" success heading', async ({ page }) => {
    await expect(page.locator('text=ברוכים הבאים')).toBeVisible({ timeout: 3000 });
  });

  test('success message includes couple names', async ({ page }) => {
    await expect(page.locator('text=יובל ושיר')).toBeVisible({ timeout: 3000 });
  });

  test('join button is no longer visible after success', async ({ page }) => {
    await expect(page.locator('text=ברוכים הבאים')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('join-couple-btn')).not.toBeVisible();
  });
});

// ─── 9. Join error ────────────────────────────────────────────────────────────

test.describe('JoinCouple — join error', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page, { coupleExists: false });
    await mockInvite(page, VALID_INVITE);
    await mockAcceptInvite(page, 'error');
    await page.goto('/join/valid-token');
    await expect(page.getByTestId('join-couple-page')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('join-couple-btn').click();
  });

  test('shows error message', async ({ page }) => {
    await expect(page.getByTestId('join-error')).toBeVisible({ timeout: 3000 });
  });

  test('error message mentions expired or already used', async ({ page }) => {
    await expect(page.getByTestId('join-error')).toContainText('פג תוקף');
  });

  test('join button is still visible after error (can retry)', async ({ page }) => {
    await expect(page.getByTestId('join-error')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('join-couple-btn')).toBeVisible();
  });
});

// ─── 10. RTL layout ───────────────────────────────────────────────────────────

test.describe('JoinCouple — RTL layout', () => {
  test('page direction is RTL', async ({ page }) => {
    await mockAuthenticated(page, { coupleExists: false });
    await mockInvite(page, VALID_INVITE);
    await page.goto('/join/valid-token');
    await expect(page.getByTestId('join-couple-page')).toBeVisible({ timeout: 5000 });
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});
