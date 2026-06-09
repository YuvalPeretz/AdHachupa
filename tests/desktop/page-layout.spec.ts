/**
 * Desktop page layout — main-app pages are constrained to the 1200px
 * max-width container (centered via AppShell's `.container`), sit alongside
 * the persistent Sidebar without horizontal overflow, at 1440px.
 *
 * Only meaningful on the Desktop Chrome project.
 */
import { test, expect, type Page } from 'playwright/test';
import { mockAuthenticatedWithCouple } from '../fixtures/auth';

const CONTAINER_MAX_WIDTH = 1200;

const PAGES: Array<{ name: string; path: string; testId: string }> = [
  { name: 'Dashboard', path: '/dashboard', testId: 'dashboard-page' },
  { name: 'Guest List', path: '/guests', testId: 'guest-list-page' },
  { name: 'Task List', path: '/tasks', testId: 'task-list-page' },
  { name: 'Budget', path: '/budget', testId: 'budget-page' },
];

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe('Main-app page layout (desktop)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Container/sidebar layout only applies on desktop');
    await mockAuthenticatedWithCouple(page);
  });

  for (const { name, path, testId } of PAGES) {
    test(`${name}: no horizontal overflow and content constrained to ${CONTAINER_MAX_WIDTH}px`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId(testId)).toBeVisible({ timeout: 5000 });

      await expectNoHorizontalOverflow(page);

      const container = page.locator('[class*="container"]').first();
      const box = await container.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(CONTAINER_MAX_WIDTH + 1);
    });
  }

  test('sidebar and content container coexist without overlap', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 5000 });

    const sidebarBox = await page.getByTestId('sidebar-nav').boundingBox();
    const contentBox = await page.getByTestId('dashboard-page').boundingBox();
    expect(sidebarBox).not.toBeNull();
    expect(contentBox).not.toBeNull();

    // Sidebar sits on the visual right in this RTL app — its start-x should be
    // at or beyond the content's end-x (no horizontal overlap).
    const sidebarStart = sidebarBox!.x;
    const contentEnd = contentBox!.x + contentBox!.width;
    expect(sidebarStart).toBeGreaterThanOrEqual(contentEnd - 1);
  });
});
