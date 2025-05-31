import { test, expect } from '@testing';

export default test.describe.parallel('Column visibility with pinning', () => {
  test('should work', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    page.failOnConsoleErrors();

    let colIds = await tableModel.getVisibleColumnIds();
    expect(colIds).toEqual([
      'group-by',
      'id',
      'make',
      'model',
      'price',
      'year',
    ]);

    await page.click('button:has-text("hide all")');
    colIds = await tableModel.getVisibleColumnIds();
    expect(colIds).toEqual([]);

    await page.click('button:has-text("show all")');
    colIds = await tableModel.getVisibleColumnIds();
    expect(colIds).toEqual([
      'group-by',
      'id',
      'make',
      'model',
      'price',
      'year',
    ]);
  });
});
