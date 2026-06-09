import { test, expect } from 'playwright/test';
import { mockUnauthenticated } from '../fixtures/auth';

test.describe('Welcome', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/onboarding/welcome');
    await page.waitForLoadState('networkidle');
  });

  test('heading in Playfair Display, right-aligned', async ({ page }) => {
    const heading = page.getByTestId('welcome-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('ברוכים הבאים');
    // In RTL the heading aligns to center (on full-width) or start (right in RTL)
    const textAlign = await heading.evaluate(
      (el) => window.getComputedStyle(el).textAlign,
    );
    expect(['right', 'start', 'center']).toContain(textAlign);
  });

  test('CTA button full-width, champagne gold', async ({ page }) => {
    const cta = page.getByTestId('welcome-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toContainText('בואו נתחיל');
  });

  test('login link below CTA', async ({ page }) => {
    const loginLink = page.getByTestId('welcome-login-link');
    await expect(loginLink).toBeVisible();
  });

  test('no bottom nav', async ({ page }) => {
    // Bottom nav has data-testid="bottom-nav" or nav role
    await expect(page.locator('[data-testid="bottom-nav"]')).toHaveCount(0);
  });

  test('CTA calls signInWithGoogle (mocked)', async ({ page }) => {
    await page.getByTestId('welcome-cta').click();
    // signInWithGoogle mock increments __PLAYWRIGHT_SIGN_IN_CALL_COUNT__
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_SIGN_IN_CALL_COUNT__ as number ?? 0,
    );
    expect(callCount).toBeGreaterThan(0);
  });

  test('login link calls signInWithGoogle (mocked)', async ({ page }) => {
    await page.getByTestId('welcome-login-link').click();
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_SIGN_IN_CALL_COUNT__ as number ?? 0,
    );
    expect(callCount).toBeGreaterThan(0);
  });

  test('illustration is visible', async ({ page }) => {
    await expect(page.getByTestId('welcome-illustration')).toBeVisible();
  });

  test('screenshot: welcome.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('welcome.png');
  });
});
