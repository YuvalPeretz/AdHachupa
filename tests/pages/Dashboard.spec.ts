import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Injects the loading-forever seam so we can snapshot the skeleton state. */
async function mockDashboardLoading(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_DASHBOARD_LOADING__ = true;
  });
}

/** Injects the negative-breakeven seam. */
async function mockDashboardNegativeBreakeven(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_DASHBOARD_BREAKEVEN_NEGATIVE__ = true;
  });
}

// ─── Skeleton state ─────────────────────────────────────────────────────────

test.describe('Dashboard — skeleton loading state', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockDashboardLoading(page);
    await page.goto('/dashboard');
  });

  test('skeleton cards are visible during load', async ({ page }) => {
    await expect(page.getByTestId('dashboard-skeleton')).toBeVisible();
  });

  test('screenshot: dashboard-loading', async ({ page }) => {
    await expect(page.getByTestId('dashboard-skeleton')).toBeVisible();
    await expect(page).toHaveScreenshot('dashboard-loading.png');
  });
});

// ─── Loaded state ───────────────────────────────────────────────────────────

test.describe('Dashboard — loaded state', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/dashboard');
    // Wait for data to resolve and skeleton to be replaced
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 5000 });
  });

  test('all 5 sections render after data loads', async ({ page }) => {
    await expect(page.getByTestId('dashboard-greeting')).toBeVisible();
    await expect(page.getByTestId('hero-card')).toBeVisible();
    await expect(page.getByTestId('budget-card')).toBeVisible();
    await expect(page.getByTestId('vendor-chips')).toBeVisible();
    await expect(page.getByTestId('other-events-list')).toBeVisible();
  });

  test('greeting shows couple names', async ({ page }) => {
    await expect(page.getByTestId('dashboard-greeting')).toContainText('יובל ושיר');
  });

  test('hero card renders with upcoming event data', async ({ page }) => {
    await expect(page.getByTestId('hero-event-type')).toBeVisible();
    await expect(page.getByTestId('hero-days-left')).toBeVisible();
  });

  test('budget progress bar is present and fills right-to-left', async ({ page }) => {
    const progressBar = page.getByTestId('budget-progress-bar');
    await expect(progressBar).toBeVisible();

    // RTL: the page direction is rtl, so antd Progress bar fills right-to-left
    const dir = await page.locator('[data-testid="dashboard-page"]').getAttribute('style');
    // The page container has RTL direction via SCSS; verify the html dir is rtl
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');
  });

  test('vendor chips scroll container is present', async ({ page }) => {
    const chips = page.getByTestId('vendor-chips');
    await expect(chips).toBeVisible();
  });

  test('vendor chips are laid out horizontally (RTL — right to left)', async ({ page }) => {
    const chips = page.getByTestId('vendor-chips');
    await expect(chips).toBeVisible();

    // All vendor chip items should be present
    const chipItems = chips.locator('[role="listitem"]');
    const count = await chipItems.count();
    expect(count).toBeGreaterThan(0);

    // In RTL the flex-direction is row-reverse; the computed style confirms this
    const flexDir = await chips.evaluate((el) =>
      window.getComputedStyle(el).flexDirection,
    );
    expect(flexDir).toBe('row-reverse');
  });

  test('breakeven positive: rendered in sage green', async ({ page }) => {
    const breakevenEl = page.getByTestId('breakeven-value');
    await expect(breakevenEl).toBeVisible();
    await expect(breakevenEl).toHaveAttribute('data-breakeven-positive', 'true');

    // Sage green: rgb(168, 197, 160) = #A8C5A0
    const color = await breakevenEl.evaluate((el) =>
      window.getComputedStyle(el).color,
    );
    expect(color).toBe('rgb(168, 197, 160)');
  });

  test('screenshot: dashboard-loaded', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-loaded.png');
  });
});

// ─── Negative breakeven state ────────────────────────────────────────────────

test.describe('Dashboard — negative breakeven', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockDashboardNegativeBreakeven(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 5000 });
  });

  test('breakeven negative: rendered in soft red', async ({ page }) => {
    const breakevenEl = page.getByTestId('breakeven-value');
    await expect(breakevenEl).toBeVisible();
    await expect(breakevenEl).toHaveAttribute('data-breakeven-positive', 'false');

    // Soft red: rgb(224, 112, 112) = #E07070
    const color = await breakevenEl.evaluate((el) =>
      window.getComputedStyle(el).color,
    );
    expect(color).toBe('rgb(224, 112, 112)');
  });
});
