import { test, expect } from '@testing';

export default test.describe('Add data to empty tree', () => {
  test('should work', async ({ page, rowModel, tableModel }) => {
    await page.waitForInfiniteHeader();

    const button = page.locator('button:has-text("Add data")');

    await button.click();
    expect(await rowModel.getRenderedRowCount()).toBe(7);

    await button.click();
    expect(await rowModel.getRenderedRowCount()).toBe(8);

    const row7 = tableModel.withCell({ rowIndex: 7, colIndex: 0 });
    expect(await row7.getValue()).toBe('1 - inserted - 1');
    await button.click();
    expect(await rowModel.getRenderedRowCount()).toBe(9);

    const row8 = tableModel.withCell({ rowIndex: 8, colIndex: 0 });
    expect(await row7.getValue()).toBe('1 - inserted - 1');
    expect(await row8.getValue()).toBe('2 - inserted - 2');
  });
});
