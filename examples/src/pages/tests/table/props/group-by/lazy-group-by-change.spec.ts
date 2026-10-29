import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

const columnValues = (page: Page, columnId: string) =>
  page
    .locator(`.InfiniteColumnCell[data-column-id="${columnId}"]`)
    .allTextContents();

const setGroupBy = (page: Page, groupBy: { field: string }[]) =>
  page.evaluate((groupBy) => (globalThis as any).setGroupBy(groupBy), groupBy);

export default test.describe.parallel('Lazy DataSource groupBy change', () => {
  test('reloads the data when groupBy changes at runtime', async ({ page }) => {
    await page.waitForInfinite();
    await expect
      .poll(() => columnValues(page, 'id'))
      .toEqual(['1', '2', '3', '4', '5', '6']);

    await setGroupBy(page, [{ field: 'stack' }]);
    await expect
      .poll(() => columnValues(page, 'group-by-stack'))
      .toEqual(['backend', 'frontend', 'mobile']);

    await setGroupBy(page, []);
    await expect
      .poll(() => columnValues(page, 'id'))
      .toEqual(['1', '2', '3', '4', '5', '6']);

    await setGroupBy(page, [{ field: 'stack' }]);
    await expect
      .poll(() => columnValues(page, 'group-by-stack'))
      .toEqual(['backend', 'frontend', 'mobile']);
  });
});
