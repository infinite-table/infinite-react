import { test, expect } from '@testing';

export default test.describe('Add data to empty tree', () => {
  test('should work', async ({ page, rowModel, tableModel }) => {
    await page.waitForInfiniteHeader();

    const button = page.locator('button:has-text("Add data")');

    await button.click();
    // poll: rendering after a data update is not synchronous with the click
    // (Vue flushes on the next tick)
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(7);

    await button.click();
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(8);

    const row7 = tableModel.withCell({ rowIndex: 7, colIndex: 0 });
    expect(await row7.getValue()).toBe('1 - inserted - 1');
    await button.click();
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(9);

    const row8 = tableModel.withCell({ rowIndex: 8, colIndex: 0 });
    expect(await row7.getValue()).toBe('1 - inserted - 1');
    expect(await row8.getValue()).toBe('2 - inserted - 2');
  });
});
