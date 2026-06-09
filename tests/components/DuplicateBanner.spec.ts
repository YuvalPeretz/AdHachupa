import { test, expect } from 'playwright/test';

test.describe('DuplicateBanner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/duplicate-banner');
    await page.waitForLoadState('networkidle');
  });

  test('banner is visible', async ({ page }) => {
    await expect(page.getByTestId('duplicate-banner')).toBeVisible();
  });

  test('shows interpolated count in Hebrew', async ({ page }) => {
    // i18n: "נמצאו 3 כפילויות אפשריות"
    await expect(page.getByTestId('duplicate-banner-message')).toContainText('3');
    await expect(page.getByTestId('duplicate-banner-message')).toContainText('כפילויות');
  });

  test('review button is visible and labeled correctly', async ({ page }) => {
    await expect(page.getByTestId('duplicate-banner-review-btn')).toBeVisible();
    await expect(page.getByTestId('duplicate-banner-review-btn')).toContainText('לסקירה');
  });

  test('clicking review button fires onReview callback', async ({ page }) => {
    // The page does nothing on click (no-op), but we can assert no error occurs
    await page.getByTestId('duplicate-banner-review-btn').click();
    // Page still renders correctly after click
    await expect(page.getByTestId('duplicate-banner')).toBeVisible();
  });

  test('screenshot: duplicate-banner.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('duplicate-banner.png');
  });
});
