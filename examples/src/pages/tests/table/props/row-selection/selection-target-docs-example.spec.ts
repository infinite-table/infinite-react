import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

// grouped by stack: "frontend" (rows 1, 2, 3) and "backend" (rows 4, 5)
// the TypeScript filter only keeps row 3
const ALL = [1, 2, 3, 4, 5];

const headerCheckbox = (page: Page) =>
  page.locator(
    '.InfiniteHeaderCell[data-column-id="checkbox"] input[type="checkbox"]',
  );

// true for checked, false for unchecked, null for indeterminate
const checkboxState = (page: Page) =>
  headerCheckbox(page).evaluate((input: HTMLInputElement) =>
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
  'multiRowSelectionTarget - the docs example',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.waitForInfinite();
      // the "frontend" group and row 3
      await expect.poll(() => renderedRows(page)).toBe(2);
    });

    test('with "visible", the header checkbox only selects the TypeScript developer', async ({
      page,
    }) => {
      await headerCheckbox(page).click();
      await expect.poll(() => selectedIds(page)).toEqual([3]);
      expect(await checkboxState(page)).toBe(true);

      await page.locator('[data-name="only-typescript"]').uncheck();
      await expect.poll(() => renderedRows(page)).toBe(ALL.length + 2);

      expect(await selectedIds(page)).toEqual([3]);
      expect(await checkboxState(page)).toBe(null);
    });

    test('with "all", the header checkbox selects every developer', async ({
      page,
    }) => {
      await page.locator('[data-name="target"]').selectOption('all');

      await headerCheckbox(page).click();
      await expect.poll(() => selectedIds(page)).toEqual(ALL);
      expect(await checkboxState(page)).toBe(true);

      await page.locator('[data-name="only-typescript"]').uncheck();
      await expect.poll(() => renderedRows(page)).toBe(ALL.length + 2);

      expect(await selectedIds(page)).toEqual(ALL);
      expect(await checkboxState(page)).toBe(true);
    });
  },
);
