import { test, expect } from 'playwright/test';

test.describe('GuestRow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/guest-row');
    await page.waitForLoadState('networkidle');
  });

  test('confirmed guest: name visible, sage green badge', async ({ page }) => {
    const row = page.getByTestId('guest-row-guest-confirmed');
    await expect(row.getByTestId('guest-name')).toHaveText('דנה כהן');
    // Badge text from i18n: "אישר"
    await expect(row.getByTestId('guest-rsvp-badge')).toContainText('אישר');
  });

  test('pending guest: name visible, amber badge', async ({ page }) => {
    const row = page.getByTestId('guest-row-guest-pending');
    await expect(row.getByTestId('guest-name')).toHaveText('אלון לוי');
    await expect(row.getByTestId('guest-rsvp-badge')).toContainText('ממתין');
  });

  test('cancelled guest: strikethrough name', async ({ page }) => {
    const row = page.getByTestId('guest-row-guest-cancelled');
    const name = row.getByTestId('guest-name');
    await expect(name).toHaveText('מיכל שמואלי');
    // Check text-decoration via computed style
    const textDecoration = await name.evaluate(
      (el) => getComputedStyle(el).textDecorationLine,
    );
    expect(textDecoration).toContain('line-through');
  });

  test('cancelled guest shows cancelled badge', async ({ page }) => {
    const row = page.getByTestId('guest-row-guest-cancelled');
    await expect(row.getByTestId('guest-rsvp-badge')).toContainText('ביטל');
  });

  test('screenshot: guest-row-confirmed.png', async ({ page }) => {
    await expect(page.getByTestId('guest-row-guest-confirmed')).toHaveScreenshot(
      'guest-row-confirmed.png',
    );
  });

  test('screenshot: guest-row-pending.png', async ({ page }) => {
    await expect(page.getByTestId('guest-row-guest-pending')).toHaveScreenshot(
      'guest-row-pending.png',
    );
  });

  test('screenshot: guest-row-cancelled.png', async ({ page }) => {
    await expect(page.getByTestId('guest-row-guest-cancelled')).toHaveScreenshot(
      'guest-row-cancelled.png',
    );
  });
});
