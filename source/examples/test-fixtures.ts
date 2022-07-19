import {
  test as base,
  expect,
  Response,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  Page,
  ElementHandle,
  Locator,
} from '@playwright/test';

const fs = require('fs');
const path = require('path');
const pathSep = path.sep;

export { expect };

export type { Page, ElementHandle, Locator, Response };

type TestExtras = {
  waitForInfinite: () => Promise<void>;
  waitForInfiniteSelector: () => Promise<void>;
  load: () => Promise<void>;
};
export const test = base.extend<
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs &
    PlaywrightWorkerOptions & {
      page: Page & TestExtras;
    }
>({
  //@ts-ignore
  page: async ({ baseURL, page }, use, testInfo) => {
    const [_, __, ...rest] = testInfo.titlePath[0].split(pathSep);

    const fileName = rest.join(pathSep).replace('.spec.ts', '');
    const filePath = path.resolve(
      __dirname,
      'src/pages',
      fileName + '.page.tsx',
    );

    const url = `${baseURL}${fileName}`;

    const exists = fs.existsSync(filePath);

    page.load = async () => {
      if (exists) {
        await page.goto(url);
      }
    };

    page.waitForInfiniteSelector = async () => {
      await page.waitForSelector('.InfiniteColumnCell[data-column-id]');
    };

    page.waitForInfinite = async () => {
      await page.load();
      await page.waitForInfiniteSelector();
    };

    await use(page);
  },
});
