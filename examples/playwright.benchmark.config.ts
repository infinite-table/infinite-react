// Playwright config for the AG Grid vs Infinite Table benchmark
// (src/benchmark/grid-comparison.bench.ts). Kept separate from
// playwright.config.ts: it needs a production build of the benchmark pages,
// a single worker, no retries and long timeouts. See src/benchmark/README.md
import { PlaywrightTestConfig } from '@playwright/test';

const port = Number(process.env.BENCH_PORT || 5560);
const baseURL = process.env.BENCH_BASE_URL || `http://localhost:${port}/`;

// shared by the runner and the worker processes (workers inherit env), so
// all scenarios of one invocation write into the same results folder
process.env.BENCH_RUN_ID =
  process.env.BENCH_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');

// headed by default - closest to what users see (real GPU, real vsync).
// BENCH_HEADLESS=1 uses Chromium's new headless mode (same rendering code)
const headless = !!process.env.CI || process.env.BENCH_HEADLESS === '1';

const config: PlaywrightTestConfig = {
  testDir: './src/benchmark',
  testMatch: /.*\.bench\.ts$/,
  outputDir: 'test-results/grid-benchmark-artifacts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60 * 60_000,
  reporter: 'list',

  use: {
    baseURL,
    // the full Chromium build - with headless this is the "new" headless
    // mode, not chromium-headless-shell
    channel: 'chromium',
    headless,
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 1,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    launchOptions: {
      args: [
        '--enable-benchmarking',
        '--disable-extensions',
        '--no-default-browser-check',
        '--window-size=1400,1100',
      ],
    },
  },

  webServer: process.env.BENCH_BASE_URL
    ? undefined
    : {
        // serves the build made by `npm run benchmark:build`
        command: `npm run benchmark:serve -- -p ${port}`,
        url: `${baseURL}benchmark/infinite-300k`,
        // never reuse: a server started before the last build serves stale
        // (or missing) chunks
        reuseExistingServer: false,
        timeout: 60_000,
      },
};

export default config;
