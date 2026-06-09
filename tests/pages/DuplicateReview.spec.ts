/**
 * DuplicateReview page — visual + interaction tests
 *
 * Covers spec 3.2c:
 *  - Each pair shows both guests + reason
 *  - "מזג" removes the secondary row (resolves pair)
 *  - "שמור בנפרד" removes the pair from the list
 *  - Empty state "כל הכפילויות טופלו ✓" when all resolved
 *  - Screenshots: populated + empty
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// ─── Setup ────────────────────────────────────────────────────────────────────

async function gotoDuplicates(page: import('playwright/test').Page) {
  await mockAuthenticatedWithCouple(page);
  await page.goto('/guests/duplicates');
  await expect(page.getByTestId('duplicate-review-page')).toBeVisible({ timeout: 5000 });
}

// ─── Populated state ──────────────────────────────────────────────────────────

test.describe('DuplicateReview — populated', () => {
  test.beforeEach(async ({ page }) => {
    await gotoDuplicates(page);
  });

  test('duplicate pair card is rendered', async ({ page }) => {
    const pairCard = page.getByTestId('duplicate-pair-pair-1');
    await expect(pairCard).toBeVisible();
  });

  test('both guests in pair are shown', async ({ page }) => {
    await expect(page.getByTestId('duplicate-guest-a-pair-1')).toBeVisible();
    await expect(page.getByTestId('duplicate-guest-b-pair-1')).toBeVisible();
  });

  test('guest names are shown in the pair', async ({ page }) => {
    await expect(page.getByTestId('duplicate-guest-a-pair-1')).toContainText('יעל לוי');
    await expect(page.getByTestId('duplicate-guest-b-pair-1')).toContainText('יעל');
  });

  test('similarity reason is shown', async ({ page }) => {
    await expect(page.getByTestId('duplicate-reason-pair-1')).toBeVisible();
    // phone_match reason
    await expect(page.getByTestId('duplicate-reason-pair-1')).toContainText('טלפון');
  });

  test('merge button is present', async ({ page }) => {
    await expect(page.getByTestId('merge-btn-pair-1')).toBeVisible();
  });

  test('keep-separate button is present', async ({ page }) => {
    await expect(page.getByTestId('keep-separate-btn-pair-1')).toBeVisible();
  });

  test('screenshot: duplicate-review', async ({ page }) => {
    await expect(page).toHaveScreenshot('duplicate-review.png');
  });
});

// ─── Merge action ─────────────────────────────────────────────────────────────

test.describe('DuplicateReview — merge action', () => {
  test.beforeEach(async ({ page }) => {
    await gotoDuplicates(page);
  });

  test('clicking merge removes the pair card', async ({ page }) => {
    const pairCard = page.getByTestId('duplicate-pair-pair-1');
    await expect(pairCard).toBeVisible();

    await page.getByTestId('merge-btn-pair-1').click();

    // After merge: pair is removed, empty state shown
    await expect(pairCard).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('duplicate-empty-state')).toBeVisible({ timeout: 3000 });
  });

  test('empty state shows correct text after merge', async ({ page }) => {
    await page.getByTestId('merge-btn-pair-1').click();
    await expect(page.getByTestId('duplicate-empty-state')).toContainText('כל הכפילויות טופלו');
  });
});

// ─── Keep separate action ─────────────────────────────────────────────────────

test.describe('DuplicateReview — keep separate action', () => {
  test.beforeEach(async ({ page }) => {
    await gotoDuplicates(page);
  });

  test('clicking keep-separate removes the pair from the list', async ({ page }) => {
    const pairCard = page.getByTestId('duplicate-pair-pair-1');
    await expect(pairCard).toBeVisible();

    await page.getByTestId('keep-separate-btn-pair-1').click();

    await expect(pairCard).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('duplicate-empty-state')).toBeVisible({ timeout: 3000 });
  });

  test('screenshot: duplicate-review-empty after keep-separate', async ({ page }) => {
    await page.getByTestId('keep-separate-btn-pair-1').click();
    await expect(page.getByTestId('duplicate-empty-state')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveScreenshot('duplicate-review-empty.png');
  });
});
