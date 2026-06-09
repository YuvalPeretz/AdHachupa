import { test, expect } from 'playwright/test';
import { mockAuthenticated } from '../fixtures/auth';

test.describe('Event Selection', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/events');
    await page.waitForLoadState('networkidle');
  });

  test('step indicator shows step 2 of 6', async ({ page }) => {
    const label = page.getByTestId('onboarding-step-label');
    await expect(label).toBeVisible();
    await expect(label).toContainText('2');
    await expect(label).toContainText('6');
  });

  test('3×2 grid renders all 6 event types', async ({ page }) => {
    await expect(page.getByTestId('event-card-wedding')).toBeVisible();
    await expect(page.getByTestId('event-card-henna')).toBeVisible();
    await expect(page.getByTestId('event-card-party')).toBeVisible();
    await expect(page.getByTestId('event-card-shabbat')).toBeVisible();
    await expect(page.getByTestId('event-card-mikveh')).toBeVisible();
    await expect(page.getByTestId('event-card-kabbalat_panim')).toBeVisible();
  });

  test('event card labels are in Hebrew', async ({ page }) => {
    await expect(page.getByTestId('event-card-wedding')).toContainText('חתונה');
    await expect(page.getByTestId('event-card-henna')).toContainText('חינה');
  });

  test('"הבא" disabled with 0 selections', async ({ page }) => {
    const nextBtn = page.getByTestId('onboarding-next');
    await expect(nextBtn).toBeDisabled();
  });

  test('"הבא" enabled with ≥ 1 selection', async ({ page }) => {
    await page.getByTestId('event-card-wedding').click();
    const nextBtn = page.getByTestId('onboarding-next');
    await expect(nextBtn).toBeEnabled();
  });

  test('selected card shows gold checkmark', async ({ page }) => {
    await page.getByTestId('event-card-wedding').click();
    await expect(page.getByTestId('event-check-wedding')).toBeVisible();
  });

  test('selecting card toggles aria-pressed', async ({ page }) => {
    const card = page.getByTestId('event-card-wedding');
    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'false');
  });

  test('multi-select: multiple cards can be selected', async ({ page }) => {
    await page.getByTestId('event-card-wedding').click();
    await page.getByTestId('event-card-henna').click();
    await expect(page.getByTestId('event-check-wedding')).toBeVisible();
    await expect(page.getByTestId('event-check-henna')).toBeVisible();
  });

  test('"הוסף אירוע אחר" link is visible', async ({ page }) => {
    await expect(page.getByTestId('event-add-other')).toBeVisible();
  });

  test('next navigates to guest-count when selection made', async ({ page }) => {
    await page.getByTestId('event-card-wedding').click();
    await page.getByTestId('onboarding-next').click();
    await page.waitForURL('**/onboarding/guest-count', { timeout: 3000 });
    await expect(page).toHaveURL('/onboarding/guest-count');
  });

  test('screenshot: event-selection-empty.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('event-selection-empty.png');
  });

  test('screenshot: event-selection-one-selected.png', async ({ page }) => {
    await page.getByTestId('event-card-wedding').click();
    await expect(page).toHaveScreenshot('event-selection-one-selected.png');
  });

  test('screenshot: event-selection-multi-selected.png', async ({ page }) => {
    await page.getByTestId('event-card-wedding').click();
    await page.getByTestId('event-card-henna').click();
    await page.getByTestId('event-card-party').click();
    await expect(page).toHaveScreenshot('event-selection-multi-selected.png');
  });
});
