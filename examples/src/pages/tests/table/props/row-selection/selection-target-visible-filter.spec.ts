import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

// "Java" keeps the Java and JavaScript rows: 1, 2, 4 and 6 - rows 3 and 5 are filtered out
const VISIBLE = [1, 2, 4, 6];

const checkboxSelector = (rowIndex: number | 'header') =>
  rowIndex === 'header'
    ? '.InfiniteHeaderCell[data-column-id="checkbox"] input[type="checkbox"]'
    : `.InfiniteColumnCell[data-column-id="checkbox"][data-row-index="${rowIndex}"] input[type="checkbox"]`;

// true for checked, false for unchecked, null for indeterminate
const checkboxState = (page: Page, rowIndex: number | 'header') =>
  page
    .locator(checkboxSelector(rowIndex))
    .evaluate((input: HTMLInputElement) =>
      input.indeterminate ? null : input.checked,
    );

const selectedIds = (page: Page) =>
  page.evaluate(() =>
    [
      ...(globalThis as any).INFINITE_GRID_API.rowSelectionApi.getSelectedPrimaryKeys(),
    ].sort((a: number, b: number) => a - b),
  );

const renderedRows = (page: Page) =>
  page.locator('.InfiniteColumnCell[data-column-id="checkbox"]').count();

export default test.describe.parallel(
  'multiRowSelectionTarget="visible" with a language filter',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.waitForInfinite();
      await expect.poll(() => renderedRows(page)).toBe(VISIBLE.length);
    });

    test('selecting each visible row checks the header once all visible rows are selected', async ({
      page,
    }) => {
      expect(await checkboxState(page, 'header')).toBe(false);

      for (let i = 0; i < VISIBLE.length; i++) {
        await page.locator(checkboxSelector(i)).click();
        await expect
          .poll(() => selectedIds(page))
          .toEqual(VISIBLE.slice(0, i + 1));

        const isLast = i === VISIBLE.length - 1;
        expect(await checkboxState(page, 'header')).toBe(isLast ? true : null);
      }

      // without the filter, rows 3 and 5 are not selected
      await page.evaluate(() => (globalThis as any).setLanguagePrefix(''));
      await expect.poll(() => renderedRows(page)).toBe(6);
      expect(await checkboxState(page, 'header')).toBe(null);
    });

    test('the header only reflects the rows that pass the current filter', async ({
      page,
    }) => {
      await page.locator(checkboxSelector('header')).click();
      await expect.poll(() => selectedIds(page)).toEqual(VISIBLE);
      expect(await checkboxState(page, 'header')).toBe(true);

      // "Ty" only keeps row 3, which is not selected
      await page.locator('[data-name="language-prefix"]').fill('Ty');
      await expect.poll(() => renderedRows(page)).toBe(1);
      expect(await checkboxState(page, 'header')).toBe(false);

      await page.locator(checkboxSelector('header')).click();
      await expect
        .poll(() => selectedIds(page))
        .toEqual([1, 2, 3, 4, 6]);
      expect(await checkboxState(page, 'header')).toBe(true);
    });
  },
);
