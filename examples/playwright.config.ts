// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

declare global {
  var __DEV__: boolean;
}
// Define __DEV__ globally for the test environment
global.__DEV__ = !process.env.CI;

// where this checkout's test apps run: 5555 / 5556, or other ports when
// those were taken by another checkout
const { getPort } = require('../scripts/dev-ports.cjs');
// under /react/, /vue/, /angular/ when the dev servers run there (npm run dev)
const { testAppBaseURL } = require('./scripts/dev-base-url.cjs');

const {
  REACT_ONLY_GLOBS,
  pagelessSpecs,
  specsRegExp,
} = require('./scripts/test-specs.cjs');

// the vue and angular projects run the specs that have a test page: the
// React-only ones and the node-side unit specs (no page) run on react only
const NON_REACT_IGNORE = [...REACT_ONLY_GLOBS, specsRegExp(pagelessSpecs())];

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

    baseURL: testAppBaseURL('react', getPort('examples')),
  },
  projects: [
    {
      name: 'react',
      testMatch: /.*.spec.ts/,

      use: { ...devices['Desktop Chrome'] },
    },
    {
      // runs the same specs against the Vue examples app (port 5556 by default).
      // Specs without a .page.vue sibling are auto-skipped (see
      // test-fixtures.ts), so parity progress is measurable as
      // "specs no longer skipped on vue".
      name: 'vue',
      testMatch: /.*.spec.ts/,

      testIgnore: NON_REACT_IGNORE,

      use: {
        ...devices['Desktop Chrome'],
        baseURL: testAppBaseURL('vue', getPort('examplesVue')),
      },
    },
    {
      // the same specs against the Angular examples app (port 5558 by
      // default), skipped when there's no .page.angular.ts sibling
      name: 'angular',
      testMatch: /.*.spec.ts/,

      testIgnore: NON_REACT_IGNORE,

      use: {
        ...devices['Desktop Chrome'],
        baseURL: testAppBaseURL('angular', getPort('examplesAngular')),
      },
    },
  ],
};
export default config;
