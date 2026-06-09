import { test, expect } from 'playwright/test';
import { mockAuthenticated } from '../fixtures/auth';

test.describe('Priorities & Vibe', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/priorities');
    await page.waitForLoadState('networkidle');
  });

  test('step indicator shows step 4 of 6', async ({ page }) => {
    const label = page.getByTestId('onboarding-step-label');
    await expect(label).toContainText('4');
    await expect(label).toContainText('6');
  });

  test('8 priority rows rendered', async ({ page }) => {
    const rows = page.getByTestId('priority-rows').locator('[data-testid^="priority-row-"]');
    await expect(rows).toHaveCount(8);
  });

  test('category labels are in Hebrew', async ({ page }) => {
    await expect(page.getByTestId('priority-row-venue')).toContainText('אולם ותפעול');
    await expect(page.getByTestId('priority-row-vendors')).toContainText('ספקים');
  });

  test('star rating is interactive', async ({ page }) => {
    // Click the 3rd star in the venue row
    const venueRow = page.getByTestId('priority-row-venue');
    const stars = venueRow.locator('.ant-rate-star');
    await stars.nth(2).click();
    // After click, at least some stars should be filled
    const filledStars = venueRow.locator('.ant-rate-star-full');
    await expect(filledStars).toHaveCount(3);
  });

  test('screenshot: priorities-unrated.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('priorities-unrated.png');
  });

  test('screenshot: priorities-rated.png', async ({ page }) => {
    // Rate a few categories
    const rows = ['venue', 'vendors', 'photography'];
    for (const cat of rows) {
      const row = page.getByTestId(`priority-row-${cat}`);
      const stars = row.locator('.ant-rate-star');
      await stars.nth(3).click(); // 4 stars
    }
    await expect(page).toHaveScreenshot('priorities-rated.png');
  });
});
