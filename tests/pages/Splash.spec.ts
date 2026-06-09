import { test, expect } from 'playwright/test';
import { mockUnauthenticated } from '../fixtures/auth';

test.describe('Splash Screen', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticated(page);
    // Navigate to Splash, but don't wait for auto-navigate
    await page.goto('/');
  });

  test('full viewport warm ivory background', async ({ page }) => {
    const bg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor,
    );
    // Accept rgb(253, 246, 236) which is #FDF6EC
    expect(bg).toBe('rgb(253, 246, 236)');
  });

  test('pulsing loader visible', async ({ page }) => {
    await expect(page.getByTestId('splash-loader')).toBeVisible();
  });

  test('logo and tagline centered', async ({ page }) => {
    await expect(page.getByTestId('splash-logo')).toBeVisible();
    await expect(page.getByTestId('splash-tagline')).toBeVisible();
    await expect(page.getByTestId('splash-tagline')).toContainText('כי כל פרט חשוב');
  });

  test('illustration is rendered', async ({ page }) => {
    await expect(page.getByTestId('splash-illustration')).toBeVisible();
  });

  test('auto-navigates to Welcome after timeout', async ({ page }) => {
    // Wait for auto-navigation (2s timeout + buffer)
    await page.waitForURL('**/onboarding/welcome', { timeout: 5000 });
    await expect(page).toHaveURL('/onboarding/welcome');
  });

  test('screenshot: splash.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('splash.png');
  });
});
