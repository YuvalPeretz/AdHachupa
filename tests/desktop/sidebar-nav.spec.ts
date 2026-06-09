/**
 * Desktop sidebar navigation — replaces the bottom tab bar at ≥1024px.
 *
 * Only meaningful on the Desktop Chrome project; skipped on mobile, where
 * BottomNav.spec.ts covers the equivalent behavior.
 */
import { test, expect } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

test.describe('Sidebar (desktop nav)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Sidebar only renders on desktop');
    await mockAuthenticatedWithCouple(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('sidebar-nav')).toBeVisible({ timeout: 5000 });
  });

  test('sidebar is visible and BottomNav is not rendered', async ({ page }) => {
    await expect(page.getByTestId('sidebar-nav')).toBeVisible();
    await expect(page.getByTestId('bottom-nav')).toHaveCount(0);
  });

  test('all 4 Hebrew nav labels are visible', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav');
    await expect(sidebar.getByText('בית')).toBeVisible();
    await expect(sidebar.getByText('מוזמנים')).toBeVisible();
    await expect(sidebar.getByText('משימות')).toBeVisible();
    await expect(sidebar.getByText('תקציב')).toBeVisible();
  });

  test('home tab has aria-current="page" on the dashboard', async ({ page }) => {
    const homeTab = page.getByTestId('sidebar-tab-home');
    await expect(homeTab).toHaveAttribute('aria-current', 'page');
  });

  test('clicking a sidebar tab navigates to the corresponding route', async ({ page }) => {
    await page.getByTestId('sidebar-tab-guests').click();
    await expect(page).toHaveURL(/\/guests/);
    await expect(page.getByTestId('sidebar-tab-guests')).toHaveAttribute('aria-current', 'page');

    await page.getByTestId('sidebar-tab-tasks').click();
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.getByTestId('sidebar-tab-tasks')).toHaveAttribute('aria-current', 'page');

    await page.getByTestId('sidebar-tab-budget').click();
    await expect(page).toHaveURL(/\/budget/);
    await expect(page.getByTestId('sidebar-tab-budget')).toHaveAttribute('aria-current', 'page');
  });

  test('screenshot: sidebar-home', async ({ page }) => {
    await expect(page).toHaveScreenshot('sidebar-home.png');
  });
});
