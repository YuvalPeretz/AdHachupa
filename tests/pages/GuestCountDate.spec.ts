import { test, expect } from 'playwright/test';
import { mockAuthenticated } from '../fixtures/auth';

test.describe('Guest Count & Date', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    // Navigate through event selection first to seed Redux state with one event
    await page.goto('/onboarding/events');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('event-card-wedding').click();
    await page.getByTestId('onboarding-next').click();
    await page.waitForURL('**/onboarding/guest-count', { timeout: 3000 });
    await page.waitForLoadState('networkidle');
  });

  test('step indicator shows step 3 of 6', async ({ page }) => {
    const label = page.getByTestId('onboarding-step-label');
    await expect(label).toContainText('3');
    await expect(label).toContainText('6');
  });

  test('one card rendered per selected event', async ({ page }) => {
    await expect(page.getByTestId('guest-count-card-wedding')).toBeVisible();
  });

  test('stepper minus/plus buttons update the count', async ({ page }) => {
    const valueEl = page.getByTestId('stepper-value-wedding');
    const initialText = await valueEl.textContent();
    const initial = parseInt(initialText ?? '100', 10);

    await page.getByTestId('stepper-plus-wedding').click();
    const afterPlus = await valueEl.textContent();
    expect(parseInt(afterPlus ?? '0', 10)).toBe(initial + 10);

    await page.getByTestId('stepper-minus-wedding').click();
    const afterMinus = await valueEl.textContent();
    expect(parseInt(afterMinus ?? '0', 10)).toBe(initial);
  });

  test('"Skip date" checkbox disables the date picker', async ({ page }) => {
    const skipCheckbox = page.getByTestId('skip-date-wedding');
    await skipCheckbox.click();
    // Date picker input should be disabled
    const datePicker = page.getByTestId('date-picker-wedding');
    // The ant DatePicker wraps in a div; check it's disabled
    await expect(datePicker).toBeDisabled();
  });

  test('screenshot: guest-count-one-event.png', async ({ page }) => {
    await expect(page).toHaveScreenshot('guest-count-one-event.png');
  });

  test('screenshot: guest-count-two-events.png', async ({ page }) => {
    // Go back and add a second event
    await page.goto('/onboarding/events');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('event-card-wedding').click();
    await page.getByTestId('event-card-henna').click();
    await page.getByTestId('onboarding-next').click();
    await page.waitForURL('**/onboarding/guest-count', { timeout: 3000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('guest-count-card-wedding')).toBeVisible();
    await expect(page.getByTestId('guest-count-card-henna')).toBeVisible();
    await expect(page).toHaveScreenshot('guest-count-two-events.png');
  });
});
