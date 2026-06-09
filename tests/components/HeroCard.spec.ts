import { test, expect } from 'playwright/test';

test.describe('HeroCard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/hero-card');
    await page.waitForLoadState('networkidle');
  });

  test('event name renders', async ({ page }) => {
    await expect(page.getByTestId('hero-event-name')).toHaveText('החתונה של יובל ושיר');
  });

  test('event type renders', async ({ page }) => {
    await expect(page.getByTestId('hero-event-type')).toHaveText('חתונה');
  });

  test('countdown number is prominent', async ({ page }) => {
    await expect(page.getByTestId('hero-days-left')).toHaveText('87');
  });

  test('date and venue are shown', async ({ page }) => {
    const meta = page.getByTestId('hero-meta');
    await expect(meta).toContainText('12/09/2026');
    await expect(meta).toContainText('אולם הגן הקסום, תל אביב');
  });

  test('progress bar is visible', async ({ page }) => {
    await expect(page.getByTestId('hero-progress')).toBeVisible();
  });

  test('screenshot: hero-card.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('hero-card.png');
  });
});
