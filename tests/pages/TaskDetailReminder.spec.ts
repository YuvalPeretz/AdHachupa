/**
 * TaskDetailReminder page — visual + interaction tests
 *
 * Covers spec 3.3e:
 *  - Toggle ON state: champagne gold (not default browser blue)
 *  - Linked task chip shows event + task name
 *  - Screenshot: task-detail-reminder.png
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// task-4 is the reminder-type task
const REMINDER_TASK_URL = '/tasks/task-4';

test.describe('TaskDetailReminder', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto(REMINDER_TASK_URL);
    await expect(page.getByTestId('task-detail-reminder-page')).toBeVisible({ timeout: 5000 });
  });

  test('renders the reminder detail page', async ({ page }) => {
    await expect(page.getByTestId('task-detail-reminder-page')).toBeVisible();
  });

  test('date picker is visible', async ({ page }) => {
    await expect(page.getByTestId('reminder-date-picker')).toBeVisible();
  });

  test('time picker is visible', async ({ page }) => {
    await expect(page.getByTestId('reminder-time-picker')).toBeVisible();
  });

  test('notification toggle is visible', async ({ page }) => {
    await expect(page.getByTestId('notify-toggle')).toBeVisible();
  });

  test('notification toggle is ON by default (mock data has notifyEnabled=true)', async ({ page }) => {
    const toggle = page.getByTestId('notify-toggle');
    // Check the toggle is checked (ON state)
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  test('notification toggle ON state has gold color (not default blue)', async ({ page }) => {
    const toggle = page.getByTestId('notify-toggle');
    // The Switch should be checked (ON)
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    // Verify the inline style sets background to champagne gold
    // (browsers may convert hex to rgb)
    const style = await toggle.getAttribute('style');
    const hasGold = style?.includes('#C9A97A') || style?.includes('201, 169, 122') || style?.includes('rgb(201');
    expect(hasGold).toBe(true);
  });

  test('linked task chip is visible with event and task name', async ({ page }) => {
    const chip = page.getByTestId('linked-task-chip');
    await expect(chip).toBeVisible();
    const text = await chip.textContent();
    // Should contain event name and task name from mock data
    expect(text).toContain('חתונה');
    expect(text).toContain('תשלום מקדמה לאולם');
  });

  test('save button is visible', async ({ page }) => {
    await expect(page.getByTestId('reminder-save-btn')).toBeVisible();
  });

  test('toggling notification changes color state', async ({ page }) => {
    const toggle = page.getByTestId('notify-toggle');
    // Click to toggle OFF
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    // Click to toggle back ON
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  test('screenshot: task-detail-reminder', async ({ page }) => {
    await expect(page).toHaveScreenshot('task-detail-reminder.png');
  });
});
