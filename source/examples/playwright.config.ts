// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const width = 1400;
const height = 1200;

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 5000 * 1000,

  use: {
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    // video: 'on-first-retry',
    headless: true,
    viewport: { width, height },
    ignoreHTTPSErrors: true,

    baseURL: 'http://localhost:3000/',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: /.*.spec.ts/,

      use: { ...devices['Desktop Chrome'] },
    },
  ],
};
export default config;
