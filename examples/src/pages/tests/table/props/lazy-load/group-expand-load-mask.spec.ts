import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

const groupCell = (page: Page, rowIndex: number) =>
  page.locator(`.InfiniteColumnCell[data-row-index="${rowIndex}"]`).first();

export default test.describe.parallel('Lazy load: expanding a group', () => {
  test('clicking the expander shows the loading icon in the row, not the load mask', async ({
    page,
  }) => {
    await page.waitForInfinite();
    const loadMask = page.locator('.Infinite-LoadMask');
    await expect(loadMask).toBeHidden();

    await groupCell(page, 0)
      .locator('[data-name="expand-collapse-icon"]')
      .click();

    await expect(
      groupCell(page, 0).locator('.InfiniteIcon-loading'),
    ).toBeVisible();
    await expect(loadMask).toBeHidden();

    await page.evaluate(() => (globalThis as any).releaseGroupLoads());
    await expect(
      groupCell(page, 0).locator('.InfiniteIcon-loading'),
    ).toHaveCount(0);
    await expect(
      page.locator('.InfiniteColumnCell[data-row-index="2"]').last(),
    ).toHaveText('John');
  });

  test('expanding through the api shows the loading icon in the row, not the load mask', async ({
    page,
    apiModel,
  }) => {
    await page.waitForInfinite();
    const loadMask = page.locator('.Infinite-LoadMask');

    await apiModel.evaluate((api) => api.expandGroupRow(['Brazil']));

    await expect(
      groupCell(page, 1).locator('.InfiniteIcon-loading'),
    ).toBeVisible();
    await expect(loadMask).toBeHidden();

    await page.evaluate(() => (globalThis as any).releaseGroupLoads());
    await expect(
      groupCell(page, 1).locator('.InfiniteIcon-loading'),
    ).toHaveCount(0);
  });
});
