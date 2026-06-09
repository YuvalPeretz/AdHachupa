import { test, expect } from 'playwright/test';

test.describe('EventPillTab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/event-pill-tab');
    await page.waitForLoadState('networkidle');
  });

  test('3 event tabs render with Hebrew labels', async ({ page }) => {
    await expect(page.getByTestId('event-tab-event-1')).toHaveText('חתונה');
    await expect(page.getByTestId('event-tab-event-2')).toHaveText('חינה');
    await expect(page.getByTestId('event-tab-event-3')).toHaveText('קבלת פנים');
  });

  test('first tab is active by default (aria-current)', async ({ page }) => {
    await expect(page.getByTestId('event-tab-event-1')).toHaveAttribute('aria-current', 'true');
  });

  test('clicking a pill makes it active', async ({ page }) => {
    await page.getByTestId('event-tab-event-2').click();
    await expect(page.getByTestId('event-tab-event-2')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByTestId('event-tab-event-1')).not.toHaveAttribute('aria-current', 'true');
  });

  test('screenshot: event-pill-tab.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('event-pill-tab.png');
  });
});
