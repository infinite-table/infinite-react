import { Browser } from '@playwright/test';
import { Page } from '@testing';
import {
  parseTraceFile,
  compareAgainstBaseline,
  formatTestName,
  saveBaseline,
  getBaseline,
  DEFAULT_THRESHOLD,
  PerfMetrics,
  PerfComparisonResult,
  isCI,
  devName,
} from './perfUtils';

type TracingModelOptions = {
  page: Page;
  browser: Browser;
  title: string;
  filePathNoExt: string;
};

export interface TracingResult {
  tracePath: string;
  metrics: PerfMetrics;
  comparison: PerfComparisonResult | null;
  testName: string;
}

type TraceStopOptions = {
  compare: 'scriptingTime' | 'renderingTime' | 'paintingTime' | 'totalTime';
};

export class TracingModel {
  static get(options: TracingModelOptions) {
    return new TracingModel(options);
  }

  private page: Page;
  private filePathNoExt: string;
  private browser: Browser;
  private title: string;
  private tracePath: string | null = null;

  constructor(options: TracingModelOptions) {
    this.page = options.page;
    this.filePathNoExt = options.filePathNoExt;
    this.browser = options.browser;
    this.title = options.title;
  }

  async start() {
    const tracePath = `${this.filePathNoExt}-${this.title}.trace.json`;

    this.tracePath = tracePath;

    await this.browser.startTracing(this.page, {
      path: tracePath,
    });

    return async (options?: TraceStopOptions) => this.stop(options);
  }

  async stop(options?: TraceStopOptions): Promise<TracingResult> {
    await this.browser.stopTracing();

    if (!this.tracePath) {
      throw new Error('Tracing was not started');
    }

    const testName = formatTestName(this.filePathNoExt, this.title);
    const metrics = parseTraceFile(this.tracePath);

    const compare = options?.compare ?? 'scriptingTime';
    const comparison = compareAgainstBaseline(testName, metrics, {
      compare,
    });

    const result: TracingResult = {
      tracePath: this.tracePath,
      metrics,
      comparison,
      testName,
    };

    // Log metrics
    const env = isCI ? '[CI]' : `[${devName}]`;
    console.log(`\n📊 ${env} Performance metrics for "${this.title}":`);
    console.log(`   Scripting: ${metrics.scriptingTime}ms`);
    console.log(`   Rendering: ${metrics.renderingTime}ms`);
    console.log(`   Painting:  ${metrics.paintingTime}ms`);
    console.log(`   Total:     ${metrics.totalTime}ms`);

    // CI mode: compare against baseline and fail if regression
    if (comparison) {
      const icon = comparison.passed ? '✅' : '❌';
      console.log(`\n${icon} ${comparison.message}`);

      if (!comparison.passed) {
        const errMessage =
          `Performance regression: ${comparison.message}\n (comparing ${compare})` +
          `If this is expected, update perf-baselines.${
            isCI ? 'ci' : devName
          }.json`;

        throw new Error(errMessage);
      }
    } else {
      console.log(
        `\n⚠️  No ${isCI ? 'CI' : 'local'} baseline found for this test.`,
      );
    }

    // Only save baseline when total time is lower than previous (or no baseline exists)
    const existingBaseline = getBaseline(testName);
    if (
      !existingBaseline ||
      metrics[compare] <
        existingBaseline[compare] * (1 - existingBaseline.threshold / 100)
    ) {
      saveBaseline(testName, metrics);
      console.log(
        `📝 Updated ${isCI ? 'CI' : 'local'} baseline: ${
          metrics[compare]
        }ms (for ${compare})`,
      );
    }

    return result;
  }

  /**
   * Stop tracing and save the current metrics as the new baseline
   */
  async stopAndSaveBaseline(): Promise<TracingResult> {
    await this.browser.stopTracing();

    if (!this.tracePath) {
      throw new Error('Tracing was not started');
    }

    const testName = formatTestName(this.filePathNoExt, this.title);
    const metrics = parseTraceFile(this.tracePath);

    // Save as baseline
    saveBaseline(testName, metrics);

    console.log(`\n📊 Performance metrics for "${this.title}":`);
    console.log(`   Scripting: ${metrics.scriptingTime}ms`);
    console.log(`   Rendering: ${metrics.renderingTime}ms`);
    console.log(`   Painting:  ${metrics.paintingTime}ms`);
    console.log(`   Total:     ${metrics.totalTime}ms`);
    console.log(`\n✅ Saved as baseline (threshold: ${DEFAULT_THRESHOLD}%)`);

    return {
      tracePath: this.tracePath,
      metrics,
      comparison: null,
      testName,
    };
  }
}
