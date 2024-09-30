import { Browser } from '@playwright/test';
import { Page } from '@testing';
const fs = require('fs');

type TracingModelOptions = {
  page: Page;
  browser: Browser;
  title: string;
  filePathNoExt: string;
};

export class TracingModel {
  static get(options: TracingModelOptions) {
    return new TracingModel(options);
  }

  private page: Page;
  private filePathNoExt: string;
  private browser: Browser;
  private title: string;
  constructor(options: TracingModelOptions) {
    this.page = options.page;
    this.filePathNoExt = options.filePathNoExt;
    this.browser = options.browser;
    this.title = options.title;
  }

  async start() {
    let index = 0;
    const name = `${this.filePathNoExt}-${this.title}-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', '_')}`;
    let tracePath = `${name}.trace.json`;
    while (fs.existsSync(tracePath)) {
      index++;
      tracePath = `${name}-${index}.trace.json`;
    }

    await this.browser.startTracing(this.page, {
      path: tracePath,
    });

    return async () => this.stop();
  }

  async stop() {
    await this.browser.stopTracing();
  }
}
