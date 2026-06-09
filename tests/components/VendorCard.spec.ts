import { test, expect } from 'playwright/test';

test.describe('VendorCard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/vendor-card');
    await page.waitForLoadState('networkidle');
  });

  test('selected vendor: sage green נבחר badge', async ({ page }) => {
    const card = page.getByTestId('vendor-card-vendor-selected');
    await expect(card.getByTestId('vendor-name')).toHaveText('סטודיו לימור כהן');
    await expect(card.getByTestId('vendor-status-badge')).toContainText('נבחר');
    // No "הגדר כנבחר" button for already-selected vendor
    await expect(card.getByTestId('vendor-select-btn')).not.toBeVisible();
  });

  test('considering vendor: amber badge + set-as-selected button', async ({ page }) => {
    const card = page.getByTestId('vendor-card-vendor-considering');
    await expect(card.getByTestId('vendor-status-badge')).toContainText('בשיקול');
    await expect(card.getByTestId('vendor-select-btn')).toBeVisible();
    await expect(card.getByTestId('vendor-select-btn')).toContainText('הגדר כנבחר');
  });

  test('rejected vendor: muted נדחה badge, no select button', async ({ page }) => {
    const card = page.getByTestId('vendor-card-vendor-rejected');
    await expect(card.getByTestId('vendor-status-badge')).toContainText('נדחה');
    await expect(card.getByTestId('vendor-select-btn')).not.toBeVisible();
  });

  test('selected vendor: payment row visible', async ({ page }) => {
    const card = page.getByTestId('vendor-card-vendor-selected');
    await expect(card.getByTestId('vendor-payment-row')).toBeVisible();
  });

  test('edit button present on all cards', async ({ page }) => {
    for (const id of ['vendor-selected', 'vendor-considering', 'vendor-rejected']) {
      await expect(page.getByTestId(`vendor-card-${id}`).getByTestId('vendor-edit-btn')).toBeVisible();
    }
  });

  test('screenshot: vendor-card-selected.png', async ({ page }) => {
    await expect(page.getByTestId('vendor-card-vendor-selected')).toHaveScreenshot(
      'vendor-card-selected.png',
    );
  });

  test('screenshot: vendor-card-considering.png', async ({ page }) => {
    await expect(page.getByTestId('vendor-card-vendor-considering')).toHaveScreenshot(
      'vendor-card-considering.png',
    );
  });

  test('screenshot: vendor-card-rejected.png', async ({ page }) => {
    await expect(page.getByTestId('vendor-card-vendor-rejected')).toHaveScreenshot(
      'vendor-card-rejected.png',
    );
  });
});
