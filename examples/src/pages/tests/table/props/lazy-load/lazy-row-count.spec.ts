import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

import { lazyRowCount } from './lazy-row-count-server';

const filteredCount = (page: Page) =>
  page.evaluate(
    () =>
      (globalThis as any).INFINITE_GRID_API.dataSourceApi.getState()
        .filteredCount,
  );

const groupCellCount = (page: Page) =>
  page.locator('.InfiniteColumnCell[data-column-id="group-by"]').count();

export default test.describe.parallel('Lazy load row count', () => {
  test('with grouping, counts the leaf rows from the top-level count the server sends', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await expect
      .poll(() => filteredCount(page))
      .toBe(lazyRowCount.rows);
    expect(lazyRowCount.rows).not.toBe(lazyRowCount.groups);
  });

  test('with grouping, adds up the counts of the top-level groups when the server sends no top-level count', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await page.evaluate(() => (globalThis as any).setWithRootCount(false));
    await expect.poll(() => groupCellCount(page)).toBeGreaterThan(0);

    await expect
      .poll(() => filteredCount(page))
      .toBe(lazyRowCount.rows);
  });

  test('without grouping, counts the rows the server sends', async ({ page }) => {
    await page.waitForInfinite();
    await page.evaluate(() => (globalThis as any).setGrouped(false));

    await expect
      .poll(() => filteredCount(page))
      .toBe(lazyRowCount.rows);
  });
});
