/**
 * Settings page — couple info + invite partner section
 *
 * Tests cover:
 *  - Couple info card renders with mock data
 *  - Invite section: generate button visible when partner not yet joined
 *  - Invite section: "partner already joined" confirmation when memberUids.length > 1
 *  - Clicking generate sets invite link and shows copy button
 *  - Copy button is labelled correctly
 *  - Error toast path when createCoupleInvite throws
 *
 * All Firebase calls are intercepted via window seams injected with
 * page.addInitScript before navigation.
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mock couple with only one member (partner not yet joined). */
async function mockCoupleSolo(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    (window as Record<string, unknown>).__PLAYWRIGHT_SETTINGS_COUPLE__ = {
      coupleId: 'test-uid-123',
      memberUids: ['test-uid-123'],
      name1: 'יובל',
      name2: 'שיר',
      region: 'tel_aviv',
      isKosher: false,
    };
  });
}

/** Mock couple with two members (partner already joined). */
async function mockCouplePartnerJoined(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    (window as Record<string, unknown>).__PLAYWRIGHT_SETTINGS_COUPLE__ = {
      coupleId: 'test-uid-123',
      memberUids: ['test-uid-123', 'partner-uid-456'],
      name1: 'יובל',
      name2: 'שיר',
      region: 'tel_aviv',
      isKosher: false,
    };
  });
}

/** Mock a successful invite token creation (returns fake token). */
async function mockCreateInviteSuccess(page: import('playwright/test').Page, token = 'fake-token-abc') {
  await page.addInitScript((t) => {
    (window as Record<string, unknown>).__PLAYWRIGHT_CREATE_INVITE_TOKEN__ = t;
  }, token);
}

/** Mock invite creation to throw an error. */
async function mockCreateInviteError(page: import('playwright/test').Page) {
  await page.addInitScript(() => {
    (window as Record<string, unknown>).__PLAYWRIGHT_CREATE_INVITE_TOKEN__ = 'error';
  });
}

async function goToSettings(page: import('playwright/test').Page) {
  await page.goto('/settings');
  await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 5000 });
}

// ─── Page presence ────────────────────────────────────────────────────────────

test.describe('Settings — page render', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await goToSettings(page);
  });

  test('settings page is visible', async ({ page }) => {
    await expect(page.getByTestId('settings-page')).toBeVisible();
  });

  test('invite card is present', async ({ page }) => {
    await expect(page.getByTestId('settings-invite-card')).toBeVisible();
  });

  test('couple info card is present', async ({ page }) => {
    await expect(page.getByTestId('settings-couple-card')).toBeVisible();
  });

  test('sign-out button is present', async ({ page }) => {
    await expect(page.getByTestId('settings-sign-out')).toBeVisible();
  });
});

// ─── Couple info card content ─────────────────────────────────────────────────

test.describe('Settings — couple info card', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockCoupleSolo(page);
    await goToSettings(page);
  });

  test('couple names are displayed', async ({ page }) => {
    await expect(page.getByTestId('settings-couple-card')).toContainText('יובל');
    await expect(page.getByTestId('settings-couple-card')).toContainText('שיר');
  });
});

// ─── Invite section — partner not yet joined ──────────────────────────────────

test.describe('Settings — invite, partner not joined', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockCoupleSolo(page);
    await mockCreateInviteSuccess(page);
    await goToSettings(page);
  });

  test('"צור קישור הזמנה" button is visible', async ({ page }) => {
    await expect(page.getByTestId('generate-invite-btn')).toBeVisible();
  });

  test('"partner already joined" text is NOT visible', async ({ page }) => {
    await expect(page.locator('text=בן/בת הזוג כבר הצטרף')).not.toBeVisible();
  });

  test('clicking generate shows the invite link input', async ({ page }) => {
    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('invite-link-input')).toBeVisible({ timeout: 3000 });
  });

  test('invite link contains "/join/"', async ({ page }) => {
    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('invite-link-input')).toBeVisible({ timeout: 3000 });
    const value = await page.getByTestId('invite-link-input').inputValue();
    expect(value).toContain('/join/');
  });

  test('invite link contains the mock token', async ({ page }) => {
    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('invite-link-input')).toBeVisible({ timeout: 3000 });
    const value = await page.getByTestId('invite-link-input').inputValue();
    expect(value).toContain('fake-token-abc');
  });

  test('generate button disappears and copy button appears after generation', async ({ page }) => {
    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('copy-invite-btn')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('generate-invite-btn')).not.toBeVisible();
  });

  test('copy button is labelled "העתק"', async ({ page }) => {
    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('copy-invite-btn')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('copy-invite-btn')).toContainText('העתק');
  });

  test('createCoupleInvite was called once', async ({ page }) => {
    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('invite-link-input')).toBeVisible({ timeout: 3000 });
    const callCount = await page.evaluate(
      () => (window as Record<string, unknown>).__PLAYWRIGHT_CREATE_INVITE_CALLED__ as number ?? 0,
    );
    expect(callCount).toBe(1);
  });
});

// ─── Invite section — partner already joined ──────────────────────────────────

test.describe('Settings — invite, partner already joined', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockCouplePartnerJoined(page);
    await goToSettings(page);
  });

  test('"בן/בת הזוג כבר הצטרף/ה" text is visible', async ({ page }) => {
    await expect(page.getByTestId('settings-invite-card')).toContainText('בן/בת הזוג כבר הצטרף');
  });

  test('"צור קישור הזמנה" generate button is NOT visible', async ({ page }) => {
    await expect(page.getByTestId('generate-invite-btn')).not.toBeVisible();
  });
});

// ─── Invite generation error ──────────────────────────────────────────────────

test.describe('Settings — invite generation error', () => {
  test('generate button remains visible after error', async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await mockCoupleSolo(page);
    await mockCreateInviteError(page);
    await goToSettings(page);

    await page.getByTestId('generate-invite-btn').click();

    // After error, link input should not appear and button should still be visible
    await expect(page.getByTestId('invite-link-input')).not.toBeVisible({ timeout: 2000 });
    await expect(page.getByTestId('generate-invite-btn')).toBeVisible();
  });
});

// ─── RTL layout ───────────────────────────────────────────────────────────────

test.describe('Settings — RTL layout', () => {
  test('page direction is RTL', async ({ page }) => {
    await mockAuthenticatedWithCouple(page);
    await goToSettings(page);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});
