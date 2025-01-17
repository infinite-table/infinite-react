import { test, expect } from '@testing';

export default test.describe.parallel('virtualization with pinned cols', () => {
  test('should work for header', async ({ page, apiModel, tableModel }) => {
    await page.waitForInfinite();

    await apiModel.evaluate((api) => {
      api.scrollLeft = 1000;
    });
    await page.waitForTimeout(100);

    const visibleColumnIds = await tableModel.getVisibleColumnIds();
    // expect the last 4 columns to be:
    expect(visibleColumnIds.slice(-4)).toEqual([
      'country',
      'firstName',
      'stack',
      'city',
    ]);
  });

  test('should also work for body', async ({ page, apiModel, tableModel }) => {
    await page.waitForInfinite();

    await apiModel.evaluate((api) => {
      api.scrollLeft = 1000;
    });
    await page.waitForTimeout(100);

    expect(
      await tableModel
        .withCell({
          rowIndex: 6,
          colId: 'city',
        })
        .isVisible(),
    ).toEqual(true);

    expect(
      await tableModel
        .withCell({
          rowIndex: 7,
          colId: 'city',
        })
        .isVisible(),
    ).toEqual(true);
  });
});
