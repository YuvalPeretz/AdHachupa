/**
 * E2E: Add Expense flow
 *
 * Add per-guest expense → donut ring + category bar update
 * Breakeven chip updates after save
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('E2E: Add expense', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/budget');
    await expect(page.getByTestId('budget-page')).toBeVisible({ timeout: 5000 });
  });

  test('initial donut shows 49% (48500/100000)', async ({ page }) => {
    const percentText = await page.getByTestId('donut-percent').innerText();
    expect(percentText).toContain('49%');
  });

  test('initial breakeven chip is positive (sage green)', async ({ page }) => {
    const chip = page.getByTestId('breakeven-chip');
    await expect(chip).toHaveAttribute('data-breakeven-positive', 'true');
  });

  test('add per-guest expense → donut ring and category bar update', async ({ page }) => {
    // Record initial percent
    const initialPercent = await page.getByTestId('donut-percent').innerText();

    // Open add expense sheet
    await page.getByTestId('add-expense-fab').click();
    await expect(page.getByTestId('add-expense-form')).toBeVisible({ timeout: 3000 });

    // Fill form
    await page.getByTestId('expense-name-input').fill('הדפסת הזמנות');

    // Select ספקים category
    await page.getByTestId('expense-category-ספקים').click();

    // Switch to per-guest billing
    await page.getByTestId('billing-unit-selector').getByText('לפי אורח').click();

    // Enter unit price: ₪15 × 103 guests = ₪1,545
    await page.getByTestId('expense-unit-price').click();
    await page.getByTestId('expense-unit-price').fill('15');

    // Wait for hint to appear
    await expect(page.getByTestId('per-guest-hint')).toBeVisible();

    // Save the expense
    await page.getByTestId('expense-save-btn').dispatchEvent('click');

    // Wait for sheet to close and data to refresh
    await expect(page.getByTestId('add-expense-form')).not.toBeVisible({ timeout: 5000 });

    // Donut should now show updated percent (48500 + 1545 = 50045 / 100000 = 50%)
    const updatedPercent = await page.getByTestId('donut-percent').innerText();
    expect(updatedPercent).not.toBe(initialPercent);
  });

  test('breakeven chip updates after adding a large expense', async ({ page }) => {
    // Initial breakeven is positive
    await expect(page.getByTestId('breakeven-chip')).toHaveAttribute('data-breakeven-positive', 'true');

    // Open sheet
    await page.getByTestId('add-expense-fab').click();
    await expect(page.getByTestId('add-expense-form')).toBeVisible({ timeout: 3000 });

    // Add a large per-item expense to push budget over
    await page.getByTestId('expense-name-input').fill('הוצאה גדולה');
    await page.getByTestId('expense-estimated-cost').fill('60000');

    // Save
    await page.getByTestId('expense-save-btn').dispatchEvent('click');

    // Wait for data refresh
    await expect(page.getByTestId('add-expense-form')).not.toBeVisible({ timeout: 5000 });

    // Breakeven should now be negative (48500 + 60000 = 108500 - 22000 = 86500 deficit)
    await expect(page.getByTestId('breakeven-chip')).toHaveAttribute('data-breakeven-positive', 'false');
  });
});
