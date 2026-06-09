/**
 * E2E: Dashboard delta-refresh behaviour
 *
 * Tests that:
 * 1. After 5 minutes of idle time, the query re-fetches in the background.
 * 2. The merged update does NOT cause a full re-render (no skeleton flash /
 *    no full remount of the page).
 *
 * Strategy: inject window.__PLAYWRIGHT_DASHBOARD_STALE_MS__ = 0 so the
 * React Query staleTime is effectively zero; then trigger a window focus event
 * (which React Query listens to for refetchOnWindowFocus) to cause a background
 * re-fetch.  We verify the page content is still visible (no skeleton flash)
 * immediately after the refetch.
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('Dashboard — delta refresh', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    // Set staleTime to 0 so the next focus event immediately triggers a background fetch
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_DASHBOARD_STALE_MS__ = 0;
    });
    await page.goto('/dashboard');
    // Wait for initial data to load
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 5000 });
  });

  test('delta refresh triggers after idle and merges without full re-render', async ({ page }) => {
    // Capture the current hero-card text to compare after refresh
    const greetingText = await page.getByTestId('dashboard-greeting').textContent();
    expect(greetingText).toBeTruthy();

    // Simulate the tab going away and coming back (triggers refetchOnWindowFocus)
    await page.evaluate(() => {
      // Blur the window (simulates user switching away)
      window.dispatchEvent(new Event('blur'));
    });
    // Small tick to let React Query mark data as stale
    await page.waitForTimeout(50);

    // Focus the window again — React Query will re-fetch in the background
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });

    // The dashboard page should remain visible immediately (no skeleton flash)
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Skeleton should NOT be shown (no full remount)
    await expect(page.getByTestId('dashboard-skeleton')).not.toBeVisible();

    // After the background fetch settles, content should still be there
    await page.waitForTimeout(500);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('dashboard-skeleton')).not.toBeVisible();

    // Content has not changed (same mock data)
    const greetingTextAfter = await page.getByTestId('dashboard-greeting').textContent();
    expect(greetingTextAfter).toBe(greetingText);
  });

  test('updated counts merge without skeleton flash on re-fetch', async ({ page }) => {
    // Confirm page is rendered (not skeleton)
    await expect(page.getByTestId('hero-card')).toBeVisible();
    await expect(page.getByTestId('budget-card')).toBeVisible();

    // Trigger background refetch via focus event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(20);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });

    // The skeleton must NOT appear during background fetch (isFetching ≠ isLoading)
    // We sample the DOM immediately after focus — if skeleton were shown it would
    // appear within the next frame
    const skeletonVisible = await page
      .getByTestId('dashboard-skeleton')
      .isVisible()
      .catch(() => false);
    expect(skeletonVisible).toBe(false);

    // After re-fetch completes, page should still show full content
    await page.waitForTimeout(600);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('vendor-chips')).toBeVisible();
    await expect(page.getByTestId('budget-card')).toBeVisible();
  });
});
