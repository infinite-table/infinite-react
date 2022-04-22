import {
  test as base,
  expect,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  Page,
  ElementHandle,
} from '@playwright/test';

const fs = require('fs');
const path = require('path');
const pathSep = path.sep;

export { expect };

export type { Page, ElementHandle };

export const test = base.extend<
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs &
    PlaywrightWorkerOptions & {
      page: Page & { waitForInfinite: () => Promise<void> };
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

    if (exists) {
      await page.goto(url);
    }

    page.waitForInfinite = async () => {
      await page.waitForSelector('.InfiniteColumnCell[data-column-id]');
    };

    await use(page);
  },
});
