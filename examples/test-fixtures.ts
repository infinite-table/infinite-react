import { ColumnTestingModel } from '@examples/pages/tests/testUtils/ColumnTestingModel';
import { EditTestingModel } from '@examples/pages/tests/testUtils/EditTestingModel';
import { HeaderTestingModel } from '@examples/pages/tests/testUtils/HeaderTestingModel';
import { MenuTestingModel } from '@examples/pages/tests/testUtils/MenuTestingModel';
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
  waitForInfinite: (extraTimeout?: number) => Promise<void>;
  waitForInfiniteSelector: () => Promise<void>;
  load: () => Promise<void>;
};

export const test = base.extend<
  PlaywrightTestArgs &
    PlaywrightTestOptions & {
      page: Page & TestExtras;
      rowModel: RowTestingModel;
      headerModel: HeaderTestingModel;
      editModel: EditTestingModel;
      columnModel: ColumnTestingModel;
      menuModel: MenuTestingModel;
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
        await page.addInitScript({
          content: `
window.__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY = (_id, ready) => {
  
  window.INFINITE_GRID_READY = ready;
};`,
        });
        await page.goto(url);
      }
    };

    page.waitForInfiniteSelector = async () => {
      await page.waitForSelector('.InfiniteColumnCell[data-column-id]');
    };

    page.waitForInfinite = async (extraTimeout?: number) => {
      await page.load();
      await page.waitForFunction(() => (window as any).INFINITE_GRID_READY);
      await page.waitForInfiniteSelector();

      if (extraTimeout) {
        await page.waitForTimeout(extraTimeout);
      }
    };

    await use(page);
  },

  rowModel: async ({ page }, use) => {
    await use(RowTestingModel.get(page));
  },
  headerModel: async ({ page }, use) => {
    await use(HeaderTestingModel.get(page));
  },
  editModel: async ({ page }, use) => {
    await use(EditTestingModel.get(page));
  },
  columnModel: async ({ page }, use) => {
    await use(ColumnTestingModel.get(page));
  },
  menuModel: async ({ page }, use) => {
    await use(MenuTestingModel.get(page));
  },
});
