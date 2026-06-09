import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('AppShell', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
  });

  test('app renders without crash at 393×852', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle('MeAndShir');
  });

  test('<html> has dir="rtl"', async ({ page }) => {
    await page.goto('/dashboard');
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('<html> has lang="he"', async ({ page }) => {
    await page.goto('/dashboard');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('he');
  });

  test('background color is warm ivory', async ({ page }) => {
    await page.goto('/dashboard');
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor,
    );
    // Accept rgb(253, 246, 236) which is #FDF6EC
    expect(bgColor).toBe('rgb(253, 246, 236)');
  });

  test('screenshot: shell-empty', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('shell-empty.png');
  });
});
