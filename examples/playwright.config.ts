// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

declare global {
  var __DEV__: boolean;
}
// Define __DEV__ globally for the test environment
global.__DEV__ = !process.env.CI;

const width = 1400;
const height = 1200;

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 12 : 1,

  // Limit the number of failures on CI to save resources
  maxFailures: process.env.CI ? 12 : undefined,
  timeout: process.env.CI ? 10000 : 5000,

  workers: 4,
  fullyParallel: true,
  reporter: 'list',

  use: {
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    // video: 'on-first-retry',
    // video: 'retain-on-failure',
    headless: true,

    viewport: { width, height },
    ignoreHTTPSErrors: true,
    // launchOptions: {
    //   slowMo: 500000, // uncomment this and also add headless: false, so you can easily debug
    // },

    baseURL: 'http://localhost:5555/',
  },
  projects: [
    {
      name: 'react',
      testMatch: /.*.spec.ts/,

      use: { ...devices['Desktop Chrome'] },
    },
    {
      // runs the same specs against the Vue examples app (port 5556).
      // Specs without a .page.vue sibling are auto-skipped (see
      // test-fixtures.ts), so parity progress is measurable as
      // "specs no longer skipped on vue".
      name: 'vue',
      testMatch: /.*.spec.ts/,

      // these specs import `test` directly from @playwright/test (bypassing
      // the auto-skip fixture) and test React-only internals:
      // - lists: the RawList/VirtualList React component wrappers (the Vue
      //   siblings ListRowPoolForVue/RawTableForVue are covered by jest
      //   bridge specs)
      // - hooks: the React useComponentState/useProperty hook pages
      testIgnore: ['**/tests/lists/**', '**/tests/hooks/**'],

      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5556/',
      },
    },
  ],
};
export default config;
