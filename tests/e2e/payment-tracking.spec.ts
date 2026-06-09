/**
 * E2E: Payment tracking flow
 *
 * Mark advance paid → balance updates → task auto-closes on full payment
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

const PAYMENT_TASK_URL = '/tasks/task-2';

test.describe('E2E: Payment tracking', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto(PAYMENT_TASK_URL);
    await expect(page.getByTestId('task-detail-payment-unpaid')).toBeVisible({ timeout: 5000 });
  });

  test('advance toggle starts as OFF (unpaid)', async ({ page }) => {
    const toggle = page.getByTestId('advance-paid-toggle');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('marking advance paid turns toggle ON and shows green icon', async ({ page }) => {
    const toggle = page.getByTestId('advance-paid-toggle');
    await toggle.click();

    // Wait for mutation to complete
    await page.waitForTimeout(500);

    // The page testId should change to advance-paid
    await expect(page.getByTestId('task-detail-payment-advance-paid')).toBeVisible();

    // Advance icon should now be green (paid)
    await expect(page.getByTestId('advance-paid-icon')).toBeVisible();
    await expect(page.getByTestId('advance-unpaid-icon')).not.toBeVisible();
  });

  test('balance toggle is disabled until advance is paid', async ({ page }) => {
    const balanceToggle = page.getByTestId('balance-paid-toggle');
    // Balance toggle should be disabled when advance is not paid
    await expect(balanceToggle).toBeDisabled();
  });

  test('full payment flow: advance → balance → task closes', async ({ page }) => {
    // Step 1: Mark advance paid
    const advanceToggle = page.getByTestId('advance-paid-toggle');
    await advanceToggle.click();
    await page.waitForTimeout(500);

    // Should now show advance-paid state
    await expect(page.getByTestId('task-detail-payment-advance-paid')).toBeVisible();

    // Step 2: Mark balance paid (now enabled)
    const balanceToggle = page.getByTestId('balance-paid-toggle');
    await expect(balanceToggle).not.toBeDisabled();
    await balanceToggle.click();
    await page.waitForTimeout(500);

    // Should auto-close: fully paid banner appears
    await expect(page.getByTestId('fully-paid-banner')).toBeVisible();
    await expect(page.getByTestId('task-detail-payment-fully-paid')).toBeVisible();
  });

  test('save button is visible in unpaid state', async ({ page }) => {
    await expect(page.getByTestId('payment-save-btn')).toBeVisible();
  });
});
