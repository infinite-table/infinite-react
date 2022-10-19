import { test, expect } from '@testing';

export default test.describe.parallel('Column piped rendering', () => {
  test('is working with hooks', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    const groupRow = rowModel.getGroupCellLocator({
      rowIndex: 0,
      colId: 'country',
    });

    expect(await groupRow.locator('button').innerText()).toEqual('Group: USA');

    const leafRow = rowModel.getGroupCellLocator({
      rowIndex: 1,
      colId: 'country',
    });
    expect(await leafRow.locator('button').innerText()).toEqual('Country: USA');
  });

  test('is working with group icon', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    const groupRow = rowModel.getGroupCellLocator({
      rowIndex: 0,
      colId: 'group-by-country',
    });

    const btn = groupRow.locator('button');
    expect(await btn.isVisible()).toBe(true);

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await btn.locator('svg').click();

    expect(await rowModel.getRenderedRowCount()).toBe(3);

    await btn.locator('svg').click();

    expect(await rowModel.getRenderedRowCount()).toBe(5);
  });
});
