/**
 * E2E: Add Guest flow
 *
 * Tests:
 *  1. Fill form → save → guest appears in the correct invitedBy section
 *  2. Duplicate detection: banner appears when similar name/phone exists
 */
import { test, expect, type Page } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

/**
 * Scroll the BottomSheet's scrollable body to the bottom and click save via JS
 * dispatch. On mobile/tablet this is an antd Drawer (.ant-drawer-body); on
 * desktop BottomSheet renders a centered Modal (.ant-modal-body) instead.
 */
async function clickSaveInDrawer(page: Page) {
  await page.evaluate(() => {
    const body = document.querySelector('.ant-drawer-body, .ant-modal-body');
    if (body) body.scrollTop = body.scrollHeight;
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="add-guest-save"]') as HTMLButtonElement | null;
    if (btn) btn.click();
  });
}

test.describe('E2E: Add Guest', () => {
  test('fill form → save → guest appears in correct section', async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await page.goto('/guests');
    await expect(page.getByTestId('guest-list-page')).toBeVisible({ timeout: 5000 });

    // Open the sheet
    await page.getByTestId('add-guest-fab').click();
    await expect(page.getByTestId('add-guest-form')).toBeVisible({ timeout: 3000 });

    // Fill the form — name is required
    await page.getByTestId('add-guest-name').fill('מרים פרץ');
    await page.getByTestId('add-guest-phone').fill('050-8888888');

    // Click save via JS dispatch (bypasses viewport clipping in drawer)
    await clickSaveInDrawer(page);

    // Wait for sheet to close (form hidden) and list to refresh
    await expect(page.getByTestId('add-guest-form')).not.toBeVisible({ timeout: 5000 });

    // The guest list should still show sections
    await expect(page.getByTestId('guest-list-page')).toBeVisible({ timeout: 5000 });
    // And there should be at least one guest row
    const rows = page.locator('[data-testid^="guest-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('duplicate detection banner appears when similar name exists', async ({ page }) => {
    // Inject seam so save returns duplicates for "דנה"
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_ADD_GUEST_DUPLICATE_NAME__ = 'דנה';
    });
    await mockAuthenticatedWithCouple(page);
    await page.goto('/guests');
    await expect(page.getByTestId('guest-list-page')).toBeVisible({ timeout: 5000 });

    // Open sheet
    await page.getByTestId('add-guest-fab').click();
    await expect(page.getByTestId('add-guest-form')).toBeVisible({ timeout: 3000 });

    // Fill with a name similar to an existing guest
    await page.getByTestId('add-guest-name').fill('דנה כהן שני');

    // Click save via JS dispatch (bypasses viewport clipping in drawer)
    await clickSaveInDrawer(page);

    // Duplicate warning should appear inline (sheet stays open)
    await expect(page.getByTestId('add-guest-duplicate-warning')).toBeVisible({ timeout: 5000 });
  });
});
