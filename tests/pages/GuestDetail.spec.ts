/**
 * GuestDetail page — visual + interaction tests
 *
 * Covers spec 3.2b:
 *  - PageHeader with back arrow on the right
 *  - antd Avatar (80px, initials via getInitials, Playfair Display font)
 *  - RSVP chips: אישר (sage green) / ממתין (amber) / ביטל (soft red)
 *  - Optimistic instant color change on tap
 *  - Delete section with thin soft-red border card
 *  - Screenshots: pending / confirmed / cancelled
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// g2 = אבי לוי — rsvpStatus: pending
// g1 = דנה כהן — rsvpStatus: confirmed
// g4 = יעקב ברוך — rsvpStatus: cancelled

async function goToGuest(page: import('playwright/test').Page, guestId: string) {
  await mockAuthenticatedWithCouple(page);
  await page.goto(`/guests/${guestId}`);
  await expect(page.getByTestId('guest-detail-page')).toBeVisible({ timeout: 5000 });
}

// ─── Pending guest (g2) ───────────────────────────────────────────────────────

test.describe('GuestDetail — pending guest', () => {
  test.beforeEach(async ({ page }) => {
    await goToGuest(page, 'g2');
  });

  test('guest name is displayed', async ({ page }) => {
    await expect(page.getByTestId('guest-detail-name')).toContainText('אבי לוי');
  });

  test('avatar is visible and has initials', async ({ page }) => {
    const avatar = page.getByTestId('guest-avatar');
    await expect(avatar).toBeVisible();
    await expect(avatar).toContainText('א'); // first char of אבי
  });

  test('all three RSVP chips are rendered', async ({ page }) => {
    await expect(page.getByTestId('rsvp-chip-confirmed')).toBeVisible();
    await expect(page.getByTestId('rsvp-chip-pending')).toBeVisible();
    await expect(page.getByTestId('rsvp-chip-cancelled')).toBeVisible();
  });

  test('pending chip is active', async ({ page }) => {
    await expect(page.getByTestId('rsvp-chip-pending')).toHaveAttribute('aria-pressed', 'true');
  });

  test('confirmed chip is not active', async ({ page }) => {
    await expect(page.getByTestId('rsvp-chip-confirmed')).toHaveAttribute('aria-pressed', 'false');
  });

  test('delete section card is visible with soft-red border', async ({ page }) => {
    const deleteSection = page.getByTestId('delete-section');
    await expect(deleteSection).toBeVisible();
    // Verify soft-red border color: #E07070
    const borderColor = await deleteSection.evaluate((el) =>
      window.getComputedStyle(el).borderColor,
    );
    expect(borderColor).toBe('rgb(224, 112, 112)');
  });

  test('back arrow is on the right side in RTL', async ({ page }) => {
    // PageHeader back button should be in the header's start slot (right side in RTL)
    const backBtn = page.locator('[aria-label="חזרה"]');
    await expect(backBtn).toBeVisible();
    const box = await backBtn.boundingBox();
    expect(box).not.toBeNull();
    // In RTL, "inline-start" is on the right side, so x should be > half viewport
    expect(box!.x).toBeGreaterThan(393 / 2);
  });

  test('5 cards are rendered', async ({ page }) => {
    await expect(page.getByTestId('contact-card')).toBeVisible();
    await expect(page.getByTestId('arrival-card')).toBeVisible();
    await expect(page.getByTestId('events-card')).toBeVisible();
    await expect(page.getByTestId('assignment-card')).toBeVisible();
    await expect(page.getByTestId('notes-card')).toBeVisible();
  });

  test('screenshot: guest-detail-pending', async ({ page }) => {
    await expect(page).toHaveScreenshot('guest-detail-pending.png');
  });
});

// ─── Confirmed guest (g1) ─────────────────────────────────────────────────────

test.describe('GuestDetail — confirmed guest', () => {
  test.beforeEach(async ({ page }) => {
    await goToGuest(page, 'g1');
  });

  test('confirmed chip is active', async ({ page }) => {
    await expect(page.getByTestId('rsvp-chip-confirmed')).toHaveAttribute('aria-pressed', 'true');
  });

  test('confirmed chip has sage green background when active', async ({ page }) => {
    const chip = page.getByTestId('rsvp-chip-confirmed');
    const bg = await chip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Sage green: #A8C5A0 = rgb(168, 197, 160)
    expect(bg).toBe('rgb(168, 197, 160)');
  });

  test('screenshot: guest-detail-confirmed', async ({ page }) => {
    await expect(page).toHaveScreenshot('guest-detail-confirmed.png');
  });
});

// ─── Cancelled guest (g4) ─────────────────────────────────────────────────────

test.describe('GuestDetail — cancelled guest', () => {
  test.beforeEach(async ({ page }) => {
    await goToGuest(page, 'g4');
  });

  test('cancelled chip is active', async ({ page }) => {
    await expect(page.getByTestId('rsvp-chip-cancelled')).toHaveAttribute('aria-pressed', 'true');
  });

  test('cancelled chip has soft-red background when active', async ({ page }) => {
    const chip = page.getByTestId('rsvp-chip-cancelled');
    const bg = await chip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Soft red: #E07070 = rgb(224, 112, 112)
    expect(bg).toBe('rgb(224, 112, 112)');
  });

  test('screenshot: guest-detail-cancelled', async ({ page }) => {
    await expect(page).toHaveScreenshot('guest-detail-cancelled.png');
  });
});

// ─── Optimistic RSVP update ───────────────────────────────────────────────────

test.describe('GuestDetail — optimistic RSVP update', () => {
  test.beforeEach(async ({ page }) => {
    await goToGuest(page, 'g2'); // starts as pending
  });

  test('tapping confirmed chip instantly makes it active', async ({ page }) => {
    const confirmedChip = page.getByTestId('rsvp-chip-confirmed');
    const pendingChip = page.getByTestId('rsvp-chip-pending');

    // Before: pending is active
    await expect(pendingChip).toHaveAttribute('aria-pressed', 'true');

    // Tap confirmed
    await confirmedChip.click();

    // Immediately (optimistically): confirmed should be active
    await expect(confirmedChip).toHaveAttribute('aria-pressed', 'true');
    await expect(pendingChip).toHaveAttribute('aria-pressed', 'false');
  });
});
