/**
 * ParentShare page — visual + interaction tests
 *
 * Covers spec 3.2d:
 *  - No bottom nav rendered (standalone web view)
 *  - Couple names as subtitle
 *  - Guest added → appears in session list below form
 *  - "שלח רשימה" → success message
 *  - Screenshots: empty / with-guests / submitted
 */
import { test, expect } from 'playwright/test';

const VALID_TOKEN = 'test-share-token-123';

// ─── Valid token ──────────────────────────────────────────────────────────────

test.describe('ParentShare — valid token', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/share/${VALID_TOKEN}`);
    await expect(page.getByTestId('parent-share-page')).toBeVisible({ timeout: 5000 });
  });

  test('no bottom nav rendered', async ({ page }) => {
    // BottomNav uses data-testid="bottom-nav"
    await expect(page.getByTestId('bottom-nav')).not.toBeVisible();
  });

  test('page title is visible', async ({ page }) => {
    await expect(page.getByTestId('parent-share-header')).toBeVisible();
  });

  test('couple names appear in subtitle', async ({ page }) => {
    const subtitle = page.getByTestId('parent-share-subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('יובל ושיר');
  });

  test('add guest form is visible', async ({ page }) => {
    await expect(page.getByTestId('parent-share-form')).toBeVisible();
  });

  test('name input is visible', async ({ page }) => {
    await expect(page.getByTestId('share-guest-name')).toBeVisible();
  });

  test('add button is disabled when name is empty', async ({ page }) => {
    await expect(page.getByTestId('share-add-guest-btn')).toBeDisabled();
  });

  test('html dir is rtl', async ({ page }) => {
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('screenshot: parent-share-empty', async ({ page }) => {
    await expect(page).toHaveScreenshot('parent-share-empty.png');
  });
});

// ─── Adding guests ────────────────────────────────────────────────────────────

test.describe('ParentShare — adding guests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/share/${VALID_TOKEN}`);
    await expect(page.getByTestId('parent-share-page')).toBeVisible({ timeout: 5000 });
  });

  test('guest appears in session list after adding', async ({ page }) => {
    await page.getByTestId('share-guest-name').fill('נועה ישראלי');
    await page.getByTestId('share-add-guest-btn').click();

    // Wait for session list to appear
    await expect(page.getByTestId('share-session-list')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('share-session-list')).toContainText('נועה ישראלי');
  });

  test('submit button appears after adding a guest', async ({ page }) => {
    await page.getByTestId('share-guest-name').fill('אבי בן דוד');
    await page.getByTestId('share-add-guest-btn').click();

    await expect(page.getByTestId('share-submit-btn')).toBeVisible({ timeout: 3000 });
  });

  test('screenshot: parent-share-with-guests', async ({ page }) => {
    await page.getByTestId('share-guest-name').fill('נועה ישראלי');
    await page.getByTestId('share-add-guest-btn').click();
    await expect(page.getByTestId('share-session-list')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveScreenshot('parent-share-with-guests.png');
  });
});

// ─── Submit list ──────────────────────────────────────────────────────────────

test.describe('ParentShare — submit list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/share/${VALID_TOKEN}`);
    await expect(page.getByTestId('parent-share-page')).toBeVisible({ timeout: 5000 });
    // Add a guest first
    await page.getByTestId('share-guest-name').fill('מיכל גולד');
    await page.getByTestId('share-add-guest-btn').click();
    await expect(page.getByTestId('share-submit-btn')).toBeVisible({ timeout: 3000 });
  });

  test('success message shown after submit', async ({ page }) => {
    await page.getByTestId('share-submit-btn').click();
    await expect(page.getByTestId('parent-share-success')).toBeVisible({ timeout: 3000 });
  });

  test('success message contains thank you text', async ({ page }) => {
    await page.getByTestId('share-submit-btn').click();
    await expect(page.getByTestId('parent-share-success')).toContainText('תודה');
  });

  test('screenshot: parent-share-submitted', async ({ page }) => {
    await page.getByTestId('share-submit-btn').click();
    await expect(page.getByTestId('parent-share-success')).toBeVisible({ timeout: 3000 });
    await expect(page).toHaveScreenshot('parent-share-submitted.png');
  });
});

// ─── Invalid token ────────────────────────────────────────────────────────────

test.describe('ParentShare — invalid token', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_SHARE_TOKEN_INVALID__ = true;
    });
    await page.goto(`/share/invalid-token`);
    await expect(page.getByTestId('parent-share-invalid')).toBeVisible({ timeout: 5000 });
  });

  test('shows invalid token message', async ({ page }) => {
    await expect(page.getByTestId('parent-share-invalid')).toBeVisible();
  });
});
