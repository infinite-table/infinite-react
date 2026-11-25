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

export type TestPage = Page & TestExtras;

/**
 * The page sibling of a spec, per Playwright project: the `vue` and
 * `angular` projects run the same specs against the Vue and Angular
 * examples apps (.page.vue, .page.angular.ts).
 */
const { PAGE_EXTENSIONS } = require('./scripts/test-specs.cjs') as {
  PAGE_EXTENSIONS: Record<string, string>;
};

function getFileInfoFromTestInfo(testInfo: TestInfo) {
  const [_, __, ...rest] = testInfo.titlePath[0].split(pathSep);

  const pageExtension = PAGE_EXTENSIONS[testInfo.project.name] ?? '.page.tsx';

  const fileName = rest.join(pathSep).replace('.spec.ts', '');
  const filePath = path.resolve(
    __dirname,
    'src/pages',
    fileName + pageExtension,
  );

  const exists = fs.existsSync(filePath);

  return {
    exists,
    filePath,
    fileName,
    pageExtension,
    filePathNoExt: filePath.replace(pageExtension, ''),
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
    testInfo.setTimeout(10_000);
    const { filePathNoExt } = getFileInfoFromTestInfo(testInfo);

    await use(
      TracingModel.get({
        page,
        title: testInfo.title,
        filePathNoExt,
        browser,
        project: testInfo.project.name,
      }),
    );
  },
  //@ts-ignore
  page: async ({ baseURL, page }, use, testInfo) => {
    const { fileName, exists, pageExtension } =
      getFileInfoFromTestInfo(testInfo);

    // parity gate: specs without a .page.vue / .page.angular.ts sibling yet
    // are skipped on the vue / angular project instead of failing
    if (testInfo.project.name !== 'react' && !exists) {
      testInfo.skip(true, `no ${pageExtension} sibling for ${fileName}`);
    }

    const url = `${baseURL}${fileName}`;

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
      // the header cells can render a few ms after the body cells: wait for
      // them too, in every grid that has a header (a header without cells,
      // eg no visible columns, doesn't make the test wait longer than this)
      await page
        .waitForFunction(
          () =>
            Array.from(
              document.querySelectorAll('.InfiniteHeaderWrapper'),
            ).every(
              (header) =>
                header.querySelector('.InfiniteHeaderCell[data-column-id]') !=
                null,
            ),
          undefined,
          { timeout: 3000 },
        )
        .catch(() => {});

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
