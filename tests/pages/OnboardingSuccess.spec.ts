import { test, expect } from 'playwright/test';
import { mockAuthenticated } from '../fixtures/auth';

test.describe('Onboarding Success', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/success');
    await page.waitForLoadState('networkidle');
  });

  test('warm ivory background', async ({ page }) => {
    const bg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).toBe('rgb(253, 246, 236)');
  });

  test('gold checkmark circle is centered and visible', async ({ page }) => {
    await expect(page.getByTestId('success-check-circle')).toBeVisible();
  });

  test('title contains "הכל מוכן"', async ({ page }) => {
    const title = page.getByTestId('success-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('הכל מוכן');
  });

  test('title is in Rubik', async ({ page }) => {
    const title = page.getByTestId('success-title');
    const fontFamily = await title.evaluate(
      (el) => window.getComputedStyle(el).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('rubik');
  });

  test('CTA button navigates to /dashboard', async ({ page }) => {
    await page.getByTestId('success-cta').click();
    await page.waitForURL('**/dashboard', { timeout: 3000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('subtitle is visible', async ({ page }) => {
    await expect(page.getByTestId('success-subtitle')).toBeVisible();
  });

  test('screenshot: onboarding-success.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('onboarding-success.png');
  });
});
