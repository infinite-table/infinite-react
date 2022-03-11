// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const width = 1400;
const height = 1200;

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    trace: 'on-first-retry',
    headless: true,
    viewport: { width, height },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
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
