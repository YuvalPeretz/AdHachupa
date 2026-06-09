import { test, expect } from 'playwright/test';
import { mockAuthenticated } from '../fixtures/auth';

test.describe('Couple Info', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/couple-info');
    await page.waitForLoadState('networkidle');
  });

  test('step indicator shows step 6 of 6', async ({ page }) => {
    const label = page.getByTestId('onboarding-step-label');
    await expect(label).toContainText('6');
  });

  test('two name fields are visible side-by-side', async ({ page }) => {
    await expect(page.getByTestId('couple-name1')).toBeVisible();
    await expect(page.getByTestId('couple-name2')).toBeVisible();
    // Both in the same name-fields row
    await expect(page.getByTestId('name-fields')).toBeVisible();
  });

  test('gender chip selectors render for both partners', async ({ page }) => {
    await expect(page.getByTestId('gender-chips-1')).toBeVisible();
    await expect(page.getByTestId('gender-chips-2')).toBeVisible();
    // Hebrew labels
    await expect(page.getByTestId('gender1-male')).toContainText('זכר');
    await expect(page.getByTestId('gender1-female')).toContainText('נקבה');
    await expect(page.getByTestId('gender1-other')).toContainText('אחר');
  });

  test('gender chip click updates aria-pressed', async ({ page }) => {
    const maleChip = page.getByTestId('gender1-male');
    await maleChip.click();
    await expect(maleChip).toHaveAttribute('aria-pressed', 'true');
  });

  test('region dropdown opens in Hebrew', async ({ page }) => {
    const regionSelect = page.getByTestId('couple-region');
    // Open the dropdown
    await regionSelect.click();
    // Check Hebrew options appear
    await expect(page.getByText('תל אביב והמרכז')).toBeVisible();
    await expect(page.getByText('ירושלים')).toBeVisible();
  });

  test('kosher toggle is visible and toggleable', async ({ page }) => {
    const toggle = page.getByTestId('couple-kosher');
    await expect(toggle).toBeVisible();
    await toggle.click();
  });

  test('submit button is visible with Hebrew text', async ({ page }) => {
    const submitBtn = page.getByTestId('onboarding-next');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('סיום');
  });

  test('submit navigates to success', async ({ page }) => {
    await page.getByTestId('onboarding-next').click();
    await page.waitForURL('**/onboarding/success', { timeout: 3000 });
    await expect(page).toHaveURL('/onboarding/success');
  });

  test('screenshot: couple-info-empty.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('couple-info-empty.png');
  });

  test('screenshot: couple-info-filled.png', async ({ page }) => {
    await page.getByTestId('couple-name1').fill('שיר');
    await page.getByTestId('couple-name2').fill('יובל');
    await page.getByTestId('gender1-female').click();
    await page.getByTestId('gender2-male').click();
    // Select region
    await page.getByTestId('couple-region').click();
    await page.getByText('תל אביב והמרכז').click();
    // Toggle kosher
    await page.getByTestId('couple-kosher').click();
    await expect(page).toHaveScreenshot('couple-info-filled.png');
  });
});
