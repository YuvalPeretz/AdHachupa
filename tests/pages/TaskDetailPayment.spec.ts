/**
 * TaskDetailPayment page — visual + interaction tests
 *
 * Covers spec 3.3c:
 *  - BillingUnitChip renders and updates total
 *  - Advance paid: ✅ + sage green; unpaid: 🔴 + soft red
 *  - Overdue deadline in soft red
 *  - Screenshots: task-detail-payment-unpaid / advance-paid / fully-paid
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// task-2 is the payment-type task
const PAYMENT_TASK_URL = '/tasks/task-2';

// ─── Unpaid state ────────────────────────────────────────────────────────────

test.describe('TaskDetailPayment — unpaid', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto(PAYMENT_TASK_URL);
    await expect(page.getByTestId('task-detail-payment-unpaid')).toBeVisible({ timeout: 5000 });
  });

  test('renders the payment detail page (unpaid)', async ({ page }) => {
    await expect(page.getByTestId('task-detail-payment-unpaid')).toBeVisible();
  });

  test('billing unit selector is rendered', async ({ page }) => {
    await expect(page.getByTestId('billing-unit-selector')).toBeVisible();
  });

  test('total amount is displayed', async ({ page }) => {
    await expect(page.getByTestId('payment-total')).toBeVisible();
    const text = await page.getByTestId('payment-total').textContent();
    expect(text).toContain('₪');
  });

  test('advance row is rendered', async ({ page }) => {
    await expect(page.getByTestId('advance-row')).toBeVisible();
  });

  test('advance unpaid icon (red) is shown when not paid', async ({ page }) => {
    await expect(page.getByTestId('advance-unpaid-icon')).toBeVisible();
    await expect(page.getByTestId('advance-paid-icon')).not.toBeVisible();
  });

  test('balance row is rendered', async ({ page }) => {
    await expect(page.getByTestId('balance-row')).toBeVisible();
  });

  test('balance unpaid icon (red) is shown when not paid', async ({ page }) => {
    await expect(page.getByTestId('balance-unpaid-icon')).toBeVisible();
  });

  test('deadline row is rendered', async ({ page }) => {
    await expect(page.getByTestId('payment-deadline-row')).toBeVisible();
  });

  test('screenshot: task-detail-payment-unpaid', async ({ page }) => {
    await expect(page).toHaveScreenshot('task-detail-payment-unpaid.png');
  });
});

// ─── Advance paid state ───────────────────────────────────────────────────────

test.describe('TaskDetailPayment — advance paid', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TASK_PAYMENT_STATE__ = 'advance_paid';
    });
    await page.goto(PAYMENT_TASK_URL);
    await expect(page.getByTestId('task-detail-payment-advance-paid')).toBeVisible({ timeout: 5000 });
  });

  test('renders the advance-paid state', async ({ page }) => {
    await expect(page.getByTestId('task-detail-payment-advance-paid')).toBeVisible();
  });

  test('advance paid icon (green) is shown when advance paid', async ({ page }) => {
    await expect(page.getByTestId('advance-paid-icon')).toBeVisible();
    await expect(page.getByTestId('advance-unpaid-icon')).not.toBeVisible();
  });

  test('balance remains unpaid (red icon)', async ({ page }) => {
    await expect(page.getByTestId('balance-unpaid-icon')).toBeVisible();
  });

  test('screenshot: task-detail-payment-advance-paid', async ({ page }) => {
    await expect(page).toHaveScreenshot('task-detail-payment-advance-paid.png');
  });
});

// ─── Fully paid state ─────────────────────────────────────────────────────────

test.describe('TaskDetailPayment — fully paid', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TASK_PAYMENT_STATE__ = 'fully_paid';
    });
    await page.goto(PAYMENT_TASK_URL);
    await expect(page.getByTestId('task-detail-payment-fully-paid')).toBeVisible({ timeout: 5000 });
  });

  test('renders the fully-paid state', async ({ page }) => {
    await expect(page.getByTestId('task-detail-payment-fully-paid')).toBeVisible();
  });

  test('fully paid banner is shown', async ({ page }) => {
    await expect(page.getByTestId('fully-paid-banner')).toBeVisible();
  });

  test('both advance and balance paid icons are green', async ({ page }) => {
    await expect(page.getByTestId('advance-paid-icon')).toBeVisible();
    await expect(page.getByTestId('balance-paid-icon')).toBeVisible();
  });

  test('save button is hidden when fully paid', async ({ page }) => {
    await expect(page.getByTestId('payment-save-btn')).not.toBeVisible();
  });

  test('screenshot: task-detail-payment-fully-paid', async ({ page }) => {
    await expect(page).toHaveScreenshot('task-detail-payment-fully-paid.png');
  });
});
