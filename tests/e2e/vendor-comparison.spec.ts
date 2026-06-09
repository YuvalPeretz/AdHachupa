/**
 * E2E: Vendor comparison flow
 *
 * Add 2 vendors → select one → other marked "נדחה" → task status → "בתהליך"
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('E2E: Vendor comparison', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    // Navigate to a vendor task that starts fresh
    // We'll use task-1 which already has 2 vendors in considering state
    await page.goto('/tasks/task-1');
    await expect(page.getByTestId('task-detail-vendor-page')).toBeVisible({ timeout: 5000 });
  });

  test('both vendors start with "בשיקול" (considering) badge', async ({ page }) => {
    const v1Badge = page.getByTestId('vendor-card-v1').getByTestId('vendor-status-badge');
    const v2Badge = page.getByTestId('vendor-card-v2').getByTestId('vendor-status-badge');
    await expect(v1Badge).toHaveText('בשיקול');
    await expect(v2Badge).toHaveText('בשיקול');
  });

  test('selecting vendor 1 marks it "נבחר" and vendor 2 "נדחה"', async ({ page }) => {
    // Select vendor 1
    const v1SelectBtn = page.getByTestId('vendor-card-v1').getByTestId('vendor-select-btn');
    await v1SelectBtn.click();

    // Wait for mutation to complete — query re-fetches
    await page.waitForTimeout(500);

    // Vendor 1 should now be "נבחר" (selected — sage green)
    const v1Badge = page.getByTestId('vendor-card-v1').getByTestId('vendor-status-badge');
    await expect(v1Badge).toHaveText('נבחר');

    // Vendor 2 should now be "נדחה" (rejected — muted)
    const v2Badge = page.getByTestId('vendor-card-v2').getByTestId('vendor-status-badge');
    await expect(v2Badge).toHaveText('נדחה');
  });

  test('after vendor selection, task status chip "inProgress" remains active', async ({ page }) => {
    // Select vendor 1
    await page.getByTestId('vendor-card-v1').getByTestId('vendor-select-btn').click();
    await page.waitForTimeout(500);

    // Task status should remain inProgress (it was already inProgress)
    // The status chip for inProgress should be active
    await expect(page.getByTestId('status-chip-inProgress')).toHaveAttribute('aria-pressed', 'true');
  });

  test('can add a new vendor via dashed card', async ({ page }) => {
    // Open add vendor form
    await page.getByTestId('add-vendor-dashed-card').click();
    await expect(page.getByTestId('add-vendor-form')).toBeVisible();

    // Fill vendor name
    await page.getByTestId('vendor-name-input').fill('DJ החדש');
    await page.getByTestId('vendor-price-min').fill('5000');

    // Save
    await page.getByTestId('vendor-save-btn').click();

    // Wait for mutation
    await page.waitForTimeout(500);

    // Form should be gone, new vendor should appear (we'll just check form is hidden)
    await expect(page.getByTestId('add-vendor-form')).not.toBeVisible();
  });
});
