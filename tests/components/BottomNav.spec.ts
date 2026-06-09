import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('BottomNav', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // BottomNav is replaced by a persistent Sidebar on desktop — see Sidebar.spec.ts
    test.skip(testInfo.project.name === 'Desktop Chrome', 'BottomNav is not rendered on desktop');
    await mockAuthenticatedWithCouple(page);
    await page.goto('/dashboard');
  });

  test('all 4 Hebrew nav labels are visible', async ({ page }) => {
    // Scope to the nav container to avoid ambiguous matches from page content
    const nav = page.getByTestId('bottom-nav');
    await expect(nav.getByText('בית')).toBeVisible();
    await expect(nav.getByText('מוזמנים')).toBeVisible();
    await expect(nav.getByText('משימות')).toBeVisible();
    await expect(nav.getByText('תקציב')).toBeVisible();
  });

  test('home tab has aria-current="page"', async ({ page }) => {
    const homeTab = page.locator('[aria-current="page"]');
    await expect(homeTab).toBeVisible();
    await expect(homeTab).toContainText('בית');
  });

  test('screenshot: bottom-nav-home', async ({ page }) => {
    await expect(page).toHaveScreenshot('bottom-nav-home.png');
  });
});
