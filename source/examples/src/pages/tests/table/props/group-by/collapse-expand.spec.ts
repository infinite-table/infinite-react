import { test, expect } from '@playwright/test';

export default test.describe.parallel('Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/group-by/collapse-expand`);
    await page.waitForTimeout(10);
  });

  test('cell content is there', async ({ page }) => {
    // wait for rendering

    await page.waitForSelector('[data-row-index]');

    const getRowCount = async () =>
      await page.evaluate(
        () => document.querySelectorAll('[data-row-index]').length,
      );

    let count = await getRowCount();

    expect(count).toEqual(12);

    const expanderIcon = await page.$('.InfiniteIcon-expander--expanded');

    // collapse Cuba
    await expanderIcon!.click();

    count = await getRowCount();

    expect(count).toEqual(9);

    // expand Cuba
    await expanderIcon!.click();

    count = await getRowCount();

    expect(count).toEqual(12);
  });
});
