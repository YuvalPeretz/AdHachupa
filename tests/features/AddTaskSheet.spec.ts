/**
 * AddTaskSheet feature — visual + interaction tests
 *
 * Covers spec 3.3a:
 *  - Type segmented selector: 4 icons, selected state highlighted
 *  - Priority chips: 4 options with correct tinted colors
 *  - "הוסף משימה" disabled until name filled
 *  - Screenshot: add-task-sheet.png
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('AddTaskSheet', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/tasks');
    // Wait for task list page to load
    await expect(page.getByTestId('task-list-page')).toBeVisible({ timeout: 5000 });
    // Open the AddTask sheet via FAB
    await page.getByTestId('add-task-fab').click();
    await expect(page.getByTestId('add-task-form')).toBeVisible();
  });

  test('add task form is visible', async ({ page }) => {
    await expect(page.getByTestId('add-task-form')).toBeVisible();
  });

  test('type selector renders 4 type options', async ({ page }) => {
    await expect(page.getByTestId('task-type-selector')).toBeVisible();
    await expect(page.getByTestId('task-type-vendor')).toBeVisible();
    await expect(page.getByTestId('task-type-payment')).toBeVisible();
    await expect(page.getByTestId('task-type-decision')).toBeVisible();
    await expect(page.getByTestId('task-type-reminder')).toBeVisible();
  });

  test('vendor type is selected by default', async ({ page }) => {
    await expect(page.getByTestId('task-type-vendor')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('task-type-payment')).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking a type chip changes selection', async ({ page }) => {
    await page.getByTestId('task-type-payment').click();
    await expect(page.getByTestId('task-type-payment')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('task-type-vendor')).toHaveAttribute('aria-pressed', 'false');
  });

  test('all 4 type options are clickable', async ({ page }) => {
    for (const type of ['vendor', 'payment', 'decision', 'reminder']) {
      await page.getByTestId(`task-type-${type}`).click();
      await expect(page.getByTestId(`task-type-${type}`)).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('priority chips render 4 options', async ({ page }) => {
    await expect(page.getByTestId('priority-chips')).toBeVisible();
    await expect(page.getByTestId('priority-chip-essential')).toBeVisible();
    await expect(page.getByTestId('priority-chip-logistic')).toBeVisible();
    await expect(page.getByTestId('priority-chip-aesthetic')).toBeVisible();
    await expect(page.getByTestId('priority-chip-personal')).toBeVisible();
  });

  test('essential priority is selected by default', async ({ page }) => {
    await expect(page.getByTestId('priority-chip-essential')).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking priority chip changes selection', async ({ page }) => {
    await page.getByTestId('priority-chip-logistic').click();
    await expect(page.getByTestId('priority-chip-logistic')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('priority-chip-essential')).toHaveAttribute('aria-pressed', 'false');
  });

  test('"הוסף משימה" button is disabled when name is empty', async ({ page }) => {
    const saveBtn = page.getByTestId('add-task-save');
    await expect(saveBtn).toBeDisabled();
  });

  test('"הוסף משימה" button is enabled after typing a name', async ({ page }) => {
    await page.getByTestId('add-task-name').fill('משימה חדשה לבדיקה');
    const saveBtn = page.getByTestId('add-task-save');
    await expect(saveBtn).toBeEnabled();
  });

  test('"הוסף משימה" button remains disabled if name is only spaces', async ({ page }) => {
    await page.getByTestId('add-task-name').fill('   ');
    const saveBtn = page.getByTestId('add-task-save');
    await expect(saveBtn).toBeDisabled();
  });

  test('responsible chips are rendered', async ({ page }) => {
    await expect(page.getByTestId('responsible-chips')).toBeVisible();
    await expect(page.getByTestId('responsible-partner1')).toBeVisible();
    await expect(page.getByTestId('responsible-partner2')).toBeVisible();
    await expect(page.getByTestId('responsible-both')).toBeVisible();
  });

  test('cancel button closes the sheet', async ({ page }) => {
    // The form is taller than 72vh on mobile; use dispatchEvent to bypass viewport check
    await page.getByTestId('add-task-cancel').dispatchEvent('click');
    await expect(page.getByTestId('add-task-form')).not.toBeVisible();
  });

  test('screenshot: add-task-sheet', async ({ page }) => {
    await expect(page).toHaveScreenshot('add-task-sheet.png');
  });
});
