import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 393, height: 852 },
  },
  projects: [
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
