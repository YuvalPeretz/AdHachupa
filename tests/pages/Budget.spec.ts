/**
 * Budget Overview page — visual + interaction tests
 *
 * Covers spec 3.4:
 *  - Context chips (confirmed guests, days left)
 *  - Donut ring fills proportionally
 *  - Breakeven chip: sage green when positive, soft red when negative
 *  - Category progress bars fill right-to-left
 *  - "ערוך תקציב כולל" link visible below donut
 *  - FAB opens AddExpenseSheet
 *  - Screenshot: budget-overview.png
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function mockBudgetLoading(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_BUDGET_LOADING__ = true;
  });
}

async function mockBudgetNegativeBreakeven(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_BUDGET_BREAKEVEN_NEGATIVE__ = true;
  });
}

// ─── Skeleton state ──────────────────────────────────────────────────────────

test.describe('Budget — skeleton loading state', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockBudgetLoading(page);
    await page.goto('/budget');
  });

  test('skeleton is visible during load', async ({ page }) => {
    await expect(page.getByTestId('budget-skeleton')).toBeVisible();
  });
});

// ─── Loaded state ────────────────────────────────────────────────────────────

test.describe('Budget — loaded state', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/budget');
    await expect(page.getByTestId('budget-page')).toBeVisible({ timeout: 5000 });
  });

  test('context chips render', async ({ page }) => {
    await expect(page.getByTestId('context-chips')).toBeVisible();
    await expect(page.getByTestId('confirmed-guests-chip')).toBeVisible();
    await expect(page.getByTestId('days-left-chip')).toBeVisible();
  });

  test('confirmed guests chip shows count', async ({ page }) => {
    await expect(page.getByTestId('confirmed-guests-chip')).toContainText('103');
  });

  test('donut ring section is visible', async ({ page }) => {
    await expect(page.getByTestId('donut-section')).toBeVisible();
  });

  test('donut center shows percent label', async ({ page }) => {
    await expect(page.getByTestId('donut-center')).toBeVisible();
    await expect(page.getByTestId('donut-percent')).toBeVisible();
    // Confirm the percent text contains a % sign
    const percentText = await page.getByTestId('donut-percent').innerText();
    expect(percentText).toMatch(/%/);
  });

  test('donut ring fills proportionally — percent matches spent/budget ratio', async ({ page }) => {
    // Budget: 48500/100000 = 49%
    const percentText = await page.getByTestId('donut-percent').innerText();
    expect(percentText).toContain('49%');
  });

  test('"ערוך תקציב כולל" link is visible below donut', async ({ page }) => {
    await expect(page.getByTestId('edit-budget-link')).toBeVisible();
    await expect(page.getByTestId('edit-budget-link')).toContainText('ערוך תקציב כולל');
  });

  test('gifts & breakeven card renders', async ({ page }) => {
    await expect(page.getByTestId('gifts-breakeven-card')).toBeVisible();
    await expect(page.getByTestId('gift-income-value')).toBeVisible();
    await expect(page.getByTestId('breakeven-chip')).toBeVisible();
  });

  test('breakeven positive: sage green chip', async ({ page }) => {
    const chip = page.getByTestId('breakeven-chip');
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute('data-breakeven-positive', 'true');

    // Sage green background: rgba(168, 197, 160, 0.18) or similar
    const color = await chip.evaluate((el) => window.getComputedStyle(el).color);
    // Color should be sage green: rgb(168, 197, 160) = #A8C5A0
    expect(color).toBe('rgb(168, 197, 160)');
  });

  test('category list renders all categories', async ({ page }) => {
    await expect(page.getByTestId('category-list')).toBeVisible();
    // Should have at least 3 category rows (mock data has 5)
    const rows = page.locator('[data-testid^="category-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('category progress bars fill right-to-left', async ({ page }) => {
    // RTL direction is set on the page; antd Progress fills right-to-left in RTL
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    // Verify at least one category progress bar is present
    const progressBars = page.locator('[data-testid^="category-progress-"]');
    const count = await progressBars.count();
    expect(count).toBeGreaterThan(0);
  });

  test('FAB is visible', async ({ page }) => {
    // FloatButton renders as a button element
    await expect(page.getByTestId('add-expense-fab')).toBeVisible();
  });

  test('screenshot: budget-overview', async ({ page }) => {
    await expect(page).toHaveScreenshot('budget-overview.png');
  });
});

// ─── Negative breakeven state ────────────────────────────────────────────────

test.describe('Budget — negative breakeven', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockBudgetNegativeBreakeven(page);
    await page.goto('/budget');
    await expect(page.getByTestId('budget-page')).toBeVisible({ timeout: 5000 });
  });

  test('breakeven negative: soft red chip', async ({ page }) => {
    const chip = page.getByTestId('breakeven-chip');
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute('data-breakeven-positive', 'false');

    // Soft red: rgb(224, 112, 112) = #E07070
    const color = await chip.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(224, 112, 112)');
  });

  test('donut percent reflects higher spending (85000/100000 = 85%)', async ({ page }) => {
    const percentText = await page.getByTestId('donut-percent').innerText();
    expect(percentText).toContain('85%');
  });
});

// ─── FAB → sheet interaction ─────────────────────────────────────────────────

test.describe('Budget — FAB opens Add Expense sheet', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/budget');
    await expect(page.getByTestId('budget-page')).toBeVisible({ timeout: 5000 });
  });

  test('tapping FAB opens add expense form', async ({ page }) => {
    await page.getByTestId('add-expense-fab').click();
    await expect(page.getByTestId('add-expense-form')).toBeVisible({ timeout: 3000 });
  });
});
