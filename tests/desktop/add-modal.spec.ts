/**
 * Desktop Add flows — BottomSheet renders as a centered Modal at ≥1024px.
 *
 * Covers Add Guest / Add Task / Add Expense: on mobile these are antd Drawers
 * sliding up from the bottom; on desktop BottomSheet branches to a centered
 * antd Modal instead. Only meaningful on the Desktop Chrome project.
 */
import { test, expect, type Page } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('Add flows render as centered modals (desktop)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'BottomSheet only renders as a Modal on desktop');
    await mockAuthenticatedWithCouple(page);
  });

  async function expectCenteredModal(page: Page, formTestId: string) {
    await expect(page.getByTestId(formTestId)).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.locator('.ant-drawer')).toHaveCount(0);
  }

  test('Add Guest opens as a centered modal', async ({ page }) => {
    await page.goto('/guests');
    await expect(page.getByTestId('guest-list-page')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('add-guest-fab').click();
    await expectCenteredModal(page, 'add-guest-form');
  });

  test('Add Task opens as a centered modal', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.getByTestId('task-list-page')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('add-task-fab').click();
    await expectCenteredModal(page, 'add-task-form');
  });

  test('Add Expense opens as a centered modal', async ({ page }) => {
    await page.goto('/budget');
    await expect(page.getByTestId('budget-page')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('add-expense-fab').click();
    await expectCenteredModal(page, 'add-expense-form');
  });

  test('screenshot: add-guest-modal', async ({ page }) => {
    await page.goto('/guests');
    await expect(page.getByTestId('guest-list-page')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('add-guest-fab').click();
    await expect(page.getByTestId('add-guest-form')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveScreenshot('add-guest-modal.png');
  });
});
