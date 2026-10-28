import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

// the server keeps the TypeScript rows (1 and 3) and sends the count of all 6 rows

const headerCheckbox =
  '.InfiniteHeaderCell[data-column-id="checkbox"] input[type="checkbox"]';
const rowCheckbox = (rowIndex: number) =>
  `.InfiniteColumnCell[data-column-id="checkbox"][data-row-index="${rowIndex}"] input[type="checkbox"]`;

// true for checked, false for unchecked, null for indeterminate
const headerState = (page: Page) =>
  page
    .locator(headerCheckbox)
    .evaluate((input: HTMLInputElement) =>
      input.indeterminate ? null : input.checked,
    );

const setTarget = (page: Page, target: 'all' | 'visible') =>
  page.evaluate((target) => (globalThis as any).setTarget(target), target);

export default test.describe.parallel(
  'Lazy multiRowSelectionTarget with unfiltered counts from the server',
  () => {
    test('the header counts the rows without the filter only for "all"', async ({
      page,
    }) => {
      await page.waitForInfinite();
      await expect
        .poll(() =>
          page.locator('.InfiniteColumnCell[data-column-id="checkbox"]').count(),
        )
        .toBe(2);

      await page.locator(rowCheckbox(0)).click();
      await page.locator(rowCheckbox(1)).click();
      await expect.poll(() => headerState(page)).toBe(null);

      await setTarget(page, 'visible');
      await expect.poll(() => headerState(page)).toBe(true);

      await setTarget(page, 'all');
      await expect.poll(() => headerState(page)).toBe(null);

      await page.locator(headerCheckbox).click();
      await expect.poll(() => headerState(page)).toBe(true);
    });
  },
);
