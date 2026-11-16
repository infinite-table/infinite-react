import { test, expect } from '@testing';

export default test.describe.parallel('Master-detail row height', () => {
  test('the cells of an expanded row keep the row height, so the detail is not covered', async ({
    page,
    tableModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const getDetailClicks = () =>
      page.evaluate(() => (globalThis as any).detailClicks ?? []);
    const top = (rowIndex: number) =>
      rowModel
        .getCellLocator({ rowIndex, colIndex: 0 })
        .evaluate((node) => node.getBoundingClientRect().top);

    // row 1 starts expanded: its cells are as tall as a row, not as tall as
    // the row plus its detail
    await expect.poll(() => rowModel.getRowHeight(1)).toBe(40);
    expect(await rowModel.getRowHeight(0)).toBe(40);

    // the next row starts below the detail
    expect((await top(2)) - (await top(1))).toBe(240);

    // the detail can be reached with the mouse - a click on something that
    // is covered by another element fails
    await page.locator('[data-name="detail-1"] button').click();
    expect(await getDetailClicks()).toEqual([1]);

    // expanding another row
    await tableModel.withCell({ rowIndex: 3, colIndex: 0 }).clickDetailIcon();

    await expect.poll(() => rowModel.getRowHeight(3)).toBe(40);
    await expect.poll(async () => (await top(4)) - (await top(3))).toBe(240);

    await page.locator('[data-name="detail-3"] button').click();
    expect(await getDetailClicks()).toEqual([1, 3]);

    // collapsing the first one
    await tableModel.withCell({ rowIndex: 1, colIndex: 0 }).clickDetailIcon();

    await expect.poll(async () => (await top(2)) - (await top(1))).toBe(40);
    await expect(page.locator('[data-name="detail-1"]')).toHaveCount(0);
    expect(await rowModel.getRowHeight(1)).toBe(40);
  });
});
