import { ColumnTestingModel } from '@examples/pages/tests/testUtils/ColumnTestingModel';
import { EditTestingModel } from '@examples/pages/tests/testUtils/EditTestingModel';
import { HeaderTestingModel } from '@examples/pages/tests/testUtils/HeaderTestingModel';
import { InfiniteTableApiModel } from '@examples/pages/tests/testUtils/InfiniteTableApiModel';
import { MenuTestingModel } from '@examples/pages/tests/testUtils/MenuTestingModel';
import { RowTestingModel } from '@examples/pages/tests/testUtils/RowTestingModel';
import { TableTestingModel } from '@examples/pages/tests/testUtils/TableTestingModel';
import { TracingModel } from '@examples/pages/tests/testUtils/TracingModel';
import { TreeTestingModel } from '@examples/pages/tests/testUtils/TreeTestingModel';
import {
  test as base,
  expect,
  Response,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  Page,
  ElementHandle,
  Locator,
  TestInfo,
} from '@playwright/test';

const fs = require('fs');
const path = require('path');
const pathSep = path.sep;

export { expect };

export type { Page, ElementHandle, Locator, Response };

type TestExtras = {
  waitForInfiniteHeaderSelector: () => Promise<void>;
  waitForInfinite: (extraTimeout?: number) => Promise<void>;
  waitForInfiniteHeader: (extraTimeout?: number) => Promise<void>;
  waitForInfiniteSelector: () => Promise<void>;
  waitForInfiniteReady: (extraTimeout?: number) => Promise<void>;
  waitForRaf: () => Promise<void>;
  load: () => Promise<void>;
  getGlobalValue: (name: string) => Promise<any>;
  failOnConsoleErrors: () => void;
  getConsoleErrors: () => string[];
};

function getFileInfoFromTestInfo(testInfo: TestInfo) {
  const [_, __, ...rest] = testInfo.titlePath[0].split(pathSep);

  const fileName = rest.join(pathSep).replace('.spec.ts', '');
  const filePath = path.resolve(__dirname, 'src/pages', fileName + '.page.tsx');

  const exists = fs.existsSync(filePath);

  return {
    exists,
    filePath,
    fileName,
    filePathNoExt: filePath.replace('.page.tsx', ''),
  };
}

export const test = base.extend<
  PlaywrightTestArgs &
    PlaywrightTestOptions & {
      page: Page & TestExtras;
      rowModel: RowTestingModel;
      treeModel: TreeTestingModel;
      headerModel: HeaderTestingModel;
      editModel: EditTestingModel;
      columnModel: ColumnTestingModel;
      menuModel: MenuTestingModel;

      apiModel: InfiniteTableApiModel;
      tableModel: TableTestingModel;
      tracingModel: TracingModel;
    }
>({
  tracingModel: async ({ page, browser }, use, testInfo) => {
    const { filePathNoExt } = getFileInfoFromTestInfo(testInfo);

    await use(
      TracingModel.get({
        page,
        title: testInfo.title,
        filePathNoExt,
        browser,
      }),
    );
  },
  //@ts-ignore
  page: async ({ baseURL, page }, use, testInfo) => {
    const { fileName, filePath } = getFileInfoFromTestInfo(testInfo);

    const url = `${baseURL}${fileName}`;

    const exists = fs.existsSync(filePath);

    page.load = async () => {
      if (exists) {
        await page.addInitScript({
          content: `
window.__DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_IS_READY = (_id, ready, api, context) => {
  
  window.INFINITE_GRID_READY = ready;
  window.INFINITE_GRID_API = api;
  window.DATA_SOURCE_API = context.dataSourceApi
};`,
        });
        await page.goto(url);
      }
    };
    // Store console errors
    const consoleErrors: string[] = [];

    // Listen to console events
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        const text = msg.text();

        consoleErrors.push(text);
      }
    });

    let shouldFailOnErrors = false;

    // Listen to page errors
    page.on('pageerror', (error: any) => {
      consoleErrors.push(error.message);
    });

    page.getConsoleErrors = () => {
      return consoleErrors;
    };
    page.failOnConsoleErrors = () => {
      shouldFailOnErrors = true;
    };

    page.waitForInfiniteSelector = async () => {
      await page.waitForSelector('.InfiniteColumnCell[data-column-id]');
    };
    page.waitForInfiniteHeaderSelector = async () => {
      await page.waitForSelector('.InfiniteHeaderCell[data-column-id]');
    };

    page.waitForInfinite = async (extraTimeout?: number) => {
      await page.load();
      await page.waitForFunction(() => (window as any).INFINITE_GRID_READY);
      await page.waitForInfiniteSelector();

      if (extraTimeout) {
        await page.waitForTimeout(extraTimeout);
      }
    };

    page.waitForInfiniteHeader = async (extraTimeout?: number) => {
      await page.load();
      await page.waitForFunction(() => (window as any).INFINITE_GRID_READY);
      await page.waitForInfiniteHeaderSelector();

      if (extraTimeout) {
        await page.waitForTimeout(extraTimeout);
      }
    };

    page.waitForInfiniteReady = async (extraTimeout?: number) => {
      await page.load();
      await page.waitForFunction(() => (window as any).INFINITE_GRID_READY);

      if (extraTimeout) {
        await page.waitForTimeout(extraTimeout);
      }
    };

    page.waitForRaf = async () => {
      await page.evaluate(() => {
        return new Promise((resolve) => requestAnimationFrame(resolve));
      });
    };

    page.getGlobalValue = async (name: string) => {
      return page.evaluate((name: string) => {
        let current = window as any;
        const names = name.split('.');

        names.forEach((n) => {
          current = current[n];
        });

        return current;
      }, name);
    };

    await use(page);

    // After the test, fail if there were any console errors
    // but only if the flag is set to true
    if (shouldFailOnErrors && consoleErrors.length > 0) {
      console.error(
        `Console errors detected, this should NOT happen: \n${consoleErrors.join(
          '\n',
        )}`,
      );
      throw new Error(`Console errors detected: \n${consoleErrors.join('\n')}`);
    }
  },

  rowModel: async ({ page }, use) => {
    await use(RowTestingModel.get(page));
  },
  headerModel: async ({ page }, use) => {
    await use(HeaderTestingModel.get(page));
  },
  apiModel: async ({ page }, use) => {
    await use(InfiniteTableApiModel.get(page));
  },
  editModel: async ({ page }, use) => {
    await use(EditTestingModel.get(page));
  },
  treeModel: async ({ page }, use) => {
    await use(TreeTestingModel.get(page));
  },
  columnModel: async ({ page }, use) => {
    await use(ColumnTestingModel.get(page));
  },

  tableModel: async ({ page }, use) => {
    await use(TableTestingModel.get(page));
  },
  menuModel: async ({ page }, use) => {
    await use(MenuTestingModel.get(page));
  },
});
