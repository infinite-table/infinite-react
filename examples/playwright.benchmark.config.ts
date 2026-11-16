// Playwright config for the grid benchmark
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

// This app has the pages of AG Grid and Infinite Table (built from source).
// The MUI X Data Grid and TanStack Table pages are only in the benchmark
// repository - see src/benchmark/README.md
process.env.BENCH_GRIDS = process.env.BENCH_GRIDS || 'ag-grid,infinite';

// headed by default - closest to what users see (real GPU, real vsync).
// BENCH_HEADLESS=1 uses Chromium's new headless mode (same rendering code)
const headless = !!process.env.CI || process.env.BENCH_HEADLESS === '1';

// Run Chromium with its sandbox, as real Chrome does (Playwright turns it off
// by default). It matters on macOS: without the sandbox the renderer can talk
// to the WindowServer, and the first time Blink recomputes the hover state
// (a layout change under the mouse - e.g. the first scroll of a grid that
// updates rows while scrolling) GetCurrentKeyModifiers() initializes that
// connection, which blocks the main thread for 30-80ms. With the sandbox the
// call returns right away, so users never see that frame - and without it,
// it lands on whichever grid changes layout under the mouse first.
// BENCH_NO_SANDBOX=1 turns the sandbox off (e.g. containers where it can't
// start).
const sandbox = process.env.BENCH_NO_SANDBOX !== '1';

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
      chromiumSandbox: sandbox,
      args: [
        '--enable-benchmarking',
        '--disable-extensions',
        '--no-default-browser-check',
        '--window-size=1400,1100',
        // Layout works in physical pixels, so the largest element a page can
        // have (in CSS px) depends on the scale factor of the display the
        // window is on: ~33.5M px at 1x, ~16.7M px at 2x - whatever
        // deviceScaleFactor the context emulates. With displays of different
        // densities connected, the two grids could get different limits (and
        // so a different scrollbar-to-rows ratio at 1M rows) in the same run.
        '--force-device-scale-factor=1',
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
