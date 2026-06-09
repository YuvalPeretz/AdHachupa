import { test, expect } from 'playwright/test';

test.describe('BottomSheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/bottom-sheet');
    await page.waitForLoadState('networkidle');
  });

  test('page renders without the sheet', async ({ page }) => {
    await expect(page.getByTestId('open-button')).toBeVisible();
    // The sheet content should not be in the DOM when closed
    await expect(page.getByTestId('sheet-content')).not.toBeVisible();
  });

  test('sheet opens when button is clicked', async ({ page }) => {
    await page.getByTestId('open-button').click();
    await expect(page.getByTestId('sheet-content')).toBeVisible();
  });

  test('sheet title is visible when open', async ({ page }) => {
    await page.getByTestId('open-button').click();
    await expect(page.getByText('הוסף אורח')).toBeVisible();
  });

  test('screenshot: bottom-sheet-closed.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('bottom-sheet-closed.png');
  });

  test('screenshot: bottom-sheet-open.png', async ({ page }) => {
    await page.getByTestId('open-button').click();
    // Wait for animation to complete
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot('bottom-sheet-open.png');
  });
});
