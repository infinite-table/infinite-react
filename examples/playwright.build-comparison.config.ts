// Playwright config for comparing two builds of Infinite Table
// (src/benchmark-builds/build-comparison.bench.ts). Same browser setup as the
// grid benchmark (playwright.benchmark.config.ts: one worker, sandboxed
// Chromium, headed by default, fixed scale factor), but no web server: the
// two builds are served by their own checkouts - see
// src/benchmark-builds/README.md
import { PlaywrightTestConfig } from '@playwright/test';

import benchmarkConfig from './playwright.benchmark.config';

const config: PlaywrightTestConfig = {
  ...benchmarkConfig,
  testDir: './src/benchmark-builds',
  testMatch: /.*\.bench\.ts$/,
  outputDir: 'test-results/build-comparison-artifacts',
  webServer: undefined,
  use: {
    ...benchmarkConfig.use,
    baseURL: undefined,
  },
};

export default config;
