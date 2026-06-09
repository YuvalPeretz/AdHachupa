/**
 * Desktop onboarding centering — wizard screens render as a constrained card
 * (~480-560px) centered in the viewport at ≥1024px, instead of stretching
 * full-width like on mobile.
 *
 * Only meaningful on the Desktop Chrome project.
 */
import { test, expect, type Page, type Locator } from 'playwright/test';
import { mockAuthenticated, mockUnauthenticated } from '../fixtures/auth';

const MIN_PANEL_WIDTH = 480;
const MAX_PANEL_WIDTH = 560;

async function expectCenteredPanel(page: Page, panel: Locator) {
  await expect(panel).toBeVisible({ timeout: 5000 });
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(MIN_PANEL_WIDTH);
  expect(box!.width).toBeLessThanOrEqual(MAX_PANEL_WIDTH);

  // Roughly centered horizontally in the viewport
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const panelCenter = box!.x + box!.width / 2;
  const viewportCenter = viewport!.width / 2;
  expect(Math.abs(panelCenter - viewportCenter)).toBeLessThan(viewport!.width * 0.15);
}

test.describe('Onboarding desktop centering', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Onboarding centering only applies on desktop');
  });

  test('Splash screen panel is centered and constrained', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/');
    const screen = page.getByTestId('splash-screen');
    await expect(screen).toBeVisible({ timeout: 5000 });
    await expectCenteredPanel(page, screen.locator('[class*="innerPanel"]'));
  });

  test('Welcome screen panel is centered and constrained', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/onboarding/welcome');
    const screen = page.getByTestId('welcome-screen');
    await expect(screen).toBeVisible({ timeout: 5000 });
    // Welcome centers itself directly (no inner wrapper) — its space-between
    // internal layout is preserved by keeping `.container` as the single card.
    await expectCenteredPanel(page, screen);
  });

  test('Onboarding wizard panel (OnboardingShell) is centered and constrained', async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/events');
    const shell = page.getByTestId('onboarding-shell');
    await expect(shell).toBeVisible({ timeout: 5000 });
    await expectCenteredPanel(page, shell.locator('[class*="panel"]').first());
  });

  test('Onboarding success panel is centered and constrained', async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/success');
    const screen = page.getByTestId('onboarding-success-screen');
    await expect(screen).toBeVisible({ timeout: 5000 });
    await expectCenteredPanel(page, screen.locator('[class*="innerPanel"]'));
  });

  test('screenshot: onboarding-wizard-desktop', async ({ page }) => {
    await mockAuthenticated(page);
    await page.goto('/onboarding/events');
    await expect(page.getByTestId('onboarding-shell')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveScreenshot('onboarding-wizard-desktop.png');
  });
});
