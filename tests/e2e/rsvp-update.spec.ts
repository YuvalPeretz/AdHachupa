/**
 * E2E: RSVP Update flow
 *
 * Tests:
 *  1. Tap RSVP chip → optimistic color change → save → stats update
 *  2. Network failure → chip reverts + toast appears
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('E2E: RSVP Update', () => {
  test('tap RSVP chip → optimistic change → chip stays changed after save', async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    // Navigate to guest g2 (אבי לוי, status: pending)
    await page.goto('/guests/g2');
    await expect(page.getByTestId('guest-detail-page')).toBeVisible({ timeout: 5000 });

    // Verify pending chip is currently active
    const pendingChip = page.getByTestId('rsvp-chip-pending');
    const confirmedChip = page.getByTestId('rsvp-chip-confirmed');
    await expect(pendingChip).toHaveAttribute('aria-pressed', 'true');

    // Tap the "confirmed" chip
    await confirmedChip.click();

    // Optimistic: confirmed should be active immediately
    await expect(confirmedChip).toHaveAttribute('aria-pressed', 'true');
    await expect(pendingChip).toHaveAttribute('aria-pressed', 'false');

    // After the mock resolves (~200ms), chip should still be confirmed
    await page.waitForTimeout(500);
    await expect(confirmedChip).toHaveAttribute('aria-pressed', 'true');

    // Now save the full detail
    const saveBtn = page.getByTestId('save-guest-btn');
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();

    // Wait for save to complete (loading spinner disappears)
    await page.waitForTimeout(500);
    // Chip should still be confirmed after save
    await expect(confirmedChip).toHaveAttribute('aria-pressed', 'true');
  });

  test('network failure → chip reverts and toast appears', async ({ page }) => {
    // Inject seam to make RSVP mutation fail
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_RSVP_FAIL__ = true;
    });
    await mockAuthenticatedWithCouple(page);
    await page.goto('/guests/g2');
    await expect(page.getByTestId('guest-detail-page')).toBeVisible({ timeout: 5000 });

    const pendingChip = page.getByTestId('rsvp-chip-pending');
    const confirmedChip = page.getByTestId('rsvp-chip-confirmed');

    // Initially pending is active
    await expect(pendingChip).toHaveAttribute('aria-pressed', 'true');

    // Tap confirmed — optimistic update fires
    await confirmedChip.click();

    // Momentarily confirmed is active (optimistic)
    await expect(confirmedChip).toHaveAttribute('aria-pressed', 'true');

    // After mock error fires (~200ms), should revert to pending
    await page.waitForTimeout(600);
    await expect(pendingChip).toHaveAttribute('aria-pressed', 'true');
    await expect(confirmedChip).toHaveAttribute('aria-pressed', 'false');

    // Toast should appear with error message
    // antd message renders in various selectors — try role="alert" or specific class
    const toastText = page.locator('text=שמירה נכשלה');
    await expect(toastText).toBeVisible({ timeout: 5000 });
  });
});
