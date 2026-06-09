import { test, expect } from 'playwright/test';

test.describe('PageHeader', () => {
  test('back button renders on the right side (RTL)', async ({ page }) => {
    await page.goto('/test/page-header-with-back');
    const backButton = page.locator('[aria-label="חזרה"]');
    await expect(backButton).toBeVisible();
    const rect = await backButton.boundingBox();
    // In RTL layout the back button should be in the right half of the viewport
    // (inline-start = right in RTL, so x > half viewport width)
    const viewportWidth = page.viewportSize()!.width;
    expect(rect!.x).toBeGreaterThan(viewportWidth / 2);
  });

  test('title "כותרת בדיקה" is visible and centred', async ({ page }) => {
    await page.goto('/test/page-header-with-back');
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('כותרת בדיקה');

    // Verify the title is roughly centred within the viewport (±40px of centre)
    const rect = await title.boundingBox();
    const titleCentreX = rect!.x + rect!.width / 2;
    const viewportCentreX = page.viewportSize()!.width / 2;
    expect(Math.abs(titleCentreX - viewportCentreX)).toBeLessThan(40);
  });

  test('screenshot: page-header-with-back', async ({ page }) => {
    await page.goto('/test/page-header-with-back');
    await expect(page).toHaveScreenshot('page-header-with-back.png');
  });

  test('screenshot: page-header-no-back', async ({ page }) => {
    await page.goto('/test/page-header-no-back');
    await expect(page).toHaveScreenshot('page-header-no-back.png');
  });
});
