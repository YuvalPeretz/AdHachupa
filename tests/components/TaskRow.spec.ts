import { test, expect } from 'playwright/test';

test.describe('TaskRow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/task-row');
    await page.waitForLoadState('networkidle');
  });

  test('not-started: task name and status badge visible', async ({ page }) => {
    const row = page.getByTestId('task-row-task-not-started');
    await expect(row.getByTestId('task-name')).toHaveText('בחירת אולם אירועים');
    await expect(row.getByTestId('task-status-badge')).toContainText('טרם התחיל');
  });

  test('in-progress: amber status badge', async ({ page }) => {
    const row = page.getByTestId('task-row-task-in-progress');
    await expect(row.getByTestId('task-status-badge')).toContainText('בתהליך');
  });

  test('closed: strikethrough name and sage green badge', async ({ page }) => {
    const row = page.getByTestId('task-row-task-closed');
    const name = row.getByTestId('task-name');
    const textDecoration = await name.evaluate(
      (el) => getComputedStyle(el).textDecorationLine,
    );
    expect(textDecoration).toContain('line-through');
    await expect(row.getByTestId('task-status-badge')).toContainText('סגור');
  });

  test('overdue: due date renders in soft red', async ({ page }) => {
    const row = page.getByTestId('task-row-task-overdue');
    const dueDate = row.getByTestId('task-due-date');
    await expect(dueDate).toBeVisible();
    const color = await dueDate.evaluate((el) => getComputedStyle(el).color);
    // rgb(224, 112, 112) = #E07070
    expect(color).toBe('rgb(224, 112, 112)');
  });

  test('checkbox is visible on each row', async ({ page }) => {
    for (const id of ['task-not-started', 'task-in-progress', 'task-closed', 'task-overdue']) {
      await expect(page.getByTestId(`task-row-${id}`).getByTestId('task-checkbox')).toBeVisible();
    }
  });

  test('screenshot: task-row-not-started.png', async ({ page }) => {
    await expect(page.getByTestId('task-row-task-not-started')).toHaveScreenshot(
      'task-row-not-started.png',
    );
  });

  test('screenshot: task-row-in-progress.png', async ({ page }) => {
    await expect(page.getByTestId('task-row-task-in-progress')).toHaveScreenshot(
      'task-row-in-progress.png',
    );
  });

  test('screenshot: task-row-closed.png', async ({ page }) => {
    await expect(page.getByTestId('task-row-task-closed')).toHaveScreenshot(
      'task-row-closed.png',
    );
  });

  test('screenshot: task-row-overdue.png', async ({ page }) => {
    await expect(page.getByTestId('task-row-task-overdue')).toHaveScreenshot(
      'task-row-overdue.png',
    );
  });
});
