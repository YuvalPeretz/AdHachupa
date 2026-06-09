/**
 * AddExpenseSheet feature — visual + interaction tests
 *
 * Covers spec 3.4a:
 *  - Selecting "per guest" billing unit shows live total hint (₪X × N אורחים)
 *  - Total field updates on each unit-price keystroke
 *  - BillingUnitSelector renders identically to Task Payment Detail
 *  - Screenshot: add-expense-sheet-per-item.png, add-expense-sheet-per-guest.png
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openExpenseSheet(page: import('playwright/test').Page) {
  await page.goto('/budget');
  await expect(page.getByTestId('budget-page')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('add-expense-fab').click();
  await expect(page.getByTestId('add-expense-form')).toBeVisible({ timeout: 3000 });
}

// ─── Sheet presence & fields ─────────────────────────────────────────────────

test.describe('AddExpenseSheet — field presence', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await openExpenseSheet(page);
  });

  test('form is visible after FAB tap', async ({ page }) => {
    await expect(page.getByTestId('add-expense-form')).toBeVisible();
  });

  test('item name input renders', async ({ page }) => {
    await expect(page.getByTestId('expense-name-input')).toBeVisible();
  });

  test('category chips render', async ({ page }) => {
    await expect(page.getByTestId('expense-category-chips')).toBeVisible();
  });

  test('BillingUnitSelector renders with correct data-testid', async ({ page }) => {
    // Same data-testid as in TaskDetailPayment — shared component
    await expect(page.getByTestId('billing-unit-selector')).toBeVisible();
  });

  test('priority chips render', async ({ page }) => {
    await expect(page.getByTestId('expense-priority-chips')).toBeVisible();
    await expect(page.getByTestId('expense-priority-required')).toBeVisible();
    await expect(page.getByTestId('expense-priority-optional')).toBeVisible();
  });

  test('"הוסף הוצאה" button is disabled when name is empty', async ({ page }) => {
    await expect(page.getByTestId('expense-save-btn')).toBeDisabled();
  });

  test('"הוסף הוצאה" button is enabled after typing a name', async ({ page }) => {
    await page.getByTestId('expense-name-input').fill('הדפסת הזמנות');
    await expect(page.getByTestId('expense-save-btn')).toBeEnabled();
  });

  test('cancel button closes the sheet', async ({ page }) => {
    await page.getByTestId('expense-cancel-btn').dispatchEvent('click');
    await expect(page.getByTestId('add-expense-form')).not.toBeVisible();
  });

  test('screenshot: add-expense-sheet-per-item', async ({ page }) => {
    // Fill a name so the save button activates
    await page.getByTestId('expense-name-input').fill('הדפסת הזמנות');
    await expect(page).toHaveScreenshot('add-expense-sheet-per-item.png');
  });
});

// ─── Per-guest billing unit — live calculation ───────────────────────────────

test.describe('AddExpenseSheet — per-guest billing unit', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await openExpenseSheet(page);
    // Switch to per-guest billing unit
    // The BillingUnitSelector is a Segmented component — click the "לפי אורח" segment
    await page.getByTestId('billing-unit-selector').getByText('לפי אורח').click();
  });

  test('switching to per-guest hides per-item cost field, shows unit price field', async ({ page }) => {
    await expect(page.getByTestId('expense-unit-price')).toBeVisible();
    await expect(page.getByTestId('expense-estimated-cost')).not.toBeVisible();
  });

  test('per-guest hint shows after typing unit price', async ({ page }) => {
    // The hint should not be visible before entering a price
    await expect(page.getByTestId('per-guest-hint')).not.toBeVisible();

    // Enter a unit price
    await page.getByTestId('expense-unit-price').click();
    await page.getByTestId('expense-unit-price').fill('15');

    // Hint should now appear: ₪15 × 103 אורחים = ₪1,545
    await expect(page.getByTestId('per-guest-hint')).toBeVisible();
    await expect(page.getByTestId('per-guest-hint')).toContainText('×');
    await expect(page.getByTestId('per-guest-hint')).toContainText('103');
  });

  test('live total display updates on each keystroke', async ({ page }) => {
    const unitPriceInput = page.getByTestId('expense-unit-price');

    // Enter "1" → total should be 1 × 103 = 103
    await unitPriceInput.click();
    await unitPriceInput.fill('1');
    await expect(page.getByTestId('expense-total-display')).toBeVisible();

    // Enter "10" → total should be 10 × 103 = 1030
    await unitPriceInput.fill('10');
    const totalText = await page.getByTestId('expense-total-display').innerText();
    expect(totalText).toContain('1,030');
  });

  test('per-guest hint text contains ₪ symbol', async ({ page }) => {
    await page.getByTestId('expense-unit-price').click();
    await page.getByTestId('expense-unit-price').fill('20');
    const hintText = await page.getByTestId('per-guest-hint').innerText();
    expect(hintText).toContain('₪');
  });

  test('BillingUnitSelector has same structure as in TaskDetailPayment', async ({ page }) => {
    // Verify the shared component renders with the same data-testid
    const selector = page.getByTestId('billing-unit-selector');
    await expect(selector).toBeVisible();
    // Segmented control should show all 3 billing units
    await expect(selector.getByText('לפי פריט')).toBeVisible();
    await expect(selector.getByText('לפי אורח')).toBeVisible();
    await expect(selector.getByText('לפי שעה')).toBeVisible();
  });

  test('screenshot: add-expense-sheet-per-guest', async ({ page }) => {
    await page.getByTestId('expense-name-input').fill('הדפסת הזמנות');
    await page.getByTestId('expense-unit-price').click();
    await page.getByTestId('expense-unit-price').fill('15');
    // Wait for live total to render
    await expect(page.getByTestId('per-guest-hint')).toBeVisible();
    await expect(page).toHaveScreenshot('add-expense-sheet-per-guest.png');
  });
});

// ─── BillingUnitSelector consistency test ───────────────────────────────────

test.describe('BillingUnitSelector — visual consistency across AddExpenseSheet and TaskDetailPayment', () => {
  test('BillingUnitSelector in AddExpenseSheet has data-testid billing-unit-selector', async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await openExpenseSheet(page);
    await expect(page.getByTestId('billing-unit-selector')).toBeVisible();
  });

  test('BillingUnitSelector in TaskDetailPayment also has data-testid billing-unit-selector', async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/tasks/task-2');
    await expect(page.getByTestId('task-detail-payment-unpaid')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('billing-unit-selector')).toBeVisible();
  });
});
