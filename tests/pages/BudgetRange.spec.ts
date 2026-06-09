import { test, expect } from 'playwright/test';
import { mockAuthenticated } from '../fixtures/auth';

test.describe('Budget Range', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/budget');
    await page.waitForLoadState('networkidle');
  });

  test('step indicator shows step 4 of 5', async ({ page }) => {
    const label = page.getByTestId('onboarding-step-label');
    await expect(label).toContainText('4');
    await expect(label).toContainText('5');
  });

  test('budget input is visible', async ({ page }) => {
    await expect(page.getByTestId('budget-total-input')).toBeVisible();
  });

  test('"הבא" disabled when no budget entered', async ({ page }) => {
    await expect(page.getByTestId('onboarding-next')).toBeDisabled();
  });

  test('entering a budget enables "הבא"', async ({ page }) => {
    await page.getByTestId('budget-total-input').fill('80000');
    await expect(page.getByTestId('onboarding-next')).toBeEnabled();
  });

  test('helper text is visible', async ({ page }) => {
    await expect(page.getByTestId('budget-helper-text')).toBeVisible();
  });

  test('screenshot: budget-range-empty.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('budget-range-empty.png');
  });

  test('screenshot: budget-range-filled.png', async ({ page }) => {
    await page.getByTestId('budget-total-input').fill('80000');
    await expect(page).toHaveScreenshot('budget-range-filled.png');
  });
});
