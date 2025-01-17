import { test, expect } from '@testing';

export default test.describe.parallel('virtualization with pinned cols', () => {
  test('should work', async ({ page, apiModel, tableModel }) => {
    await page.waitForInfinite();

    await apiModel.evaluate((api) => {
      api.scrollLeft = 1000;
    });

    const visibleColumnIds = await tableModel.getVisibleColumnIds();
    // expect the last 4 columns to be:
    expect(visibleColumnIds.slice(-4)).toEqual([
      'country',
      'firstName',
      'stack',
      'city',
    ]);
  });
});
