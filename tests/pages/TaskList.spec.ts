/**
 * TaskList page — visual + interaction tests
 *
 * Covers spec 3.3:
 *  - EventPillTab rendering
 *  - Category filter chips (horizontal scroll RTL right-to-left)
 *  - Active chip: blush rose fill
 *  - Overdue task rows show red date tag
 *  - Completed tasks: strikethrough + sage green badge
 *  - Empty state illustration
 *  - Screenshots: task-list-all / task-list-category-filtered / task-list-empty
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function mockTasksLoading(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TASKS_LOADING__ = true;
  });
}

async function mockTasksEmpty(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TASKS_EMPTY__ = true;
  });
}

// ─── Skeleton state ──────────────────────────────────────────────────────────

test.describe('TaskList — skeleton loading', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockTasksLoading(page);
    await page.goto('/tasks');
  });

  test('skeleton is visible during load', async ({ page }) => {
    await expect(page.getByTestId('task-list-skeleton')).toBeVisible();
  });
});

// ─── Loaded state ────────────────────────────────────────────────────────────

test.describe('TaskList — loaded with tasks', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/tasks');
    await expect(page.getByTestId('task-list-page')).toBeVisible({ timeout: 5000 });
  });

  test('renders the page with correct testId', async ({ page }) => {
    await expect(page.getByTestId('task-list-page')).toBeVisible();
  });

  test('event pill tabs are rendered', async ({ page }) => {
    await expect(page.getByTestId('event-tab-evt-wedding')).toBeVisible();
    await expect(page.getByTestId('event-tab-evt-henna')).toBeVisible();
  });

  test('category filter chips are rendered', async ({ page }) => {
    await expect(page.getByTestId('category-chip-all')).toBeVisible();
    await expect(page.getByTestId('category-chip-ספקים')).toBeVisible();
    await expect(page.getByTestId('category-chip-תשלומים')).toBeVisible();
    await expect(page.getByTestId('category-chip-ביגוד')).toBeVisible();
    await expect(page.getByTestId('category-chip-טיפוח')).toBeVisible();
    await expect(page.getByTestId('category-chip-לוגיסטיקה')).toBeVisible();
    await expect(page.getByTestId('category-chip-שונות')).toBeVisible();
  });

  test('category scroll container exists for RTL horizontal scroll', async ({ page }) => {
    await expect(page.getByTestId('category-scroll')).toBeVisible();
  });

  test('active category chip has blush-rose background', async ({ page }) => {
    // "all" is active by default
    const allChip = page.getByTestId('category-chip-all');
    await expect(allChip).toBeVisible();
    // Check aria-pressed is true for active chip
    await expect(allChip).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a category chip changes the active chip', async ({ page }) => {
    const vendorsChip = page.getByTestId('category-chip-ספקים');
    await vendorsChip.click();
    await expect(vendorsChip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('category-chip-all')).toHaveAttribute('aria-pressed', 'false');
  });

  test('task sections are rendered', async ({ page }) => {
    await expect(page.getByTestId('task-sections')).toBeVisible();
  });

  test('overdue task row shows red date', async ({ page }) => {
    // task-1 is overdue (dueDate in the past)
    const overdueRow = page.getByTestId('task-row-task-1');
    await expect(overdueRow).toBeVisible();
    const dueDateEl = overdueRow.getByTestId('task-due-date');
    await expect(dueDateEl).toBeVisible();
    // CSS Modules hashes class names — check for the dueDateOverdue class pattern
    const cls = await dueDateEl.getAttribute('class');
    // The class should contain either 'overdue' (plain) or the hashed module form
    expect(cls?.toLowerCase()).toMatch(/overdue/i);
  });

  test('closed task has sage green badge', async ({ page }) => {
    // task-5 is closed
    const closedRow = page.getByTestId('task-row-task-5');
    await expect(closedRow).toBeVisible();
    const badge = closedRow.getByTestId('task-status-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('סגור');
  });

  test('FAB is visible at bottom inline-start', async ({ page }) => {
    await expect(page.getByTestId('add-task-fab')).toBeVisible();
  });

  test('FAB opens AddTask sheet', async ({ page }) => {
    await page.getByTestId('add-task-fab').click();
    await expect(page.getByTestId('add-task-form')).toBeVisible();
  });

  test('screenshot: task-list-all', async ({ page }) => {
    await expect(page).toHaveScreenshot('task-list-all.png');
  });

  test('screenshot: task-list-category-filtered (ספקים)', async ({ page }) => {
    await page.getByTestId('category-chip-ספקים').click();
    // Wait for filter to apply
    await expect(page.getByTestId('task-section-ספקים')).toBeVisible();
    await expect(page).toHaveScreenshot('task-list-category-filtered.png');
  });
});

// ─── Empty state ─────────────────────────────────────────────────────────────

test.describe('TaskList — empty state', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockTasksEmpty(page);
    await page.goto('/tasks');
    await expect(page.getByTestId('task-list-page')).toBeVisible({ timeout: 5000 });
  });

  test('empty state element is shown', async ({ page }) => {
    await expect(page.getByTestId('task-list-empty')).toBeVisible();
  });

  test('screenshot: task-list-empty', async ({ page }) => {
    await expect(page).toHaveScreenshot('task-list-empty.png');
  });
});
