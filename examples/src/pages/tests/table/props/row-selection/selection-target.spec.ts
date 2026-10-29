import { test, expect } from '@testing';
import type { Page, TestPage } from '@testing';

type Config = {
  target: 'all' | 'visible';
  grouped: boolean;
  useGroupKeys: boolean;
};

// JavaScript rows (1 and 2, both in the "frontend" group) are filtered out
const ALL = [1, 2, 3, 4, 5];
const VISIBLE = [3, 4, 5];

const checkboxSelector = (rowIndex: number | 'header') =>
  rowIndex === 'header'
    ? '.InfiniteHeaderCell[data-column-id="checkbox"] input[type="checkbox"]'
    : `.InfiniteColumnCell[data-column-id="checkbox"][data-row-index="${rowIndex}"] input[type="checkbox"]`;

const checkboxState = (page: Page, rowIndex: number | 'header') =>
  page
    .locator(checkboxSelector(rowIndex))
    .evaluate((input: HTMLInputElement) =>
      input.indeterminate ? null : input.checked,
    );

const clickCheckbox = (page: Page, rowIndex: number | 'header') =>
  page.locator(checkboxSelector(rowIndex)).click();

const selectedIds = (page: Page) =>
  page.evaluate(() =>
    [
      ...(globalThis as any).INFINITE_GRID_API.rowSelectionApi.getSelectedPrimaryKeys(),
    ].sort((a: number, b: number) => a - b),
  );

const renderedRows = (page: Page) =>
  page.locator('.InfiniteColumnCell[data-column-id="checkbox"]').count();

async function setup(page: TestPage, config: Config) {
  await page.waitForInfinite();
  await page.evaluate((c) => (globalThis as any).setConfig(c), config);
  await expect
    .poll(() => renderedRows(page))
    .toBe(config.grouped ? ALL.length + 2 : ALL.length);
}

async function filter(page: Page, config: Config) {
  await page.evaluate(() => (globalThis as any).setFiltered(true));
  await expect
    .poll(() => renderedRows(page))
    .toBe(config.grouped ? VISIBLE.length + 2 : VISIBLE.length);
}

const configs: Config[] = [];
for (const target of ['all', 'visible'] as const) {
  configs.push({ target, grouped: false, useGroupKeys: false });
  configs.push({ target, grouped: true, useGroupKeys: false });
  configs.push({ target, grouped: true, useGroupKeys: true });
}

const describeConfig = (config: Config) =>
  `${config.target} - ${
    config.grouped
      ? config.useGroupKeys
        ? 'grouped with group keys'
        : 'grouped'
      : 'flat'
  }`;

export default test.describe.parallel('multiRowSelectionTarget', () => {
  for (const config of configs) {
    const name = describeConfig(config);
    const expectedAfterSelectAll = config.target === 'all' ? ALL : VISIBLE;

    test(`header checkbox without filtered out rows - ${name}`, async ({
      page,
    }) => {
      await setup(page, config);

      await clickCheckbox(page, 'header');
      await expect.poll(() => selectedIds(page)).toEqual(ALL);
      expect(await checkboxState(page, 'header')).toBe(true);

      await clickCheckbox(page, 'header');
      await expect.poll(() => selectedIds(page)).toEqual([]);
      expect(await checkboxState(page, 'header')).toBe(false);
    });

    test(`header checkbox with filtered out rows - ${name}`, async ({
      page,
    }) => {
      await setup(page, config);
      await filter(page, config);

      await clickCheckbox(page, 'header');
      await expect
        .poll(() => selectedIds(page))
        .toEqual(expectedAfterSelectAll);
      expect(await checkboxState(page, 'header')).toBe(true);
      expect(await checkboxState(page, config.grouped ? 1 : 0)).toBe(true);

      await clickCheckbox(page, 'header');
      await expect.poll(() => selectedIds(page)).toEqual([]);
      expect(await checkboxState(page, 'header')).toBe(false);
    });

    test(`header checkbox keeps filtered out selection - ${name}`, async ({
      page,
    }) => {
      await setup(page, config);
      // select row 1, which the filter will hide
      await clickCheckbox(page, config.grouped ? 1 : 0);
      await expect.poll(() => selectedIds(page)).toEqual([1]);
      await filter(page, config);

      expect(await checkboxState(page, 'header')).toBe(
        config.target === 'all' ? null : false,
      );

      await clickCheckbox(page, 'header');
      await expect.poll(() => selectedIds(page)).toEqual(
        config.target === 'all' ? ALL : [1, ...VISIBLE],
      );

      await clickCheckbox(page, 'header');
      await expect
        .poll(() => selectedIds(page))
        .toEqual(config.target === 'all' ? [] : [1]);
    });

    test(`all visible rows selected - ${name}`, async ({ page }) => {
      await setup(page, config);
      await filter(page, config);

      for (let i = 0; i < VISIBLE.length; i++) {
        await page.evaluate(
          (id) =>
            (globalThis as any).INFINITE_GRID_API.rowSelectionApi.selectRow(id),
          VISIBLE[i],
        );
        await expect
          .poll(() => selectedIds(page))
          .toEqual(VISIBLE.slice(0, i + 1));
      }

      expect(await checkboxState(page, 'header')).toBe(
        config.target === 'all' ? null : true,
      );
      if (config.grouped) {
        // the "frontend" group
        expect(await checkboxState(page, 0)).toBe(
          config.target === 'all' ? null : true,
        );
      }
    });

    test(`rowSelectionApi.selectAll with filtered out rows - ${name}`, async ({
      page,
    }) => {
      await setup(page, config);
      await filter(page, config);

      await page.evaluate(() =>
        (globalThis as any).INFINITE_GRID_API.rowSelectionApi.selectAll(),
      );
      await expect
        .poll(() => selectedIds(page))
        .toEqual(expectedAfterSelectAll);

      await page.evaluate(() =>
        (globalThis as any).INFINITE_GRID_API.rowSelectionApi.deselectAll(),
      );
      await expect.poll(() => selectedIds(page)).toEqual([]);
    });

    if (config.grouped) {
      test(`group checkbox with filtered out rows - ${name}`, async ({
        page,
      }) => {
        await setup(page, config);
        await filter(page, config);

        // the "frontend" group, where rows 1 and 2 are filtered out
        await clickCheckbox(page, 0);
        await expect
          .poll(() => selectedIds(page))
          .toEqual(config.target === 'all' ? [1, 2, 3] : [3]);
        expect(await checkboxState(page, 0)).toBe(true);

        await page.evaluate(() => (globalThis as any).setFiltered(false));
        await expect.poll(() => renderedRows(page)).toBe(ALL.length + 2);
        expect(await checkboxState(page, 0)).toBe(
          config.target === 'all' ? true : null,
        );
      });
    }
  }
});
