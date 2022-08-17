import { ColumnTestingModel } from '@examples/pages/tests/testUtils/ColumnTestingModel';
import { HeaderTestingModel } from '@examples/pages/tests/testUtils/HeaderModel';
import { RowTestingModel } from '@examples/pages/tests/testUtils/RowTestingModel';
import {
  test as base,
  expect,
  Response,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
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
  PlaywrightTestArgs &
    PlaywrightTestOptions & {
      page: Page & TestExtras;
      rowModel: RowTestingModel;
      headerModel: HeaderTestingModel;
      columnModel: ColumnTestingModel;
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

  rowModel: async ({ page }, use) => {
    await use(RowTestingModel.get(page));
  },
  headerModel: async ({ page }, use) => {
    await use(HeaderTestingModel.get(page));
  },
  columnModel: async ({ page }, use) => {
    await use(ColumnTestingModel.get(page));
  },
});
